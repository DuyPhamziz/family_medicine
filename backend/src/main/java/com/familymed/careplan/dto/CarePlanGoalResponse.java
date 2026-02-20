package com.familymed.careplan.dto;

import com.familymed.careplan.entity.CarePlanGoal;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class CarePlanGoalResponse {
    private UUID id;
    private String goalDescription;
    private String targetValue;
    private LocalDate targetDate;
    private CarePlanGoal.Status status;
    private LocalDateTime createdAt;
    private UUID createdBy;

    public static CarePlanGoalResponse fromEntity(CarePlanGoal goal) {
        return CarePlanGoalResponse.builder()
                .id(goal.getId())
                .goalDescription(goal.getGoalDescription())
                .targetValue(goal.getTargetValue())
                .targetDate(goal.getTargetDate())
                .status(goal.getStatus())
                .createdAt(goal.getCreatedAt())
                .createdBy(goal.getCreatedBy())
                .build();
    }
}
