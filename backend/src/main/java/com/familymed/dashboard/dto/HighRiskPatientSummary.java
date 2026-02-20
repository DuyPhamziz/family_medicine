package com.familymed.dashboard.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class HighRiskPatientSummary {
    private UUID patientId;
    private String patientName;
    private UUID sessionId;
    private String formName;
    private Double riskPercentage;
    private String riskLevel;
    private LocalDateTime completedAt;
}
