package com.familymed.guideline.dto;

import com.familymed.guideline.Guideline;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class GuidelineResponse {
    private UUID id;
    private String title;
    private String summary;
    private String content;
    private String category;
    private String status;
    private String owner;
    private UUID formId;
    private String recommendations; // JSON array
    private String referenceList; // JSON array
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static GuidelineResponse fromEntity(Guideline guideline) {
        return GuidelineResponse.builder()
                .id(guideline.getId())
                .title(guideline.getTitle())
                .summary(guideline.getSummary())
                .content(guideline.getContent())
                .category(guideline.getCategory())
                .status(guideline.getStatus())
                .owner(guideline.getOwner())
                .formId(guideline.getForm() != null ? guideline.getForm().getFormId() : null)
                .recommendations(guideline.getRecommendations())
                .referenceList(guideline.getReferenceList())
                .createdAt(guideline.getCreatedAt())
                .updatedAt(guideline.getUpdatedAt())
                .build();
    }
}
