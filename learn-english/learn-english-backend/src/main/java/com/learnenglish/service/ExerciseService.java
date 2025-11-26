package com.learnenglish.service;

import com.learnenglish.dto.ExerciseQuestion;
import com.learnenglish.dto.ExerciseRequest;
import com.learnenglish.model.Exercise;
import com.learnenglish.model.Word;
import com.learnenglish.model.Progress;
import com.learnenglish.mapper.ExerciseMapper;
import com.learnenglish.mapper.WordMapper;
import com.learnenglish.mapper.ProgressMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExerciseService {

    @Autowired
    private ExerciseMapper exerciseMapper;

    @Autowired
    private WordMapper wordMapper;

    @Autowired
    private ProgressMapper progressMapper;

    @Autowired
    private ProgressService progressService;

    @Autowired
    private SpacedRepetitionService spacedRepetitionService;

    /**
     * Generate exercise questions
     */
    public List<ExerciseQuestion> generateExercises(String questionType, Integer count, Long userId) {
        if (count == null || count <= 0)
            count = 10;
        if (userId == null)
            userId = 1L;

        List<Word> words = wordMapper.findRandom(count, userId);
        List<ExerciseQuestion> questions = new ArrayList<>();

        for (int i = 0; i < words.size(); i++) {
            Word word = words.get(i);
            ExerciseQuestion question = new ExerciseQuestion();
            question.setId((long) i);
            question.setWord(word);

            if ("MULTIPLE_CHOICE".equals(questionType)) {
                question.setQuestionType("MULTIPLE_CHOICE");
                question.setOptions(generateMultipleChoiceOptions(word));
                question.setCorrectAnswer(word.getChinese());
            } else if ("FILL_BLANK".equals(questionType)) {
                question.setQuestionType("FILL_BLANK");
                question.setCorrectAnswer(word.getEnglish());
                question.setHint(word.getChinese());
            } else if ("LISTENING".equals(questionType)) {
                question.setQuestionType("LISTENING");
                question.setOptions(generateMultipleChoiceOptions(word));
                question.setCorrectAnswer(word.getEnglish());
            } else {
                // Default to multiple choice
                question.setQuestionType("MULTIPLE_CHOICE");
                question.setOptions(generateMultipleChoiceOptions(word));
                question.setCorrectAnswer(word.getChinese());
            }

            questions.add(question);
        }

        return questions;
    }

    /**
     * Generate multiple choice options
     */
    private List<String> generateMultipleChoiceOptions(Word correctWord) {
        List<Word> allWords = wordMapper.findAll();
        List<String> options = new ArrayList<>();
        options.add(correctWord.getChinese());

        // Get random wrong answers
        Random random = new Random();
        Set<String> addedOptions = new HashSet<>();
        addedOptions.add(correctWord.getChinese());

        while (options.size() < 4 && addedOptions.size() < allWords.size()) {
            Word randomWord = allWords.get(random.nextInt(allWords.size()));
            if (!addedOptions.contains(randomWord.getChinese())) {
                options.add(randomWord.getChinese());
                addedOptions.add(randomWord.getChinese());
            }
        }

        // Shuffle options
        Collections.shuffle(options);
        return options;
    }

    /**
     * Submit exercise answer
     */
    public Map<String, Object> submitExercise(Long userId, ExerciseRequest request) {
        if (userId == null)
            userId = 1L;

        Word word = wordMapper.findById(request.getWordId());
        if (word == null) {
            throw new RuntimeException("Word not found");
        }

        String correctAnswer = null;
        if ("MULTIPLE_CHOICE".equals(request.getQuestionType())) {
            correctAnswer = word.getChinese();
        } else if ("FILL_BLANK".equals(request.getQuestionType())) {
            correctAnswer = word.getEnglish().toLowerCase();
        } else if ("LISTENING".equals(request.getQuestionType())) {
            correctAnswer = word.getEnglish();
        }

        boolean isCorrect = correctAnswer != null &&
                correctAnswer.equalsIgnoreCase(request.getUserAnswer().trim());

        // Save exercise record
        Exercise exercise = new Exercise();
        exercise.setUserId(userId);
        exercise.setQuestionType(request.getQuestionType());
        exercise.setWordId(request.getWordId());
        exercise.setUserAnswer(request.getUserAnswer());
        exercise.setCorrectAnswer(correctAnswer);
        exercise.setIsCorrect(isCorrect);
        exercise.setTimeSpent(request.getTimeSpent());
        exerciseMapper.insert(exercise);

        // Update progress based on correctness
        Progress progress = progressMapper.findByUserAndWord(userId, request.getWordId());
        int currentLevel = progress != null ? progress.getMasteryLevel() : 0;
        int newLevel = spacedRepetitionService.calculateMasteryLevel(currentLevel, isCorrect);
        progressService.updateProgress(userId, request.getWordId(), newLevel, null);

        // Return result
        Map<String, Object> result = new HashMap<>();
        result.put("isCorrect", isCorrect);
        result.put("correctAnswer", correctAnswer);
        result.put("userAnswer", request.getUserAnswer());
        result.put("explanation", word.getExampleSentence());

        return result;
    }

    /**
     * Get exercise history
     */
    public List<Exercise> getExerciseHistory(Long userId, Integer limit) {
        if (userId == null)
            userId = 1L;
        if (limit == null)
            limit = 20;
        return exerciseMapper.findByUserId(userId, limit);
    }

    /**
     * Get exercise statistics
     */
    public Map<String, Object> getExerciseStats(Long userId) {
        if (userId == null)
            userId = 1L;

        int totalExercises = exerciseMapper.countByUserId(userId);
        Double averageAccuracy = exerciseMapper.getAverageAccuracy(userId);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalExercises", totalExercises);
        stats.put("averageAccuracy", averageAccuracy != null ? averageAccuracy : 0.0);

        return stats;
    }
}
