package com.lms.app.dto;

import com.lms.app.model.Assignment;

import java.time.LocalDateTime;

public class AssignmentDto {
    private Long id;
    private Long courseId;
    private String courseTitle;
    private String courseCode;
    private String title;
    private String description;
    private Integer maxScore;
    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
    private int submissionCount;
    private boolean hasSubmitted;
    private SubmissionDto mySubmission;

    public AssignmentDto() {
    }

    public AssignmentDto(Long id, Long courseId, String courseTitle, String courseCode, String title,
                         String description, Integer maxScore, LocalDateTime dueDate, LocalDateTime createdAt,
                         int submissionCount, boolean hasSubmitted, SubmissionDto mySubmission) {
        this.id = id;
        this.courseId = courseId;
        this.courseTitle = courseTitle;
        this.courseCode = courseCode;
        this.title = title;
        this.description = description;
        this.maxScore = maxScore;
        this.dueDate = dueDate;
        this.createdAt = createdAt;
        this.submissionCount = submissionCount;
        this.hasSubmitted = hasSubmitted;
        this.mySubmission = mySubmission;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public String getCourseTitle() {
        return courseTitle;
    }

    public void setCourseTitle(String courseTitle) {
        this.courseTitle = courseTitle;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public int getSubmissionCount() {
        return submissionCount;
    }

    public void setSubmissionCount(int submissionCount) {
        this.submissionCount = submissionCount;
    }

    public boolean isHasSubmitted() {
        return hasSubmitted;
    }

    public void setHasSubmitted(boolean hasSubmitted) {
        this.hasSubmitted = hasSubmitted;
    }

    public SubmissionDto getMySubmission() {
        return mySubmission;
    }

    public void setMySubmission(SubmissionDto mySubmission) {
        this.mySubmission = mySubmission;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Long courseId;
        private String courseTitle;
        private String courseCode;
        private String title;
        private String description;
        private Integer maxScore;
        private LocalDateTime dueDate;
        private LocalDateTime createdAt;
        private int submissionCount;
        private boolean hasSubmitted;
        private SubmissionDto mySubmission;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder courseId(Long courseId) {
            this.courseId = courseId;
            return this;
        }

        public Builder courseTitle(String courseTitle) {
            this.courseTitle = courseTitle;
            return this;
        }

        public Builder courseCode(String courseCode) {
            this.courseCode = courseCode;
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

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Builder submissionCount(int submissionCount) {
            this.submissionCount = submissionCount;
            return this;
        }

        public Builder hasSubmitted(boolean hasSubmitted) {
            this.hasSubmitted = hasSubmitted;
            return this;
        }

        public Builder mySubmission(SubmissionDto mySubmission) {
            this.mySubmission = mySubmission;
            return this;
        }

        public AssignmentDto build() {
            return new AssignmentDto(id, courseId, courseTitle, courseCode, title, description,
                    maxScore, dueDate, createdAt, submissionCount, hasSubmitted, mySubmission);
        }
    }

    public static AssignmentDto fromEntity(Assignment assignment) {
        if (assignment == null) return null;
        return AssignmentDto.builder()
                .id(assignment.getId())
                .courseId(assignment.getCourse() != null ? assignment.getCourse().getId() : null)
                .courseTitle(assignment.getCourse() != null ? assignment.getCourse().getTitle() : null)
                .courseCode(assignment.getCourse() != null ? assignment.getCourse().getCode() : null)
                .title(assignment.getTitle())
                .description(assignment.getDescription())
                .maxScore(assignment.getMaxScore())
                .dueDate(assignment.getDueDate())
                .createdAt(assignment.getCreatedAt())
                .submissionCount(assignment.getSubmissions() != null ? assignment.getSubmissions().size() : 0)
                .build();
    }
}
