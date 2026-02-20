package com.familymed.logic.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LogicFormulaRequest {
    @NotBlank
    private String formulaName;
    private String formulaCode;
    private String expression;
}
