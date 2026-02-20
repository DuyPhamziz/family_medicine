package com.familymed.diagnosis.dto;

import com.familymed.diagnosis.entity.PatientDiagnosis;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CreatePatientDiagnosisRequest {

    @NotBlank
    private String icd10Code;

    private UUID assessmentSessionId;

    @NotNull
    private PatientDiagnosis.DiagnosisType diagnosisType;

    private String notes;

    private LocalDateTime diagnosedAt;
}
