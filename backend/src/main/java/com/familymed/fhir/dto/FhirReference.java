package com.familymed.fhir.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FhirReference {
    private String reference;
    private String type;
    private String display;
}
