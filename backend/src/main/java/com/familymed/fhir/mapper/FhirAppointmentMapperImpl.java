package com.familymed.fhir.mapper;

import com.familymed.appointment.entity.Appointment;
import com.familymed.fhir.dto.FhirAppointment;
import org.springframework.stereotype.Component;

@Component
public class FhirAppointmentMapperImpl implements FhirAppointmentMapper {

    @Override
    public FhirAppointment toFhir(Appointment appointment) {
        return FhirAppointment.builder()
                .id(appointment.getId().toString())
                .status(appointment.getStatus().name().toLowerCase())
                .start(appointment.getScheduledStart() != null ? appointment.getScheduledStart().toString() : null)
                .end(appointment.getScheduledEnd() != null ? appointment.getScheduledEnd().toString() : null)
                .reason(appointment.getReason())
                .patient(FhirReferenceFactory.patient(appointment.getPatient()))
                .practitioner(FhirReferenceFactory.practitioner(appointment.getPractitioner()))
                .build();
    }
}
