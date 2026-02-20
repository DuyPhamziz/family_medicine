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
    private String category;
    private String status;
    private String owner;
    private LocalDateTime updatedAt;

    public static GuidelineResponse fromEntity(Guideline guideline) {
        return GuidelineResponse.builder()
                .id(guideline.getId())
                .title(guideline.getTitle())
                .category(guideline.getCategory())
                .status(guideline.getStatus())
                .owner(guideline.getOwner())
                .updatedAt(guideline.getUpdatedAt())
                .build();
    }
}
