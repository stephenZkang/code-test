package com.learnenglish.service;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

/**
 * Spaced Repetition Service
 * Implements a simplified SM-2 algorithm for calculating next review dates
 */
@Service
public class SpacedRepetitionService {
    
    /**
     * Calculate next review date based on mastery level
     * @param masteryLevel Current mastery level (0-5)
     * @param reviewCount Number of times reviewed
     * @return Next review date
     */
    public LocalDateTime calculateNextReviewDate(int masteryLevel, int reviewCount) {
        LocalDateTime now = LocalDateTime.now();
        
        // Intervals in hours based on mastery level
        int[] intervals = {1, 4, 24, 72, 168, 336}; // 1h, 4h, 1d, 3d, 7d, 14d
        
        if (masteryLevel < 0) masteryLevel = 0;
        if (masteryLevel >= intervals.length) masteryLevel = intervals.length - 1;
        
        int hoursToAdd = intervals[masteryLevel];
        
        // Add some variation based on review count
        if (reviewCount > 3) {
            hoursToAdd = (int) (hoursToAdd * Math.pow(1.5, reviewCount - 3));
        }
        
        return now.plusHours(hoursToAdd);
    }
    
    /**
     * Calculate new mastery level based on correctness
     * @param currentLevel Current mastery level
     * @param isCorrect Whether the answer was correct
     * @return New mastery level
     */
    public int calculateMasteryLevel(int currentLevel, boolean isCorrect) {
        if (isCorrect) {
            return Math.min(currentLevel + 1, 5);
        } else {
            return Math.max(currentLevel - 1, 0);
        }
    }
}
