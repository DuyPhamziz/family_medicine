package com.familymed.form.controller;

import com.familymed.form.service.ConditionalLogicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Conditional logic evaluation endpoints
 * Used by frontend to determine which questions to show/hide/require
 */
@RestController
@RequestMapping("/api/forms/conditions")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
public class ConditionalLogicController {
    
    private final ConditionalLogicService conditionalLogicService;
    
    /**
     * POST /api/forms/conditions/evaluate/{formId}
     * Evaluate all conditional rules for given form answers
     * Request body: {
     *   questionCode1: value1,
     *   questionCode2: value2,
     *   ...
     * }
     * Response: {
     *   questionId1: {visible: true, required: false, disabled: false},
     *   questionId2: {visible: false, required: false, disabled: false},
     *   ...
     * }
     */
    @PostMapping("/evaluate/{formId}")
    public ResponseEntity<Map<String, Map<String, Object>>> evaluateConditions(
            @PathVariable UUID formId,
            @RequestBody Map<String, Object> answersMap) {
        return ResponseEntity.ok(conditionalLogicService.evaluateConditions(formId, answersMap));
    }
}
