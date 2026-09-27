package com.lms.app.controller;

import com.lms.app.dto.ApiResponse;
import com.lms.app.dto.FeedbackCreateDto;
import com.lms.app.dto.FeedbackDto;
import com.lms.app.dto.SubmissionDto;
import com.lms.app.service.SubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<SubmissionDto>> submitAssignment(
            @RequestParam("assignmentId") Long assignmentId,
            @RequestParam(value = "textContent", required = false) String textContent,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        SubmissionDto submission = submissionService.submitAssignment(assignmentId, textContent, file);
        return new ResponseEntity<>(ApiResponse.ok("Assignment submitted successfully", submission), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubmissionDto>> getSubmissionById(@PathVariable Long id) {
        SubmissionDto submission = submissionService.getSubmissionById(id);
        return ResponseEntity.ok(ApiResponse.ok("Submission retrieved successfully", submission));
    }

    @GetMapping("/assignment/{assignmentId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<SubmissionDto>>> getSubmissionsForAssignment(@PathVariable Long assignmentId) {
        List<SubmissionDto> submissions = submissionService.getSubmissionsForAssignment(assignmentId);
        return ResponseEntity.ok(ApiResponse.ok("Submissions retrieved successfully", submissions));
    }

    @GetMapping("/my-submissions")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<SubmissionDto>>> getMySubmissions() {
        List<SubmissionDto> submissions = submissionService.getMySubmissions();
        return ResponseEntity.ok(ApiResponse.ok("My submissions retrieved successfully", submissions));
    }

    @PutMapping("/{id}/feedback")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<FeedbackDto>> gradeSubmission(
            @PathVariable Long id,
            @Valid @RequestBody FeedbackCreateDto feedbackDto) {

        FeedbackDto feedback = submissionService.gradeSubmission(id, feedbackDto);
        return ResponseEntity.ok(ApiResponse.ok("Submission graded and feedback saved successfully", feedback));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadSubmissionFile(@PathVariable Long id) {
        SubmissionService.ResourceAndMetadata fileData = submissionService.getSubmissionFileForDownload(id);

        String contentType = fileData.contentType() != null ? fileData.contentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileData.originalFileName() + "\"")
                .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, HttpHeaders.CONTENT_DISPOSITION)
                .body(fileData.resource());
    }
}
