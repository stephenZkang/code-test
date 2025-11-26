package com.learnenglish.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Exercise {
    private Long id;
    private Long userId;
    private String questionType;
    private Long wordId;
    private String userAnswer;
    private String correctAnswer;
    private Boolean isCorrect;
    private Integer timeSpent;
    private LocalDateTime createdAt;
    
    // For joined queries
    private Word word;
}
