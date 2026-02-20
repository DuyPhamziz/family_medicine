package com.familymed.logic.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LogicVariableRequest {
    @NotBlank
    private String variableName;
    private String variableCode;
    private String unit;
}
