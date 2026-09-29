package com.lms.app.dto;

import com.lms.app.model.Course;

import java.time.LocalDateTime;

public class CourseDto {
    private Long id;
    private String title;
    private String code;
    private String description;
    private UserDto instructor;
    private int enrolledStudentsCount;
    private int assignmentsCount;
    private boolean isEnrolledByCurrentUser;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CourseDto() {
    }

    public CourseDto(Long id, String title, String code, String description, UserDto instructor,
                     int enrolledStudentsCount, int assignmentsCount, boolean isEnrolledByCurrentUser,
                     LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.code = code;
        this.description = description;
        this.instructor = instructor;
        this.enrolledStudentsCount = enrolledStudentsCount;
        this.assignmentsCount = assignmentsCount;
        this.isEnrolledByCurrentUser = isEnrolledByCurrentUser;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public UserDto getInstructor() {
        return instructor;
    }

    public void setInstructor(UserDto instructor) {
        this.instructor = instructor;
    }

    public int getEnrolledStudentsCount() {
        return enrolledStudentsCount;
    }

    public void setEnrolledStudentsCount(int enrolledStudentsCount) {
        this.enrolledStudentsCount = enrolledStudentsCount;
    }

    public int getAssignmentsCount() {
        return assignmentsCount;
    }

    public void setAssignmentsCount(int assignmentsCount) {
        this.assignmentsCount = assignmentsCount;
    }

    public boolean isEnrolledByCurrentUser() {
        return isEnrolledByCurrentUser;
    }

    public void setEnrolledByCurrentUser(boolean enrolledByCurrentUser) {
        isEnrolledByCurrentUser = enrolledByCurrentUser;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
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
        private String title;
        private String code;
        private String description;
        private UserDto instructor;
        private int enrolledStudentsCount;
        private int assignmentsCount;
        private boolean isEnrolledByCurrentUser;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder title(String title) {
            this.title = title;
            return this;
        }

        public Builder code(String code) {
            this.code = code;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Builder instructor(UserDto instructor) {
            this.instructor = instructor;
            return this;
        }

        public Builder enrolledStudentsCount(int enrolledStudentsCount) {
            this.enrolledStudentsCount = enrolledStudentsCount;
            return this;
        }

        public Builder assignmentsCount(int assignmentsCount) {
            this.assignmentsCount = assignmentsCount;
            return this;
        }

        public Builder isEnrolledByCurrentUser(boolean isEnrolledByCurrentUser) {
            this.isEnrolledByCurrentUser = isEnrolledByCurrentUser;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Builder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public CourseDto build() {
            return new CourseDto(id, title, code, description, instructor, enrolledStudentsCount,
                    assignmentsCount, isEnrolledByCurrentUser, createdAt, updatedAt);
        }
    }

    public static CourseDto fromEntity(Course course) {
        if (course == null) return null;
        return CourseDto.builder()
                .id(course.getId())
                .title(course.getTitle())
                .code(course.getCode())
                .description(course.getDescription())
                .instructor(UserDto.fromEntity(course.getInstructor()))
                .enrolledStudentsCount(course.getEnrollments() != null ? course.getEnrollments().size() : 0)
                .assignmentsCount(course.getAssignments() != null ? course.getAssignments().size() : 0)
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .build();
    }
}
