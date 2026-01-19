from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import HumanMessage, SystemMessage
from typing import List, Dict
import logging
import time

from vector_store import VectorStore
from config import (
    OPENAI_API_KEY, OPENAI_MODEL, 
    GOOGLE_API_KEY, GEMINI_MODEL, AI_PROVIDER
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RAGChain:
    """
    RAG (Retrieval-Augmented Generation) chain for legal Q&A
    """
    
    def __init__(self, vector_store: VectorStore):
        self.vector_store = vector_store
        if AI_PROVIDER == "google":
            self.llm = ChatGoogleGenerativeAI(
                model=GEMINI_MODEL,
                temperature=0.1,
                google_api_key=GOOGLE_API_KEY
            )
            self.model_name = GEMINI_MODEL
        else:
            self.llm = ChatOpenAI(
                model=OPENAI_MODEL,
                temperature=0.1,
                openai_api_key=OPENAI_API_KEY
            )
            self.model_name = OPENAI_MODEL
        
        self.system_prompt = """你是一个专业的法律助手。你的任务是基于提供的法律文档内容回答用户的问题。

重要规则:
1. 只基于提供的文档内容回答问题
2. 如果文档中没有相关信息，明确告诉用户
3. 引用具体的法律条款（如"第X条"）来支持你的回答
4. 保持客观和专业的语气
5. 如果问题涉及法律建议，提醒用户咨询专业律师

请用清晰、准确的语言回答问题。"""
    
    def ask(self, question: str, top_k: int = 5) -> Dict:
        """
        Answer question using RAG
        Returns answer and source references
        """
        try:
            # 1. Retrieve relevant documents
            search_results = self.vector_store.search(question, limit=top_k)
            
            if not search_results:
                return {
                    'answer': '抱歉，我在知识库中没有找到与您问题相关的法律文档。请尝试换一个问法或上传相关的法律文档。',
                    'references': [],
                    'model': self.model_name,
                    'tokens_used': 0
                }
            
            # 2. Build context from retrieved chunks
            context = self._build_context(search_results)
            
            # 3. Generate answer
            # Gemini sometimes has issues with SystemMessage, so we combine it into the HumanMessage
            full_prompt = f"{self.system_prompt}\n\n基于以下法律文档内容，回答用户的问题。\n\n法律文档内容:\n{context}\n\n用户问题: {question}\n\n请提供详细且准确的回答，并引用具体的法律条款。"
            
            messages = [
                HumanMessage(content=full_prompt)
            ]
            
            # Retry logic for LLM call (Gemini Free Tier rate limits)
            max_retries = 3
            base_delay = 30
            
            response = None
            for attempt in range(max_retries):
                try:
                    response = self.llm.invoke(messages)
                    break
                except Exception as e:
                    if "429" in str(e) or "quota" in str(e).lower():
                        if attempt < max_retries - 1:
                            delay = base_delay * (attempt + 1)
                            logger.warning(f"LLM rate limit hit, retrying in {delay}s... (Attempt {attempt+1}/{max_retries})")
                            time.sleep(delay)
                        else:
                            raise e
                    else:
                        raise e
            
            if not response:
                raise Exception("Failed to get response from LLM after retries")

            answer = response.content
            
            # 4. Format references
            references = self._format_references(search_results)
            
            logger.info(f"Generated answer for question: {question[:50]}...")
            
            return {
                'answer': answer,
                'references': references,
                'model': self.model_name,
                'tokens_used': 0 # Gemini token usage might need different handling
            }
        
        except Exception as e:
            logger.error(f"RAG chain failed: {str(e)}")
            raise
    
    def _build_context(self, search_results: List[Dict]) -> str:
        """Build context string from search results"""
        context_parts = []
        
        for idx, result in enumerate(search_results, 1):
            chunk_position = result.get('chunk_position', '未知位置')
            chunk_text = result.get('chunk_text', '')
            similarity = result.get('similarity_score', 0.0)
            
            context_parts.append(
                f"[文档{idx}] {chunk_position} (相关度: {similarity:.2f})\n{chunk_text}\n"
            )
        
        return "\n".join(context_parts)
    
    def _format_references(self, search_results: List[Dict]) -> List[Dict]:
        """Format search results as references"""
        references = []
        
        for result in search_results:
            references.append({
                'document_id': result.get('document_id'),
                'chunk_text': result.get('chunk_text', '')[:200],  # Truncate for preview
                'chunk_position': result.get('chunk_position'),
                'similarity_score': result.get('similarity_score'),
                'page_number': None  # Can be extracted if available
            })
        
        return references
    
    def chat_with_history(self, question: str, chat_history: List[Dict], top_k: int = 5) -> Dict:
        """
        Answer question with chat history context
        """
        # Build conversation context
        history_context = "\n".join([
            f"{'用户' if msg['role'] == 'user' else '助手'}: {msg['content']}"
            for msg in chat_history[-5:]  # Last 5 messages
        ])
        
        # Enhance question with history context
        enhanced_question = f"对话历史:\n{history_context}\n\n当前问题: {question}"
        
        return self.ask(enhanced_question, top_k)
