package com.familymed.form.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitFormRequest {
    private UUID patientId;
    private UUID formId;
    private String submissionData; // JSON string với các câu trả lời
    private String notes;
}

