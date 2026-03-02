package com.familymed.export.entity;

import com.familymed.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

/**
 * Hospital template configuration for Excel/PDF report generation
 * Stores customizable hospital information, logo, and disclaimers
 */
@Entity
@Table(name = "hospital_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HospitalTemplate extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "template_id", columnDefinition = "UUID")
    private UUID templateId;
    
    @Column(nullable = false)
    private String hospitalName = "Family Medicine Clinic"; // Default value
    
    @Column(nullable = false)
    private String department = "Clinical Assessment"; // Default department
    
    @Column(nullable = false)
    private String address = "123 Medical Center, City"; // Default address
    
    @Column(columnDefinition = "TEXT")
    private String logoBase64; // Base64-encoded hospital logo (PNG/JPG)
    
    @Column(columnDefinition = "TEXT")
    private String disclaimerText = "This report is generated for clinical use only. " +
            "It should not replace professional medical advice. " +
            "Always consult with a healthcare professional.";
    
    @Column(name = "signature_required", nullable = false)
    private Boolean signatureRequired = true;
    
    @Column(name = "stamp_required", nullable = false)
    private Boolean stampRequired = true;
    
    @Column(name = "footer_text", columnDefinition = "TEXT")
    private String footerText = "© Hospital Name. All rights reserved. " +
            "Confidential - For authorized personnel only.";
    
    @Column(nullable = false)
    private Boolean active = true;
    
    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = true;
    
    // Get the default template or create minimal one
    public static HospitalTemplate defaultTemplate() {
        HospitalTemplate template = new HospitalTemplate();
        template.setHospitalName("Family Medicine Clinic");
        template.setDepartment("Clinical Assessment");
        template.setAddress("123 Medical Center, City");
        template.setActive(true);
        template.setIsDefault(true);
        return template;
    }
}
