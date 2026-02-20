package com.familymed.medicalrecord.dto;

import com.familymed.form.assessment.entity.AssessmentSession;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class AssessmentHistoryItem {
    private UUID sessionId;
    private UUID formId;
    private String formName;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime updatedAt;
    private String notes;

    public static AssessmentHistoryItem fromEntity(AssessmentSession session) {
        return AssessmentHistoryItem.builder()
                .sessionId(session.getSessionId())
                .formId(session.getForm().getFormId())
                .formName(session.getForm().getFormName())
                .status(session.getStatus().name())
                .startedAt(session.getStartedAt())
                .completedAt(session.getCompletedAt())
                .updatedAt(session.getUpdatedAt())
                .notes(session.getNotes())
                .build();
    }
}
