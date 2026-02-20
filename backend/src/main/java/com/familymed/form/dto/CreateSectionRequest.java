package com.familymed.form.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSectionRequest {
    private String sectionName;
    private Integer sectionOrder;
}
