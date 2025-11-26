package com.learnenglish.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserAchievement {
    private Long id;
    private Long userId;
    private Long achievementId;
    private LocalDateTime unlockedAt;
    
    // For joined queries
    private Achievement achievement;
}
