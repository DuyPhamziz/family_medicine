package com.familymed.careplan.dto;

import com.familymed.careplan.entity.CarePlan;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class CarePlanResponse {
    private UUID id;
    private UUID patientId;
    private UUID assessmentSessionId;
    private CarePlan.Status status;
    private LocalDate startDate;
    private LocalDate endDate;
    private String notes;
    private LocalDateTime createdAt;
    private UUID createdBy;
    private LocalDateTime updatedAt;
    private UUID updatedBy;
    private List<CarePlanGoalResponse> goals;
    private List<CarePlanActionResponse> actions;

    public static CarePlanResponse fromEntity(CarePlan plan,
                                             List<CarePlanGoalResponse> goals,
                                             List<CarePlanActionResponse> actions) {
        return CarePlanResponse.builder()
                .id(plan.getId())
                .patientId(plan.getPatient().getPatientId())
                .assessmentSessionId(plan.getAssessmentSession() != null ? plan.getAssessmentSession().getSessionId() : null)
                .status(plan.getStatus())
                .startDate(plan.getStartDate())
                .endDate(plan.getEndDate())
                .notes(plan.getNotes())
                .createdAt(plan.getCreatedAt())
                .createdBy(plan.getCreatedBy())
                .updatedAt(plan.getUpdatedAt())
                .updatedBy(plan.getUpdatedBy())
                .goals(goals)
                .actions(actions)
                .build();
    }
}
