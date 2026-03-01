package com.familymed.form.controller;

import com.familymed.form.dto.doctor.DoctorRespondRequest;
import com.familymed.form.dto.doctor.DoctorSubmissionDetailDTO;
import com.familymed.form.dto.doctor.DoctorSubmissionListItemDTO;
import com.familymed.form.dto.doctor.DoctorSubmissionStatsDTO;
import com.familymed.form.entity.PatientFormSubmission;
import com.familymed.form.service.DoctorSubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/doctor/submissions")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
public class DoctorSubmissionController {

    private final DoctorSubmissionService doctorSubmissionService;

    @GetMapping
    public ResponseEntity<List<DoctorSubmissionListItemDTO>> getSubmissions(
            @RequestParam(required = false) PatientFormSubmission.SubmissionStatus status
    ) {
        return ResponseEntity.ok(doctorSubmissionService.getSubmissions(status));
    }

    @GetMapping("/stats")
    public ResponseEntity<DoctorSubmissionStatsDTO> getStats() {
        return ResponseEntity.ok(doctorSubmissionService.getStats());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorSubmissionDetailDTO> getDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(doctorSubmissionService.getSubmissionDetail(id));
    }

    @PostMapping("/{id}/respond")
    public ResponseEntity<DoctorSubmissionDetailDTO> respond(
            @PathVariable UUID id,
            @RequestBody DoctorRespondRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(doctorSubmissionService.respond(id, request, authentication.getName()));
    }
}
