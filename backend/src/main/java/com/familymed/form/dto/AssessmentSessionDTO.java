package com.familymed.form.dto;

import com.familymed.form.assessment.entity.AssessmentSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentSessionDTO {
    private UUID sessionId;
    private UUID patientId;
    private UUID formId;
    private UUID doctorId;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime updatedAt;
    private String notes;

    public static AssessmentSessionDTO fromSession(AssessmentSession session) {
        return AssessmentSessionDTO.builder()
                .sessionId(session.getSessionId())
                .patientId(session.getPatient().getPatientId())
                .formId(session.getForm().getFormId())
                .doctorId(session.getDoctor().getUserId())
                .status(session.getStatus().name())
                .startedAt(session.getStartedAt())
                .completedAt(session.getCompletedAt())
                .updatedAt(session.getUpdatedAt())
                .notes(session.getNotes())
                .build();
    }
}
