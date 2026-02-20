package com.familymed.fhir.mapper;

import com.familymed.fhir.dto.FhirPatient;
import com.familymed.patient.entity.Patient;

public interface FhirPatientMapper {
    FhirPatient toFhir(Patient patient);
}
