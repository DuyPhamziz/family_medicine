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
    private String displayCondition; // Legacy key for condition JSON
    private String conditionJson;
    private String metadataJson;
    private Integer orderIndex;
    private String type;
    private String label;
    private String placeholder;
    private List<PublicFormOptionDTO> options;
}
