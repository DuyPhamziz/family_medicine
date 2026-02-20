package com.familymed.fhir.mapper;

import com.familymed.careplan.entity.CarePlan;
import com.familymed.fhir.dto.FhirCarePlan;
import org.springframework.stereotype.Component;

@Component
public class FhirCarePlanMapperImpl implements FhirCarePlanMapper {

    @Override
    public FhirCarePlan toFhir(CarePlan carePlan) {
        return FhirCarePlan.builder()
                .id(carePlan.getId().toString())
                .status(carePlan.getStatus().name().toLowerCase())
                .intent("plan")
                .periodStart(carePlan.getStartDate() != null ? carePlan.getStartDate().toString() : null)
                .periodEnd(carePlan.getEndDate() != null ? carePlan.getEndDate().toString() : null)
                .description(carePlan.getNotes())
                .subject(FhirReferenceFactory.patient(carePlan.getPatient()))
                .build();
    }
}
