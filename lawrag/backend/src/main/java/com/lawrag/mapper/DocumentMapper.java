package com.lawrag.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.lawrag.entity.Document;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface DocumentMapper extends BaseMapper<Document> {
    
    /**
     * Full-text search in document content and title
     */
    @Select("SELECT * FROM documents WHERE MATCH(content, title) AGAINST(#{query} IN NATURAL LANGUAGE MODE) AND parse_status = 'COMPLETED' LIMIT #{limit}")
    List<Document> fullTextSearch(@Param("query") String query, @Param("limit") int limit);
    
    /**
     * Search by category
     */
    @Select("SELECT * FROM documents WHERE category = #{category} AND parse_status = 'COMPLETED' ORDER BY upload_time DESC LIMIT #{limit}")
    List<Document> findByCategory(@Param("category") String category, @Param("limit") int limit);
    
    /**
     * Get random documents for homepage
     */
    @Select("SELECT * FROM documents WHERE parse_status = 'COMPLETED' ORDER BY RAND() LIMIT #{limit}")
    List<Document> findRandom(@Param("limit") int limit);
}
