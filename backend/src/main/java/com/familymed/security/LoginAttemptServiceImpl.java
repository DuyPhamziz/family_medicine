package com.familymed.security;

import com.familymed.audit.entity.AuditActionType;
import com.familymed.audit.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class LoginAttemptServiceImpl implements LoginAttemptService {

    private static final int MAX_FAILURES = 5;

    private final AuditLogService auditLogService;

    @Value("${security.rate-limit.login-lock-minutes:15}")
    private int lockMinutes;

    private final Map<String, Deque<Long>> failures = new ConcurrentHashMap<>();
    private final Map<String, Long> lockedUntil = new ConcurrentHashMap<>();

    @Override
    public void recordFailure(String identifier, UUID userId) {
        auditLogService.logAction(AuditActionType.LOGIN_FAILED, "AUTH", identifier, userId);
        String key = resolveKey(identifier);
        long now = Instant.now().toEpochMilli();
        long windowStart = now - 60_000;

        Deque<Long> deque = failures.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (deque) {
            while (!deque.isEmpty() && deque.peekFirst() < windowStart) {
                deque.pollFirst();
            }
            deque.addLast(now);
            if (deque.size() >= MAX_FAILURES) {
                lockedUntil.put(key, now + lockMinutes * 60_000L);
                deque.clear();
            }
        }
    }

    @Override
    public void recordSuccess(String identifier, UUID userId) {
        auditLogService.logAction(AuditActionType.LOGIN_SUCCESS, "AUTH", identifier, userId);
        String key = resolveKey(identifier);
        failures.remove(key);
        lockedUntil.remove(key);
    }

    @Override
    public boolean isBlocked(String identifier) {
        String key = resolveKey(identifier);
        Long until = lockedUntil.get(key);
        if (until == null) {
            return false;
        }
        if (until <= Instant.now().toEpochMilli()) {
            lockedUntil.remove(key);
            return false;
        }
        return true;
    }

    private String resolveKey(String identifier) {
        String ip = resolveIp();
        return ip + "|" + (identifier == null ? "unknown" : identifier);
    }

    private String resolveIp() {
        HttpServletRequest request = currentRequest();
        if (request == null) {
            return "unknown";
        }
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            String[] parts = forwarded.split(",");
            return parts[0].trim();
        }
        return request.getRemoteAddr();
    }

    private HttpServletRequest currentRequest() {
        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        if (attributes instanceof ServletRequestAttributes servletAttributes) {
            return servletAttributes.getRequest();
        }
        return null;
    }
}
