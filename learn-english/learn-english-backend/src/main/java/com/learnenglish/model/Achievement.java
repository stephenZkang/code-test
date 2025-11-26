package com.learnenglish.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Achievement {
    private Long id;
    private String name;
    private String description;
    private String icon;
    private String requirementType;
    private Integer requirementValue;
    private LocalDateTime createdAt;
}
