package com.familymed.audit;

import com.familymed.audit.entity.AuditLog;
import com.familymed.audit.entity.AuditActionType;
import com.familymed.audit.repository.AuditLogRepository;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private static final Logger logger = LoggerFactory.getLogger(AuditLogServiceImpl.class);

    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(AuditActionType actionType, String entityType, String entityId, UUID userId) {
        try {
            AuditLog log = new AuditLog();
            log.setId(UUID.randomUUID());
            log.setUserId(userId);
            log.setActionType(actionType.name());
            log.setEntityType(entityType);
            log.setEntityId(entityId);
            log.setTimestamp(LocalDateTime.now());
            log.setIpAddress(resolveIpAddress());
            auditLogRepository.save(log);
        } catch (Exception ex) {
            logger.warn("Failed to write audit log action={} entityType={} entityId={}",
                    actionType, entityType, entityId, ex);
        }
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logLoginAttempt(String identifier, boolean success, UUID userId) {
        AuditActionType actionType = success ? AuditActionType.LOGIN_SUCCESS : AuditActionType.LOGIN_FAILED;
        logAction(actionType, "AUTH", identifier, userId);
    }

    private String resolveIpAddress() {
        HttpServletRequest request = currentRequest();
        if (request == null) {
            return null;
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
