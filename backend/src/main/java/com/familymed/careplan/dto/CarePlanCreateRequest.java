package com.familymed.careplan.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class CarePlanCreateRequest {

    @NotNull
    private UUID patientId;

    private UUID assessmentSessionId;

    private LocalDate startDate;

    private LocalDate endDate;

    private String notes;
}
