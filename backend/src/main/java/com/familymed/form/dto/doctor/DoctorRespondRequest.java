package com.familymed.form.dto.doctor;

import com.familymed.form.entity.PatientFormSubmission;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorRespondRequest {
    private String responseMessage;
    private PatientFormSubmission.ResponseMethod responseMethod;
}
