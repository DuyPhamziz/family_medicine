package com.familymed.form.dto.doctor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorSubmissionAnswerDTO {
    private UUID questionId;
    private String questionCode;
    private String value;
}
