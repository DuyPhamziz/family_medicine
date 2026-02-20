package com.familymed.careplan.dto;

import com.familymed.careplan.entity.CarePlanAction;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class CarePlanActionResponse {
    private UUID id;
    private CarePlanAction.ActionType actionType;
    private String description;
    private String frequency;
    private String duration;
    private CarePlanAction.Status status;
    private LocalDateTime createdAt;
    private UUID createdBy;

    public static CarePlanActionResponse fromEntity(CarePlanAction action) {
        return CarePlanActionResponse.builder()
                .id(action.getId())
                .actionType(action.getActionType())
                .description(action.getDescription())
                .frequency(action.getFrequency())
                .duration(action.getDuration())
                .status(action.getStatus())
                .createdAt(action.getCreatedAt())
                .createdBy(action.getCreatedBy())
                .build();
    }
}
