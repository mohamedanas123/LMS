package com.lms.app.dto;

import com.lms.app.model.Feedback;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackDto {
    private Long id;
    private Long submissionId;
    private UserDto instructor;
    private Double grade;
    private String comments;
    private LocalDateTime gradedAt;
    private LocalDateTime updatedAt;

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
