package com.learnenglish.mapper;

import com.learnenglish.model.LearningSession;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.time.LocalDate;
import java.util.List;

@Mapper
public interface LearningSessionMapper {
    
    LearningSession findByUserAndDate(@Param("userId") Long userId, @Param("sessionDate") LocalDate sessionDate);
    
    List<LearningSession> findByUserAndDateRange(@Param("userId") Long userId,
                                                  @Param("startDate") LocalDate startDate,
                                                  @Param("endDate") LocalDate endDate);
    
    int insert(LearningSession session);
    
    int update(LearningSession session);
    
    int countStreak(@Param("userId") Long userId, @Param("endDate") LocalDate endDate);
}
