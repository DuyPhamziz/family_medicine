package com.familymed.diagnosis.dto;

import com.familymed.diagnosis.entity.PatientDiagnosis;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class PatientDiagnosisResponse {
    private UUID id;
    private UUID patientId;
    private String icd10Code;
    private String icd10Description;
    private PatientDiagnosis.DiagnosisType diagnosisType;
    private String notes;
    private LocalDateTime diagnosedAt;
    private LocalDateTime createdAt;
    private UUID createdBy;
    private LocalDateTime updatedAt;
    private UUID updatedBy;

    public static PatientDiagnosisResponse fromEntity(PatientDiagnosis diagnosis) {
        return PatientDiagnosisResponse.builder()
                .id(diagnosis.getId())
                .patientId(diagnosis.getPatient().getPatientId())
                .icd10Code(diagnosis.getIcd10Code().getCode())
                .icd10Description(diagnosis.getIcd10Code().getDescription())
                .diagnosisType(diagnosis.getDiagnosisType())
                .notes(diagnosis.getNotes())
                .diagnosedAt(diagnosis.getDiagnosedAt())
                .createdAt(diagnosis.getCreatedAt())
                .createdBy(diagnosis.getCreatedBy())
                .updatedAt(diagnosis.getUpdatedAt())
                .updatedBy(diagnosis.getUpdatedBy())
                .build();
    }
}
