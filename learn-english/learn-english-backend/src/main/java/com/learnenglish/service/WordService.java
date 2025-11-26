package com.learnenglish.service;

import com.learnenglish.model.Word;
import com.learnenglish.mapper.WordMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class WordService {
    
    @Autowired
    private WordMapper wordMapper;
    
    public List<Word> getAllWords() {
        return wordMapper.findAll();
    }
    
    public List<Word> getWordsByCategory(String category) {
        return wordMapper.findByCategory(category);
    }
    
    public List<Word> getRandomWords(Integer limit, Long userId) {
        if (limit == null || limit <= 0) {
            limit = 10;
        }
        if (userId == null) {
            userId = 1L;
        }
        return wordMapper.findRandom(limit, userId);
    }
    
    public Word getWordById(Long id) {
        return wordMapper.findById(id);
    }
    
    public Word createWord(Word word) {
        wordMapper.insert(word);
        return word;
    }
    
    public Word updateWord(Long id, Word word) {
        word.setId(id);
        wordMapper.update(word);
        return word;
    }
    
    public void deleteWord(Long id) {
        wordMapper.deleteById(id);
    }
    
    public int getTotalWordCount() {
        return wordMapper.count();
    }
}
