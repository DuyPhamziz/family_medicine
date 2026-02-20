package com.familymed.form.dto;

import com.familymed.form.assessment.entity.AssessmentAnswer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentAnswerDTO {
    private UUID answerId;
    private UUID questionId;
    private String questionCode;
    private String questionText;
    private String answerType;
    private String answerValue;
    private LocalDateTime answeredAt;

    public static AssessmentAnswerDTO fromAnswer(AssessmentAnswer answer) {
        return AssessmentAnswerDTO.builder()
                .answerId(answer.getAnswerId())
                .questionId(answer.getQuestionId())
                .questionCode(answer.getQuestionCode())
                .questionText(answer.getQuestionText())
                .answerType(answer.getAnswerType().name())
                .answerValue(answer.getAnswerValue())
                .answeredAt(answer.getAnsweredAt())
                .build();
    }
}
