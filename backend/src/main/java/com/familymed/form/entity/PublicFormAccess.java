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
 * Public form access configuration
 * Allows anonymous users to fill forms via token-based access
 */
@Entity
@Table(name = "public_form_access")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PublicFormAccess extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "access_id", columnDefinition = "UUID")
    private UUID accessId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_version_id", nullable = false)
    private FormVersion formVersion; // Which version is public
    
    @Column(nullable = false, unique = true)
    private String accessToken; // UUID token for URL: /public/forms/{token}
    
    @Column(nullable = false, unique = true)
    private String urlSlug; // Human-readable: /public/forms/diabetes-risk-screening
    
    @Column(nullable = false)
    private String title; // Display title in public page
    
    private String description; // Description shown to public users
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccessStatus status = AccessStatus.ACTIVE; // ACTIVE, INACTIVE, EXPIRED
    
    private LocalDateTime expiresAt; // Null = never expires
    
    private Integer maxResponses; // Null = unlimited
    
    private Integer currentResponses = 0; // Track count
    
    private Boolean requireEmail = false; // Must provide email to submit
    
    private Boolean requirePhone = false; // Must provide phone to submit
    
    @Column(columnDefinition = "TEXT")
    private String successMessage; // Message shown after successful submission
    
    @Column(columnDefinition = "TEXT")
    private String customCss; // Custom styling for public form
    
    public enum AccessStatus {
        ACTIVE,
        INACTIVE,
        EXPIRED
    }
}
