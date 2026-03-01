package com.familymed.form.controller;

import com.familymed.form.dto.*;
import com.familymed.form.entity.FormVersion;
import com.familymed.form.service.FormService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/forms/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminFormController {

    private final FormService formService;

    @GetMapping("/all")
    public ResponseEntity<List<DiagnosticFormDTO>> getAllForms() {
        return ResponseEntity.ok(formService.getAllForms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiagnosticFormDTO> getForm(@PathVariable UUID id) {
        return ResponseEntity.ok(formService.getFormWithQuestions(id));
    }

    @PostMapping("/create")
    public ResponseEntity<DiagnosticFormDTO> createForm(@RequestBody DiagnosticFormDTO dto) {
        return ResponseEntity.ok(formService.createForm(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiagnosticFormDTO> updateForm(@PathVariable UUID id, @RequestBody DiagnosticFormDTO dto) {
        return ResponseEntity.ok(formService.updateForm(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteForm(@PathVariable UUID id) {
        formService.deleteForm(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/versions")
    public ResponseEntity<DiagnosticFormDTO> createNewVersion(
            @PathVariable UUID id,
            @RequestBody CreateFormVersionRequest request) {
        return ResponseEntity.ok(formService.createNewVersion(id, request));
    }

    @PostMapping("/{formId}/sections")
    public ResponseEntity<FormSectionDTO> createSection(
            @PathVariable UUID formId,
            @RequestBody CreateSectionRequest request) {
        return ResponseEntity.ok(formService.createSection(formId, request));
    }

    @PutMapping("/sections/{sectionId}")
    public ResponseEntity<FormSectionDTO> updateSection(
            @PathVariable UUID sectionId,
            @RequestBody UpdateSectionRequest request) {
        return ResponseEntity.ok(formService.updateSection(sectionId, request));
    }

    @DeleteMapping("/sections/{sectionId}")
    public ResponseEntity<Void> deleteSection(@PathVariable UUID sectionId) {
        formService.deleteSection(sectionId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sections/{sectionId}/questions")
    public ResponseEntity<FormQuestionDTO> createQuestion(
            @PathVariable UUID sectionId,
            @RequestBody CreateQuestionRequest request) {
        return ResponseEntity.ok(formService.createQuestion(sectionId, request));
    }

    @PutMapping("/questions/{questionId}")
    public ResponseEntity<FormQuestionDTO> updateQuestion(
            @PathVariable UUID questionId,
            @RequestBody UpdateQuestionRequest request) {
        return ResponseEntity.ok(formService.updateQuestion(questionId, request));
    }

    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable UUID questionId) {
        formService.deleteQuestion(questionId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/questions/{questionId}/options")
    public ResponseEntity<FormQuestionOptionDTO> createOption(
            @PathVariable UUID questionId,
            @RequestBody CreateQuestionOptionRequest request) {
        return ResponseEntity.ok(formService.createOption(questionId, request));
    }

    @PutMapping("/options/{optionId}")
    public ResponseEntity<FormQuestionOptionDTO> updateOption(
            @PathVariable UUID optionId,
            @RequestBody UpdateQuestionOptionRequest request) {
        return ResponseEntity.ok(formService.updateOption(optionId, request));
    }

    @DeleteMapping("/options/{optionId}")
    public ResponseEntity<Void> deleteOption(@PathVariable UUID optionId) {
        formService.deleteOption(optionId);
        return ResponseEntity.noContent().build();
    }

    /**
     * PUT /api/forms/admin/questions/reorder
     * Reorder questions within a section (for drag & drop)
     */
    @PutMapping("/questions/reorder")
    public ResponseEntity<Void> reorderQuestions(@RequestBody ReorderQuestionsRequest request) {
        formService.reorderQuestions(request);
        return ResponseEntity.ok().build();
    }

    /**
     * PUT /api/forms/admin/sections/reorder
     * Reorder sections within a form
     */
    @PutMapping("/sections/reorder")
    public ResponseEntity<Void> reorderSections(@RequestBody ReorderSectionsRequest request) {
        formService.reorderSections(request);
        return ResponseEntity.ok().build();
    }
    
    // ===== NEW: VERSIONING ENDPOINTS =====
    
    /**
     * GET /api/forms/admin/{formId}/versions
     * Get all versions of a form
     */
    @GetMapping("/{formId}/versions")
    public ResponseEntity<List<FormVersion>> getFormVersions(@PathVariable UUID formId) {
        return ResponseEntity.ok(formService.getFormVersionHistory(formId));
    }
    
    /**
     * POST /api/forms/admin/{formId}/versions/publish/{versionId}
     * Publish a draft version to make it live
     */
    @PostMapping("/{formId}/versions/publish/{versionId}")
    public ResponseEntity<FormVersion> publishVersion(@PathVariable UUID versionId) {
        try {
            return ResponseEntity.ok(formService.publishVersion(versionId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * GET /api/forms/admin/{formId}/versions/published
     * Get currently published version
     */
    @GetMapping("/{formId}/versions/published")
    public ResponseEntity<FormVersion> getPublishedVersion(@PathVariable UUID formId) {
        return ResponseEntity.ok(formService.getPublishedVersion(formId).orElse(null));
    }
}
