package com.lawrag.dto;

import lombok.Data;

@Data
public class DocumentUploadResponse {
    private Long documentId;
    private String fileName;
    private String parseStatus;
    private String message;
}
