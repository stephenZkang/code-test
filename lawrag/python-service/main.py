from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import logging
import requests
import asyncio

from document_processor import DocumentProcessor
from vector_store import VectorStore
from rag_chain import RAGChain
from config import SERVICE_HOST, SERVICE_PORT, BACKEND_URL

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="LawRAG Python AI Service",
    description="Document parsing, vectorization, and RAG-based Q&A service",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
document_processor = DocumentProcessor()
vector_store = VectorStore()
rag_chain = RAGChain(vector_store)


# Request/Response models
class ParseRequest(BaseModel):
    documentId: int
    filePath: str
    fileType: str


class ParseResponse(BaseModel):
    status: str
    message: str
    vectorCount: Optional[int] = None


class SearchRequest(BaseModel):
    query: str
    limit: int = 10


class SearchResult(BaseModel):
    documentId: int
    chunkText: str
    chunkPosition: str
    similarityScore: float
    pageNumber: Optional[int] = None


class SearchResponse(BaseModel):
    results: List[SearchResult]


class QARequest(BaseModel):
    question: str
    sessionId: str


class Reference(BaseModel):
    documentId: int
    chunkText: str
    chunkPosition: str
    similarityScore: float
    pageNumber: Optional[int] = None


class QAResponse(BaseModel):
    answer: str
    references: List[Reference]
    model: str
    tokensUsed: int


@app.get("/")
async def root():
    """Service health check"""
    return {
        "service": "LawRAG Python AI Service",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/stats")
async def get_stats():
    """Get vector store statistics"""
    try:
        stats = vector_store.get_stats()
        return stats
    except Exception as e:
        logger.error(f"Failed to get stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/parse", response_model=ParseResponse)
async def parse_document(request: ParseRequest, background_tasks: BackgroundTasks):
    """
    Parse document and store vectors
    This is called by the SpringBoot backend
    """
    logger.info(f"Received parse request for document {request.documentId}")
    
    # Start parsing in background
    background_tasks.add_task(
        process_document,
        request.documentId,
        request.filePath,
        request.fileType
    )
    
    return ParseResponse(
        status="accepted",
        message="Document parsing started",
        vectorCount=None
    )


async def process_document(document_id: int, file_path: str, file_type: str):
    """Background task to process document"""
    try:
        # Update status to PARSING
        update_backend_status(document_id, "PARSING", 20, None, None)
        
        # 1. Parse file
        logger.info(f"Parsing file: {file_path}")
        text = document_processor.parse_file(file_path, file_type)
        update_backend_status(document_id, "PARSING", 40, None, None)
        
        # 2. Chunk text
        logger.info(f"Chunking text for document {document_id}")
        chunks = document_processor.chunk_text(text, document_id)
        update_backend_status(document_id, "PARSING", 60, None, None)
        
        # 3. Add to vector store
        logger.info(f"Adding {len(chunks)} chunks to vector store")
        vector_count = vector_store.add_chunks(chunks)
        update_backend_status(document_id, "PARSING", 80, None, None)
        
        # 4. Complete
        update_backend_status(document_id, "COMPLETED", 100, None, vector_count)
        logger.info(f"Successfully processed document {document_id}")
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Failed to process document {document_id}: {error_msg}")
        update_backend_status(document_id, "FAILED", 0, error_msg, None)


def update_backend_status(document_id: int, status: str, progress: int, error: Optional[str], vector_count: Optional[int]):
    """Update parse status in SpringBoot backend"""
    try:
        url = f"{BACKEND_URL}/docs/{document_id}/update-parse-status"
        params = {
            "status": status,
            "progress": progress
        }
        if error:
            params["error"] = error
        if vector_count is not None:
            params["vectorCount"] = vector_count
        
        response = requests.post(url, params=params)
        if response.status_code == 200:
            logger.info(f"Updated backend status for document {document_id}: {status}")
        else:
            logger.warning(f"Failed to update backend status: {response.status_code}")
    except Exception as e:
        logger.error(f"Failed to notify backend: {str(e)}")


@app.post("/search", response_model=SearchResponse)
async def search(request: SearchRequest):
    """Semantic search in vector store"""
    try:
        results = vector_store.search(request.query, request.limit)
        
        search_results = [
            SearchResult(
                documentId=r['document_id'],
                chunkText=r['chunk_text'],
                chunkPosition=r['chunk_position'],
                similarityScore=r['similarity_score'],
                pageNumber=None
            )
            for r in results
        ]
        
        return SearchResponse(results=search_results)
    
    except Exception as e:
        logger.error(f"Search failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/qa", response_model=QAResponse)
async def qa(request: QARequest):
    """RAG-based Q&A"""
    try:
        logger.info(f"Processing Q&A for session {request.sessionId}")
        
        # Get answer from RAG chain
        result = rag_chain.ask(request.question, top_k=5)
        
        # Format response
        references = [
            Reference(
                documentId=ref['document_id'],
                chunkText=ref['chunk_text'],
                chunkPosition=ref['chunk_position'],
                similarityScore=ref['similarity_score'],
                pageNumber=ref['page_number']
            )
            for ref in result['references']
        ]
        
        return QAResponse(
            answer=result['answer'],
            references=references,
            model=result['model'],
            tokensUsed=result['tokens_used']
        )
    
    except Exception as e:
        logger.error(f"Q&A failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=SERVICE_HOST, port=SERVICE_PORT)
