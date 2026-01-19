import re
from typing import List, Dict
import PyPDF2
from docx import Document as DocxDocument
from PIL import Image
import pytesseract
import logging

from config import CHUNK_SIZE, CHUNK_OVERLAP, LEGAL_PATTERN_ENABLED

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DocumentProcessor:
    """
    Document processor with legal text segmentation
    Handles PDF, DOCX, and image (OCR) processing
    """
    
    def __init__(self):
        self.legal_patterns = [
            r'第[零一二三四五六七八九十百千万\d]+条',  # Article pattern: 第N条
            r'第[零一二三四五六七八九十百千万\d]+款',  # Clause pattern: 第N款
            r'第[零一二三四五六七八九十百千万\d]+项',  # Item pattern: 第N项
            r'第[零一二三四五六七八九十百千万\d]+章',  # Chapter pattern: 第N章
        ]
    
    def parse_file(self, file_path: str, file_type: str) -> str:
        """Parse file and extract text content"""
        try:
            if file_type.upper() == 'PDF':
                return self._parse_pdf(file_path)
            elif file_type.upper() in ['DOCX', 'DOC']:
                return self._parse_docx(file_path)
            elif file_type.upper() in ['PNG', 'JPG', 'JPEG', 'TIFF']:
                return self._parse_image(file_path)
            elif file_type.upper() == 'TXT':
                return self._parse_txt(file_path)
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
        except Exception as e:
            logger.error(f"Failed to parse file {file_path}: {str(e)}")
            raise
    
    def _parse_pdf(self, file_path: str) -> str:
        """Extract text from PDF"""
        text = ""
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text
    
    def _parse_docx(self, file_path: str) -> str:
        """Extract text from DOCX"""
        doc = DocxDocument(file_path)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text
    
    def _parse_image(self, file_path: str) -> str:
        """Extract text from image using OCR"""
        image = Image.open(file_path)
        text = pytesseract.image_to_string(image, lang='chi_sim')
        return text

    def _parse_txt(self, file_path: str) -> str:
        """Extract text from TXT file"""
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    
    def chunk_text(self, text: str, document_id: int) -> List[Dict]:
        """
        Chunk text with legal article/clause awareness
        Returns list of chunks with metadata
        """
        if LEGAL_PATTERN_ENABLED:
            return self._chunk_by_legal_structure(text, document_id)
        else:
            return self._chunk_by_size(text, document_id)
    
    def _chunk_by_legal_structure(self, text: str, document_id: int) -> List[Dict]:
        """
        Chunk text by legal structure (articles, clauses)
        Avoids cutting in the middle of legal provisions
        """
        chunks = []
        
        # Find all legal markers
        markers = []
        for pattern in self.legal_patterns:
            for match in re.finditer(pattern, text):
                markers.append({
                    'position': match.start(),
                    'text': match.group(),
                    'pattern': pattern
                })
        
        # Sort markers by position
        markers.sort(key=lambda x: x['position'])
        
        if not markers:
            # No legal markers found, use size-based chunking
            return self._chunk_by_size(text, document_id)
        
        # Chunk based on markers
        for i in range(len(markers)):
            start_pos = markers[i]['position']
            end_pos = markers[i + 1]['position'] if i + 1 < len(markers) else len(text)
            
            chunk_text = text[start_pos:end_pos].strip()
            
            # If chunk is too large, split it further
            if len(chunk_text) > CHUNK_SIZE * 2:
                sub_chunks = self._split_large_chunk(chunk_text, CHUNK_SIZE)
                for j, sub_chunk in enumerate(sub_chunks):
                    chunks.append({
                        'text': sub_chunk,
                        'document_id': document_id,
                        'chunk_position': f"{markers[i]['text']}-{j + 1}",
                        'chunk_index': len(chunks)
                    })
            else:
                chunks.append({
                    'text': chunk_text,
                    'document_id': document_id,
                    'chunk_position': markers[i]['text'],
                    'chunk_index': len(chunks)
                })
        
        logger.info(f"Created {len(chunks)} chunks using legal structure segmentation")
        return chunks
    
    def _chunk_by_size(self, text: str, document_id: int) -> List[Dict]:
        """
        Standard size-based chunking with overlap
        """
        chunks = []
        start = 0
        chunk_index = 0
        
        while start < len(text):
            end = start + CHUNK_SIZE
            chunk_text = text[start:end].strip()
            
            if chunk_text:
                chunks.append({
                    'text': chunk_text,
                    'document_id': document_id,
                    'chunk_position': f"Position {start}-{end}",
                    'chunk_index': chunk_index
                })
                chunk_index += 1
            
            start += CHUNK_SIZE - CHUNK_OVERLAP
        
        logger.info(f"Created {len(chunks)} chunks using size-based segmentation")
        return chunks
    
    def _split_large_chunk(self, text: str, max_size: int) -> List[str]:
        """Split a large chunk into smaller pieces"""
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + max_size
            chunks.append(text[start:end].strip())
            start = end
        
        return chunks
