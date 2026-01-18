package com.lawrag.dto;

import lombok.Data;
import java.util.List;

@Data
public class ChatResponse {
    private Long messageId;
    private String answer;
    private Boolean cached;
    private Integer responseTime;
    private List<ReferenceInfo> references;

    @Data
    public static class ReferenceInfo {
        private Long documentId;
        private String documentTitle;
        private String chunkPosition;
        private Float similarityScore;
    }
}
