package com.familymed.fhir.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FhirPatient {
    private String id;
    private String identifier;
    private String name;
    private String gender;
    private String birthDate;
}
