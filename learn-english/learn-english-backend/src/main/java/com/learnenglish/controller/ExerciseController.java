package com.learnenglish.controller;

import com.learnenglish.dto.ApiResponse;
import com.learnenglish.dto.ExerciseQuestion;
import com.learnenglish.dto.ExerciseRequest;
import com.learnenglish.model.Exercise;
import com.learnenglish.service.ExerciseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {
    
    @Autowired
    private ExerciseService exerciseService;
    
    @GetMapping("/generate")
    public ApiResponse<List<ExerciseQuestion>> generateExercises(
            @RequestParam(required = false, defaultValue = "MULTIPLE_CHOICE") String questionType,
            @RequestParam(required = false, defaultValue = "10") Integer count,
            @RequestParam(required = false, defaultValue = "1") Long userId) {
        List<ExerciseQuestion> questions = exerciseService.generateExercises(questionType, count, userId);
        return ApiResponse.success(questions);
    }
    
    @PostMapping("/submit")
    public ApiResponse<Map<String, Object>> submitExercise(
            @RequestParam(required = false, defaultValue = "1") Long userId,
            @RequestBody ExerciseRequest request) {
        Map<String, Object> result = exerciseService.submitExercise(userId, request);
        return ApiResponse.success(result);
    }
    
    @GetMapping("/history")
    public ApiResponse<List<Exercise>> getExerciseHistory(
            @RequestParam(required = false, defaultValue = "1") Long userId,
            @RequestParam(required = false, defaultValue = "20") Integer limit) {
        List<Exercise> history = exerciseService.getExerciseHistory(userId, limit);
        return ApiResponse.success(history);
    }
    
    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getExerciseStats(
            @RequestParam(required = false, defaultValue = "1") Long userId) {
        Map<String, Object> stats = exerciseService.getExerciseStats(userId);
        return ApiResponse.success(stats);
    }
}
