package com.familymed.fhir.mapper;

import com.familymed.fhir.dto.FhirMedicationRequest;
import com.familymed.prescription.entity.Prescription;

public interface FhirMedicationRequestMapper {
    FhirMedicationRequest toFhir(Prescription prescription);
}
