package com.learnenglish.dto;

import lombok.Data;
import java.util.List;

@Data
public class ExerciseRequest {
    private String questionType; // MULTIPLE_CHOICE, FILL_BLANK, LISTENING
    private Long wordId;
    private String userAnswer;
    private Integer timeSpent;
}
