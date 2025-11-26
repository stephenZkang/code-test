package com.learnenglish.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Progress {
    private Long id;
    private Long wordId;
    private Long userId;
    private Integer masteryLevel;
    private LocalDateTime lastReviewDate;
    private LocalDateTime nextReviewDate;
    private Integer reviewCount;
    private Boolean isBookmarked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // For joined queries
    private Word word;
}
