package com.lawrag.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("document_references")
public class DocumentReference {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long messageId;
    private Long documentId;
    
    private String chunkText;
    private String chunkPosition;
    private Float similarityScore;
    private Integer pageNumber;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
