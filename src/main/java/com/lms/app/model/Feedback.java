package com.lms.app.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false, unique = true)
    @JsonIgnoreProperties({"feedback", "assignment"})
    private Submission submission;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "instructor_id", nullable = false)
    @JsonIgnoreProperties({"passwordHash", "createdAt"})
    private User instructor;

    @NotNull(message = "Score/grade is required")
    @Min(value = 0, message = "Grade cannot be negative")
    @Column(nullable = false)
    private Double grade;

    @Column(columnDefinition = "TEXT")
    private String comments;

    @Column(name = "graded_at", nullable = false, updatable = false)
    private LocalDateTime gradedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


    // No-argument constructor
    public Feedback() {
    }


    // All-argument constructor
    public Feedback(
            Long id,
            Submission submission,
            User instructor,
            Double grade,
            String comments,
            LocalDateTime gradedAt,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.submission = submission;
        this.instructor = instructor;
        this.grade = grade;
        this.comments = comments;
        this.gradedAt = gradedAt;
        this.updatedAt = updatedAt;
    }


    // Getters

    public Long getId() {
        return id;
    }

    public Submission getSubmission() {
        return submission;
    }

    public User getInstructor() {
        return instructor;
    }

    public Double getGrade() {
        return grade;
    }

    public String getComments() {
        return comments;
    }

    public LocalDateTime getGradedAt() {
        return gradedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }


    // Setters

    public void setId(Long id) {
        this.id = id;
    }

    public void setSubmission(Submission submission) {
        this.submission = submission;
    }

    public void setInstructor(User instructor) {
        this.instructor = instructor;
    }

    public void setGrade(Double grade) {
        this.grade = grade;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public void setGradedAt(LocalDateTime gradedAt) {
        this.gradedAt = gradedAt;
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
        private Submission submission;
        private User instructor;
        private Double grade;
        private String comments;
        private LocalDateTime gradedAt;
        private LocalDateTime updatedAt;


        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder submission(Submission submission) {
            this.submission = submission;
            return this;
        }

        public Builder instructor(User instructor) {
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


        public Feedback build() {
            return new Feedback(
                    id,
                    submission,
                    instructor,
                    grade,
                    comments,
                    gradedAt,
                    updatedAt
            );
        }
    }


    @PrePersist
    protected void onCreate() {
        this.gradedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}