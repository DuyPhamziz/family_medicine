package com.familymed.api.controller;

import com.familymed.api.dto.PublicCheckResultResponse;
import com.familymed.form.entity.PatientFormSubmission;
import com.familymed.form.repository.PatientFormSubmissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicApiController {

    private final PatientFormSubmissionRepository submissionRepository;
    private final ObjectMapper objectMapper;

    /**
     * Public endpoint to check submission result
     * Requires phone and submissionId for verification
     */
    @GetMapping("/check-result")
    public ResponseEntity<PublicCheckResultResponse> checkResult(
            @RequestParam String phone,
            @RequestParam String submissionId) {
        
        log.info("Public check result request - phone: {}, submissionId: {}", phone, submissionId);

        try {
            UUID uuid = UUID.fromString(submissionId);
            PatientFormSubmission submission = submissionRepository.findById(uuid)
                    .orElse(null);

            // Validate submission exists and phone matches
            if (submission == null || 
                !phone.equals(submission.getPhone()) ||
                Boolean.TRUE.equals(submission.getIsDeleted())) {
                log.warn("Submission not found or phone mismatch");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            // Build response
            PublicCheckResultResponse response = buildResponse(submission);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.error("Invalid submission ID format: {}", submissionId);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error checking result", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private PublicCheckResultResponse buildResponse(PatientFormSubmission submission) {
        PublicCheckResultResponse.PublicCheckResultResponseBuilder builder = PublicCheckResultResponse.builder()
                .submissionId(submission.getSubmissionId().toString())
                .patientName(submission.getPatientName())
                .patientEmail(submission.getEmail())
                .patientPhone(submission.getPhone())
                .formName(submission.getForm() != null ? submission.getForm().getFormName() : "N/A")
                .status(mapStatus(submission.getStatus()))
                .submittedAt(submission.getCreatedAt());

        // Add doctor response if available
        if (submission.getDoctorResponse() != null && !submission.getDoctorResponse().isEmpty()) {
            try {
                JsonNode doctorResponseNode = objectMapper.readTree(submission.getDoctorResponse());
                
                PublicCheckResultResponse.DoctorResponse doctorResponse = PublicCheckResultResponse.DoctorResponse.builder()
                        .diagnosis(getJsonString(doctorResponseNode, "diagnosis"))
                        .recommendations(getJsonString(doctorResponseNode, "recommendations"))
                        .notes(getJsonString(doctorResponseNode, "notes"))
                        .doctorName(submission.getDoctor() != null ? submission.getDoctor().getFullName() : null)
                        .respondedAt(submission.getRespondedAt())
                        .build();

                builder.doctorResponse(doctorResponse);
            } catch (Exception e) {
                log.warn("Failed to parse doctor response JSON", e);
            }
        }

        return builder.build();
    }

    private String mapStatus(PatientFormSubmission.SubmissionStatus status) {
        if (status == null) return "PENDING";
        
        switch (status) {
            case REVIEWED:
            case RESPONDED:
                return "REVIEWED";
            case ARCHIVED:
                return "CANCELLED";
            default:
                return "PENDING";
        }
    }

    private String getJsonString(JsonNode node, String fieldName) {
        if (node == null || !node.has(fieldName)) return null;
        JsonNode fieldNode = node.get(fieldName);
        return fieldNode.isNull() ? null : fieldNode.asText();
    }
}
