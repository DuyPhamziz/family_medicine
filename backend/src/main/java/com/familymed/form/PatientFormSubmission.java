package com.familymed.form;

import com.familymed.patient.Patient;
import com.familymed.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.UUID;

@Entity
@Table(name = "patient_form_submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PatientFormSubmission {
    
    @Id
    @Column(name = "submission_id", columnDefinition = "UUID")
    private UUID submissionId;
    
    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;
    
    @ManyToOne
    @JoinColumn(name = "form_id", nullable = false)
    private DiagnosticForm form;
    
    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor; // Bác sĩ nhập liệu
    
    @Column(columnDefinition = "TEXT")
    private String submissionData; // JSON - lưu các câu trả lời
    
    private Double totalScore; // Tổng điểm
    
    @Column(columnDefinition = "TEXT")
    private String diagnosticResult; // Kết quả chuẩn đoán (JSON)
    
    private String riskLevel; // MỨC NGUY CÓ: LOW, MEDIUM, HIGH
    
    private String notes; // Ghi chú của bác sĩ
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus status = SubmissionStatus.COMPLETED;
    
    public enum SubmissionStatus {
        DRAFT,
        COMPLETED,
        REVIEWED
    }
}
