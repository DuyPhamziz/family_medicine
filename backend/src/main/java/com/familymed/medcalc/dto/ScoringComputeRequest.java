package com.familymed.medcalc.dto;

import lombok.Data;

import java.util.Map;

@Data
public class ScoringComputeRequest {
    private String formula;
    private Map<String, Object> inputs;
}
