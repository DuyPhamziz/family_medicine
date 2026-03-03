package com.familymed.form.controller;

import com.familymed.form.dto.publicapi.PublicFormDetailDTO;
import com.familymed.form.dto.publicapi.PublicFormSubmitRequest;
import com.familymed.form.dto.publicapi.PublicFormSummaryDTO;
import com.familymed.form.service.PublicFormAntiSpamService;
import com.familymed.form.service.PublicFormService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Public form endpoints - no authentication required
 */
@RestController
@RequestMapping("/api/public/forms")
@RequiredArgsConstructor
public class PublicFormController {
    
    private final PublicFormService publicFormService;
    private final PublicFormAntiSpamService antiSpamService;
    
    @GetMapping
    public ResponseEntity<List<PublicFormSummaryDTO>> getPublicForms() {
        return ResponseEntity.ok(publicFormService.getPublicForms());
    }

    @GetMapping("/{formToken}")
    public ResponseEntity<PublicFormDetailDTO> getPublicForm(
            @PathVariable UUID formToken,
            HttpServletRequest request) {
        PublicFormDetailDTO form = publicFormService.getPublicForm(formToken);
        
        // Create session token for anti-spam
        String clientIp = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        UUID sessionToken = antiSpamService.createSession(
            publicFormService.getFormIdByToken(formToken), 
            clientIp, 
            userAgent
        );
        
        // Add session token to response
        form.setSessionToken(sessionToken);
        form.setRemainingSubmissions(antiSpamService.getRemainingSubmissions(
            publicFormService.getFormIdByToken(formToken), 
            clientIp
        ));
        
        return ResponseEntity.ok(form);
    }

    @PostMapping("/{token}/submit")
    public ResponseEntity<Map<String, Object>> submitPublicForm(
            @PathVariable("token") UUID formToken,
            @RequestBody PublicFormSubmitRequest request,
            HttpServletRequest httpRequest) {
        
        String clientIp = getClientIp(httpRequest);
        return ResponseEntity.ok(publicFormService.submitPublicForm(formToken, request, clientIp));
    }
    
    /**
     * Get client IP address from request, handling proxies
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // Take first IP if comma-separated
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
