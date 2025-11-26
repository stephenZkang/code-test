package com.learnenglish.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProgressStats {
    private Integer totalWords;
    private Integer learnedWords;
    private Integer masteredWords;
    private Integer streakDays;
    private Integer totalExercises;
    private Double averageAccuracy;
    private Integer todayWordsLearned;
    private Integer bookmarkedWords;
}
