package com.familymed.form.controller;

import com.familymed.form.dto.DiagnosticFormDTO;
import com.familymed.form.dto.PatientFormSubmissionDTO;
import com.familymed.form.dto.SubmitFormRequest;
import com.familymed.form.service.FormService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.familymed.user.UserRepository;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/forms")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FormController {
    
    private final FormService formService;
    private final UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<?> getAllForms() {
        try {
            List<DiagnosticFormDTO> forms = formService.getAllActiveForms();
            return ResponseEntity.ok(forms);
        } catch (Exception e) {
            return ResponseEntity.status(400)
                    .body(Map.of("message", e.getMessage(), "error", "Bad Request"));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getForm(@PathVariable UUID id) {
        try {
            DiagnosticFormDTO form = formService.getFormWithQuestions(id);
            return ResponseEntity.ok(form);
        } catch (Exception e) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", e.getMessage(), "error", "Not Found"));
        }
    }
    
    @PostMapping("/submit")
    public ResponseEntity<?> submitForm(@Valid @RequestBody SubmitFormRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            
            UUID doctorId = userRepository.findByEmail(email)
                    .map(user -> user.getUserId())
                    .orElseThrow(() -> new RuntimeException("Doctor not found"));
            
            PatientFormSubmissionDTO submission = formService.submitForm(request, doctorId);
            return ResponseEntity.ok(submission);
        } catch (Exception e) {
            return ResponseEntity.status(400)
                    .body(Map.of("message", e.getMessage(), "error", "Bad Request"));
        }
    }
    
    @GetMapping("/patient/{patientId}/submissions")
    public ResponseEntity<?> getPatientSubmissions(@PathVariable UUID patientId) {
        try {
            List<PatientFormSubmissionDTO> submissions = formService.getPatientSubmissions(patientId);
            return ResponseEntity.ok(submissions);
        } catch (Exception e) {
            return ResponseEntity.status(400)
                    .body(Map.of("message", e.getMessage(), "error", "Bad Request"));
        }
    }
    
    @GetMapping("/doctor/submissions")
    public ResponseEntity<?> getDoctorSubmissions() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            
            UUID doctorId = userRepository.findByEmail(email)
                    .map(user -> user.getUserId())
                    .orElseThrow(() -> new RuntimeException("Doctor not found"));
            
            List<PatientFormSubmissionDTO> submissions = formService.getDoctorSubmissions(doctorId);
            return ResponseEntity.ok(submissions);
        } catch (Exception e) {
            return ResponseEntity.status(400)
                    .body(Map.of("message", e.getMessage(), "error", "Bad Request"));
        }
    }
    
    // ===== ADMIN FORM MANAGEMENT =====
    
    @PostMapping("/admin/create")
    public ResponseEntity<?> createForm(@Valid @RequestBody DiagnosticFormDTO dto) {
        try {
            DiagnosticFormDTO created = formService.createForm(dto);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.status(400)
                    .body(Map.of("message", e.getMessage(), "error", "Bad Request"));
        }
    }
    
    @PutMapping("/admin/{id}")
    public ResponseEntity<?> updateForm(@PathVariable UUID id, @Valid @RequestBody DiagnosticFormDTO dto) {
        try {
            DiagnosticFormDTO updated = formService.updateForm(id, dto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(400)
                    .body(Map.of("message", e.getMessage(), "error", "Bad Request"));
        }
    }
    
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> deleteForm(@PathVariable UUID id) {
        try {
            formService.deleteForm(id);
            return ResponseEntity.ok(Map.of("message", "Form deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(400)
                    .body(Map.of("message", e.getMessage(), "error", "Bad Request"));
        }
    }
    
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllFormsByAdmin() {
        try {
            List<DiagnosticFormDTO> forms = formService.getAllForms();
            return ResponseEntity.ok(forms);
        } catch (Exception e) {
            return ResponseEntity.status(400)
                    .body(Map.of("message", e.getMessage(), "error", "Bad Request"));
        }
    }
}

