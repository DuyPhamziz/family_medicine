package com.familymed.form.dto;

import com.familymed.form.entity.FormQuestion;
import com.familymed.form.entity.FormQuestionOption;
import com.familymed.form.entity.FamilyDiseaseMatrixConfig;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;
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
    private String formulaExpression;
    private Boolean allowAdditionalAnswers;
    private Integer maxAdditionalAnswers;
    private String groupId;
    private Boolean isRepeatableGroup;
    private Boolean repeatGroupRoot;
    private Integer maxRepeat;
    private String labelAddButton;
    private MatrixFamilyDiseaseConfigDTO matrixConfig;
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

        MatrixFamilyDiseaseConfigDTO matrixConfig = toMatrixConfigDto(question.getMatrixConfig());

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
                .groupId(question.getGroupId())
                .isRepeatableGroup(Boolean.TRUE.equals(question.getIsRepeatableGroup()))
                .repeatGroupRoot(Boolean.TRUE.equals(question.getRepeatGroupRoot()))
                .maxRepeat(question.getMaxRepeat())
                .labelAddButton(question.getLabelAddButton())
                .matrixConfig(matrixConfig)
            .optionItems(optionItems)
                .build();
    }

    private static MatrixFamilyDiseaseConfigDTO toMatrixConfigDto(FamilyDiseaseMatrixConfig config) {
        if (config == null) {
            return null;
        }

        List<Map<String, Object>> rows = parseJsonList(config.getRowsJson());
        List<Map<String, Object>> columns = parseJsonList(config.getColumnsJson());

        return MatrixFamilyDiseaseConfigDTO.builder()
                .rows(rows)
                .columns(columns)
                .allowAdditionalColumn(Boolean.TRUE.equals(config.getAllowAdditionalColumn()))
                .allowAdditionalRow(Boolean.TRUE.equals(config.getAllowAdditionalRow()))
                .build();
    }

    @SuppressWarnings("unchecked")
    private static List<Map<String, Object>> parseJsonList(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }

        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Object parsed = mapper.readValue(json, Object.class);
            if (!(parsed instanceof List<?> list)) {
                return List.of();
            }
            return list.stream()
                    .filter(Map.class::isInstance)
                    .map(item -> (Map<String, Object>) item)
                    .toList();
        } catch (Exception ex) {
            return List.of();
        }
    }

    private static String toJsonArray(List<String> values) {
        return values.stream()
                .map(value -> value == null ? "\"\"" : "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\"")
                .collect(Collectors.joining(",", "[", "]"));
    }
}

