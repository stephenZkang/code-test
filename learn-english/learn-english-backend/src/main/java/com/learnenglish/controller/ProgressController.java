package com.learnenglish.controller;

import com.learnenglish.dto.ApiResponse;
import com.learnenglish.dto.ProgressStats;
import com.learnenglish.dto.ProgressUpdateRequest;
import com.learnenglish.model.Progress;
import com.learnenglish.service.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {
    
    @Autowired
    private ProgressService progressService;
    
    @GetMapping
    public ApiResponse<ProgressStats> getProgress(
            @RequestParam(required = false, defaultValue = "1") Long userId) {
        ProgressStats stats = progressService.getProgressStats(userId);
        return ApiResponse.success(stats);
    }
    
    @PostMapping("/update")
    public ApiResponse<Progress> updateProgress(
            @RequestParam(required = false, defaultValue = "1") Long userId,
            @RequestBody ProgressUpdateRequest request) {
        Progress progress = progressService.updateProgress(
            userId, 
            request.getWordId(), 
            request.getMasteryLevel(), 
            request.getIsBookmarked()
        );
        return ApiResponse.success("Progress updated successfully", progress);
    }
    
    @GetMapping("/history")
    public ApiResponse<List<Progress>> getProgressHistory(
            @RequestParam(required = false, defaultValue = "1") Long userId) {
        List<Progress> history = progressService.getUserProgress(userId);
        return ApiResponse.success(history);
    }
    
    @GetMapping("/due")
    public ApiResponse<List<Progress>> getDueWords(
            @RequestParam(required = false, defaultValue = "1") Long userId) {
        List<Progress> dueWords = progressService.getDueWords(userId);
        return ApiResponse.success(dueWords);
    }
    
    @GetMapping("/bookmarked")
    public ApiResponse<List<Progress>> getBookmarkedWords(
            @RequestParam(required = false, defaultValue = "1") Long userId) {
        List<Progress> bookmarked = progressService.getBookmarkedWords(userId);
        return ApiResponse.success(bookmarked);
    }
}
