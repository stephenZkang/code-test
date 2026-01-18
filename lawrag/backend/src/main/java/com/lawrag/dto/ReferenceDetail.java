package com.lawrag.dto;

import lombok.Data;

@Data
public class ReferenceDetail {
    private Long referenceId;
    private Long documentId;
    private String documentTitle;
    private String fileName;
    private String filePath;
    private String chunkText;
    private String chunkPosition;
    private Float similarityScore;
    private Integer pageNumber;
}
