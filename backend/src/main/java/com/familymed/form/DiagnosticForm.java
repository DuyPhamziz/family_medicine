package com.familymed.form;

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
public class DiagnosticForm {
    
    @Id
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
    
    // Mối quan hệ với các câu hỏi
    @OneToMany(mappedBy = "form", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FormQuestion> questions;
    
    public enum FormStatus {
        ACTIVE,
        INACTIVE,
        ARCHIVED
    }
}

