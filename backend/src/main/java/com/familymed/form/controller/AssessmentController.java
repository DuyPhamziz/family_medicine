package com.familymed.form.controller;

import com.familymed.form.dto.AssessmentAnswerDTO;
import com.familymed.form.dto.AssessmentSessionDTO;
import com.familymed.form.dto.AssessmentSessionDetailDTO;
import com.familymed.form.dto.CompleteAssessmentRequest;
import com.familymed.form.dto.StartAssessmentRequest;
import com.familymed.form.dto.SubmitAnswerRequest;
import com.familymed.form.service.AssessmentService;
import com.familymed.pdf.PdfExportService;
import com.familymed.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/assessments")
@RequiredArgsConstructor
public class AssessmentController {

    private final AssessmentService assessmentService;
    private final UserRepository userRepository;
    private final PdfExportService pdfExportService;

    @PostMapping("/start")
    public ResponseEntity<AssessmentSessionDTO> startSession(
            @RequestBody StartAssessmentRequest request,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }

        UUID doctorId = userRepository.findByEmailOrUsername(authentication.getName(), authentication.getName())
                .map(user -> user.getUserId())
                .orElse(null);

        if (doctorId == null) {
            return ResponseEntity.status(404).build();
        }

        return ResponseEntity.ok(assessmentService.startSession(request, doctorId));
    }

    @GetMapping("/{sessionId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<AssessmentSessionDetailDTO> getSession(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(assessmentService.getSessionDetails(sessionId));
    }

    @PostMapping("/{sessionId}/answers")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<AssessmentAnswerDTO> submitAnswer(
            @PathVariable UUID sessionId,
            @RequestBody SubmitAnswerRequest request) {
        return ResponseEntity.ok(assessmentService.submitAnswer(sessionId, request));
    }

    @PostMapping("/{sessionId}/complete")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<AssessmentSessionDTO> completeSession(
            @PathVariable UUID sessionId,
            @RequestBody CompleteAssessmentRequest request) {
        return ResponseEntity.ok(assessmentService.completeSession(sessionId, request));
    }

    @GetMapping("/{sessionId}/export/pdf")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public void exportPdf(@PathVariable UUID sessionId, HttpServletResponse response) throws java.io.IOException {
        byte[] pdf = pdfExportService.exportAssessmentResult(sessionId);
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=assessment_" + sessionId + ".pdf");
        response.getOutputStream().write(pdf);
    }

    @GetMapping("/export/excel")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public void exportExcel(
            @RequestParam(value = "formIds", required = false) java.util.List<UUID> formIds,
            @RequestParam(value = "formId", required = false) UUID formId,
            @RequestParam(value = "questionnaireVersionId", required = false) UUID legacyFormId,
            HttpServletResponse response) throws IOException {
        UUID targetFormId = formId != null ? formId : legacyFormId;
        if ((formIds == null || formIds.isEmpty()) && targetFormId == null) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing formIds or formId");
            return;
        }

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        String filename = targetFormId != null ? "assessments_" + targetFormId : "assessments_multi";
        response.setHeader("Content-Disposition", "attachment; filename=" + filename + ".xlsx");

        try {
            if (formIds != null && !formIds.isEmpty()) {
                assessmentService.exportFormsToExcel(formIds, response.getOutputStream());
                return;
            }

            assessmentService.exportToExcel(targetFormId, response.getOutputStream());
        } catch (RuntimeException ex) {
            response.reset();
            response.sendError(HttpServletResponse.SC_NOT_FOUND, ex.getMessage());
        }
    }
}
