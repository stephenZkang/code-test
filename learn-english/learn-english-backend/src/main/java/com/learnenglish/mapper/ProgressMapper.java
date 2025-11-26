package com.learnenglish.mapper;

import com.learnenglish.model.Progress;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface ProgressMapper {
    
    Progress findByUserAndWord(@Param("userId") Long userId, @Param("wordId") Long wordId);
    
    List<Progress> findByUserId(@Param("userId") Long userId);
    
    List<Progress> findDueWords(@Param("userId") Long userId, @Param("now") LocalDateTime now);
    
    List<Progress> findBookmarked(@Param("userId") Long userId);
    
    int insert(Progress progress);
    
    int update(Progress progress);
    
    int countLearned(@Param("userId") Long userId);
    
    int countMastered(@Param("userId") Long userId);
    
    int countBookmarked(@Param("userId") Long userId);
}
