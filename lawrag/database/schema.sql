-- LawRAG Database Schema
-- Database: lawrag
-- MySQL 8.0+

USE lawrag;

-- Documents table: stores document metadata and parsing status
CREATE TABLE IF NOT EXISTS documents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL COMMENT 'Document title',
    category VARCHAR(50) NOT NULL COMMENT 'Document category (e.g., 民法, 刑法, 行政法)',
    file_name VARCHAR(255) NOT NULL COMMENT 'Original filename',
    file_path VARCHAR(500) NOT NULL COMMENT 'File storage path',
    file_type VARCHAR(20) NOT NULL COMMENT 'File type (PDF, DOCX, etc.)',
    file_size BIGINT NOT NULL COMMENT 'File size in bytes',
    content TEXT COMMENT 'Extracted text content',
    
    -- Parsing status
    parse_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING, PARSING, COMPLETED, FAILED',
    parse_progress INT DEFAULT 0 COMMENT 'Parsing progress 0-100',
    parse_error TEXT COMMENT 'Error message if parsing failed',
    vector_count INT DEFAULT 0 COMMENT 'Number of vectors stored in Milvus',
    
    -- Metadata
    upload_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Upload timestamp',
    parse_time DATETIME COMMENT 'Parsing completion timestamp',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_parse_status (parse_status),
    INDEX idx_upload_time (upload_time),
    FULLTEXT INDEX idx_content (content, title) COMMENT 'Full-text search index'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Document metadata table';

-- Chat sessions table: tracks user conversation sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(64) UNIQUE NOT NULL COMMENT 'Unique session identifier',
    user_id VARCHAR(64) COMMENT 'User identifier (optional for future auth)',
    title VARCHAR(255) COMMENT 'Session title (first question or custom)',
    
    -- Metadata
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_message_at DATETIME COMMENT 'Timestamp of last message',
    
    INDEX idx_session_id (session_id),
    INDEX idx_user_id (user_id),
    INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Chat session table';

-- Chat messages table: stores Q&A history
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(64) NOT NULL COMMENT 'Session identifier',
    role VARCHAR(20) NOT NULL COMMENT 'user or assistant',
    content TEXT NOT NULL COMMENT 'Message content',
    
    -- AI response metadata
    model VARCHAR(50) COMMENT 'AI model used (e.g., gpt-4)',
    tokens_used INT COMMENT 'Total tokens consumed',
    response_time INT COMMENT 'Response time in milliseconds',
    cached BOOLEAN DEFAULT FALSE COMMENT 'Whether response was from cache',
    
    -- Reference tracking
    has_references BOOLEAN DEFAULT FALSE COMMENT 'Whether message has document references',
    
    -- Metadata
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_session_id (session_id),
    INDEX idx_role (role),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Chat message history';

-- Document references table: links messages to source documents
CREATE TABLE IF NOT EXISTS document_references (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    message_id BIGINT NOT NULL COMMENT 'Message ID that references the document',
    document_id BIGINT NOT NULL COMMENT 'Referenced document ID',
    
    -- Reference details
    chunk_text TEXT COMMENT 'Referenced text chunk',
    chunk_position VARCHAR(100) COMMENT 'Position in document (e.g., 第3条第2款)',
    similarity_score FLOAT COMMENT 'Similarity score from vector search',
    page_number INT COMMENT 'Page number if applicable',
    
    -- Metadata
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_message_id (message_id),
    INDEX idx_document_id (document_id),
    
    FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Document reference linking table';

-- Insert sample categories for reference
INSERT IGNORE INTO documents (id, title, category, file_name, file_path, file_type, file_size, parse_status) 
VALUES 
(0, 'Sample Document', '民法', 'sample.pdf', '/samples/sample.pdf', 'PDF', 0, 'PENDING')
ON DUPLICATE KEY UPDATE id=id;

DELETE FROM documents WHERE id = 0;
