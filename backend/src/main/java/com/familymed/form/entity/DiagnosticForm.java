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
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FormStatus status = FormStatus.ACTIVE;
    
    private Integer version = 1;
    
    // Mối quan hệ với các phần (Sections)
    @OneToMany(mappedBy = "form", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sectionOrder ASC")
    private List<FormSection> sections;

    @Column(columnDefinition = "TEXT")
    private String scoringRules; // JSON configuration for scoring and risk levels

    public enum FormStatus {
        ACTIVE,
        INACTIVE,
        ARCHIVED
    }
}

