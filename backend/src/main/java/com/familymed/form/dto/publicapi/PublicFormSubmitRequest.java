package com.familymed.form.dto.publicapi;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicFormSubmitRequest {
    private String patientName;
    private String phone;
    private String email;
    private Map<String, Object> answers;
    
    // Anti-spam fields
    private UUID sessionToken;  // Session token from form load
    private String honeypot;     // Hidden field - should be empty (bots will fill it)
    private Long formLoadTime;   // Timestamp when form was loaded (ms)
}
