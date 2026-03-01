package com.familymed.medcalc.controller;

import com.familymed.medcalc.dto.ScoringComputeRequest;
import com.familymed.medcalc.dto.ScoringComputeResponse;
import com.familymed.medcalc.model.ScoringResult;
import com.familymed.medcalc.service.MedicalScoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping({"/api/scoring", "/scoring", "/api/public/scoring"})
public class ScoringController {

    private final MedicalScoringService medicalScoringService;

    @PostMapping("/compute")
    public ResponseEntity<ScoringComputeResponse> compute(@RequestBody ScoringComputeRequest request) {
        ScoringResult result = medicalScoringService.compute(request.getFormula(), request.getInputs());
        return ResponseEntity.ok(ScoringComputeResponse.builder()
                .formula(request.getFormula())
                .score(result.getScore())
                .interpretation(result.getInterpretation())
                .build());
    }
}
