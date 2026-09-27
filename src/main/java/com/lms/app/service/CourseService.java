package com.lms.app.service;

import com.lms.app.dto.CourseCreateDto;
import com.lms.app.dto.CourseDto;
import com.lms.app.exception.AccessDeniedException;
import com.lms.app.exception.BadRequestException;
import com.lms.app.exception.ResourceNotFoundException;
import com.lms.app.model.Course;
import com.lms.app.model.Enrollment;
import com.lms.app.model.Role;
import com.lms.app.model.User;
import com.lms.app.repository.CourseRepository;
import com.lms.app.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AuthService authService;
    private final HtmlSanitizerService sanitizer;

    public List<CourseDto> getAllCourses(String search) {
        User currentUser = null;
        try {
            currentUser = authService.getCurrentUser();
        } catch (Exception ignored) {}

        List<Course> courses;
        if (search != null && !search.trim().isEmpty()) {
            courses = courseRepository.findByTitleContainingIgnoreCaseOrCodeContainingIgnoreCase(search.trim(), search.trim());
        } else {
            courses = courseRepository.findAll();
        }

        final User finalUser = currentUser;
        return courses.stream().map(course -> {
            CourseDto dto = CourseDto.fromEntity(course);
            if (finalUser != null && finalUser.getRole() == Role.ROLE_STUDENT) {
                boolean isEnrolled = enrollmentRepository.existsByStudentAndCourse(finalUser, course);
                dto.setEnrolledByCurrentUser(isEnrolled);
            }
            return dto;
        }).collect(Collectors.toList());
    }

    public CourseDto getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));

        CourseDto dto = CourseDto.fromEntity(course);
        try {
            User currentUser = authService.getCurrentUser();
            if (currentUser.getRole() == Role.ROLE_STUDENT) {
                dto.setEnrolledByCurrentUser(enrollmentRepository.existsByStudentAndCourse(currentUser, course));
            }
        } catch (Exception ignored) {}

        return dto;
    }

    @Transactional
    public CourseDto createCourse(CourseCreateDto dto) {
        User currentUser = authService.getCurrentUser();

        if (currentUser.getRole() != Role.ROLE_INSTRUCTOR && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new AccessDeniedException("Only Instructors and Administrators can create courses.");
        }

        if (courseRepository.existsByCode(dto.getCode().trim().toUpperCase())) {
            throw new BadRequestException("Course with code '" + dto.getCode() + "' already exists.");
        }

        Course course = Course.builder()
                .title(sanitizer.sanitize(dto.getTitle()))
                .code(sanitizer.sanitize(dto.getCode().trim().toUpperCase()))
                .description(sanitizer.sanitize(dto.getDescription()))
                .instructor(currentUser)
                .build();

        Course saved = courseRepository.save(course);
        return CourseDto.fromEntity(saved);
    }

    @Transactional
    public CourseDto updateCourse(Long id, CourseCreateDto dto) {
        User currentUser = authService.getCurrentUser();
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));

        // Authorization check: only owner instructor or Admin can modify
        if (currentUser.getRole() != Role.ROLE_ADMIN && !course.getInstructor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not authorized to update this course.");
        }

        // If code changed, check uniqueness
        String updatedCode = dto.getCode().trim().toUpperCase();
        if (!course.getCode().equalsIgnoreCase(updatedCode) && courseRepository.existsByCode(updatedCode)) {
            throw new BadRequestException("Course code '" + updatedCode + "' is already in use.");
        }

        course.setTitle(sanitizer.sanitize(dto.getTitle()));
        course.setCode(sanitizer.sanitize(updatedCode));
        course.setDescription(sanitizer.sanitize(dto.getDescription()));

        Course updated = courseRepository.save(course);
        return CourseDto.fromEntity(updated);
    }

    @Transactional
    public void deleteCourse(Long id) {
        User currentUser = authService.getCurrentUser();
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));

        if (currentUser.getRole() != Role.ROLE_ADMIN && !course.getInstructor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not authorized to delete this course.");
        }

        courseRepository.delete(course);
    }

    @Transactional
    public void enrollCourse(Long courseId) {
        User currentUser = authService.getCurrentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        if (currentUser.getRole() != Role.ROLE_STUDENT && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new BadRequestException("Only students can enroll in courses.");
        }

        if (enrollmentRepository.existsByStudentAndCourse(currentUser, course)) {
            throw new BadRequestException("You are already enrolled in this course.");
        }

        Enrollment enrollment = Enrollment.builder()
                .student(currentUser)
                .course(course)
                .build();

        enrollmentRepository.save(enrollment);
    }

    public List<CourseDto> getMyCourses() {
        User currentUser = authService.getCurrentUser();

        if (currentUser.getRole() == Role.ROLE_INSTRUCTOR) {
            return courseRepository.findByInstructor(currentUser)
                    .stream()
                    .map(CourseDto::fromEntity)
                    .collect(Collectors.toList());
        } else if (currentUser.getRole() == Role.ROLE_STUDENT) {
            return enrollmentRepository.findByStudent(currentUser)
                    .stream()
                    .map(e -> {
                        CourseDto dto = CourseDto.fromEntity(e.getCourse());
                        dto.setEnrolledByCurrentUser(true);
                        return dto;
                    })
                    .collect(Collectors.toList());
        } else {
            // Admin sees all
            return courseRepository.findAll().stream().map(CourseDto::fromEntity).collect(Collectors.toList());
        }
    }
}
