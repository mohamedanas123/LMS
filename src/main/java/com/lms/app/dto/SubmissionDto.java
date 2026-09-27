package com.lms.app.dto;

import com.lms.app.model.Submission;
import com.lms.app.model.SubmissionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
