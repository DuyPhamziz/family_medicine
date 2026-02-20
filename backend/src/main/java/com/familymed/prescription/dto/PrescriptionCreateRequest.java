package com.familymed.prescription.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class PrescriptionCreateRequest {

    @NotNull
    private UUID patientId;

    @NotNull
    private UUID diagnosisId;

    private UUID carePlanId;
}
