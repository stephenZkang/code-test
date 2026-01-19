import os
from dotenv import load_dotenv

load_dotenv()

# AI Model Configuration (Gemini/OpenAI)
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-pro")
GEMINI_EMBEDDING_MODEL = os.getenv("GEMINI_EMBEDDING_MODEL", "models/text-embedding-004")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
OPENAI_EMBEDDING_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-ada-002")

# Preferred Provider
AI_PROVIDER = os.getenv("AI_PROVIDER", "google") # Reverted to google as requested


# Milvus Configuration
MILVUS_HOST = os.getenv("MILVUS_HOST", "127.0.0.1")
MILVUS_PORT = int(os.getenv("MILVUS_PORT", "19530"))
MILVUS_COLLECTION_NAME = os.getenv("MILVUS_COLLECTION_NAME", "lawrag_documents")

# Backend URL
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8080/api")

# Service Configuration
SERVICE_HOST = os.getenv("SERVICE_HOST", "0.0.0.0")
SERVICE_PORT = int(os.getenv("SERVICE_PORT", "8000"))

# Chunking Configuration
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "3000"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "50"))

# Legal Text Patterns
LEGAL_PATTERN_ENABLED = os.getenv("LEGAL_PATTERN_ENABLED", "true").lower() == "true"
