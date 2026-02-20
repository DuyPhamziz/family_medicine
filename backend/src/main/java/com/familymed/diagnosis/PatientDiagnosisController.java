package com.familymed.diagnosis;

import com.familymed.diagnosis.dto.CreatePatientDiagnosisRequest;
import com.familymed.diagnosis.dto.PatientDiagnosisResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientDiagnosisController {

    private final PatientDiagnosisService diagnosisService;

    @PostMapping("/{patientId}/diagnoses")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<PatientDiagnosisResponse> createDiagnosis(
            @PathVariable UUID patientId,
            @Valid @RequestBody CreatePatientDiagnosisRequest request) {
        return ResponseEntity.ok(diagnosisService.createDiagnosis(patientId, request));
    }

    @GetMapping("/{patientId}/diagnoses")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<List<PatientDiagnosisResponse>> getDiagnoses(@PathVariable UUID patientId) {
        return ResponseEntity.ok(diagnosisService.getDiagnosesByPatient(patientId));
    }
}
