package com.familymed.form.dto.publicapi;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicFormDetailDTO {
    private UUID publicToken;
    private String title;
    private String description;
    private String category;
    private Integer version;
    private List<PublicFormSectionDTO> sections;
}
