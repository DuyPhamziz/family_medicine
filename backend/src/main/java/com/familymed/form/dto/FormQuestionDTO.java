package com.familymed.form.dto;

import com.familymed.form.entity.FormQuestion;
import com.familymed.form.entity.FormQuestionOption;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
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
    private String formulaExpression;
    private Boolean allowAdditionalAnswers;
    private Integer maxAdditionalAnswers;
    private List<FormQuestionOptionDTO> optionItems;

        public FormQuestionDTO(
            UUID questionId,
            Integer questionOrder,
            String questionCode,
            String questionText,
            String questionType,
            String options,
            String unit,
            Double minValue,
            Double maxValue,
            Integer points,
            Boolean required,
            String helpText,
            String displayCondition,
            Boolean allowAdditionalAnswers,
            Integer maxAdditionalAnswers,
            List<FormQuestionOptionDTO> optionItems
        ) {
        this.questionId = questionId;
        this.questionOrder = questionOrder;
        this.questionCode = questionCode;
        this.questionText = questionText;
        this.questionType = questionType;
        this.options = options;
        this.unit = unit;
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.points = points;
        this.required = required;
        this.helpText = helpText;
        this.displayCondition = displayCondition;
        this.allowAdditionalAnswers = allowAdditionalAnswers;
        this.maxAdditionalAnswers = maxAdditionalAnswers;
        this.optionItems = optionItems;
        }

        public FormQuestionDTO(
            UUID questionId,
            Integer questionOrder,
            String questionCode,
            String questionText,
            String questionType,
            String options,
            String unit,
            Double minValue,
            Double maxValue,
            Integer points,
            Boolean required,
            String helpText,
            String displayCondition,
            String formulaExpression,
            Boolean allowAdditionalAnswers,
            Integer maxAdditionalAnswers,
            List<FormQuestionOptionDTO> optionItems
        ) {
        this(questionId, questionOrder, questionCode, questionText, questionType, options, unit, minValue, maxValue,
            points, required, helpText, displayCondition, allowAdditionalAnswers, maxAdditionalAnswers, optionItems);
        this.formulaExpression = formulaExpression;
        }
    
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
            .formulaExpression(question.getFormulaExpression())
            .allowAdditionalAnswers(Boolean.TRUE.equals(question.getAllowAdditionalAnswers()))
            .maxAdditionalAnswers(question.getMaxAdditionalAnswers())
            .optionItems(optionItems)
                .build();
    }

    private static String toJsonArray(List<String> values) {
        return values.stream()
                .map(value -> value == null ? "\"\"" : "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\"")
                .collect(Collectors.joining(",", "[", "]"));
    }
}

