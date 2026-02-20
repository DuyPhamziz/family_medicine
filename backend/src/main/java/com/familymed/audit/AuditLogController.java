package com.familymed.audit;

import com.familymed.audit.repository.AuditLogRepository;
import com.familymed.audit.entity.AuditLog;

import com.familymed.audit.dto.AuditLogResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLogResponse>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "200") int size) {
        List<AuditLogResponse> results = auditLogRepository
                .findAllByOrderByTimestampDesc(PageRequest.of(page, size))
                .stream()
                .map(AuditLogResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(results);
    }
}
