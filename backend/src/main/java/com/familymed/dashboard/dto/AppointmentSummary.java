package com.familymed.dashboard.dto;

import com.familymed.appointment.entity.Appointment;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class AppointmentSummary {
    private UUID id;
    private UUID patientId;
    private String patientName;
    private Appointment.Status status;
    private LocalDateTime scheduledStart;
    private LocalDateTime scheduledEnd;
    private String reason;

    public static AppointmentSummary fromEntity(Appointment appointment) {
        return AppointmentSummary.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatient().getPatientId())
                .patientName(appointment.getPatient().getFullName())
                .status(appointment.getStatus())
                .scheduledStart(appointment.getScheduledStart())
                .scheduledEnd(appointment.getScheduledEnd())
                .reason(appointment.getReason())
                .build();
    }
}
