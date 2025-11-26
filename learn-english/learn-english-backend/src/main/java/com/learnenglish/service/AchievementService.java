package com.learnenglish.service;

import com.learnenglish.model.Achievement;
import com.learnenglish.model.UserAchievement;
import com.learnenglish.mapper.AchievementMapper;
import com.learnenglish.mapper.ProgressMapper;
import com.learnenglish.mapper.ExerciseMapper;
import com.learnenglish.mapper.LearningSessionMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AchievementService {
    
    @Autowired
    private AchievementMapper achievementMapper;
    
    @Autowired
    private ProgressMapper progressMapper;
    
    @Autowired
    private ExerciseMapper exerciseMapper;
    
    @Autowired
    private LearningSessionMapper learningSessionMapper;
    
    /**
     * Get all achievements with user unlock status
     */
    public List<Map<String, Object>> getAllAchievements(Long userId) {
        if (userId == null) userId = 1L;
        
        List<Achievement> allAchievements = achievementMapper.findAll();
        List<UserAchievement> userAchievements = achievementMapper.findUserAchievements(userId);
        
        Set<Long> unlockedIds = userAchievements.stream()
            .map(UserAchievement::getAchievementId)
            .collect(Collectors.toSet());
        
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Achievement achievement : allAchievements) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", achievement.getId());
            item.put("name", achievement.getName());
            item.put("description", achievement.getDescription());
            item.put("icon", achievement.getIcon());
            item.put("requirementType", achievement.getRequirementType());
            item.put("requirementValue", achievement.getRequirementValue());
            item.put("unlocked", unlockedIds.contains(achievement.getId()));
            
            // Find unlock date if unlocked
            userAchievements.stream()
                .filter(ua -> ua.getAchievementId().equals(achievement.getId()))
                .findFirst()
                .ifPresent(ua -> item.put("unlockedAt", ua.getUnlockedAt()));
            
            result.add(item);
        }
        
        return result;
    }
    
    /**
     * Check and unlock achievements for a user
     */
    public List<Achievement> checkAndUnlockAchievements(Long userId) {
        if (userId == null) userId = 1L;
        
        List<Achievement> newlyUnlocked = new ArrayList<>();
        List<Achievement> allAchievements = achievementMapper.findAll();
        
        for (Achievement achievement : allAchievements) {
            // Check if already unlocked
            UserAchievement existing = achievementMapper.findUserAchievement(userId, achievement.getId());
            if (existing != null) {
                continue;
            }
            
            // Check if requirements are met
            boolean shouldUnlock = checkAchievementRequirement(userId, achievement);
            
            if (shouldUnlock) {
                UserAchievement userAchievement = new UserAchievement();
                userAchievement.setUserId(userId);
                userAchievement.setAchievementId(achievement.getId());
                achievementMapper.insertUserAchievement(userAchievement);
                newlyUnlocked.add(achievement);
            }
        }
        
        return newlyUnlocked;
    }
    
    /**
     * Check if achievement requirement is met
     */
    private boolean checkAchievementRequirement(Long userId, Achievement achievement) {
        String requirementType = achievement.getRequirementType();
        int requirementValue = achievement.getRequirementValue();
        
        switch (requirementType) {
            case "words_learned":
                int learnedCount = progressMapper.countLearned(userId);
                return learnedCount >= requirementValue;
                
            case "exercises_completed":
                int exerciseCount = exerciseMapper.countByUserId(userId);
                return exerciseCount >= requirementValue;
                
            case "streak_days":
                int streakDays = learningSessionMapper.countStreak(userId, LocalDate.now());
                return streakDays >= requirementValue;
                
            case "perfect_score":
                // Check if user has at least one perfect exercise session
                // For simplicity, we'll consider this achieved if average accuracy is 100%
                Double accuracy = exerciseMapper.getAverageAccuracy(userId);
                return accuracy != null && accuracy >= 100.0;
                
            case "bookmarks":
                int bookmarkCount = progressMapper.countBookmarked(userId);
                return bookmarkCount >= requirementValue;
                
            default:
                return false;
        }
    }
    
    /**
     * Get user's unlocked achievements
     */
    public List<UserAchievement> getUserAchievements(Long userId) {
        if (userId == null) userId = 1L;
        return achievementMapper.findUserAchievements(userId);
    }
}
