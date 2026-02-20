package com.familymed.form.controller;

import com.familymed.form.dto.DiagnosticFormDTO;
import com.familymed.form.dto.PatientFormSubmissionDTO;
import com.familymed.form.service.FormService;
import com.familymed.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/forms")
@RequiredArgsConstructor
public class FormController {

    private final FormService formService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<DiagnosticFormDTO>> getAllForms() {
        return ResponseEntity.ok(formService.getAllActiveForms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiagnosticFormDTO> getForm(@PathVariable UUID id) {
        return ResponseEntity.ok(formService.getFormWithQuestions(id));
    }

    @PostMapping
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

    @GetMapping("/doctor/submissions")
    public ResponseEntity<List<PatientFormSubmissionDTO>> getDoctorSubmissions(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }

        UUID doctorId = userRepository.findByEmailOrUsername(authentication.getName(), authentication.getName())
                .map(user -> user.getUserId())
                .orElse(null);

        if (doctorId == null) {
            return ResponseEntity.ok(List.of());
        }

        return ResponseEntity.ok(formService.getDoctorSubmissions(doctorId));
    }
}
