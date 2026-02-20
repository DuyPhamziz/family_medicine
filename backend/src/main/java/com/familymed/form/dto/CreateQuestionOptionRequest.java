package com.familymed.form.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuestionOptionRequest {
    private String optionText;
    private String optionValue;
    private Integer optionOrder;
    private Integer points;
}
