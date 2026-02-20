package com.familymed.question.service;

import com.familymed.question.entity.QuestionBank;
import com.familymed.question.entity.QuestionType;
import com.familymed.question.dto.PaginatedResponse;
import com.familymed.question.dto.QuestionBankRequest;
import com.familymed.question.dto.QuestionBankResponse;
import com.familymed.question.mapper.QuestionMapper;
import com.familymed.question.repository.QuestionBankRepository;
import com.familymed.question.repository.QuestionSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {

    private final QuestionBankRepository repository;
    private final QuestionMapper mapper;

    @Override
    @Transactional
    public QuestionBankResponse createQuestion(QuestionBankRequest request) {
        QuestionBank entity = mapper.toEntity(request);
        QuestionBank saved = repository.save(entity);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional
    public QuestionBankResponse updateQuestion(UUID id, QuestionBankRequest request) {
        QuestionBank entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
        
        mapper.updateEntity(entity, request);
        QuestionBank saved = repository.save(entity);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void softDeleteQuestion(UUID id) {
        QuestionBank entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
        entity.setIsActive(false);
        repository.save(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public QuestionBankResponse getQuestionDetail(UUID id) {
        QuestionBank entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
        return mapper.toResponse(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<QuestionBankResponse> listQuestions(String keyword, QuestionType type, Boolean isActive, Pageable pageable) {
        Specification<QuestionBank> spec = Specification.where(QuestionSpecification.hasKeyword(keyword))
                .and(QuestionSpecification.hasType(type))
                .and(QuestionSpecification.hasActiveStatus(isActive));

        Page<QuestionBank> page = repository.findAll(spec, pageable);
        
        List<QuestionBankResponse> content = page.getContent().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());

        return PaginatedResponse.<QuestionBankResponse>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
