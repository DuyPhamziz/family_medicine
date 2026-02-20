package com.familymed.prescription.dto;

import com.familymed.prescription.entity.Prescription;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class PrescriptionResponse {
    private UUID id;
    private UUID patientId;
    private UUID diagnosisId;
    private UUID carePlanId;
    private Prescription.Status status;
    private LocalDateTime issuedAt;
    private LocalDateTime createdAt;
    private UUID createdBy;
    private LocalDateTime updatedAt;
    private UUID updatedBy;
    private List<PrescriptionItemResponse> items;

    public static PrescriptionResponse fromEntity(Prescription prescription, List<PrescriptionItemResponse> items) {
        return PrescriptionResponse.builder()
                .id(prescription.getId())
                .patientId(prescription.getPatient().getPatientId())
                .diagnosisId(prescription.getDiagnosis() != null ? prescription.getDiagnosis().getId() : null)
                .carePlanId(prescription.getCarePlan() != null ? prescription.getCarePlan().getId() : null)
                .status(prescription.getStatus())
                .issuedAt(prescription.getIssuedAt())
                .createdAt(prescription.getCreatedAt())
                .createdBy(prescription.getCreatedBy())
                .updatedAt(prescription.getUpdatedAt())
                .updatedBy(prescription.getUpdatedBy())
                .items(items)
                .build();
    }
}
