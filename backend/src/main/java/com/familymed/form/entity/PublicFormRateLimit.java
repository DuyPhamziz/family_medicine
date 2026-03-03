package com.familymed.form.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Rate limiting for public form submissions by IP address
 */
@Entity
@Table(name = "public_form_rate_limits", indexes = {
    @Index(name = "idx_rate_limit_ip_date", columnList = "client_ip,submission_date")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicFormRateLimit {
    
    @Id
    @GeneratedValue
    private UUID id;
    
    @Column(name = "client_ip", nullable = false, length = 45)
    private String clientIp;
    
    @Column(name = "form_id", nullable = false)
    private UUID formId;
    
    @Column(name = "submission_date", nullable = false)
    private LocalDateTime submissionDate;
    
    @Column(name = "submission_count", nullable = false)
    private Integer submissionCount;
    
    @Column(name = "last_submission_at", nullable = false)
    private LocalDateTime lastSubmissionAt;
    
    @Column(name = "blocked", nullable = false)
    private Boolean blocked;
    
    @PrePersist
    protected void onCreate() {
        if (submissionDate == null) {
            submissionDate = LocalDateTime.now();
        }
        if (submissionCount == null) {
            submissionCount = 0;
        }
        if (lastSubmissionAt == null) {
            lastSubmissionAt = LocalDateTime.now();
        }
        if (blocked == null) {
            blocked = false;
        }
    }
}
