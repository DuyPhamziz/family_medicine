package com.familymed.fhir.mapper;

import com.familymed.diagnosis.entity.PatientDiagnosis;
import com.familymed.fhir.dto.FhirCondition;
import org.springframework.stereotype.Component;

@Component
public class FhirConditionMapperImpl implements FhirConditionMapper {

    @Override
    public FhirCondition toFhir(PatientDiagnosis diagnosis) {
        return FhirCondition.builder()
                .id(diagnosis.getId().toString())
                .code(diagnosis.getIcd10Code().getCode())
                .codeText(diagnosis.getIcd10Code().getDescription())
                .category(diagnosis.getDiagnosisType().name().toLowerCase())
                .recordedDate(diagnosis.getDiagnosedAt() != null ? diagnosis.getDiagnosedAt().toString() : null)
                .note(diagnosis.getNotes())
                .subject(FhirReferenceFactory.patient(diagnosis.getPatient()))
                .build();
    }
}
