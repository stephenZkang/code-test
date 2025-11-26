package com.learnenglish.mapper;

import com.learnenglish.model.Achievement;
import com.learnenglish.model.UserAchievement;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface AchievementMapper {
    
    List<Achievement> findAll();
    
    Achievement findById(@Param("id") Long id);
    
    List<UserAchievement> findUserAchievements(@Param("userId") Long userId);
    
    UserAchievement findUserAchievement(@Param("userId") Long userId, @Param("achievementId") Long achievementId);
    
    int insertUserAchievement(UserAchievement userAchievement);
}
