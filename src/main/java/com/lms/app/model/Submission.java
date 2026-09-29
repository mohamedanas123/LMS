package com.lms.app.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assignment_id", nullable = false)
    @JsonIgnoreProperties({"submissions", "course"})
    private Assignment assignment;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({"passwordHash", "createdAt"})
    private User student;

    @Column(name = "text_content", columnDefinition = "TEXT")
    private String textContent;

    // Securely stored file reference (UUID filename on disk)
    @Column(name = "stored_file_name")
    private String storedFileName;

    @Column(name = "original_file_name")
    private String originalFileName;

    @Column(name = "file_content_type", length = 100)
    private String fileContentType;

    @Column(name = "file_size")
    private Long fileSize;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SubmissionStatus status = SubmissionStatus.SUBMITTED;

    @OneToOne(
            mappedBy = "submission",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.EAGER
    )
    private Feedback feedback;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


    // No-argument constructor
    public Submission() {
    }


    // All-argument constructor
    public Submission(
            Long id,
            Assignment assignment,
            User student,
            String textContent,
            String storedFileName,
            String originalFileName,
            String fileContentType,
            Long fileSize,
            SubmissionStatus status,
            Feedback feedback,
            LocalDateTime submittedAt,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.assignment = assignment;
        this.student = student;
        this.textContent = textContent;
        this.storedFileName = storedFileName;
        this.originalFileName = originalFileName;
        this.fileContentType = fileContentType;
        this.fileSize = fileSize;
        this.status = status;
        this.feedback = feedback;
        this.submittedAt = submittedAt;
        this.updatedAt = updatedAt;
    }


    // Getters

    public Long getId() {
        return id;
    }

    public Assignment getAssignment() {
        return assignment;
    }

    public User getStudent() {
        return student;
    }

    public String getTextContent() {
        return textContent;
    }

    public String getStoredFileName() {
        return storedFileName;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public String getFileContentType() {
        return fileContentType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public SubmissionStatus getStatus() {
        return status;
    }

    public Feedback getFeedback() {
        return feedback;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }


    // Setters

    public void setId(Long id) {
        this.id = id;
    }

    public void setAssignment(Assignment assignment) {
        this.assignment = assignment;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public void setTextContent(String textContent) {
        this.textContent = textContent;
    }

    public void setStoredFileName(String storedFileName) {
        this.storedFileName = storedFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public void setFileContentType(String fileContentType) {
        this.fileContentType = fileContentType;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public void setStatus(SubmissionStatus status) {
        this.status = status;
    }

    public void setFeedback(Feedback feedback) {
        this.feedback = feedback;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }


    // Builder

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {

        private Long id;
        private Assignment assignment;
        private User student;
        private String textContent;
        private String storedFileName;
        private String originalFileName;
        private String fileContentType;
        private Long fileSize;
        private SubmissionStatus status = SubmissionStatus.SUBMITTED;
        private Feedback feedback;
        private LocalDateTime submittedAt;
        private LocalDateTime updatedAt;


        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder assignment(Assignment assignment) {
            this.assignment = assignment;
            return this;
        }

        public Builder student(User student) {
            this.student = student;
            return this;
        }

        public Builder textContent(String textContent) {
            this.textContent = textContent;
            return this;
        }

        public Builder storedFileName(String storedFileName) {
            this.storedFileName = storedFileName;
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

        public Builder status(SubmissionStatus status) {
            this.status = status;
            return this;
        }

        public Builder feedback(Feedback feedback) {
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


        public Submission build() {
            return new Submission(
                    id,
                    assignment,
                    student,
                    textContent,
                    storedFileName,
                    originalFileName,
                    fileContentType,
                    fileSize,
                    status,
                    feedback,
                    submittedAt,
                    updatedAt
            );
        }
    }


    @PrePersist
    protected void onCreate() {
        this.submittedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();

        if (this.status == null) {
            this.status = SubmissionStatus.SUBMITTED;
        }
    }


    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}