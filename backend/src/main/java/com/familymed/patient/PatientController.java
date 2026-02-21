package com.familymed.patient;

import com.familymed.patient.dto.CreatePatientRequest;
import com.familymed.patient.dto.PatientDTO;
import com.familymed.patient.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.familymed.user.repository.UserRepository;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PatientController {
    
    private final PatientService patientService;
    private final UserRepository userRepository;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<?> createPatient(@Valid @RequestBody CreatePatientRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            
            UUID doctorId = userRepository.findByEmail(email)
                    .map(user -> user.getUserId())
                    .orElseThrow(() -> new RuntimeException("Doctor not found"));
            
            PatientDTO patient = patientService.createPatient(request, doctorId);
            return ResponseEntity.ok(patient);
        } catch (Exception e) {
            return ResponseEntity.status(400)
                    .body(Map.of("message", e.getMessage(), "error", "Bad Request"));
        }
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<?> getPatient(@PathVariable UUID id) {
        try {
            PatientDTO patient = patientService.getPatient(id);
            return ResponseEntity.ok(patient);
        } catch (Exception e) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", e.getMessage(), "error", "Not Found"));
        }
    }
    
    @GetMapping("/doctor/list")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<?> getDoctorPatients() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            log.info("getDoctorPatients - Authentication: {}", authentication);
            
            if (authentication == null || !authentication.isAuthenticated()) {
                log.error("getDoctorPatients - No authentication found or not authenticated");
                return ResponseEntity.status(403)
                        .body(Map.of("message", "Not authenticated", "error", "Forbidden"));
            }
            
            String email = authentication.getName();
            log.info("getDoctorPatients - User email: {}", email);
            
            UUID doctorId = userRepository.findByEmail(email)
                    .map(user -> user.getUserId())
                    .orElseThrow(() -> new RuntimeException("Doctor not found"));
            
            log.info("getDoctorPatients - Doctor ID: {}", doctorId);
            
            return ResponseEntity.ok(patientService.getPatientsByDoctor(doctorId));
        } catch (Exception e) {
            log.error("getDoctorPatients - Error: {}", e.getMessage(), e);
            return ResponseEntity.status(400)
                    .body(Map.of("message", e.getMessage(), "error", "Bad Request"));
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<?> updatePatient(@PathVariable UUID id, @Valid @RequestBody CreatePatientRequest request) {
        try {
            PatientDTO patient = patientService.updatePatient(id, request);
            return ResponseEntity.ok(patient);
        } catch (Exception e) {
            return ResponseEntity.status(400)
                    .body(Map.of("message", e.getMessage(), "error", "Bad Request"));
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<?> deletePatient(@PathVariable UUID id) {
        try {
            patientService.deletePatient(id);
            return ResponseEntity.ok(Map.of("message", "Patient deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(400)
                    .body(Map.of("message", e.getMessage(), "error", "Bad Request"));
        }
    }
}

