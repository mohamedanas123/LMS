package com.lms.app.dto;

import com.lms.app.model.Course;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
