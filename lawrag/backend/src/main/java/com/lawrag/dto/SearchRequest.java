package com.lawrag.dto;

import lombok.Data;
import java.util.List;

@Data
public class SearchRequest {
    private String query;
    private String category;
    private Integer limit = 10;
}
