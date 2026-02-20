package com.familymed.form.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuestionRequest {
    private String questionCode;
    private Integer questionOrder;
    private String questionText;
    private String questionType;
    private String unit;
    private Double minValue;
    private Double maxValue;
    private Integer points;
    private Boolean required;
    private String helpText;
    private String displayCondition;
    private List<CreateQuestionOptionRequest> options;
}
