package com.learnenglish.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Word {
    private Long id;
    private String english;
    private String chinese;
    private String pronunciation;
    private String category;
    private Integer difficulty;
    private String audioUrl;
    private String exampleSentence;
    private LocalDateTime createdAt;
}
