package com.familymed.form.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Session token for public forms - prevents multiple submissions
 */
@Entity
@Table(name = "public_form_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicFormSession {
    
    @Id
    @Column(name = "session_token")
    private UUID sessionToken;
    
    @Column(name = "form_id", nullable = false)
    private UUID formId;
    
    @Column(name = "client_ip", length = 45)
    private String clientIp;
    
    @Column(name = "user_agent", length = 500)
    private String userAgent;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
    
    @Column(name = "used", nullable = false)
    private Boolean used;
    
    @Column(name = "used_at")
    private LocalDateTime usedAt;
    
    @Column(name = "submission_id")
    private UUID submissionId;
    
    @PrePersist
    protected void onCreate() {
        if (sessionToken == null) {
            sessionToken = UUID.randomUUID();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (expiresAt == null) {
            // Session expires after 2 hours
            expiresAt = createdAt.plusHours(2);
        }
        if (used == null) {
            used = false;
        }
    }
}
