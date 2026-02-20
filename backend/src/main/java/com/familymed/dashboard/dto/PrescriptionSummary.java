package com.familymed.dashboard.dto;

import com.familymed.prescription.entity.Prescription;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class PrescriptionSummary {
    private UUID prescriptionId;
    private UUID patientId;
    private String patientName;
    private Prescription.Status status;
    private LocalDateTime issuedAt;
    private LocalDateTime createdAt;

    public static PrescriptionSummary fromEntity(Prescription prescription) {
        return PrescriptionSummary.builder()
                .prescriptionId(prescription.getId())
                .patientId(prescription.getPatient().getPatientId())
                .patientName(prescription.getPatient().getFullName())
                .status(prescription.getStatus())
                .issuedAt(prescription.getIssuedAt())
                .createdAt(prescription.getCreatedAt())
                .build();
    }
}
