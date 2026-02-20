package com.familymed.guideline.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GuidelineRequest {
    @NotBlank
    private String title;
    private String category;
    private String status;
    private String owner;
}
