package com.familymed.fhir.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FhirCarePlan {
    private String id;
    private String status;
    private String intent;
    private String periodStart;
    private String periodEnd;
    private String description;
    private FhirReference subject;
}
