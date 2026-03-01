package com.familymed.form.controller;

import com.familymed.form.entity.PatientFormSubmission;
import com.familymed.form.service.FormSubmissionResultService;
import com.familymed.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * API cho doctor xem submissions từ public forms
 */
@RestController
@RequestMapping("/api/doctor/public-submissions")
@CrossOrigin(origins = "*")
public class DoctorPublicSubmissionsController {
    
    @Autowired
    private FormSubmissionResultService formSubmissionResultService;
    
    @Autowired
    private com.familymed.form.repository.PatientFormSubmissionRepository submissionRepository;
    
    /**
     * Lấy danh sách submissions từ public forms (phân trang)
     * GET /api/doctor/public-submissions?page=0&size=10&status=PENDING
     */
    @GetMapping
    public ResponseEntity<?> listPublicSubmissions(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search
    ) {
        try {
            Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
            
            // Tìm submissions từ public forms
            Page<PatientFormSubmission> submissions;
            if (status != null) {
                submissions = submissionRepository.findByFormIsPublic(
                    PatientFormSubmission.SubmissionStatus.valueOf(status),
                    pageable
                );
            } else {
                submissions = submissionRepository.findByFormIsPublic(pageable);
            }
            
            // Convert to DTOs
            List<Map<String, Object>> dtos = submissions.get()
                    .map(this::toSubmissionSummaryDTO)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("content", dtos);
            response.put("totalPages", submissions.getTotalPages());
            response.put("totalElements", submissions.getTotalElements());
            response.put("currentPage", page);
            response.put("pageSize", size);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    Map.of("error", "Failed to load submissions: " + e.getMessage())
            );
        }
    }
    
    /**
     * Lấy chi tiết submission và kết quả phân tích
     * GET /api/doctor/public-submissions/{submissionId}
     */
    @GetMapping("/{submissionId}")
    public ResponseEntity<?> getSubmissionDetail(@PathVariable String submissionId) {
        try {
            UUID id = UUID.fromString(submissionId);
            Object result = formSubmissionResultService.getSubmissionResult(id);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(
                    Map.of("error", "Submission not found: " + e.getMessage())
            );
        }
    }
    
    /**
     * Trả lời/submit kết quả cho submission
     * POST /api/doctor/public-submissions/{submissionId}/respond
     */
    @PostMapping("/{submissionId}/respond")
    public ResponseEntity<?> respondToSubmission(
            @PathVariable String submissionId,
            @RequestBody Map<String, Object> request,
            Authentication authentication
    ) {
        try {
            UUID id = UUID.fromString(submissionId);
            
            PatientFormSubmission submission = submissionRepository
                    .findById(id)
                    .orElseThrow(() -> new RuntimeException("Submission not found"));
            
            // Get doctor info from authentication
            User doctor = (User) authentication.getPrincipal();
            
            // Update submission
            submission.setDoctorResponse((String) request.get("response"));
            submission.setResponseMethod(
                    PatientFormSubmission.ResponseMethod.valueOf(
                            (String) request.getOrDefault("responseMethod", "NONE")
                    )
            );
            submission.setStatus(PatientFormSubmission.SubmissionStatus.RESPONDED);
            submission.setRespondedAt(java.time.LocalDateTime.now());
            submission.setNotes((String) request.get("notes"));
            
            if (request.containsKey("doctor")) {
                submission.setDoctor(doctor);
            }
            
            submissionRepository.save(submission);
            
            return ResponseEntity.ok(
                    Map.of(
                            "message", "Response submitted successfully",
                            "submissionId", id,
                            "status", submission.getStatus().name()
                    )
            );
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    Map.of("error", "Failed to submit response: " + e.getMessage())
            );
        }
    }
    
    /**
     * Helper: Convert to summary DTO for list view
     */
    private Map<String, Object> toSubmissionSummaryDTO(PatientFormSubmission submission) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("submissionId", submission.getSubmissionId());
        dto.put("formName", submission.getForm().getFormName());
        dto.put("patientName", submission.getPatientName());
        dto.put("email", submission.getEmail());
        dto.put("phone", submission.getPhone());
        dto.put("submittedAt", submission.getCreatedAt());
        dto.put("status", submission.getStatus().name());
        dto.put("statusDisplay", getStatusDisplay(submission.getStatus()));
        dto.put("totalScore", submission.getTotalScore());
        dto.put("riskLevel", submission.getRiskLevel());
        return dto;
    }
    
    private String getStatusDisplay(PatientFormSubmission.SubmissionStatus status) {
        return switch (status) {
            case COMPLETED -> "Hoàn thành";
            case PENDING -> "Chờ xử lý";
            case REVIEWED -> "Đã xem";
            case RESPONDED -> "Đã trả lời";
            case DRAFT -> "Bản nháp";
        };
    }
}
