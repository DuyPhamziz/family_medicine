package com.familymed.medcalc.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ScoringComputeResponse {
    private String formula;
    private double score;
    private String interpretation;
}
