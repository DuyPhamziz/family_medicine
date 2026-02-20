package com.familymed.question.service;

import com.familymed.question.entity.QuestionType;
import com.familymed.question.dto.PaginatedResponse;
import com.familymed.question.dto.QuestionBankRequest;
import com.familymed.question.dto.QuestionBankResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface QuestionService {
    QuestionBankResponse createQuestion(QuestionBankRequest request);
    QuestionBankResponse updateQuestion(UUID id, QuestionBankRequest request);
    void softDeleteQuestion(UUID id);
    QuestionBankResponse getQuestionDetail(UUID id);
    PaginatedResponse<QuestionBankResponse> listQuestions(String keyword, QuestionType type, Boolean isActive, Pageable pageable);
}
