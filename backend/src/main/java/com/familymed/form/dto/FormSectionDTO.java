package com.familymed.form.dto;

import com.familymed.form.entity.FormSection;
import com.familymed.form.entity.FormQuestion;
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
public class FormSectionDTO {
    private UUID sectionId;
    private String sectionName;
    private Integer sectionOrder;
    private List<FormQuestionDTO> questions;

    public static FormSectionDTO fromSection(FormSection section) {
        return FormSectionDTO.builder()
                .sectionId(section.getSectionId())
                .sectionName(section.getSectionName())
                .sectionOrder(section.getSectionOrder())
                .questions(section.getQuestions() != null ? 
                        section.getQuestions().stream()
                                .map(FormQuestionDTO::fromQuestion)
                                .collect(Collectors.toList()) : List.of())
                .build();
    }
}
