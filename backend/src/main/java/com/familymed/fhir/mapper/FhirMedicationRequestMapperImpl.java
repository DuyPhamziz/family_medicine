package com.familymed.fhir.mapper;

import com.familymed.fhir.dto.FhirMedicationRequest;
import com.familymed.prescription.entity.Prescription;
import org.springframework.stereotype.Component;

@Component
public class FhirMedicationRequestMapperImpl implements FhirMedicationRequestMapper {

    @Override
    public FhirMedicationRequest toFhir(Prescription prescription) {
        return FhirMedicationRequest.builder()
                .id(prescription.getId().toString())
                .status(prescription.getStatus().name().toLowerCase())
                .intent("order")
                .authoredOn(prescription.getCreatedAt() != null ? prescription.getCreatedAt().toString() : null)
                .subject(FhirReferenceFactory.patient(prescription.getPatient()))
                .reasonReference(prescription.getDiagnosis() != null
                        ? FhirReferenceFactory.diagnosis(prescription.getDiagnosis())
                        : null)
                .build();
    }
}
