package com.familymed.question.dto;

import com.familymed.question.entity.QuestionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class QuestionBankRequest {

    @NotBlank(message = "Question code is required")
    private String questionCode;

    @NotBlank(message = "Question text is required")
    private String questionText;

    @NotNull(message = "Question type is required")
    private QuestionType questionType;

    private List<OptionRequest> options;

    @Data
    public static class OptionRequest {
        @NotBlank(message = "Option text is required")
        private String optionText;
        private String optionValue;
        private Integer optionOrder;
        private Integer points;
    }
}
