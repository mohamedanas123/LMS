package com.lms.app.controller;

import com.lms.app.dto.ApiResponse;
import com.lms.app.dto.AssignmentCreateDto;
import com.lms.app.dto.AssignmentDto;
import com.lms.app.service.AssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<AssignmentDto>> createAssignment(@Valid @RequestBody AssignmentCreateDto dto) {
        AssignmentDto created = assignmentService.createAssignment(dto);
        return new ResponseEntity<>(ApiResponse.ok("Assignment created successfully", created), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssignmentDto>> getAssignmentById(@PathVariable Long id) {
        AssignmentDto assignment = assignmentService.getAssignmentById(id);
        return ResponseEntity.ok(ApiResponse.ok("Assignment retrieved successfully", assignment));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<AssignmentDto>>> getAssignmentsByCourse(@PathVariable Long courseId) {
        List<AssignmentDto> assignments = assignmentService.getAssignmentsByCourse(courseId);
        return ResponseEntity.ok(ApiResponse.ok("Assignments retrieved successfully", assignments));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<AssignmentDto>> updateAssignment(@PathVariable Long id, @Valid @RequestBody AssignmentCreateDto dto) {
        AssignmentDto updated = assignmentService.updateAssignment(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Assignment updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAssignment(@PathVariable Long id) {
        assignmentService.deleteAssignment(id);
        return ResponseEntity.ok(ApiResponse.ok("Assignment deleted successfully", null));
    }
}
