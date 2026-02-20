package com.familymed.form.dto;

import com.familymed.form.entity.DiagnosticForm;
import com.familymed.form.entity.FormQuestion;
import com.familymed.form.entity.FormSection;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiagnosticFormDTO {
    private UUID formId;
    private String formName;
    private String description;
    private String category;
    private String status;
    private Integer version;
    private List<FormSectionDTO> sections;
    
    public static DiagnosticFormDTO fromForm(DiagnosticForm form, List<FormSection> sections) {
        return DiagnosticFormDTO.builder()
                .formId(form.getFormId())
                .formName(form.getFormName())
                .description(form.getDescription())
                .category(form.getCategory())
                .status(form.getStatus().name())
                .version(form.getVersion())
                .sections(sections != null ? 
                        sections.stream()
                                .map(FormSectionDTO::fromSection)
                                .collect(Collectors.toList()) : List.of())
                .build();
    }
}

