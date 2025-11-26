package com.learnenglish.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import com.learnenglish.model.Word;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExerciseQuestion {
    private Long id;
    private String questionType;
    private Word word;
    private List<String> options; // For multiple choice
    private String correctAnswer;
    private String hint;
}
