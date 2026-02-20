package com.familymed.form.dto;

import com.familymed.form.entity.FormQuestionOption;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormQuestionOptionDTO {
    private UUID optionId;
    private String optionText;
    private String optionValue;
    private Integer optionOrder;
    private Integer points;

    public static FormQuestionOptionDTO fromOption(FormQuestionOption option) {
        return FormQuestionOptionDTO.builder()
                .optionId(option.getOptionId())
                .optionText(option.getOptionText())
                .optionValue(option.getOptionValue())
                .optionOrder(option.getOptionOrder())
                .points(option.getPoints())
                .build();
    }
}
