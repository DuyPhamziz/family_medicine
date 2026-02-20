package com.familymed.question.mapper;

import com.familymed.question.entity.QuestionBank;
import com.familymed.question.entity.QuestionBankOption;
import com.familymed.question.entity.QuestionType;

import com.familymed.question.dto.QuestionBankRequest;
import com.familymed.question.dto.QuestionBankResponse;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class QuestionMapper {

    public QuestionBankResponse toResponse(QuestionBank entity) {
        if (entity == null) {
            return null;
        }

        List<QuestionBankResponse.OptionResponse> options = entity.getOptions() == null ? Collections.emptyList() :
                entity.getOptions().stream()
                        .map(this::toOptionResponse)
                        .collect(Collectors.toList());

        return QuestionBankResponse.builder()
                .questionId(entity.getId())
                .questionCode(entity.getQuestionCode())
                .questionText(entity.getQuestionText())
                .questionType(entity.getQuestionType())
                .isActive(entity.getIsActive())
                .options(options)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private QuestionBankResponse.OptionResponse toOptionResponse(QuestionBankOption option) {
        return QuestionBankResponse.OptionResponse.builder()
                .optionId(option.getOptionId())
                .optionText(option.getOptionText())
                .optionValue(option.getOptionValue())
                .optionOrder(option.getOptionOrder())
                .points(option.getPoints())
                .build();
    }

    public QuestionBank toEntity(QuestionBankRequest request) {
        if (request == null) {
            return null;
        }

        QuestionBank entity = new QuestionBank();
        entity.setQuestionCode(request.getQuestionCode());
        entity.setQuestionText(request.getQuestionText());
        entity.setQuestionType(request.getQuestionType());
        entity.setIsActive(true);

        if (request.getOptions() != null) {
            request.getOptions().forEach(optReq -> {
                QuestionBankOption option = new QuestionBankOption();
                option.setOptionText(optReq.getOptionText());
                option.setOptionValue(optReq.getOptionValue());
                option.setOptionOrder(optReq.getOptionOrder());
                option.setPoints(optReq.getPoints());
                entity.addOption(option);
            });
        }

        return entity;
    }

    public void updateEntity(QuestionBank entity, QuestionBankRequest request) {
        if (request == null || entity == null) {
            return;
        }

        entity.setQuestionCode(request.getQuestionCode());
        entity.setQuestionText(request.getQuestionText());
        entity.setQuestionType(request.getQuestionType());

        // Update options: simplest way is clear and re-add for this case
        // In production, we might want to reconcile options by ID if they were editable individually
        entity.getOptions().clear();
        if (request.getOptions() != null) {
            request.getOptions().forEach(optReq -> {
                QuestionBankOption option = new QuestionBankOption();
                option.setOptionText(optReq.getOptionText());
                option.setOptionValue(optReq.getOptionValue());
                option.setOptionOrder(optReq.getOptionOrder());
                option.setPoints(optReq.getPoints());
                entity.addOption(option);
            });
        }
    }
}
