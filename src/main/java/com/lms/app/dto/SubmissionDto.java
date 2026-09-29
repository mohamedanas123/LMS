package com.lms.app.dto;

import com.lms.app.model.Submission;
import com.lms.app.model.SubmissionStatus;

import java.time.LocalDateTime;

public class SubmissionDto {
    private Long id;
    private Long assignmentId;
    private String assignmentTitle;
    private Integer maxScore;
    private Long courseId;
    private String courseTitle;
    private UserDto student;
    private String textContent;
    private String originalFileName;
    private String fileContentType;
    private Long fileSize;
    private boolean hasAttachment;
    private SubmissionStatus status;
    private FeedbackDto feedback;
    private LocalDateTime submittedAt;
    private LocalDateTime updatedAt;

    public SubmissionDto() {
    }

    public SubmissionDto(Long id, Long assignmentId, String assignmentTitle, Integer maxScore, Long courseId,
                         String courseTitle, UserDto student, String textContent, String originalFileName,
                         String fileContentType, Long fileSize, boolean hasAttachment, SubmissionStatus status,
                         FeedbackDto feedback, LocalDateTime submittedAt, LocalDateTime updatedAt) {
        this.id = id;
        this.assignmentId = assignmentId;
        this.assignmentTitle = assignmentTitle;
        this.maxScore = maxScore;
        this.courseId = courseId;
        this.courseTitle = courseTitle;
        this.student = student;
        this.textContent = textContent;
        this.originalFileName = originalFileName;
        this.fileContentType = fileContentType;
        this.fileSize = fileSize;
        this.hasAttachment = hasAttachment;
        this.status = status;
        this.feedback = feedback;
        this.submittedAt = submittedAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAssignmentId() {
        return assignmentId;
    }

    public void setAssignmentId(Long assignmentId) {
        this.assignmentId = assignmentId;
    }

    public String getAssignmentTitle() {
        return assignmentTitle;
    }

    public void setAssignmentTitle(String assignmentTitle) {
        this.assignmentTitle = assignmentTitle;
    }

    public Integer getMaxScore() {
        return maxScore;
    }

    public void setMaxScore(Integer maxScore) {
        this.maxScore = maxScore;
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

    public UserDto getStudent() {
        return student;
    }

    public void setStudent(UserDto student) {
        this.student = student;
    }

    public String getTextContent() {
        return textContent;
    }

    public void setTextContent(String textContent) {
        this.textContent = textContent;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public String getFileContentType() {
        return fileContentType;
    }

    public void setFileContentType(String fileContentType) {
        this.fileContentType = fileContentType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public boolean isHasAttachment() {
        return hasAttachment;
    }

    public void setHasAttachment(boolean hasAttachment) {
        this.hasAttachment = hasAttachment;
    }

    public SubmissionStatus getStatus() {
        return status;
    }

    public void setStatus(SubmissionStatus status) {
        this.status = status;
    }

    public FeedbackDto getFeedback() {
        return feedback;
    }

    public void setFeedback(FeedbackDto feedback) {
        this.feedback = feedback;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
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
        private Long assignmentId;
        private String assignmentTitle;
        private Integer maxScore;
        private Long courseId;
        private String courseTitle;
        private UserDto student;
        private String textContent;
        private String originalFileName;
        private String fileContentType;
        private Long fileSize;
        private boolean hasAttachment;
        private SubmissionStatus status;
        private FeedbackDto feedback;
        private LocalDateTime submittedAt;
        private LocalDateTime updatedAt;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder assignmentId(Long assignmentId) {
            this.assignmentId = assignmentId;
            return this;
        }

        public Builder assignmentTitle(String assignmentTitle) {
            this.assignmentTitle = assignmentTitle;
            return this;
        }

        public Builder maxScore(Integer maxScore) {
            this.maxScore = maxScore;
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

        public Builder student(UserDto student) {
            this.student = student;
            return this;
        }

        public Builder textContent(String textContent) {
            this.textContent = textContent;
            return this;
        }

        public Builder originalFileName(String originalFileName) {
            this.originalFileName = originalFileName;
            return this;
        }

        public Builder fileContentType(String fileContentType) {
            this.fileContentType = fileContentType;
            return this;
        }

        public Builder fileSize(Long fileSize) {
            this.fileSize = fileSize;
            return this;
        }

        public Builder hasAttachment(boolean hasAttachment) {
            this.hasAttachment = hasAttachment;
            return this;
        }

        public Builder status(SubmissionStatus status) {
            this.status = status;
            return this;
        }

        public Builder feedback(FeedbackDto feedback) {
            this.feedback = feedback;
            return this;
        }

        public Builder submittedAt(LocalDateTime submittedAt) {
            this.submittedAt = submittedAt;
            return this;
        }

        public Builder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public SubmissionDto build() {
            return new SubmissionDto(id, assignmentId, assignmentTitle, maxScore, courseId, courseTitle,
                    student, textContent, originalFileName, fileContentType, fileSize, hasAttachment,
                    status, feedback, submittedAt, updatedAt);
        }
    }

    public static SubmissionDto fromEntity(Submission submission) {
        if (submission == null) return null;
        return SubmissionDto.builder()
                .id(submission.getId())
                .assignmentId(submission.getAssignment() != null ? submission.getAssignment().getId() : null)
                .assignmentTitle(submission.getAssignment() != null ? submission.getAssignment().getTitle() : null)
                .maxScore(submission.getAssignment() != null ? submission.getAssignment().getMaxScore() : null)
                .courseId(submission.getAssignment() != null && submission.getAssignment().getCourse() != null ? submission.getAssignment().getCourse().getId() : null)
                .courseTitle(submission.getAssignment() != null && submission.getAssignment().getCourse() != null ? submission.getAssignment().getCourse().getTitle() : null)
                .student(UserDto.fromEntity(submission.getStudent()))
                .textContent(submission.getTextContent())
                .originalFileName(submission.getOriginalFileName())
                .fileContentType(submission.getFileContentType())
                .fileSize(submission.getFileSize())
                .hasAttachment(submission.getStoredFileName() != null && !submission.getStoredFileName().isEmpty())
                .status(submission.getStatus())
                .feedback(submission.getFeedback() != null ? FeedbackDto.fromEntity(submission.getFeedback()) : null)
                .submittedAt(submission.getSubmittedAt())
                .updatedAt(submission.getUpdatedAt())
                .build();
    }
}
