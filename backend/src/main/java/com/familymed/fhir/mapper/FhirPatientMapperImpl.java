package com.familymed.fhir.mapper;

import com.familymed.fhir.dto.FhirPatient;
import com.familymed.patient.entity.Patient;
import org.springframework.stereotype.Component;

@Component
public class FhirPatientMapperImpl implements FhirPatientMapper {

    @Override
    public FhirPatient toFhir(Patient patient) {
        return FhirPatient.builder()
                .id(patient.getPatientId().toString())
                .identifier(patient.getPatientCode())
                .name(patient.getFullName())
                .gender(patient.getGender() != null ? patient.getGender().name().toLowerCase() : null)
                .birthDate(patient.getDateOfBirth() != null ? patient.getDateOfBirth().toString() : null)
                .build();
    }
}
