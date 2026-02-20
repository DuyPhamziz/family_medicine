package com.familymed.question.dto;

import com.familymed.question.entity.QuestionType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class QuestionBankResponse {
    private UUID questionId;
    private String questionCode;
    private String questionText;
    private QuestionType questionType;
    private Boolean isActive;
    private List<OptionResponse> options;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    public static class OptionResponse {
        private UUID optionId;
        private String optionText;
        private String optionValue;
        private Integer optionOrder;
        private Integer points;
    }
}
