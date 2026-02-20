package com.familymed.fhir.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FhirAppointment {
    private String id;
    private String status;
    private String start;
    private String end;
    private String reason;
    private FhirReference patient;
    private FhirReference practitioner;
}
