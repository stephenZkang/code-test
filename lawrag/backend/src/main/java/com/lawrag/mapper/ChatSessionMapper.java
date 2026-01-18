package com.lawrag.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.lawrag.entity.ChatSession;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ChatSessionMapper extends BaseMapper<ChatSession> {
}
