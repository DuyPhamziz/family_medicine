package com.familymed.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class RateLimitingFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;
    private final LoginAttemptService loginAttemptService;

    @Value("${security.rate-limit.login-per-minute:5}")
    private int loginLimit;

    @Value("${security.rate-limit.public-per-minute:60}")
    private int publicLimit;

    @Value("${security.rate-limit.auth-per-minute:100}")
    private int authLimit;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        String ip = resolveIp(request);

        if (path.startsWith("/api/auth/login")) {
            String identifier = request.getParameter("emailOrCode");
            if (loginAttemptService.isBlocked(identifier)) {
                respondTooManyRequests(response, "Login temporarily blocked");
                return;
            }
            if (!rateLimitService.allowRequest("login:" + ip, loginLimit)) {
                respondTooManyRequests(response, "Too many login attempts");
                return;
            }
        } else if (isPublicPath(path)) {
            if (!rateLimitService.allowRequest("public:" + ip, publicLimit)) {
                respondTooManyRequests(response, "Too many requests");
                return;
            }
        } else {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String key = (auth != null && auth.isAuthenticated()) ? auth.getName() : ip;
            if (!rateLimitService.allowRequest("auth:" + key, authLimit)) {
                respondTooManyRequests(response, "Too many requests");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isPublicPath(String path) {
        return path.startsWith("/api/auth/")
                || path.startsWith("/api-docs")
                || path.startsWith("/swagger-ui");
    }

    private String resolveIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            String[] parts = forwarded.split(",");
            return parts[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void respondTooManyRequests(HttpServletResponse response, String message) throws IOException {
        response.setStatus(429);
        response.setContentType("application/json");
        response.getWriter().write("{\"message\":\"" + message + "\",\"error\":\"Too Many Requests\"}");
    }
}
