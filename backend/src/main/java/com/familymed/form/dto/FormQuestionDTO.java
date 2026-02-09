package com.familymed.form.dto;

import com.familymed.form.FormQuestion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormQuestionDTO {
    private UUID questionId;
    private Integer questionOrder;
    private String questionText;
    private String questionType;
    private String options;
    private String unit;
    private Double minValue;
    private Double maxValue;
    private Integer points;
    private Boolean required;
    private String helpText;
    
    public static FormQuestionDTO fromQuestion(FormQuestion question) {
        return FormQuestionDTO.builder()
                .questionId(question.getQuestionId())
                .questionOrder(question.getQuestionOrder())
                .questionText(question.getQuestionText())
                .questionType(question.getQuestionType().name())
                .options(question.getOptions())
                .unit(question.getUnit())
                .minValue(question.getMinValue())
                .maxValue(question.getMaxValue())
                .points(question.getPoints())
                .required(question.getRequired())
                .helpText(question.getHelpText())
                .build();
    }
}

