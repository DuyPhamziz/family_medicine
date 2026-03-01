package com.familymed.form.dto.doctor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorSubmissionDetailDTO {
    private UUID submissionId;
    private String patientName;
    private String phone;
    private String email;
    private String formTitle;
    private Integer formVersion;
    private String status;
    private Double totalScore;
    private String riskLevel;
    private String doctorResponse;
    private String responseMethod;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;
    private List<DoctorSubmissionAnswerDTO> answers;
}
