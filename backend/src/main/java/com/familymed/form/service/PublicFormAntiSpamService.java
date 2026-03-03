package com.familymed.form.service;

import com.familymed.form.entity.PublicFormRateLimit;
import com.familymed.form.entity.PublicFormSession;
import com.familymed.form.repository.PublicFormRateLimitRepository;
import com.familymed.form.repository.PublicFormSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Anti-spam service for public forms
 * Implements rate limiting, session tokens, and abuse detection
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PublicFormAntiSpamService {
    
    private final PublicFormSessionRepository sessionRepository;
    private final PublicFormRateLimitRepository rateLimitRepository;
    
    // Configuration constants
    private static final int MAX_SUBMISSIONS_PER_IP_PER_DAY = 10;
    private static final int MAX_SESSIONS_PER_IP_PER_HOUR = 20;
    private static final int MIN_FORM_FILL_TIME_SECONDS = 5; // Too fast = bot
    private static final int SESSION_EXPIRY_HOURS = 2;
    
    /**
     * Create a new session token when user opens the form
     */
    @Transactional
    public UUID createSession(UUID formId, String clientIp, String userAgent) {
        // Check if IP is creating too many sessions (potential bot)
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        long recentSessions = sessionRepository.countByClientIpAndCreatedAtAfter(clientIp, oneHourAgo);
        
        if (recentSessions >= MAX_SESSIONS_PER_IP_PER_HOUR) {
            log.warn("IP {} exceeded session creation limit: {} sessions in 1 hour", clientIp, recentSessions);
            throw new RuntimeException("Quá nhiều yêu cầu từ địa chỉ IP của bạn. Vui lòng thử lại sau.");
        }
        
        PublicFormSession session = PublicFormSession.builder()
                .sessionToken(UUID.randomUUID())
                .formId(formId)
                .clientIp(clientIp)
                .userAgent(userAgent)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusHours(SESSION_EXPIRY_HOURS))
                .used(false)
                .build();
        
        sessionRepository.save(session);
        log.info("Created session {} for form {} from IP {}", session.getSessionToken(), formId, clientIp);
        
        return session.getSessionToken();
    }
    
    /**
     * Validate submission against all anti-spam rules
     */
    @Transactional
    public void validateAndRecordSubmission(
            UUID sessionToken, 
            UUID formId, 
            String clientIp,
            String honeypot,
            UUID submissionId) {
        
        LocalDateTime now = LocalDateTime.now();
        
        // 1. Honeypot check (hidden field that bots fill)
        if (honeypot != null && !honeypot.isEmpty()) {
            log.warn("Honeypot triggered from IP {}: '{}'", clientIp, honeypot);
            throw new RuntimeException("Phát hiện hành vi bất thường. Gửi form thất bại.");
        }
        
        // 2. Session token validation
        PublicFormSession session = sessionRepository.findBySessionToken(sessionToken)
                .orElseThrow(() -> new RuntimeException("Phiên làm việc không hợp lệ hoặc đã hết hạn."));
        
        if (!session.getFormId().equals(formId)) {
            log.warn("Session {} form mismatch: expected {} got {}", sessionToken, session.getFormId(), formId);
            throw new RuntimeException("Token không khớp với biểu mẫu.");
        }
        
        if (session.getExpiresAt().isBefore(now)) {
            log.warn("Session {} expired at {}", sessionToken, session.getExpiresAt());
            throw new RuntimeException("Phiên làm việc đã hết hạn. Vui lòng tải lại trang.");
        }
        
        if (Boolean.TRUE.equals(session.getUsed())) {
            log.warn("Session {} already used at {}", sessionToken, session.getUsedAt());
            throw new RuntimeException("Biểu mẫu này đã được gửi rồi.");
        }
        
        // 3. Time-based validation (too fast = bot)
        long secondsSinceSessionCreated = java.time.Duration.between(session.getCreatedAt(), now).getSeconds();
        if (secondsSinceSessionCreated < MIN_FORM_FILL_TIME_SECONDS) {
            log.warn("Suspicious fast submission from IP {}: {} seconds", clientIp, secondsSinceSessionCreated);
            throw new RuntimeException("Gửi form quá nhanh. Vui lòng điền kỹ thông tin.");
        }
        
        // 4. Rate limiting - check IP submission count
        LocalDateTime oneDayAgo = now.minusDays(1);
        PublicFormRateLimit rateLimit = rateLimitRepository
                .findByClientIpAndFormIdAndSubmissionDateAfter(clientIp, formId, oneDayAgo)
                .orElse(null);
        
        if (rateLimit == null) {
            // Create new rate limit record
            rateLimit = PublicFormRateLimit.builder()
                    .clientIp(clientIp)
                    .formId(formId)
                    .submissionDate(now)
                    .submissionCount(1)
                    .lastSubmissionAt(now)
                    .blocked(false)
                    .build();
        } else {
            // Check if blocked
            if (Boolean.TRUE.equals(rateLimit.getBlocked())) {
                log.warn("IP {} is blocked for form {}", clientIp, formId);
                throw new RuntimeException("Địa chỉ IP của bạn đã bị chặn do gửi quá nhiều lần.");
            }
            
            // Check submission count
            if (rateLimit.getSubmissionCount() >= MAX_SUBMISSIONS_PER_IP_PER_DAY) {
                log.warn("IP {} exceeded daily limit for form {}: {} submissions", 
                        clientIp, formId, rateLimit.getSubmissionCount());
                rateLimit.setBlocked(true);
                rateLimitRepository.save(rateLimit);
                throw new RuntimeException("Bạn đã đạt giới hạn gửi form hôm nay (" + 
                        MAX_SUBMISSIONS_PER_IP_PER_DAY + " lần). Vui lòng thử lại vào ngày mai.");
            }
            
            // Increment count
            rateLimit.setSubmissionCount(rateLimit.getSubmissionCount() + 1);
            rateLimit.setLastSubmissionAt(now);
        }
        
        rateLimitRepository.save(rateLimit);
        
        // 5. Mark session as used
        session.setUsed(true);
        session.setUsedAt(now);
        session.setSubmissionId(submissionId);
        sessionRepository.save(session);
        
        log.info("Validated submission {} for session {} from IP {} (attempt {}/{})", 
                submissionId, sessionToken, clientIp, 
                rateLimit.getSubmissionCount(), MAX_SUBMISSIONS_PER_IP_PER_DAY);
    }
    
    /**
     * Clean up expired sessions (called by scheduled task)
     */
    @Transactional
    public void cleanupExpiredSessions() {
        LocalDateTime now = LocalDateTime.now();
        sessionRepository.deleteByExpiresAtBefore(now);
        log.info("Cleaned up expired sessions before {}", now);
    }
    
    /**
     * Get remaining submissions allowed for an IP today
     */
    public int getRemainingSubmissions(UUID formId, String clientIp) {
        LocalDateTime oneDayAgo = LocalDateTime.now().minusDays(1);
        PublicFormRateLimit rateLimit = rateLimitRepository
                .findByClientIpAndFormIdAndSubmissionDateAfter(clientIp, formId, oneDayAgo)
                .orElse(null);
        
        if (rateLimit == null) {
            return MAX_SUBMISSIONS_PER_IP_PER_DAY;
        }
        
        if (Boolean.TRUE.equals(rateLimit.getBlocked())) {
            return 0;
        }
        
        return Math.max(0, MAX_SUBMISSIONS_PER_IP_PER_DAY - rateLimit.getSubmissionCount());
    }
}
