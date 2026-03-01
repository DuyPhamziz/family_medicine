package com.familymed.form.controller;

import com.familymed.form.dto.publicapi.PublicFormDetailDTO;
import com.familymed.form.dto.publicapi.PublicFormSubmitRequest;
import com.familymed.form.dto.publicapi.PublicFormSummaryDTO;
import com.familymed.form.service.PublicFormService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Public form endpoints - no authentication required
 */
@RestController
@RequestMapping("/api/public/forms")
@RequiredArgsConstructor
public class PublicFormController {
    
    private final PublicFormService publicFormService;
    
    @GetMapping
    public ResponseEntity<List<PublicFormSummaryDTO>> getPublicForms() {
        return ResponseEntity.ok(publicFormService.getPublicForms());
    }

    @GetMapping("/{formToken}")
    public ResponseEntity<PublicFormDetailDTO> getPublicForm(@PathVariable UUID formToken) {
        return ResponseEntity.ok(publicFormService.getPublicForm(formToken));
    }

    @PostMapping("/{token}/submit")
    public ResponseEntity<Map<String, Object>> submitPublicForm(
            @PathVariable("token") UUID formToken,
            @RequestBody PublicFormSubmitRequest request) {
        return ResponseEntity.ok(publicFormService.submitPublicForm(formToken, request));
    }
}
