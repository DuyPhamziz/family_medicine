package com.familymed.form.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

/**
 * Immutable snapshot of form structure at time of submission
 * Allows us to always know what form user saw, even if form changed later
 */
@Entity
@Table(name = "form_submission_snapshots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FormSubmissionSnapshot {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "snapshot_id", columnDefinition = "UUID")
    private UUID snapshotId;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false, unique = true)
    private PatientFormSubmission submission;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_version_id", nullable = false)
    private FormVersion formVersion; // Which version was submitted
    
    /**
     * Complete form structure + submission answers + calculated results
     * Format: {
     *   sections: [...],
     *   answers: {questionCode: value},
     *   calculatedScores: {...},
     *   conditionalResults: {questionId: {visible, required, ...}}
     * }
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String snapshotJson;
}
