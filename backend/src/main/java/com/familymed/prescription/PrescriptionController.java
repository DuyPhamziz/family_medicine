package com.familymed.prescription;

import com.familymed.prescription.dto.PrescriptionCreateRequest;
import com.familymed.prescription.dto.PrescriptionItemCreateRequest;
import com.familymed.prescription.dto.PrescriptionItemResponse;
import com.familymed.prescription.dto.PrescriptionResponse;
import com.familymed.pdf.PdfExportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final PdfExportService pdfExportService;

    @PostMapping("/prescriptions")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<PrescriptionResponse> createPrescription(
            @Valid @RequestBody PrescriptionCreateRequest request) {
        return ResponseEntity.ok(prescriptionService.createPrescription(request));
    }

    @GetMapping("/prescriptions/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<PrescriptionResponse> getPrescription(@PathVariable UUID id) {
        return ResponseEntity.ok(prescriptionService.getPrescription(id));
    }

    @GetMapping("/patients/{patientId}/prescriptions")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<List<PrescriptionResponse>> getPatientPrescriptions(@PathVariable UUID patientId) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByPatient(patientId));
    }

    @PostMapping("/prescriptions/{id}/items")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<PrescriptionItemResponse> addItem(
            @PathVariable UUID id,
            @Valid @RequestBody PrescriptionItemCreateRequest request) {
        return ResponseEntity.ok(prescriptionService.addItem(id, request));
    }

    @PutMapping("/prescriptions/{id}/issue")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<PrescriptionResponse> issue(@PathVariable UUID id) {
        return ResponseEntity.ok(prescriptionService.issuePrescription(id));
    }

    @PutMapping("/prescriptions/{id}/cancel")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<PrescriptionResponse> cancel(@PathVariable UUID id) {
        return ResponseEntity.ok(prescriptionService.cancelPrescription(id));
    }

    @GetMapping("/prescriptions/{id}/export/pdf")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public void exportPdf(@PathVariable UUID id, jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
        byte[] pdf = pdfExportService.exportPrescription(id);
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=prescription_" + id + ".pdf");
        response.getOutputStream().write(pdf);
    }
}
