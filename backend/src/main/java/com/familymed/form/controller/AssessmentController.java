package com.familymed.form.controller;

import com.familymed.form.dto.AssessmentAnswerDTO;
import com.familymed.form.dto.AssessmentSessionDTO;
import com.familymed.form.dto.AssessmentSessionDetailDTO;
import com.familymed.form.dto.CompleteAssessmentRequest;
import com.familymed.form.dto.StartAssessmentRequest;
import com.familymed.form.dto.SubmitAnswerRequest;
import com.familymed.form.service.AssessmentService;
import com.familymed.pdf.PdfExportService;
import com.familymed.patient.entity.Patient;
import com.familymed.patient.repository.PatientRepository;
import com.familymed.form.entity.DiagnosticForm;
import com.familymed.form.repository.DiagnosticFormRepository;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import com.familymed.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/assessments")
@RequiredArgsConstructor
@Slf4j
public class AssessmentController {

    private final AssessmentService assessmentService;
    private final UserRepository userRepository;
    private final PdfExportService pdfExportService;
    private final PatientRepository patientRepository;
    private final DiagnosticFormRepository formRepository;

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
        log.debug("completeSession called for session {} with request {}", sessionId, request);
        try {
            return ResponseEntity.ok(assessmentService.completeSession(sessionId, request));
        } catch (Exception ex) {
            log.error("Error completing assessment session {}", sessionId, ex);
            throw ex;
        }
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
            @RequestParam(value = "patientId", required = false) UUID patientId,
            @RequestParam(value = "patientCode", required = false) String patientCode,
            HttpServletResponse response) throws IOException {

        UUID targetFormId = formId != null ? formId : legacyFormId;
        if ((formIds == null || formIds.isEmpty()) && targetFormId == null) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing formIds or formId");
            return;
        }

        // 1. Default filename
        String fileName = "Ket_qua_tong_hop";

        // 2. resolve patient by id or code, then build filename
        if (targetFormId != null) {
            Patient patient = null;
            if (patientId != null) {
                patient = patientRepository.findById(patientId)
                        .orElseThrow(() -> new RuntimeException("Không thấy bệnh nhân"));
            } else if (patientCode != null) {
                patient = patientRepository.findByPatientCode(patientCode)
                        .orElseThrow(() -> new RuntimeException("Không thấy bệnh nhân với mã " + patientCode));
            }
            if (patient != null) {
                DiagnosticForm form = formRepository.findById(targetFormId)
                        .orElseThrow(() -> new RuntimeException("Không thấy biểu mẫu"));

                fileName = form.getFormName() + "_" + patient.getPatientCode() + "_" + patient.getFullName();
                // also set patientId for later filtering in service
                patientId = patient.getPatientId();
            }
        }

        // 3. Clean filename and set header with UTF-8 encoding
        String cleanFileName = fileName.replaceAll("[\\\\/:*?\"<>|]", "_").replace(" ", "_");
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        String encodedFileName = URLEncoder.encode(cleanFileName + ".xlsx", StandardCharsets.UTF_8.toString()).replace("+", "%20");
        response.setHeader("Content-Disposition", "attachment; filename*=UTF-8''" + encodedFileName);

        try {
            if (formIds != null && !formIds.isEmpty()) {
                // pass patientId so filter applies when multiple forms are exported as well
                assessmentService.exportFormsToExcel(formIds, patientId, response.getOutputStream());
                return;
            }

            assessmentService.exportToExcel(targetFormId, patientId, response.getOutputStream());
        } catch (RuntimeException ex) {
            response.reset();
            response.sendError(HttpServletResponse.SC_NOT_FOUND, ex.getMessage());
        }
    }
}
