package com.familymed.appointment.dto;

import com.familymed.appointment.entity.Appointment;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class AppointmentResponse {
    private UUID id;
    private UUID patientId;
    private UUID practitionerId;
    private Appointment.Status status;
    private LocalDateTime scheduledStart;
    private LocalDateTime scheduledEnd;
    private String reason;
    private LocalDateTime createdAt;
    private UUID createdBy;
    private LocalDateTime updatedAt;
    private UUID updatedBy;

    public static AppointmentResponse fromEntity(Appointment appointment) {
        return AppointmentResponse.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatient().getPatientId())
                .practitionerId(appointment.getPractitioner().getUserId())
                .status(appointment.getStatus())
                .scheduledStart(appointment.getScheduledStart())
                .scheduledEnd(appointment.getScheduledEnd())
                .reason(appointment.getReason())
                .createdAt(appointment.getCreatedAt())
                .createdBy(appointment.getCreatedBy())
                .updatedAt(appointment.getUpdatedAt())
                .updatedBy(appointment.getUpdatedBy())
                .build();
    }
}
