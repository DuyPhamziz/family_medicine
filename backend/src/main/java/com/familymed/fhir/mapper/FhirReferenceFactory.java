package com.familymed.fhir.mapper;

import com.familymed.careplan.entity.CarePlan;
import com.familymed.diagnosis.entity.PatientDiagnosis;
import com.familymed.patient.entity.Patient;
import com.familymed.user.entity.User;
import com.familymed.fhir.dto.FhirReference;

public final class FhirReferenceFactory {

    private FhirReferenceFactory() {
    }

    public static FhirReference patient(Patient patient) {
        return FhirReference.builder()
                .reference("Patient/" + patient.getPatientId())
                .type("Patient")
                .display(patient.getFullName())
                .build();
    }

    public static FhirReference practitioner(User user) {
        return FhirReference.builder()
                .reference("Practitioner/" + user.getUserId())
                .type("Practitioner")
                .display(user.getFullName())
                .build();
    }

    public static FhirReference carePlan(CarePlan carePlan) {
        return FhirReference.builder()
                .reference("CarePlan/" + carePlan.getId())
                .type("CarePlan")
                .display(carePlan.getNotes())
                .build();
    }

    public static FhirReference diagnosis(PatientDiagnosis diagnosis) {
        return FhirReference.builder()
                .reference("Condition/" + diagnosis.getId())
                .type("Condition")
                .display(diagnosis.getIcd10Code().getDescription())
                .build();
    }
}
