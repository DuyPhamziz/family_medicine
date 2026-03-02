package com.familymed.form.controller;

import com.familymed.form.dto.doctor.DoctorRespondRequest;
import com.familymed.form.dto.doctor.DoctorSubmissionDetailDTO;
import com.familymed.form.dto.doctor.DoctorSubmissionListItemDTO;
import com.familymed.form.dto.doctor.DoctorSubmissionStatsDTO;
import com.familymed.form.dto.doctor.DoctorSubmissionResultDTO;
import com.familymed.form.entity.PatientFormSubmission;
import com.familymed.form.repository.PatientFormSubmissionRepository;
import com.familymed.form.repository.SubmissionAnswerRepository;
import com.familymed.form.service.DoctorSubmissionService;
import com.familymed.form.service.FormSubmissionResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/doctor/submissions")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
public class DoctorSubmissionController {

    private final DoctorSubmissionService doctorSubmissionService;
    private final FormSubmissionResultService formSubmissionResultService;
    private final PatientFormSubmissionRepository submissionRepository;
    private final SubmissionAnswerRepository answerRepository;

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

    /**
     * DELETE submission với cascade
     * Xóa SubmissionAnswer trước, sau đó xóa PatientFormSubmission
     * Dùng @Transactional để đảm bảo consistency
     */
    @DeleteMapping("/{submissionId}")
    @Transactional
    public ResponseEntity<?> deleteSubmission(@PathVariable UUID submissionId) {
        var submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found: " + submissionId));

        try {
            // Step 1: Xóa tất cả answers của submission này
            answerRepository.deleteBySubmissionSubmissionId(submissionId);

            // Step 2: Xóa submission
            submissionRepository.delete(submission);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Đã xóa submission thành công",
                    "submissionId", submissionId
            ));
        } catch (Exception e) {
            throw new RuntimeException("Lỗi xóa submission: " + e.getMessage(), e);
        }
    }

    /**
     * Archive submission (soft delete alternative)
     */
    @PutMapping("/{submissionId}/archive")
    @Transactional
    public ResponseEntity<?> archiveSubmission(@PathVariable UUID submissionId) {
        var submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found: " + submissionId));

        submission.setStatus(PatientFormSubmission.SubmissionStatus.ARCHIVED);
        submissionRepository.save(submission);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã lưu trữ submission",
                "submissionId", submissionId
        ));
    }
}
