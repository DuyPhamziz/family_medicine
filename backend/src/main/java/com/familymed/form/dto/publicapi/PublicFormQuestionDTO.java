package com.familymed.form.dto.publicapi;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicFormQuestionDTO {
    private UUID questionId;
    private String questionCode;
    private String questionText;
    private String questionType;
    private String formulaExpression;
    private Boolean required;
    private String helpText;
    private Double minValue;
    private Double maxValue;
    private String unit;
    private String displayCondition; // JSON used for conditional logic
    private List<PublicFormOptionDTO> options;
}
