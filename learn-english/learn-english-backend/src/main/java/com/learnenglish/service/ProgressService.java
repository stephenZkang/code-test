package com.learnenglish.service;

import com.learnenglish.dto.ProgressStats;
import com.learnenglish.model.Progress;
import com.learnenglish.model.LearningSession;
import com.learnenglish.mapper.ProgressMapper;
import com.learnenglish.mapper.WordMapper;
import com.learnenglish.mapper.ExerciseMapper;
import com.learnenglish.mapper.LearningSessionMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProgressService {
    
    @Autowired
    private ProgressMapper progressMapper;
    
    @Autowired
    private WordMapper wordMapper;
    
    @Autowired
    private ExerciseMapper exerciseMapper;
    
    @Autowired
    private LearningSessionMapper learningSessionMapper;
    
    @Autowired
    private SpacedRepetitionService spacedRepetitionService;
    
    public ProgressStats getProgressStats(Long userId) {
        if (userId == null) userId = 1L;
        
        int totalWords = wordMapper.count();
        int learnedWords = progressMapper.countLearned(userId);
        int masteredWords = progressMapper.countMastered(userId);
        int bookmarkedWords = progressMapper.countBookmarked(userId);
        int streakDays = learningSessionMapper.countStreak(userId, LocalDate.now());
        int totalExercises = exerciseMapper.countByUserId(userId);
        Double averageAccuracy = exerciseMapper.getAverageAccuracy(userId);
        
        // Get today's session
        LearningSession todaySession = learningSessionMapper.findByUserAndDate(userId, LocalDate.now());
        int todayWordsLearned = todaySession != null ? todaySession.getWordsLearned() : 0;
        
        return new ProgressStats(
            totalWords,
            learnedWords,
            masteredWords,
            streakDays,
            totalExercises,
            averageAccuracy != null ? averageAccuracy : 0.0,
            todayWordsLearned,
            bookmarkedWords
        );
    }
    
    public Progress updateProgress(Long userId, Long wordId, Integer masteryLevel, Boolean isBookmarked) {
        if (userId == null) userId = 1L;
        
        Progress progress = progressMapper.findByUserAndWord(userId, wordId);
        
        if (progress == null) {
            // Create new progress record
            progress = new Progress();
            progress.setUserId(userId);
            progress.setWordId(wordId);
            progress.setMasteryLevel(masteryLevel != null ? masteryLevel : 0);
            progress.setReviewCount(1);
            progress.setIsBookmarked(isBookmarked != null ? isBookmarked : false);
            progress.setLastReviewDate(LocalDateTime.now());
            progress.setNextReviewDate(spacedRepetitionService.calculateNextReviewDate(progress.getMasteryLevel(), 1));
            progressMapper.insert(progress);
        } else {
            // Update existing progress
            if (masteryLevel != null) {
                progress.setMasteryLevel(masteryLevel);
            }
            if (isBookmarked != null) {
                progress.setIsBookmarked(isBookmarked);
            }
            progress.setReviewCount(progress.getReviewCount() + 1);
            progress.setLastReviewDate(LocalDateTime.now());
            progress.setNextReviewDate(spacedRepetitionService.calculateNextReviewDate(
                progress.getMasteryLevel(), 
                progress.getReviewCount()
            ));
            progressMapper.update(progress);
        }
        
        // Update today's learning session
        updateLearningSession(userId);
        
        return progress;
    }
    
    public List<Progress> getUserProgress(Long userId) {
        if (userId == null) userId = 1L;
        return progressMapper.findByUserId(userId);
    }
    
    public List<Progress> getDueWords(Long userId) {
        if (userId == null) userId = 1L;
        return progressMapper.findDueWords(userId, LocalDateTime.now());
    }
    
    public List<Progress> getBookmarkedWords(Long userId) {
        if (userId == null) userId = 1L;
        return progressMapper.findBookmarked(userId);
    }
    
    private void updateLearningSession(Long userId) {
        LocalDate today = LocalDate.now();
        LearningSession session = learningSessionMapper.findByUserAndDate(userId, today);
        
        if (session == null) {
            session = new LearningSession();
            session.setUserId(userId);
            session.setSessionDate(today);
            session.setWordsLearned(1);
            session.setExercisesCompleted(0);
            session.setTimeSpent(0);
            learningSessionMapper.insert(session);
        } else {
            session.setWordsLearned(session.getWordsLearned() + 1);
            learningSessionMapper.update(session);
        }
    }
}
