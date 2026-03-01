package com.familymed.form.entity;

import com.familymed.common.BaseEntity;
import com.familymed.patient.entity.Patient;
import com.familymed.user.entity.User;
import jakarta.persistence.*;
import org.hibernate.annotations.ColumnTransformer;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "patient_form_submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PatientFormSubmission extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "submission_id", columnDefinition = "UUID")
    private UUID submissionId;
    
    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;
    
    @ManyToOne
    @JoinColumn(name = "form_id", nullable = false)
    private DiagnosticForm form;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_version_id")
    private FormVersion formVersion; // Which form version was submitted

    @Column(name = "form_version_number")
    private Integer formVersionNumber;
    
    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private User doctor; // Bác sĩ nhập liệu

    @Column(name = "patient_name")
    private String patientName;

    @Column(name = "phone")
    private String phone;

    @Column(name = "email")
    private String email;
    
    @Column(columnDefinition = "TEXT")
    private String submissionData; // JSON - lưu các câu trả lời

    @Column(name = "form_snapshot", columnDefinition = "jsonb")
    @ColumnTransformer(write = "?::jsonb")
    private String formSnapshot;
    
    private Double totalScore; // Tổng điểm
    
    @Column(columnDefinition = "TEXT")
    private String diagnosticResult; // Kết quả chuẩn đoán (JSON)
    
    private String riskLevel; // MỨC NGUY CÓ: LOW, MEDIUM, HIGH
    
    private String notes; // Ghi chú của bác sĩ

    @Column(name = "doctor_response", columnDefinition = "TEXT")
    private String doctorResponse;

    @Enumerated(EnumType.STRING)
    @Column(name = "response_method")
    private ResponseMethod responseMethod;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus status = SubmissionStatus.COMPLETED;
    
    @OneToOne(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true)
    private FormSubmissionSnapshot snapshot; // Immutable snapshot of form + answers

    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SubmissionAnswer> answers;
    
    public enum SubmissionStatus {
        DRAFT,
        COMPLETED,
        PENDING,
        REVIEWED,
        RESPONDED
    }

    public enum ResponseMethod {
        EMAIL,
        ZALO,
        NONE
    }
}
