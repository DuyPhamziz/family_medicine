package com.familymed.api.dto;

import lombok.Data;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@Builder
public class PublicCheckResultResponse {
    private String submissionId;
    private String patientName;
    private String patientEmail;
    private String patientPhone;
    private String formName;
    private String status; // PENDING, REVIEWED, CANCELLED
    private LocalDateTime submittedAt;
    private DoctorResponse doctorResponse;

    @Data
    @Builder
    public static class DoctorResponse {
        private String diagnosis;
        private String recommendations;
        private String notes;
        private String doctorName;
        private LocalDateTime respondedAt;
    }
}
