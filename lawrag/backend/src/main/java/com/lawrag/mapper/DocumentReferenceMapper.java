package com.lawrag.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.lawrag.entity.DocumentReference;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface DocumentReferenceMapper extends BaseMapper<DocumentReference> {

    /**
     * Get all references for a message with document details
     */
    @Select("SELECT dr.*, d.title, d.file_name, d.file_path " +
            "FROM document_references dr " +
            "LEFT JOIN documents d ON dr.document_id = d.id " +
            "WHERE dr.message_id = #{messageId} " +
            "ORDER BY dr.similarity_score DESC")
    List<DocumentReference> findByMessageIdWithDocument(@Param("messageId") Long messageId);
}
