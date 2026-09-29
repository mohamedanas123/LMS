package com.lms.app.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "assignments")
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnoreProperties({"assignments", "enrollments"})
    private Course course;

    @NotBlank(message = "Assignment title is required")
    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Max score is required")
    @Min(value = 1, message = "Max score must be at least 1")
    @Column(name = "max_score", nullable = false)
    private Integer maxScore;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @OneToMany(
            mappedBy = "assignment",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Submission> submissions = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;


    // No-argument constructor
    public Assignment() {
    }


    // All-argument constructor
    public Assignment(
            Long id,
            Course course,
            String title,
            String description,
            Integer maxScore,
            LocalDateTime dueDate,
            List<Submission> submissions,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.course = course;
        this.title = title;
        this.description = description;
        this.maxScore = maxScore;
        this.dueDate = dueDate;
        this.submissions = submissions;
        this.createdAt = createdAt;
    }


    // Getters

    public Long getId() {
        return id;
    }

    public Course getCourse() {
        return course;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Integer getMaxScore() {
        return maxScore;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public List<Submission> getSubmissions() {
        return submissions;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }


    // Setters

    public void setId(Long id) {
        this.id = id;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setMaxScore(Integer maxScore) {
        this.maxScore = maxScore;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public void setSubmissions(List<Submission> submissions) {
        this.submissions = submissions;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }


    // Builder

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {

        private Long id;
        private Course course;
        private String title;
        private String description;
        private Integer maxScore;
        private LocalDateTime dueDate;
        private List<Submission> submissions = new ArrayList<>();
        private LocalDateTime createdAt;


        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder course(Course course) {
            this.course = course;
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

        public Builder submissions(List<Submission> submissions) {
            this.submissions = submissions;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }


        public Assignment build() {
            return new Assignment(
                    id,
                    course,
                    title,
                    description,
                    maxScore,
                    dueDate,
                    submissions,
                    createdAt
            );
        }
    }


    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}