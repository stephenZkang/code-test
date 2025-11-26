package com.learnenglish.controller;

import com.learnenglish.dto.ApiResponse;
import com.learnenglish.model.Achievement;
import com.learnenglish.model.UserAchievement;
import com.learnenglish.service.AchievementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/achievements")
public class AchievementController {
    
    @Autowired
    private AchievementService achievementService;
    
    @GetMapping
    public ApiResponse<List<Map<String, Object>>> getAllAchievements(
            @RequestParam(required = false, defaultValue = "1") Long userId) {
        List<Map<String, Object>> achievements = achievementService.getAllAchievements(userId);
        return ApiResponse.success(achievements);
    }
    
    @GetMapping("/user")
    public ApiResponse<List<UserAchievement>> getUserAchievements(
            @RequestParam(required = false, defaultValue = "1") Long userId) {
        List<UserAchievement> userAchievements = achievementService.getUserAchievements(userId);
        return ApiResponse.success(userAchievements);
    }
    
    @PostMapping("/check")
    public ApiResponse<List<Achievement>> checkAchievements(
            @RequestParam(required = false, defaultValue = "1") Long userId) {
        List<Achievement> newAchievements = achievementService.checkAndUnlockAchievements(userId);
        if (newAchievements.isEmpty()) {
            return ApiResponse.success("No new achievements unlocked", newAchievements);
        } else {
            return ApiResponse.success("Unlocked " + newAchievements.size() + " new achievement(s)!", newAchievements);
        }
    }
}
