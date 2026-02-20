package com.familymed.dashboard.dto;

import com.familymed.form.assessment.entity.AssessmentSession;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class AssessmentSummary {
    private UUID sessionId;
    private UUID patientId;
    private String patientName;
    private UUID formId;
    private String formName;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime updatedAt;

    public static AssessmentSummary fromEntity(AssessmentSession session) {
        return AssessmentSummary.builder()
                .sessionId(session.getSessionId())
                .patientId(session.getPatient().getPatientId())
                .patientName(session.getPatient().getFullName())
                .formId(session.getForm().getFormId())
                .formName(session.getForm().getFormName())
                .status(session.getStatus().name())
                .startedAt(session.getStartedAt())
                .updatedAt(session.getUpdatedAt())
                .build();
    }
}
