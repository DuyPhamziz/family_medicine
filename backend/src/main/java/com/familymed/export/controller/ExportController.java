package com.familymed.export.controller;

import com.familymed.export.dto.PatientReportExportRequest;
import com.familymed.export.service.DynamicExcelExportService;
import com.familymed.export.service.PatientReportExportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * REST API Controller for patient report exports
 * Handles Excel and PDF generation endpoints
 */
@Slf4j
@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
public class ExportController {
    
    private final PatientReportExportService patientReportExportService;
    private final DynamicExcelExportService dynamicExcelExportService;
    
    /**
     * Export submission theo form template động (RECOMMENDED)
     * Tự động render Excel theo questions trong form
     * Hỗ trợ mọi loại form: tim mạch, nội tổng quát, nhi khoa, sản phụ khoa...
     * 
     * POST /api/export/submission/{submissionId}
     */
    @PostMapping("/submission/{submissionId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<?> exportDynamicExcel(@PathVariable UUID submissionId) {
        try {
            log.info("[EXPORT] Dynamic export request for submission: {}", submissionId);

            byte[] excelData = dynamicExcelExportService.exportSubmission(submissionId);
            
            // Validate generated file
            if (excelData == null || excelData.length == 0) {
                log.error("[EXPORT] Generated Excel file is empty for submission: {}", submissionId);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new ErrorResponse("Không thể tạo file Excel: dữ liệu trống"));
            }
            
            log.info("[EXPORT] Generated Excel successfully ({} bytes) for submission: {}", excelData.length, submissionId);

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = String.format("BenhNhan_KetQua_%s.xlsx", timestamp);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + filename + "\"")
                    .header(HttpHeaders.CONTENT_TYPE,
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .body(excelData);

        } catch (RuntimeException e) {
            String msg = e.getMessage();
            log.error("[EXPORT] Failed to export submission {}: {}", submissionId, msg);
            
            // Check if it's a not-found error
            if (msg != null && (msg.contains("not found") || msg.contains("deleted"))) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("Không tìm thấy submission (có thể đã bị xóa): " + submissionId));
            }
            
            // Other runtime errors
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Lỗi: " + msg));
        } catch (Exception e) {
            log.error("[EXPORT] Unexpected error exporting submission {}", submissionId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Lỗi xuất Excel: " + e.getMessage()));
        }
    }
    
    /**
     * Export clinical report as Excel file.
     * Primary endpoint: POST /api/export/clinical-report
     */
    @PostMapping("/clinical-report")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<?> exportClinicalReport(@RequestBody PatientReportExportRequest request) {
        return doExport(request);
    }

    /**
     * Backward-compatible alias.
     */
    @PostMapping("/patient-report")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<?> exportPatientReport(@RequestBody PatientReportExportRequest request) {
        return doExport(request);
    }

    private ResponseEntity<?> doExport(PatientReportExportRequest request) {
        try {
            log.info("Export request: submission={}, patient={}",
                    request.getSubmissionId(), request.getPatientId());

            if (request.getSubmissionId() == null || request.getSubmissionId().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Submission ID is required"));
            }

            byte[] excelData = patientReportExportService.generateClinicalReportExcel(request);

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = String.format("Clinical_Report_%s.xlsx", timestamp);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + filename + "\"")
                    .header(HttpHeaders.CONTENT_TYPE,
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .body(excelData);

        } catch (IllegalArgumentException e) {
            log.error("Invalid request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Invalid request: " + e.getMessage()));
        } catch (RuntimeException e) {
            log.error("Resource not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Resource not found: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Error exporting clinical report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error generating report: " + e.getMessage()));
        }
    }
    
    /**
     * Get hospital template configuration
     * 
     * GET /api/export/hospital-template
     * 
     * @return current hospital template configuration
     */
    @GetMapping("/hospital-template")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<?> getHospitalTemplate() {
        try {
            // This would be implemented in a template service
            return ResponseEntity.ok()
                    .body(new SuccessResponse("Hospital template configuration endpoint"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error fetching template: " + e.getMessage()));
        }
    }
    
    /**
     * Error response DTO
     */
    static class ErrorResponse {
        public String error;
        public ErrorResponse(String error) {
            this.error = error;
        }
    }
    
    /**
     * Success response DTO
     */
    static class SuccessResponse {
        public String message;
        public SuccessResponse(String message) {
            this.message = message;
        }
    }
}
