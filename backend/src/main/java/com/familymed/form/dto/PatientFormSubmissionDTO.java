package com.familymed.form.dto;

import com.familymed.form.PatientFormSubmission;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientFormSubmissionDTO {
    private UUID submissionId;
    private UUID patientId;
    private UUID formId;
    private String formName;
    private Double totalScore;
    private String riskLevel;
    private String diagnosticResult;
    private String notes;
    private String status;
    
    public static PatientFormSubmissionDTO fromSubmission(PatientFormSubmission submission) {
        return PatientFormSubmissionDTO.builder()
                .submissionId(submission.getSubmissionId())
                .patientId(submission.getPatient().getPatientId())
                .formId(submission.getForm().getFormId())
                .formName(submission.getForm().getFormName())
                .totalScore(submission.getTotalScore())
                .riskLevel(submission.getRiskLevel())
                .diagnosticResult(submission.getDiagnosticResult())
                .notes(submission.getNotes())
                .status(submission.getStatus().name())
                .build();
    }
}

