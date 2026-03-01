package com.familymed.form.dto.publicapi;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicFormSectionDTO {
    private String sectionName;
    private Integer sectionOrder;
    private List<PublicFormQuestionDTO> questions;
}
