package com.familymed.form.dto;

import com.familymed.form.entity.PatientFormSubmission;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientFormSubmissionDTO {
    private UUID submissionId;
    private UUID patientId;
    private String patientName;
    private String patientCode;
    private UUID formId;
    private String formName;
    private String category;
    private Double totalScore;
    private String riskLevel;
    private String diagnosticResult;
    private String notes;
    private String status;
    private Integer formVersion;
    private String doctorResponse;
    private String responseMethod;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;
    
    public static PatientFormSubmissionDTO fromSubmission(PatientFormSubmission submission) {
        var patient = submission.getPatient();
        var form = submission.getForm();
        var status = submission.getStatus();
        return PatientFormSubmissionDTO.builder()
                .submissionId(submission.getSubmissionId())
            .patientId(patient != null ? patient.getPatientId() : null)
            .patientName(patient != null ? patient.getFullName() : null)
            .patientCode(patient != null ? patient.getPatientCode() : null)
            .formId(form != null ? form.getFormId() : null)
            .formName(form != null ? form.getFormName() : null)
            .category(form != null ? form.getCategory() : null)
                .totalScore(submission.getTotalScore())
                .riskLevel(submission.getRiskLevel())
                .diagnosticResult(submission.getDiagnosticResult())
                .notes(submission.getNotes())
            .status(status != null ? status.name() : null)
                .formVersion(submission.getFormVersionNumber())
                .doctorResponse(submission.getDoctorResponse())
                .responseMethod(submission.getResponseMethod() != null ? submission.getResponseMethod().name() : null)
                .createdAt(submission.getCreatedAt())
                .respondedAt(submission.getRespondedAt())
                .build();
    }
}

