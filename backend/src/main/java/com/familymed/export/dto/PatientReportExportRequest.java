package com.familymed.export.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request DTO for patient report export
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientReportExportRequest {
    private String patientId;           // Patient UUID
    private String submissionId;        // PatientFormSubmission UUID
    private String calculatorId;        // DiagnosticForm UUID (optional, can be derived from submission)
}
