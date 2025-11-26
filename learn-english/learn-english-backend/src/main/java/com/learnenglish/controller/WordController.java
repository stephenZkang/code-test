package com.learnenglish.controller;

import com.learnenglish.dto.ApiResponse;
import com.learnenglish.model.Word;
import com.learnenglish.service.WordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/words")
public class WordController {
    
    @Autowired
    private WordService wordService;
    
    @GetMapping
    public ApiResponse<List<Word>> getAllWords(@RequestParam(required = false) String category) {
        List<Word> words;
        if (category != null && !category.isEmpty()) {
            words = wordService.getWordsByCategory(category);
        } else {
            words = wordService.getAllWords();
        }
        return ApiResponse.success(words);
    }
    
    @GetMapping("/random")
    public ApiResponse<List<Word>> getRandomWords(
            @RequestParam(required = false, defaultValue = "10") Integer limit,
            @RequestParam(required = false, defaultValue = "1") Long userId) {
        List<Word> words = wordService.getRandomWords(limit, userId);
        return ApiResponse.success(words);
    }
    
    @GetMapping("/{id}")
    public ApiResponse<Word> getWordById(@PathVariable Long id) {
        Word word = wordService.getWordById(id);
        if (word == null) {
            return ApiResponse.error(404, "Word not found");
        }
        return ApiResponse.success(word);
    }
    
    @PostMapping
    public ApiResponse<Word> createWord(@RequestBody Word word) {
        Word created = wordService.createWord(word);
        return ApiResponse.success("Word created successfully", created);
    }
    
    @PutMapping("/{id}")
    public ApiResponse<Word> updateWord(@PathVariable Long id, @RequestBody Word word) {
        Word updated = wordService.updateWord(id, word);
        return ApiResponse.success("Word updated successfully", updated);
    }
    
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteWord(@PathVariable Long id) {
        wordService.deleteWord(id);
        return ApiResponse.success("Word deleted successfully", null);
    }
}
