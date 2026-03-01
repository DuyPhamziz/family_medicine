package com.familymed.guideline.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class GuidelineRequest {
    @NotBlank
    private String title;

    private String summary; // Brief summary

    private String content; // Full content/recommendations

    private String category; // e.g., "Tim mạch", "Hô hấp"

    private String status; // DRAFT, PUBLISHED, ACTIVE

    private String owner; // Author/doctor name

    private UUID formId; // Link to DiagnosticForm/calculator

    private String recommendations; // JSON: ["rec1", "rec2"]

    private String referenceList; // JSON: [{title, authors, ...}]
}
