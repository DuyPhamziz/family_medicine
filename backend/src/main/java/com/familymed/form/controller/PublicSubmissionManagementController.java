package com.familymed.form.controller;

import com.familymed.form.entity.PatientFormSubmission;
import com.familymed.form.repository.PatientFormSubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
public class PublicSubmissionManagementController {

    private final PatientFormSubmissionRepository submissionRepository;

    @GetMapping("/public-submissions")
    public ResponseEntity<?> listPublicSubmissions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status
    ) {
        Pageable pageable = PageRequest.of(page, size);

        Page<PatientFormSubmission> submissions = (status == null || status.isBlank())
                ? submissionRepository.findByFormIsPublic(pageable)
                : submissionRepository.findByFormIsPublic(PatientFormSubmission.SubmissionStatus.valueOf(status), pageable);

        List<Map<String, Object>> content = submissions.getContent().stream()
                .map(this::toSummary)
                .collect(Collectors.toList());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("content", content);
        response.put("totalPages", submissions.getTotalPages());
        response.put("totalElements", submissions.getTotalElements());
        response.put("currentPage", submissions.getNumber());
        response.put("pageSize", submissions.getSize());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/public-submission/{id}")
    public ResponseEntity<?> softDeletePublicSubmission(@PathVariable("id") UUID submissionId) {
        PatientFormSubmission submission = submissionRepository.findBySubmissionIdAndDeletedAtIsNull(submissionId)
                .orElseThrow(() -> new RuntimeException("Public submission not found"));

        if (submission.getForm() == null || !Boolean.TRUE.equals(submission.getForm().getIsPublic())) {
            throw new RuntimeException("Submission is not from public form");
        }

        submission.setIsDeleted(true);
        submission.setDeletedAt(LocalDateTime.now());
        submission.setPatientName("Deleted Public Submission");
        submission.setEmail(null);
        submission.setPhone(null);
        submission.setSubmissionData("{}");
        submission.setDoctorResponse(null);
        submission.setNotes(null);
        submission.setPatient(null);
        submissionRepository.save(submission);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Deleted public submission successfully",
                "submissionId", submissionId
        ));
    }

    private Map<String, Object> toSummary(PatientFormSubmission submission) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("submissionId", submission.getSubmissionId());
        dto.put("formName", submission.getForm() != null ? submission.getForm().getFormName() : "N/A");
        dto.put("patientName", submission.getPatientName());
        dto.put("email", submission.getEmail());
        dto.put("phone", submission.getPhone());
        dto.put("submittedAt", submission.getCreatedAt());
        dto.put("status", submission.getStatus() != null ? submission.getStatus().name() : null);
        dto.put("totalScore", submission.getTotalScore());
        dto.put("riskLevel", submission.getRiskLevel());
        return dto;
    }
}
