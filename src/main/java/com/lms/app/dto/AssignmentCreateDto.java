package com.lms.app.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AssignmentCreateDto {
    @NotNull(message = "Course ID is required")
    private Long courseId;

    @NotBlank(message = "Assignment title is required")
    private String title;

    private String description;

    @NotNull(message = "Max score is required")
    @Min(value = 1, message = "Max score must be at least 1")
    private Integer maxScore;

    private LocalDateTime dueDate;
}
