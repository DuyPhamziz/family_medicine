package com.familymed.fhir.mapper;

import com.familymed.appointment.entity.Appointment;
import com.familymed.fhir.dto.FhirAppointment;

public interface FhirAppointmentMapper {
    FhirAppointment toFhir(Appointment appointment);
}
