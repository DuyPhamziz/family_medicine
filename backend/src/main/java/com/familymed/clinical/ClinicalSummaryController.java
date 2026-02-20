package com.familymed.clinical;

import com.familymed.clinical.dto.ClinicalSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class ClinicalSummaryController {

    private final ClinicalSummaryService clinicalSummaryService;

    @GetMapping("/{id}/clinical-summary")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<ClinicalSummaryResponse> getSummary(@PathVariable UUID id) {
        return ResponseEntity.ok(clinicalSummaryService.getSummary(id));
    }
}
