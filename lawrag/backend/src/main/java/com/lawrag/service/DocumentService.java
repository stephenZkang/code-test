package com.lawrag.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.lawrag.client.PythonServiceClient;
import com.lawrag.dto.DocumentUploadResponse;
import com.lawrag.dto.ParseStatusResponse;
import com.lawrag.entity.Document;
import com.lawrag.mapper.DocumentMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentMapper documentMapper;
    private final PythonServiceClient pythonServiceClient;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${app.upload.path}")
    private String uploadPath;

    /**
     * Upload document and trigger parsing
     */
    public DocumentUploadResponse uploadDocument(MultipartFile file, String title, String category) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String fileName = UUID.randomUUID().toString() + fileExtension;

        // Create upload directory if not exists
        Path uploadDir = Paths.get(uploadPath);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        // Save file
        Path filePath = uploadDir.resolve(fileName);
        file.transferTo(filePath.toFile());

        // Create document record
        Document document = new Document();
        document.setTitle(title != null ? title : originalFilename);
        document.setCategory(category);
        document.setFileName(originalFilename);
        document.setFilePath(filePath.toString());
        document.setFileType(fileExtension.substring(1).toUpperCase());
        document.setFileSize(file.getSize());
        document.setParseStatus("PENDING");
        document.setParseProgress(0);
        document.setUploadTime(LocalDateTime.now());

        documentMapper.insert(document);

        // Trigger async parsing via Python service
        triggerParsing(document);

        DocumentUploadResponse response = new DocumentUploadResponse();
        response.setDocumentId(document.getId());
        response.setFileName(originalFilename);
        response.setParseStatus("PENDING");
        response.setMessage("Document uploaded successfully, parsing started");

        return response;
    }

    /**
     * Trigger document parsing in Python service
     */
    private void triggerParsing(Document document) {
        pythonServiceClient.parseDocument(
                document.getId(),
                document.getFilePath(),
                document.getFileType()).subscribe(
                        response -> {
                            log.info("Python service accepted parsing request for document {}", document.getId());
                            updateParseStatus(document.getId(), "PARSING", 10, null, null);
                        },
                        error -> {
                            log.error("Failed to trigger parsing for document {}: {}", document.getId(),
                                    error.getMessage());
                            updateParseStatus(document.getId(), "FAILED", 0, error.getMessage(), null);
                        });
    }

    /**
     * Update parse status and broadcast via WebSocket
     */
    public void updateParseStatus(Long documentId, String status, Integer progress, String error, Integer vectorCount) {
        Document document = documentMapper.selectById(documentId);
        if (document != null) {
            document.setParseStatus(status);
            document.setParseProgress(progress);
            document.setParseError(error);
            if (vectorCount != null) {
                document.setVectorCount(vectorCount);
            }
            if ("COMPLETED".equals(status)) {
                document.setParseTime(LocalDateTime.now());
            }
            documentMapper.updateById(document);

            // Broadcast progress via WebSocket
            ParseStatusResponse statusResponse = new ParseStatusResponse();
            statusResponse.setDocumentId(documentId);
            statusResponse.setParseStatus(status);
            statusResponse.setParseProgress(progress);
            statusResponse.setParseError(error);
            statusResponse.setVectorCount(vectorCount);

            messagingTemplate.convertAndSend("/topic/parse-progress/" + documentId, statusResponse);
        }
    }

    /**
     * Get parse status
     */
    public ParseStatusResponse getParseStatus(Long documentId) {
        Document document = documentMapper.selectById(documentId);
        if (document == null) {
            throw new IllegalArgumentException("Document not found");
        }

        ParseStatusResponse response = new ParseStatusResponse();
        response.setDocumentId(documentId);
        response.setParseStatus(document.getParseStatus());
        response.setParseProgress(document.getParseProgress());
        response.setParseError(document.getParseError());
        response.setVectorCount(document.getVectorCount());

        return response;
    }

    /**
     * Get document by ID
     */
    public Document getDocument(Long id) {
        return documentMapper.selectById(id);
    }

    /**
     * Get documents by category
     */
    public List<Document> getDocumentsByCategory(String category, int limit) {
        if (category == null || category.isEmpty()) {
            return getAllDocuments(limit);
        }
        return documentMapper.findByCategory(category, limit);
    }

    /**
     * Get all completed documents
     */
    public List<Document> getAllDocuments(int limit) {
        LambdaQueryWrapper<Document> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Document::getParseStatus, "COMPLETED")
                .orderByDesc(Document::getUploadTime)
                .last("LIMIT " + limit);
        return documentMapper.selectList(wrapper);
    }

    /**
     * Get random documents
     */
    public List<Document> getRandomDocuments(int limit) {
        return documentMapper.findRandom(limit);
    }

    /**
     * Full-text search
     */
    public List<Document> fullTextSearch(String query, int limit) {
        return documentMapper.fullTextSearch(query, limit);
    }

    /**
     * Delete document
     */
    public void deleteDocument(Long id) {
        Document document = documentMapper.selectById(id);
        if (document != null) {
            // Delete physical file
            try {
                Files.deleteIfExists(Paths.get(document.getFilePath()));
            } catch (IOException e) {
                log.error("Failed to delete file: {}", e.getMessage());
            }

            // Delete database record
            documentMapper.deleteById(id);
        }
    }
}
