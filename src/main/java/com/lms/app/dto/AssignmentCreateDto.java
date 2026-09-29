package com.lms.app.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

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

    public AssignmentCreateDto() {
    }

    public AssignmentCreateDto(Long courseId, String title, String description, Integer maxScore, LocalDateTime dueDate) {
        this.courseId = courseId;
        this.title = title;
        this.description = description;
        this.maxScore = maxScore;
        this.dueDate = dueDate;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getMaxScore() {
        return maxScore;
    }

    public void setMaxScore(Integer maxScore) {
        this.maxScore = maxScore;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long courseId;
        private String title;
        private String description;
        private Integer maxScore;
        private LocalDateTime dueDate;

        public Builder courseId(Long courseId) {
            this.courseId = courseId;
            return this;
        }

        public Builder title(String title) {
            this.title = title;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Builder maxScore(Integer maxScore) {
            this.maxScore = maxScore;
            return this;
        }

        public Builder dueDate(LocalDateTime dueDate) {
            this.dueDate = dueDate;
            return this;
        }

        public AssignmentCreateDto build() {
            return new AssignmentCreateDto(courseId, title, description, maxScore, dueDate);
        }
    }
}
