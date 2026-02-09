package com.familymed.form.dto;

import com.familymed.form.DiagnosticForm;
import com.familymed.form.FormQuestion;
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
public class DiagnosticFormDTO {
    private UUID formId;
    private String formName;
    private String description;
    private String category;
    private String status;
    private Integer version;
    private List<FormQuestionDTO> questions;
    
    public static DiagnosticFormDTO fromForm(DiagnosticForm form, List<FormQuestion> questions) {
        return DiagnosticFormDTO.builder()
                .formId(form.getFormId())
                .formName(form.getFormName())
                .description(form.getDescription())
                .category(form.getCategory())
                .status(form.getStatus().name())
                .version(form.getVersion())
                .questions(questions.stream().map(FormQuestionDTO::fromQuestion).toList())
                .build();
    }
}

