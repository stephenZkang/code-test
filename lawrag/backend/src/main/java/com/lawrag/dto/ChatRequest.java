package com.lawrag.dto;

import lombok.Data;

@Data
public class ChatRequest {
    private String sessionId;
    private String question;
}
