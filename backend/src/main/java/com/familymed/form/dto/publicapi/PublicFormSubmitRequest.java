package com.familymed.form.dto.publicapi;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicFormSubmitRequest {
    private String patientName;
    private String phone;
    private String email;
    private Map<String, Object> answers;
}
