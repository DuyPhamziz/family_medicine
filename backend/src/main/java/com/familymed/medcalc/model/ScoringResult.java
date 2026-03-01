package com.familymed.medcalc.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ScoringResult {
    private double score;
    private String interpretation;
}
