package com.lawrag.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("chat_messages")
public class ChatMessage {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String sessionId;
    private String role;
    private String content;
    
    private String model;
    private Integer tokensUsed;
    private Integer responseTime;
    private Boolean cached;
    private Boolean hasReferences;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
