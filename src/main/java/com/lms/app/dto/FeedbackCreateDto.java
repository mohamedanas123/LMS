package com.lms.app.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public class FeedbackCreateDto {

    @NotNull(message = "Score is required")
    @DecimalMin(value = "0.0", message = "Score cannot be negative")
    private Double grade;

    private String comments;

    public FeedbackCreateDto() {
    }

    public FeedbackCreateDto(Double grade, String comments) {
        this.grade = grade;
        this.comments = comments;
    }

    public Double getGrade() {
        return grade;
    }

    public void setGrade(Double grade) {
        this.grade = grade;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Double grade;
        private String comments;

        public Builder grade(Double grade) {
            this.grade = grade;
            return this;
        }

        public Builder comments(String comments) {
            this.comments = comments;
            return this;
        }

        public FeedbackCreateDto build() {
            return new FeedbackCreateDto(grade, comments);
        }
    }
}
