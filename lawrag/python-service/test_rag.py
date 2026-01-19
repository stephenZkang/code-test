import sys
import os
sys.path.append(os.getcwd())

from vector_store import VectorStore
from rag_chain import RAGChain
import logging

logging.basicConfig(level=logging.INFO)

def test_qa():
    try:
        vs = VectorStore()
        rag = RAGChain(vs)
        question = "民事诉讼时效是多久？"
        print(f"Asking: {question}")
        result = rag.ask(question)
        print("Answer:")
        print(result['answer'])
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_qa()
