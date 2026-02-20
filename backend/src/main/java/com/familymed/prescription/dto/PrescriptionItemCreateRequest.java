package com.familymed.prescription.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PrescriptionItemCreateRequest {

    @NotBlank
    private String drugName;

    @NotBlank
    private String dosage;

    private String route;

    private String frequency;

    private String duration;

    private String instructions;
}
