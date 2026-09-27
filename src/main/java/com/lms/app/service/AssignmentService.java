package com.lms.app.service;

import com.lms.app.dto.AssignmentCreateDto;
import com.lms.app.dto.AssignmentDto;
import com.lms.app.dto.SubmissionDto;
import com.lms.app.exception.AccessDeniedException;
import com.lms.app.exception.BadRequestException;
import com.lms.app.exception.ResourceNotFoundException;
import com.lms.app.model.Assignment;
import com.lms.app.model.Course;
import com.lms.app.model.Role;
import com.lms.app.model.Submission;
import com.lms.app.model.User;
import com.lms.app.repository.AssignmentRepository;
import com.lms.app.repository.CourseRepository;
import com.lms.app.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final CourseRepository courseRepository;
    private final SubmissionRepository submissionRepository;
    private final AuthService authService;
    private final HtmlSanitizerService sanitizer;

    @Transactional
    public AssignmentDto createAssignment(AssignmentCreateDto dto) {
        User currentUser = authService.getCurrentUser();
        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + dto.getCourseId()));

        // Authorization check: Must be the course instructor or Admin
        if (currentUser.getRole() != Role.ROLE_ADMIN && !course.getInstructor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not authorized to create assignments for this course.");
        }

        Assignment assignment = Assignment.builder()
                .course(course)
                .title(sanitizer.sanitize(dto.getTitle()))
                .description(sanitizer.sanitize(dto.getDescription()))
                .maxScore(dto.getMaxScore())
                .dueDate(dto.getDueDate())
                .build();

        Assignment saved = assignmentRepository.save(assignment);
        return AssignmentDto.fromEntity(saved);
    }

    public AssignmentDto getAssignmentById(Long id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + id));

        AssignmentDto dto = AssignmentDto.fromEntity(assignment);

        try {
            User currentUser = authService.getCurrentUser();
            if (currentUser.getRole() == Role.ROLE_STUDENT) {
                Optional<Submission> submission = submissionRepository.findByAssignmentAndStudent(assignment, currentUser);
                if (submission.isPresent()) {
                    dto.setHasSubmitted(true);
                    dto.setMySubmission(SubmissionDto.fromEntity(submission.get()));
                }
            }
        } catch (Exception ignored) {}

        return dto;
    }

    public List<AssignmentDto> getAssignmentsByCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        User currentUser = null;
        try {
            currentUser = authService.getCurrentUser();
        } catch (Exception ignored) {}

        final User finalUser = currentUser;

        return assignmentRepository.findByCourse(course).stream().map(assignment -> {
            AssignmentDto dto = AssignmentDto.fromEntity(assignment);
            if (finalUser != null && finalUser.getRole() == Role.ROLE_STUDENT) {
                Optional<Submission> submission = submissionRepository.findByAssignmentAndStudent(assignment, finalUser);
                if (submission.isPresent()) {
                    dto.setHasSubmitted(true);
                    dto.setMySubmission(SubmissionDto.fromEntity(submission.get()));
                }
            }
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public AssignmentDto updateAssignment(Long id, AssignmentCreateDto dto) {
        User currentUser = authService.getCurrentUser();
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + id));

        if (currentUser.getRole() != Role.ROLE_ADMIN && !assignment.getCourse().getInstructor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not authorized to modify this assignment.");
        }

        assignment.setTitle(sanitizer.sanitize(dto.getTitle()));
        assignment.setDescription(sanitizer.sanitize(dto.getDescription()));
        assignment.setMaxScore(dto.getMaxScore());
        assignment.setDueDate(dto.getDueDate());

        Assignment updated = assignmentRepository.save(assignment);
        return AssignmentDto.fromEntity(updated);
    }

    @Transactional
    public void deleteAssignment(Long id) {
        User currentUser = authService.getCurrentUser();
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + id));

        if (currentUser.getRole() != Role.ROLE_ADMIN && !assignment.getCourse().getInstructor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not authorized to delete this assignment.");
        }

        assignmentRepository.delete(assignment);
    }
}
