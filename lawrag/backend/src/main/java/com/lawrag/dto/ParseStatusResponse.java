package com.lawrag.dto;

import lombok.Data;

@Data
public class ParseStatusResponse {
    private Long documentId;
    private String parseStatus;
    private Integer parseProgress;
    private String parseError;
    private Integer vectorCount;
}
