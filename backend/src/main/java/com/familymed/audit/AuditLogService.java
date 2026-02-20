package com.familymed.audit;

import com.familymed.audit.entity.AuditActionType;

import java.util.UUID;

public interface AuditLogService {
    void logAction(AuditActionType actionType, String entityType, String entityId, UUID userId);

    void logLoginAttempt(String identifier, boolean success, UUID userId);
}
