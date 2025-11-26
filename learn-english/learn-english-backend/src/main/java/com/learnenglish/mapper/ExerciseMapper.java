package com.learnenglish.mapper;

import com.learnenglish.model.Exercise;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface ExerciseMapper {
    
    List<Exercise> findByUserId(@Param("userId") Long userId, @Param("limit") Integer limit);
    
    List<Exercise> findByUserAndDateRange(@Param("userId") Long userId, 
                                          @Param("startDate") LocalDateTime startDate,
                                          @Param("endDate") LocalDateTime endDate);
    
    int insert(Exercise exercise);
    
    int countByUserId(@Param("userId") Long userId);
    
    Double getAverageAccuracy(@Param("userId") Long userId);
}
