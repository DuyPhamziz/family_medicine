package com.familymed.appointment.dto;

import com.familymed.appointment.entity.Appointment;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AppointmentStatusUpdateRequest {

    @NotNull
    private Appointment.Status status;
}
