package com.familymed.form.controller;

import com.familymed.form.dto.DiagnosticFormDTO;
import com.familymed.form.service.MasterFormService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class MasterFormAdminController {

    private final MasterFormService masterFormService;

    @PostMapping("/generate-master-form")
    public ResponseEntity<DiagnosticFormDTO> generateMasterForm() {
        try {
            return ResponseEntity.ok(masterFormService.generateMasterForm());
        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/master-form/lock")
    public ResponseEntity<DiagnosticFormDTO> setMasterFormLock(@RequestParam(defaultValue = "true") boolean locked) {
        try {
            return ResponseEntity.ok(masterFormService.setMasterLock(locked));
        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/master-form")
    public ResponseEntity<DiagnosticFormDTO> getMasterFormForAdmin() {
        return masterFormService.getMasterForm()
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.noContent().build());
    }
}
