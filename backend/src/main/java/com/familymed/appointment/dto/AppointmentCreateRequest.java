package com.familymed.appointment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class AppointmentCreateRequest {

    @NotNull
    private UUID patientId;

    @NotNull
    private UUID practitionerId;

    @NotNull
    private LocalDateTime scheduledStart;

    @NotNull
    private LocalDateTime scheduledEnd;

    private String reason;
}
