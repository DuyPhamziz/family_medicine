package com.familymed.form.assessment.entity;

import com.familymed.form.entity.DiagnosticForm;
import com.familymed.patient.entity.Patient;
import com.familymed.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "assessment_sessions", indexes = {
    @Index(name = "idx_assessment_patient", columnList = "patient_id"),
    @Index(name = "idx_assessment_doctor", columnList = "doctor_id"),
    @Index(name = "idx_assessment_status", columnList = "status"),
    @Index(name = "idx_assessment_completed", columnList = "completed_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentSession {

    @Id
    @Column(name = "session_id", columnDefinition = "UUID")
    private UUID sessionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", nullable = false)
    private DiagnosticForm form;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status = SessionStatus.IN_PROGRESS;

    @Column(nullable = false)
    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    private LocalDateTime updatedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public enum SessionStatus {
        IN_PROGRESS,
        COMPLETED,
        ABANDONED
    }
}
