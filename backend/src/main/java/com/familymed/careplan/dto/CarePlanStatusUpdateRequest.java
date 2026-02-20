package com.familymed.careplan.dto;

import com.familymed.careplan.entity.CarePlan;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CarePlanStatusUpdateRequest {

    @NotNull
    private CarePlan.Status status;
}
