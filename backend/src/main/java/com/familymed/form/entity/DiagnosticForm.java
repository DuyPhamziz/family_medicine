package com.familymed.form.entity;

import com.familymed.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "diagnostic_forms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DiagnosticForm extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "form_id", columnDefinition = "UUID")
    private UUID formId;
    
    @Column(nullable = false)
    private String formName; // Tên biểu mẫu (e.g., "SCORE Tiền đái tháo đường")
    
    private String description;
    
    private String category; // Phân loại (e.g., "Phòng ngừa bệnh", "Chẩn đoán", v.v.)

    @Column(name = "estimated_time")
    private Integer estimatedTime;

    @Column(name = "icon_color")
    private String iconColor;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FormStatus status = FormStatus.ACTIVE;

    @Column(name = "is_public")
    private Boolean isPublic = false;

    @Column(name = "public_token", columnDefinition = "UUID", unique = true)
    private UUID publicToken;
    
    private Integer version = 1;
    
    // Multi-tenant support
    @Column(name = "clinic_id", columnDefinition = "UUID")
    private UUID clinicId;
    
    // Versioning: current published version
    @Column(name = "published_version_id", columnDefinition = "UUID")
    private UUID publishedVersionId;
    
    // Mối quan hệ với các phần (Sections)
    @OneToMany(mappedBy = "form", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sectionOrder ASC")
    private List<FormSection> sections;
    
    // All versions of this form
    @OneToMany(mappedBy = "form", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("versionNumber DESC")
    private List<FormVersion> versions;

    @Column(columnDefinition = "TEXT")
    private String scoringRules; // JSON configuration for scoring and risk levels

    public enum FormStatus {
        DRAFT,
        PUBLISHED,
        ACTIVE,
        INACTIVE,
        ARCHIVED
    }
}

