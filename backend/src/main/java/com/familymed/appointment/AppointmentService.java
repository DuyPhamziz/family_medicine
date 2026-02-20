package com.familymed.appointment;

import com.familymed.appointment.entity.Appointment;
import com.familymed.appointment.dto.AppointmentCreateRequest;
import com.familymed.appointment.dto.AppointmentResponse;

import java.util.List;
import java.util.UUID;

public interface AppointmentService {
    AppointmentResponse createAppointment(AppointmentCreateRequest request);

    AppointmentResponse getAppointment(UUID id);

    List<AppointmentResponse> getAppointmentsByPatient(UUID patientId);

    List<AppointmentResponse> getUpcomingAppointmentsByPatient(UUID patientId);

    AppointmentResponse updateStatus(UUID id, Appointment.Status status);
}
