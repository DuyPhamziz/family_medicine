package com.familymed.logic.dto;

import com.familymed.logic.LogicVariable;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class LogicVariableResponse {
    private UUID variableId;
    private String variableName;
    private String variableCode;
    private String unit;

    public static LogicVariableResponse fromEntity(LogicVariable variable) {
        return LogicVariableResponse.builder()
                .variableId(variable.getVariableId())
                .variableName(variable.getVariableName())
                .variableCode(variable.getVariableCode())
                .unit(variable.getUnit())
                .build();
    }
}
