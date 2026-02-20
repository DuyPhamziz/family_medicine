package com.familymed.careplan;

import com.familymed.careplan.dto.CarePlanActionCreateRequest;
import com.familymed.careplan.dto.CarePlanActionResponse;
import com.familymed.careplan.dto.CarePlanCreateRequest;
import com.familymed.careplan.dto.CarePlanGoalCreateRequest;
import com.familymed.careplan.dto.CarePlanGoalResponse;
import com.familymed.careplan.dto.CarePlanResponse;
import com.familymed.careplan.dto.CarePlanStatusUpdateRequest;
import com.familymed.pdf.PdfExportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CarePlanController {

    private final CarePlanService carePlanService;
    private final PdfExportService pdfExportService;

    @PostMapping("/care-plans")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<CarePlanResponse> createCarePlan(@Valid @RequestBody CarePlanCreateRequest request) {
        return ResponseEntity.ok(carePlanService.createCarePlan(request));
    }

    @GetMapping("/care-plans/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<CarePlanResponse> getCarePlan(@PathVariable UUID id) {
        return ResponseEntity.ok(carePlanService.getCarePlan(id));
    }

    @GetMapping("/patients/{patientId}/care-plans")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<List<CarePlanResponse>> getPatientCarePlans(@PathVariable UUID patientId) {
        return ResponseEntity.ok(carePlanService.getCarePlansByPatient(patientId));
    }

    @PutMapping("/care-plans/{id}/status")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<CarePlanResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody CarePlanStatusUpdateRequest request) {
        return ResponseEntity.ok(carePlanService.updateStatus(id, request.getStatus()));
    }

    @PostMapping("/care-plans/{id}/goals")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<CarePlanGoalResponse> addGoal(
            @PathVariable UUID id,
            @Valid @RequestBody CarePlanGoalCreateRequest request) {
        return ResponseEntity.ok(carePlanService.addGoal(id, request));
    }

    @PostMapping("/care-plans/{id}/actions")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<CarePlanActionResponse> addAction(
            @PathVariable UUID id,
            @Valid @RequestBody CarePlanActionCreateRequest request) {
        return ResponseEntity.ok(carePlanService.addAction(id, request));
    }

    @GetMapping("/care-plans/{id}/export/pdf")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public void exportPdf(@PathVariable UUID id, jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
        byte[] pdf = pdfExportService.exportCarePlan(id);
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=care_plan_" + id + ".pdf");
        response.getOutputStream().write(pdf);
    }
}
