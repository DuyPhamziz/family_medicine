package com.familymed.form.controller;

import com.familymed.form.application.PublicFormSubmitUseCase;
import com.familymed.form.dto.publicapi.PublicFormDetailDTO;
import com.familymed.form.dto.publicapi.PublicFormSubmitRequest;
import com.familymed.form.dto.publicapi.PublicFormSummaryDTO;
import com.familymed.form.service.PublicFormAntiSpamService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.InetAddress;
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
    
    private final PublicFormSubmitUseCase publicFormSubmitUseCase;
    private final PublicFormAntiSpamService antiSpamService;
    
    @GetMapping
    public ResponseEntity<List<PublicFormSummaryDTO>> getPublicForms() {
        return ResponseEntity.ok(publicFormSubmitUseCase.getPublicForms());
    }

    @GetMapping("/{formToken}")
    public ResponseEntity<PublicFormDetailDTO> getPublicForm(
            @PathVariable UUID formToken,
            HttpServletRequest request) {
        PublicFormDetailDTO form = publicFormSubmitUseCase.getPublicForm(formToken);
        
        // Create session token for anti-spam
        String clientIp = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        UUID sessionToken = antiSpamService.createSession(
            publicFormSubmitUseCase.getFormIdByToken(formToken), 
            clientIp, 
            userAgent
        );
        
        // Add session token to response
        form.setSessionToken(sessionToken);
        form.setRemainingSubmissions(antiSpamService.getRemainingSubmissions(
            publicFormSubmitUseCase.getFormIdByToken(formToken), 
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
        return ResponseEntity.ok(publicFormSubmitUseCase.submitPublicForm(formToken, request, clientIp));
    }
    
    /**
     * Get client IP address from request, handling proxies
     */
    private String getClientIp(HttpServletRequest request) {
        String remoteAddr = sanitizeIp(request.getRemoteAddr());
        String xForwardedFor = request.getHeader("X-Forwarded-For");

        // Only trust forwarding headers when request comes from a private/loopback proxy hop.
        if (isLikelyTrustedProxy(remoteAddr) && xForwardedFor != null && !xForwardedFor.isBlank()) {
            String forwardedIp = sanitizeIp(xForwardedFor.split(",")[0]);
            if (forwardedIp != null) {
                return forwardedIp;
            }
        }

        return remoteAddr != null ? remoteAddr : "0.0.0.0";
    }

    private boolean isLikelyTrustedProxy(String ip) {
        if (ip == null) {
            return false;
        }
        return ip.startsWith("10.")
                || ip.startsWith("192.168.")
                || ip.startsWith("127.")
                || ip.equals("::1")
                || ip.startsWith("172.16.")
                || ip.startsWith("172.17.")
                || ip.startsWith("172.18.")
                || ip.startsWith("172.19.")
                || ip.startsWith("172.2")
                || ip.startsWith("172.30.")
                || ip.startsWith("172.31.");
    }

    private String sanitizeIp(String rawIp) {
        if (rawIp == null) {
            return null;
        }
        String ip = rawIp.trim();
        if (ip.isEmpty() || "unknown".equalsIgnoreCase(ip) || ip.length() > 64) {
            return null;
        }
        try {
            return InetAddress.getByName(ip).getHostAddress();
        } catch (Exception ex) {
            return null;
        }
    }
}
