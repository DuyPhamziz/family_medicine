package com.familymed.form.controller;

import com.familymed.form.dto.publicapi.PublicFormSummaryDTO;
import com.familymed.form.service.PublicFormService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PublicFormListController {

    private final PublicFormService publicFormService;

    @GetMapping({"/api/form/public/list", "/api/forms/public", "/form/public/list", "/forms/public"})
    public ResponseEntity<List<PublicFormSummaryDTO>> getPublicFormList() {
        return ResponseEntity.ok(publicFormService.getPublicForms());
    }
}
