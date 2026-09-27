package com.lms.app.service;

import com.lms.app.dto.FeedbackCreateDto;
import com.lms.app.dto.FeedbackDto;
import com.lms.app.dto.SubmissionDto;
import com.lms.app.exception.AccessDeniedException;
import com.lms.app.exception.BadRequestException;
import com.lms.app.exception.ResourceNotFoundException;
import com.lms.app.model.*;
import com.lms.app.repository.AssignmentRepository;
import com.lms.app.repository.EnrollmentRepository;
import com.lms.app.repository.FeedbackRepository;
import com.lms.app.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final FeedbackRepository feedbackRepository;
    private final FileStorageService fileStorageService;
    private final HtmlSanitizerService sanitizer;
    private final AuthService authService;

    @Transactional
    public SubmissionDto submitAssignment(Long assignmentId, String textContent, MultipartFile file) {
        User currentUser = authService.getCurrentUser();

        if (currentUser.getRole() != Role.ROLE_STUDENT && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new AccessDeniedException("Only students can submit assignments.");
        }

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + assignmentId));

        // Verify student is enrolled in the course
        if (currentUser.getRole() == Role.ROLE_STUDENT &&
                !enrollmentRepository.existsByStudentAndCourse(currentUser, assignment.getCourse())) {
            throw new BadRequestException("You must be enrolled in the course '" + assignment.getCourse().getTitle() + "' to submit assignments.");
        }

        // Must provide at least text or a file
        if ((textContent == null || textContent.trim().isEmpty()) && (file == null || file.isEmpty())) {
            throw new BadRequestException("Submission must contain either text content or an attached file.");
        }

        // Check if student already submitted to update or create
        Optional<Submission> existingSubmission = submissionRepository.findByAssignmentAndStudent(assignment, currentUser);
        Submission submission;

        if (existingSubmission.isPresent()) {
            submission = existingSubmission.get();
            submission.setStatus(SubmissionStatus.RESUBMITTED);
        } else {
            submission = Submission.builder()
                    .assignment(assignment)
                    .student(currentUser)
                    .status(SubmissionStatus.SUBMITTED)
                    .build();
        }

        if (textContent != null) {
            submission.setTextContent(sanitizer.sanitize(textContent));
        }

        // Handle file upload if present
        if (file != null && !file.isEmpty()) {
            // If replacing previous file, clean up old file
            if (submission.getStoredFileName() != null) {
                fileStorageService.deleteFile(submission.getStoredFileName());
            }

            String secureFileName = fileStorageService.storeFile(file);
            submission.setStoredFileName(secureFileName);
            submission.setOriginalFileName(file.getOriginalFilename());
            submission.setFileContentType(file.getContentType());
            submission.setFileSize(file.getSize());
        }

        Submission saved = submissionRepository.save(submission);
        return SubmissionDto.fromEntity(saved);
    }

    public SubmissionDto getSubmissionById(Long id) {
        User currentUser = authService.getCurrentUser();
        Submission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with id: " + id));

        // Strict Access Control / IDOR Defense
        validateSubmissionAccess(submission, currentUser);

        return SubmissionDto.fromEntity(submission);
    }

    public List<SubmissionDto> getSubmissionsForAssignment(Long assignmentId) {
        User currentUser = authService.getCurrentUser();
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + assignmentId));

        // Only course instructor or Admin can view all submissions for an assignment
        if (currentUser.getRole() != Role.ROLE_ADMIN &&
                !assignment.getCourse().getInstructor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not authorized to view submissions for this course.");
        }

        return submissionRepository.findByAssignment(assignment)
                .stream()
                .map(SubmissionDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<SubmissionDto> getMySubmissions() {
        User currentUser = authService.getCurrentUser();
        return submissionRepository.findByStudent(currentUser)
                .stream()
                .map(SubmissionDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public FeedbackDto gradeSubmission(Long submissionId, FeedbackCreateDto feedbackDto) {
        User currentUser = authService.getCurrentUser();
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with id: " + submissionId));

        // Only course instructor or Admin can grade
        if (currentUser.getRole() != Role.ROLE_ADMIN &&
                !submission.getAssignment().getCourse().getInstructor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not authorized to grade submissions for this course.");
        }

        // Validate score against max score
        if (feedbackDto.getGrade() > submission.getAssignment().getMaxScore()) {
            throw new BadRequestException("Grade cannot exceed maximum score of " + submission.getAssignment().getMaxScore());
        }

        Optional<Feedback> existingFeedback = feedbackRepository.findBySubmission(submission);
        Feedback feedback;

        if (existingFeedback.isPresent()) {
            feedback = existingFeedback.get();
            feedback.setGrade(feedbackDto.getGrade());
            feedback.setComments(sanitizer.sanitize(feedbackDto.getComments()));
            feedback.setInstructor(currentUser);
        } else {
            feedback = Feedback.builder()
                    .submission(submission)
                    .instructor(currentUser)
                    .grade(feedbackDto.getGrade())
                    .comments(sanitizer.sanitize(feedbackDto.getComments()))
                    .build();
        }

        submission.setStatus(SubmissionStatus.GRADED);
        Feedback savedFeedback = feedbackRepository.save(feedback);
        submission.setFeedback(savedFeedback);
        submissionRepository.save(submission);

        return FeedbackDto.fromEntity(savedFeedback);
    }

    public ResourceAndMetadata getSubmissionFileForDownload(Long submissionId) {
        User currentUser = authService.getCurrentUser();
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with id: " + submissionId));

        // IDOR defense check
        validateSubmissionAccess(submission, currentUser);

        if (submission.getStoredFileName() == null || submission.getStoredFileName().isEmpty()) {
            throw new BadRequestException("This submission does not contain any uploaded file.");
        }

        Resource resource = fileStorageService.loadFileAsResource(submission.getStoredFileName());
        return new ResourceAndMetadata(resource, submission.getOriginalFileName(), submission.getFileContentType());
    }

    private void validateSubmissionAccess(Submission submission, User currentUser) {
        if (currentUser.getRole() == Role.ROLE_ADMIN) {
            return;
        }

        if (currentUser.getRole() == Role.ROLE_STUDENT) {
            if (!submission.getStudent().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("You are only permitted to view your own submissions.");
            }
        } else if (currentUser.getRole() == Role.ROLE_INSTRUCTOR) {
            if (!submission.getAssignment().getCourse().getInstructor().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("You can only view submissions for courses you instruct.");
            }
        }
    }

    public record ResourceAndMetadata(Resource resource, String originalFileName, String contentType) {}
}
