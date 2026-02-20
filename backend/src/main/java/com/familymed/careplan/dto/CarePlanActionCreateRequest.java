package com.familymed.careplan.dto;

import com.familymed.careplan.entity.CarePlanAction;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CarePlanActionCreateRequest {

    @NotNull
    private CarePlanAction.ActionType actionType;

    @NotBlank
    private String description;

    private String frequency;

    private String duration;

    private CarePlanAction.Status status;
}
