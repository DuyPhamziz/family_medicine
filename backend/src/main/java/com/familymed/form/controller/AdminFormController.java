package com.familymed.form.controller;

import com.familymed.form.dto.CreateFormVersionRequest;
import com.familymed.form.dto.CreateQuestionOptionRequest;
import com.familymed.form.dto.CreateQuestionRequest;
import com.familymed.form.dto.CreateSectionRequest;
import com.familymed.form.dto.DiagnosticFormDTO;
import com.familymed.form.dto.FormQuestionDTO;
import com.familymed.form.dto.FormQuestionOptionDTO;
import com.familymed.form.dto.FormSectionDTO;
import com.familymed.form.dto.UpdateQuestionOptionRequest;
import com.familymed.form.dto.UpdateQuestionRequest;
import com.familymed.form.dto.UpdateSectionRequest;
import com.familymed.form.service.FormService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
}
