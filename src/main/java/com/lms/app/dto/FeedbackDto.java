package com.lms.app.dto;

import com.lms.app.model.Feedback;

import java.time.LocalDateTime;

public class FeedbackDto {
    private Long id;
    private Long submissionId;
    private UserDto instructor;
    private Double grade;
    private String comments;
    private LocalDateTime gradedAt;
    private LocalDateTime updatedAt;

    public FeedbackDto() {
    }

    public FeedbackDto(Long id, Long submissionId, UserDto instructor, Double grade, String comments,
                       LocalDateTime gradedAt, LocalDateTime updatedAt) {
        this.id = id;
        this.submissionId = submissionId;
        this.instructor = instructor;
        this.grade = grade;
        this.comments = comments;
        this.gradedAt = gradedAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSubmissionId() {
        return submissionId;
    }

    public void setSubmissionId(Long submissionId) {
        this.submissionId = submissionId;
    }

    public UserDto getInstructor() {
        return instructor;
    }

    public void setInstructor(UserDto instructor) {
        this.instructor = instructor;
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

    public LocalDateTime getGradedAt() {
        return gradedAt;
    }

    public void setGradedAt(LocalDateTime gradedAt) {
        this.gradedAt = gradedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Long submissionId;
        private UserDto instructor;
        private Double grade;
        private String comments;
        private LocalDateTime gradedAt;
        private LocalDateTime updatedAt;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder submissionId(Long submissionId) {
            this.submissionId = submissionId;
            return this;
        }

        public Builder instructor(UserDto instructor) {
            this.instructor = instructor;
            return this;
        }

        public Builder grade(Double grade) {
            this.grade = grade;
            return this;
        }

        public Builder comments(String comments) {
            this.comments = comments;
            return this;
        }

        public Builder gradedAt(LocalDateTime gradedAt) {
            this.gradedAt = gradedAt;
            return this;
        }

        public Builder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public FeedbackDto build() {
            return new FeedbackDto(id, submissionId, instructor, grade, comments, gradedAt, updatedAt);
        }
    }

    public static FeedbackDto fromEntity(Feedback feedback) {
        if (feedback == null) return null;
        return FeedbackDto.builder()
                .id(feedback.getId())
                .submissionId(feedback.getSubmission() != null ? feedback.getSubmission().getId() : null)
                .instructor(UserDto.fromEntity(feedback.getInstructor()))
                .grade(feedback.getGrade())
                .comments(feedback.getComments())
                .gradedAt(feedback.getGradedAt())
                .updatedAt(feedback.getUpdatedAt())
                .build();
    }
}
