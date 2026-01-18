from pymilvus import connections, Collection, FieldSchema, CollectionSchema, DataType, utility
from langchain_openai import OpenAIEmbeddings
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from typing import List, Dict
import logging

from config import (
    MILVUS_HOST, MILVUS_PORT, MILVUS_COLLECTION_NAME, 
    OPENAI_API_KEY, GOOGLE_API_KEY, GEMINI_EMBEDDING_MODEL, AI_PROVIDER
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class VectorStore:
    """
    Milvus vector store for document chunks
    """
    
    def __init__(self):
        self.collection_name = MILVUS_COLLECTION_NAME
        if AI_PROVIDER == "google":
            self.embeddings = GoogleGenerativeAIEmbeddings(
                model=GEMINI_EMBEDDING_MODEL,
                google_api_key=GOOGLE_API_KEY
            )
            self.dim = 768  # Gemini embedding dimension
        else:
            self.embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
            self.dim = 1536 # OpenAI dimension
            
        self._connect()
        self._create_collection()
    
    def _connect(self):
        """Connect to Milvus"""
        try:
            connections.connect(
                alias="default",
                host=MILVUS_HOST,
                port=MILVUS_PORT
            )
            logger.info(f"Connected to Milvus at {MILVUS_HOST}:{MILVUS_PORT}")
        except Exception as e:
            logger.error(f"Failed to connect to Milvus: {str(e)}")
            raise
    
    def _create_collection(self):
        """Create collection if not exists"""
        if utility.has_collection(self.collection_name):
            self.collection = Collection(self.collection_name)
            logger.info(f"Collection '{self.collection_name}' already exists")
        else:
            fields = [
                FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
                FieldSchema(name="document_id", dtype=DataType.INT64),
                FieldSchema(name="chunk_index", dtype=DataType.INT64),
                FieldSchema(name="chunk_position", dtype=DataType.VARCHAR, max_length=200),
                FieldSchema(name="chunk_text", dtype=DataType.VARCHAR, max_length=5000),
                FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=self.dim)
            ]
            
            schema = CollectionSchema(fields, description="LawRAG document chunks")
            self.collection = Collection(self.collection_name, schema)
            
            # Create index for vector field
            index_params = {
                "metric_type": "COSINE",
                "index_type": "IVF_FLAT",
                "params": {"nlist": 1024}
            }
            self.collection.create_index("embedding", index_params)
            
            logger.info(f"Created collection '{self.collection_name}'")
        
        # Load collection into memory
        self.collection.load()
    
    def add_chunks(self, chunks: List[Dict]) -> int:
        """
        Add document chunks to vector store
        Returns the number of vectors added
        """
        if not chunks:
            return 0
        
        try:
            # Extract texts for embedding
            texts = [chunk['text'] for chunk in chunks]
            
            # Generate embeddings
            embeddings = self.embeddings.embed_documents(texts)
            
            # Prepare data for insertion
            data = [
                [chunk['document_id'] for chunk in chunks],
                [chunk['chunk_index'] for chunk in chunks],
                [chunk['chunk_position'] for chunk in chunks],
                [chunk['text'][:5000] for chunk in chunks],  # Truncate if necessary
                embeddings
            ]
            
            # Insert into Milvus
            insert_result = self.collection.insert(data)
            self.collection.flush()
            
            logger.info(f"Inserted {len(chunks)} chunks into Milvus")
            return len(chunks)
        
        except Exception as e:
            logger.error(f"Failed to add chunks to Milvus: {str(e)}")
            raise
    
    def search(self, query: str, limit: int = 10, document_id: int = None) -> List[Dict]:
        """
        Semantic search in vector store
        """
        try:
            # Generate query embedding
            query_embedding = self.embeddings.embed_query(query)
            
            # Search parameters
            search_params = {"metric_type": "COSINE", "params": {"nprobe": 10}}
            
            # Output fields
            output_fields = ["document_id", "chunk_index", "chunk_position", "chunk_text"]
            
            # Execute search
            if document_id is not None:
                expr = f"document_id == {document_id}"
                results = self.collection.search(
                    data=[query_embedding],
                    anns_field="embedding",
                    param=search_params,
                    limit=limit,
                    expr=expr,
                    output_fields=output_fields
                )
            else:
                results = self.collection.search(
                    data=[query_embedding],
                    anns_field="embedding",
                    param=search_params,
                    limit=limit,
                    output_fields=output_fields
                )
            
            # Format results
            formatted_results = []
            for hits in results:
                for hit in hits:
                    formatted_results.append({
                        'document_id': hit.entity.get('document_id'),
                        'chunk_index': hit.entity.get('chunk_index'),
                        'chunk_position': hit.entity.get('chunk_position'),
                        'chunk_text': hit.entity.get('chunk_text'),
                        'similarity_score': float(hit.score)
                    })
            
            logger.info(f"Found {len(formatted_results)} results for query")
            return formatted_results
        
        except Exception as e:
            logger.error(f"Search failed: {str(e)}")
            raise
    
    def delete_by_document(self, document_id: int):
        """Delete all chunks for a document"""
        try:
            expr = f"document_id == {document_id}"
            self.collection.delete(expr)
            self.collection.flush()
            logger.info(f"Deleted chunks for document {document_id}")
        except Exception as e:
            logger.error(f"Failed to delete chunks: {str(e)}")
            raise
    
    def get_stats(self) -> Dict:
        """Get collection statistics"""
        self.collection.flush()
        return {
            'name': self.collection_name,
            'num_entities': self.collection.num_entities,
        }
