package com.lawrag.controller;

import com.lawrag.dto.ApiResponse;
import com.lawrag.dto.DocumentUploadResponse;
import com.lawrag.dto.ParseStatusResponse;
import com.lawrag.entity.Document;
import com.lawrag.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/docs")
@RequiredArgsConstructor
@Tag(name = "Document Management", description = "Document upload, parsing, and retrieval")
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping("/upload")
    @Operation(summary = "Upload document", description = "Upload a document and trigger parsing")
    public ApiResponse<DocumentUploadResponse> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam("category") String category) {
        try {
            DocumentUploadResponse response = documentService.uploadDocument(file, title, category);
            return ApiResponse.success(response);
        } catch (IOException e) {
            log.error("Failed to upload document: {}", e.getMessage(), e);
            return ApiResponse.error("Failed to upload document: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/parse-status")
    @Operation(summary = "Get parse status", description = "Get document parsing status and progress")
    public ApiResponse<ParseStatusResponse> getParseStatus(@PathVariable Long id) {
        try {
            ParseStatusResponse response = documentService.getParseStatus(id);
            return ApiResponse.success(response);
        } catch (Exception e) {
            log.error("Failed to get parse status: {}", e.getMessage(), e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get document", description = "Get document details by ID")
    public ApiResponse<Document> getDocument(@PathVariable Long id) {
        try {
            Document document = documentService.getDocument(id);
            if (document == null) {
                return ApiResponse.error(404, "Document not found");
            }
            return ApiResponse.success(document);
        } catch (Exception e) {
            log.error("Failed to get document: {}", e.getMessage(), e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/list")
    @Operation(summary = "List documents", description = "Get documents by category or all")
    public ApiResponse<List<Document>> listDocuments(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "limit", defaultValue = "20") int limit) {
        try {
            List<Document> documents = documentService.getDocumentsByCategory(category, limit);
            return ApiResponse.success(documents);
        } catch (Exception e) {
            log.error("Failed to list documents: {}", e.getMessage(), e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/random")
    @Operation(summary = "Get random documents", description = "Get random documents for homepage")
    public ApiResponse<List<Document>> getRandomDocuments(
            @RequestParam(value = "limit", defaultValue = "6") int limit) {
        try {
            List<Document> documents = documentService.getRandomDocuments(limit);
            return ApiResponse.success(documents);
        } catch (Exception e) {
            log.error("Failed to get random documents: {}", e.getMessage(), e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete document", description = "Delete a document and its file")
    public ApiResponse<Void> deleteDocument(@PathVariable Long id) {
        try {
            documentService.deleteDocument(id);
            return ApiResponse.success("Document deleted successfully", null);
        } catch (Exception e) {
            log.error("Failed to delete document: {}", e.getMessage(), e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/{id}/update-parse-status")
    @Operation(summary = "Update parse status", description = "Called by Python service to update parsing progress")
    public ApiResponse<Void> updateParseStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam Integer progress,
            @RequestParam(required = false) String error,
            @RequestParam(required = false) Integer vectorCount) {
        try {
            documentService.updateParseStatus(id, status, progress, error, vectorCount);
            return ApiResponse.success(null);
        } catch (Exception e) {
            log.error("Failed to update parse status: {}", e.getMessage(), e);
            return ApiResponse.error(e.getMessage());
        }
    }
}
