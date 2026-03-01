package com.familymed.form.dto.publicapi;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicFormQuestionDTO {
    private String questionCode;
    private String questionText;
    private String questionType;
    private Boolean required;
    private String helpText;
    private Double minValue;
    private Double maxValue;
    private String unit;
    private List<PublicFormOptionDTO> options;
}
