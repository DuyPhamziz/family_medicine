package com.familymed.question.controller;

import com.familymed.common.ApiResponse;
import com.familymed.question.entity.QuestionType;
import com.familymed.question.dto.PaginatedResponse;
import com.familymed.question.dto.QuestionBankRequest;
import com.familymed.question.dto.QuestionBankResponse;
import com.familymed.question.service.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/questions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminQuestionController {

    private final QuestionService questionService;

    @PostMapping
    public ResponseEntity<ApiResponse<QuestionBankResponse>> createQuestion(@Valid @RequestBody QuestionBankRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Created question successfully", questionService.createQuestion(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<QuestionBankResponse>> updateQuestion(
            @PathVariable UUID id,
            @Valid @RequestBody QuestionBankRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Updated question successfully", questionService.updateQuestion(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(@PathVariable UUID id) {
        questionService.softDeleteQuestion(id);
        return ResponseEntity.ok(ApiResponse.success("Deleted question successfully", null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QuestionBankResponse>> getQuestion(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(questionService.getQuestionDetail(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<QuestionBankResponse>>> listQuestions(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) QuestionType type,
            @RequestParam(required = false, defaultValue = "true") Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        
        String[] sortParams = sort.split(",");
        Sort sortObj = Sort.by(sortParams[0]);
        if (sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc")) {
            sortObj = sortObj.ascending();
        } else {
            sortObj = sortObj.descending();
        }

        Pageable pageable = PageRequest.of(page, size, sortObj);
        return ResponseEntity.ok(ApiResponse.success(questionService.listQuestions(keyword, type, isActive, pageable)));
    }
}
