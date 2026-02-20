package com.familymed.fhir.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FhirMedicationRequest {
    private String id;
    private String status;
    private String intent;
    private String authoredOn;
    private FhirReference subject;
    private FhirReference reasonReference;
}
