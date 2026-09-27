package com.lms.app.dto;

import com.lms.app.model.Assignment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
