package com.familymed.form.dto.publicapi;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicFormSummaryDTO {
    private String title;
    private String description;
    private String category;
    private Integer estimatedTime;
    private String iconColor;
    private Integer version;
    private UUID publicToken;
}
