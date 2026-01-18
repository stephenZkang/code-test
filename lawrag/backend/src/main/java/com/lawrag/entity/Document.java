package com.lawrag.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("documents")
public class Document {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String title;
    private String category;
    private String fileName;
    private String filePath;
    private String fileType;
    private Long fileSize;
    
    @TableField(value = "content", updateStrategy = FieldStrategy.IGNORED)
    private String content;
    
    private String parseStatus;
    private Integer parseProgress;
    private String parseError;
    private Integer vectorCount;
    
    private LocalDateTime uploadTime;
    private LocalDateTime parseTime;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
