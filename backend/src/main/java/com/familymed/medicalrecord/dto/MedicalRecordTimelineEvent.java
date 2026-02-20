package com.familymed.medicalrecord.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class MedicalRecordTimelineEvent {
    private String eventType;
    private LocalDateTime eventTime;
    private String title;
    private UUID referenceId;
    private Map<String, Object> data;
}
