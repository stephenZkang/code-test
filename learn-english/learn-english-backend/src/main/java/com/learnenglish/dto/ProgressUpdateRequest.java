package com.learnenglish.dto;

import lombok.Data;

@Data
public class ProgressUpdateRequest {
    private Long wordId;
    private Integer masteryLevel;
    private Boolean isBookmarked;
}
