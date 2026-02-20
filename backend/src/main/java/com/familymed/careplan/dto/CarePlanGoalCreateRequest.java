package com.familymed.careplan.dto;

import com.familymed.careplan.entity.CarePlanGoal;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CarePlanGoalCreateRequest {

    @NotBlank
    private String goalDescription;

    private String targetValue;

    private LocalDate targetDate;

    private CarePlanGoal.Status status;
}
