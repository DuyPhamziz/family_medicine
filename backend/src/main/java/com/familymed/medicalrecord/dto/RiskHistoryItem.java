package com.familymed.medicalrecord.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class RiskHistoryItem {
    private UUID sessionId;
    private String formName;
    private Double riskPercentage;
    private String riskLevel;
    private LocalDateTime calculatedAt;
}
