package com.familymed.prescription.dto;

import com.familymed.prescription.entity.PrescriptionItem;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class PrescriptionItemResponse {
    private UUID id;
    private UUID prescriptionId;
    private String drugName;
    private String dosage;
    private String route;
    private String frequency;
    private String duration;
    private String instructions;
    private LocalDateTime createdAt;
    private UUID createdBy;
    private LocalDateTime updatedAt;
    private UUID updatedBy;

    public static PrescriptionItemResponse fromEntity(PrescriptionItem item) {
        return PrescriptionItemResponse.builder()
                .id(item.getId())
                .prescriptionId(item.getPrescription().getId())
                .drugName(item.getDrugName())
                .dosage(item.getDosage())
                .route(item.getRoute())
                .frequency(item.getFrequency())
                .duration(item.getDuration())
                .instructions(item.getInstructions())
                .createdAt(item.getCreatedAt())
                .createdBy(item.getCreatedBy())
                .updatedAt(item.getUpdatedAt())
                .updatedBy(item.getUpdatedBy())
                .build();
    }
}
