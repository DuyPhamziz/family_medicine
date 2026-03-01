package com.familymed.form.controller;

import com.familymed.form.dto.doctor.DoctorRespondRequest;
import com.familymed.form.dto.doctor.DoctorSubmissionDetailDTO;
import com.familymed.form.dto.doctor.DoctorSubmissionListItemDTO;
import com.familymed.form.dto.doctor.DoctorSubmissionStatsDTO;
import com.familymed.form.dto.doctor.DoctorSubmissionResultDTO;
import com.familymed.form.entity.PatientFormSubmission;
import com.familymed.form.service.DoctorSubmissionService;
import com.familymed.form.service.FormSubmissionResultService;
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
    private final FormSubmissionResultService formSubmissionResultService;

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

    /**
     * Lấy kết quả phân tích hoàn chỉnh của một submission
     * Bao gồm: điểm số, risk level, các giá trị tính toán tự động, vv
     */
    @GetMapping("/{id}/results")
    public ResponseEntity<DoctorSubmissionResultDTO> getSubmissionResults(@PathVariable UUID id) {
        return ResponseEntity.ok(formSubmissionResultService.getSubmissionResult(id));
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
