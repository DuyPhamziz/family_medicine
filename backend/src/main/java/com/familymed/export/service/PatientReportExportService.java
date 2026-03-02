package com.familymed.export.service;

import com.familymed.export.dto.PatientReportExportRequest;
import com.familymed.export.entity.HospitalTemplate;
import com.familymed.export.repository.HospitalTemplateRepository;
import com.familymed.form.entity.PatientFormSubmission;
import com.familymed.form.entity.SubmissionAnswer;
import com.familymed.form.repository.FormQuestionRepository;
import com.familymed.form.repository.PatientFormSubmissionRepository;
import com.familymed.form.repository.SubmissionAnswerRepository;
import com.familymed.patient.entity.Patient;
import com.familymed.patient.repository.PatientRepository;
import com.familymed.user.entity.User;
import com.familymed.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.UUID;

/**
 * Service to orchestrate patient report Excel generation
 * Fetches all required data and delegates to ExcelExportService
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PatientReportExportService {
    
    private final PatientFormSubmissionRepository submissionRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final SubmissionAnswerRepository submissionAnswerRepository;
    private final FormQuestionRepository formQuestionRepository;
    private final HospitalTemplateRepository templateRepository;
    private final ClinicalReportExcelService clinicalReportExcelService;
    
    public byte[] generatePatientReportExcel(PatientReportExportRequest request) throws IOException {
        return generateClinicalReportExcel(request);
    }

    public byte[] generateClinicalReportExcel(PatientReportExportRequest request) throws IOException {
        log.info("Starting clinical report export for submission: {}", request.getSubmissionId());

        if (request.getSubmissionId() == null || request.getSubmissionId().isBlank()) {
            throw new IllegalArgumentException("Submission ID is required");
        }

        UUID submissionUuid;
        try {
            submissionUuid = UUID.fromString(request.getSubmissionId());
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid submission ID format");
        }

        // Fetch submission
        PatientFormSubmission submission = submissionRepository.findById(submissionUuid)
                .orElseThrow(() -> new RuntimeException("Submission not found: " + request.getSubmissionId()));

        // Resolve patient: prefer submission linkage, fallback to request.patientId if provided
        Patient patient = submission.getPatient();
        if (patient == null && request.getPatientId() != null && !request.getPatientId().isBlank()) {
            UUID patientUuid;
            try {
                patientUuid = UUID.fromString(request.getPatientId());
            } catch (Exception ex) {
                throw new IllegalArgumentException("Invalid patient ID format");
            }
            patient = patientRepository.findById(patientUuid)
                    .orElseThrow(() -> new RuntimeException("Patient not found: " + request.getPatientId()));
        }

        if (patient == null) {
            throw new RuntimeException("Patient not found for submission: " + request.getSubmissionId());
        }

        // Optional consistency check when patientId is provided
        if (request.getPatientId() != null && !request.getPatientId().isBlank()) {
            if (!patient.getPatientId().toString().equals(request.getPatientId())) {
                throw new IllegalArgumentException("Patient does not match submission");
            }
        }
        
        // Get doctor from submission or current authenticated user
        User doctor = submission.getDoctor();
        if (doctor == null) {
            // Try to get current authenticated user
            try {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated() && auth.getName() != null) {
                    doctor = userRepository.findByUsername(auth.getName()).orElse(null);
                }
            } catch (Exception e) {
                log.warn("Could not get current authenticated user", e);
            }
        }
        
        // Get hospital template (use default if not found)
        HospitalTemplate template;
        try {
            template = templateRepository.findByIsDefaultTrue().orElse(HospitalTemplate.defaultTemplate());
        } catch (Exception ex) {
            log.warn("Failed to load hospital template from database, fallback to defaults", ex);
            template = HospitalTemplate.defaultTemplate();
        }

        var answers = submissionAnswerRepository.findBySubmissionSubmissionId(submission.getSubmissionId());
        var questions = formQuestionRepository.findBySection_Form_FormId(submission.getForm().getFormId());

        log.info("Generating clinical Excel report for patient: {}, submission: {}", patient.getPatientCode(), submission.getSubmissionId());

        return clinicalReportExcelService.generateClinicalReport(
                submission,
                patient,
                doctor,
                template,
                answers,
                questions
        );
    }
}
