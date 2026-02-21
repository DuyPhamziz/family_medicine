package com.familymed.form.controller;

import com.familymed.form.dto.PatientFormSubmissionDTO;
import com.familymed.form.dto.SubmitFormRequest;
import com.familymed.form.service.FormService;
import com.familymed.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final FormService formService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<PatientFormSubmissionDTO> submitForm(
            @RequestBody SubmitFormRequest request,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }

        UUID doctorId = userRepository.findByEmailOrUsername(authentication.getName(), authentication.getName())
                .map(user -> user.getUserId())
                .orElse(null);

        if (doctorId == null) {
            return ResponseEntity.status(404).build();
        }

        return ResponseEntity.ok(formService.submitForm(request, doctorId));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<List<PatientFormSubmissionDTO>> getPatientSubmissions(@PathVariable UUID patientId) {
        return ResponseEntity.ok(formService.getPatientSubmissions(patientId));
    }

    @GetMapping("/{id}/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public void exportSubmission(@PathVariable UUID id, HttpServletResponse response) throws IOException {
        // Mock export logic for now, implementing real structure requires parsing the JSON submissionData
        // and mapping it to the Excel structure.
        
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=submission_" + id + ".xlsx");

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Submission Data");
            
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Variable Code");
            header.createCell(1).setCellValue("Question Text");
            header.createCell(2).setCellValue("Answer");

            // In a real implementation, we would fetch the submission, parse the JSON, 
            // and iterate through the answers to populate rows.
            // For now, create a dummy row to prove it works.
            Row row = sheet.createRow(1);
            row.createCell(0).setCellValue("V1");
            row.createCell(1).setCellValue("Sample Question");
            row.createCell(2).setCellValue("Sample Answer");

            workbook.write(response.getOutputStream());
        }
    }
}
