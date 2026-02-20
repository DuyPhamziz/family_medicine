package com.familymed.dashboard.dto;

import com.familymed.careplan.entity.CarePlan;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class CarePlanSummary {
    private UUID carePlanId;
    private UUID patientId;
    private String patientName;
    private CarePlan.Status status;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime createdAt;

    public static CarePlanSummary fromEntity(CarePlan plan) {
        return CarePlanSummary.builder()
                .carePlanId(plan.getId())
                .patientId(plan.getPatient().getPatientId())
                .patientName(plan.getPatient().getFullName())
                .status(plan.getStatus())
                .startDate(plan.getStartDate())
                .endDate(plan.getEndDate())
                .createdAt(plan.getCreatedAt())
                .build();
    }
}
