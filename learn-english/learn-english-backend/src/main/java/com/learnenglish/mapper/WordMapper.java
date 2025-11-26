package com.learnenglish.mapper;

import com.learnenglish.model.Word;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface WordMapper {
    
    List<Word> findAll();
    
    List<Word> findByCategory(@Param("category") String category);
    
    List<Word> findRandom(@Param("limit") Integer limit, @Param("userId") Long userId);
    
    Word findById(@Param("id") Long id);
    
    int insert(Word word);
    
    int update(Word word);
    
    int deleteById(@Param("id") Long id);
    
    int count();
}
