package com.familymed.logic.dto;

import com.familymed.logic.LogicFormula;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class LogicFormulaResponse {
    private UUID formulaId;
    private String formulaName;
    private String formulaCode;
    private String expression;

    public static LogicFormulaResponse fromEntity(LogicFormula formula) {
        return LogicFormulaResponse.builder()
                .formulaId(formula.getFormulaId())
                .formulaName(formula.getFormulaName())
                .formulaCode(formula.getFormulaCode())
                .expression(formula.getExpression())
                .build();
    }
}
