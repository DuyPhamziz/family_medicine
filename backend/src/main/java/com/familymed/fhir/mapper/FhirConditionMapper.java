package com.familymed.fhir.mapper;

import com.familymed.diagnosis.entity.PatientDiagnosis;
import com.familymed.fhir.dto.FhirCondition;

public interface FhirConditionMapper {
    FhirCondition toFhir(PatientDiagnosis diagnosis);
}
