package com.familymed.fhir.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FhirCondition {
    private String id;
    private String code;
    private String codeText;
    private String category;
    private String recordedDate;
    private String note;
    private FhirReference subject;
}
