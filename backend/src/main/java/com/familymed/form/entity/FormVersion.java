package com.familymed.form.entity;

import com.familymed.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Immutable snapshot of a published form version
 * Stores complete form structure as JSON for point-in-time accuracy
 */
@Entity
@Table(name = "form_versions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FormVersion extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "version_id", columnDefinition = "UUID")
    private UUID versionId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", nullable = false)
    private DiagnosticForm form;
    
    @Column(nullable = false)
    private Integer versionNumber; // 1, 2, 3, ...
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String formSchemaJson; // Complete form structure snapshot (sections, questions, options, conditions)
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VersionStatus status = VersionStatus.DRAFT; // DRAFT, PUBLISHED, DEPRECATED
    
    @Column(nullable = false)
    private LocalDateTime publishedAt;
    
    private String changeLog; // What changed from previous version
    
    @Column(columnDefinition = "TEXT")
    private String scoringRulesJson; // Scoring configuration snapshot
    
    private Boolean isActive = false;
    
    public enum VersionStatus {
        DRAFT,
        PUBLISHED,
        DEPRECATED
    }
}
