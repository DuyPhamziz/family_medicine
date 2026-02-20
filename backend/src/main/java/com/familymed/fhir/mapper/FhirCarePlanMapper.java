package com.familymed.fhir.mapper;

import com.familymed.careplan.entity.CarePlan;
import com.familymed.fhir.dto.FhirCarePlan;

public interface FhirCarePlanMapper {
    FhirCarePlan toFhir(CarePlan carePlan);
}
