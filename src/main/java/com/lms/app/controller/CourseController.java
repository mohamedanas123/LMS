package com.lms.app.controller;

import com.lms.app.dto.ApiResponse;
import com.lms.app.dto.CourseCreateDto;
import com.lms.app.dto.CourseDto;
import com.lms.app.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseDto>>> getAllCourses(@RequestParam(required = false) String search) {
        List<CourseDto> courses = courseService.getAllCourses(search);
        return ResponseEntity.ok(ApiResponse.ok("Courses retrieved successfully", courses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseDto>> getCourseById(@PathVariable Long id) {
        CourseDto course = courseService.getCourseById(id);
        return ResponseEntity.ok(ApiResponse.ok("Course retrieved successfully", course));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<CourseDto>> createCourse(@Valid @RequestBody CourseCreateDto dto) {
        CourseDto created = courseService.createCourse(dto);
        return new ResponseEntity<>(ApiResponse.ok("Course created successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<CourseDto>> updateCourse(@PathVariable Long id, @Valid @RequestBody CourseCreateDto dto) {
        CourseDto updated = courseService.updateCourse(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Course updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(ApiResponse.ok("Course deleted successfully", null));
    }

    @PostMapping("/{id}/enroll")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> enrollCourse(@PathVariable Long id) {
        courseService.enrollCourse(id);
        return ResponseEntity.ok(ApiResponse.ok("Successfully enrolled in course", null));
    }

    @GetMapping("/my-courses")
    public ResponseEntity<ApiResponse<List<CourseDto>>> getMyCourses() {
        List<CourseDto> courses = courseService.getMyCourses();
        return ResponseEntity.ok(ApiResponse.ok("User courses retrieved successfully", courses));
    }
}
