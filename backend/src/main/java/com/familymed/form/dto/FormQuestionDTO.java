package com.familymed.form.dto;

import com.familymed.form.entity.FormQuestion;
import com.familymed.form.entity.FormQuestionOption;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormQuestionDTO {
    private UUID questionId;
    private Integer questionOrder;
    private String questionCode;
    private String questionText;
    private String questionType;
    private String options;
    private String unit;
    private Double minValue;
    private Double maxValue;
    private Integer points;
    private Boolean required;
    private String helpText;
    private String displayCondition;
    private List<FormQuestionOptionDTO> optionItems;
    
    public static FormQuestionDTO fromQuestion(FormQuestion question) {
        List<FormQuestionOptionDTO> optionItems = question.getOptionItems() != null
            ? question.getOptionItems().stream()
                .map(FormQuestionOptionDTO::fromOption)
                .collect(Collectors.toList())
            : List.of();

        String optionsJson = question.getOptions();
        if ((optionsJson == null || optionsJson.isBlank()) && !optionItems.isEmpty()) {
            List<String> labels = optionItems.stream()
                .map(FormQuestionOptionDTO::getOptionText)
                .collect(Collectors.toList());
            optionsJson = toJsonArray(labels);
        }

        return FormQuestionDTO.builder()
                .questionId(question.getQuestionId())
                .questionOrder(question.getQuestionOrder())
                .questionCode(question.getQuestionCode())
                .questionText(question.getQuestionText())
                .questionType(question.getQuestionType().name())
            .options(optionsJson)
                .unit(question.getUnit())
                .minValue(question.getMinValue())
                .maxValue(question.getMaxValue())
                .points(question.getPoints())
                .required(question.getRequired())
                .helpText(question.getHelpText())
            .displayCondition(question.getDisplayCondition())
            .optionItems(optionItems)
                .build();
    }

    private static String toJsonArray(List<String> values) {
        return values.stream()
                .map(value -> value == null ? "\"\"" : "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\"")
                .collect(Collectors.joining(",", "[", "]"));
    }
}

