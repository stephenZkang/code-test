package com.learnenglish.model;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class LearningSession {
    private Long id;
    private Long userId;
    private LocalDate sessionDate;
    private Integer wordsLearned;
    private Integer exercisesCompleted;
    private Integer timeSpent;
    private LocalDateTime createdAt;
}
