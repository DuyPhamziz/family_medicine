package com.familymed.auth.controller;

import com.familymed.auth.dto.AuthTokens;
import com.familymed.auth.dto.LoginRequest;
import com.familymed.auth.dto.LoginResponse;
import com.familymed.auth.dto.UserDTO;
import com.familymed.auth.refresh.RefreshTokenService;
import com.familymed.auth.util.JwtTokenProvider;
import com.familymed.security.LoginAttemptService;
import com.familymed.auth.service.AuthService;
import com.familymed.user.entity.User;
import com.familymed.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseCookie;
import com.familymed.auth.dto.ChangePasswordRequest;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    
    private final AuthService authService;
    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    private final JwtTokenProvider jwtTokenProvider;
    private final LoginAttemptService loginAttemptService;

    @Value("${security.refresh-cookie.secure:false}")
    private boolean refreshCookieSecure;

    @Value("${security.refresh-cookie.same-site:Strict}")
    private String refreshCookieSameSite;

    @Value("${security.refresh-cookie.path:/api/auth/refresh}")
    private String refreshCookiePath;

    @Value("${security.refresh-cookie.name:refresh_token}")
    private String refreshCookieName;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            if (loginAttemptService.isBlocked(request.getEmailOrCode())) {
                return ResponseEntity.status(429)
                        .body(Map.of("message", "Login temporarily blocked", "error", "Too Many Requests"));
            }

            AuthTokens tokens = authService.login(request);

            ResponseCookie cookie = ResponseCookie.from(refreshCookieName, tokens.getRefreshToken())
                    .httpOnly(true)
                    .secure(refreshCookieSecure)
                    .path(refreshCookiePath)
                    .sameSite(refreshCookieSameSite)
                    .maxAge(jwtTokenProvider.getRefreshExpirationSeconds())
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(tokens.getResponse());
        } catch (RuntimeException e) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", e.getMessage(), "error", "Unauthorized"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Có lỗi xảy ra khi đăng nhập", "error", "Internal Server Error"));
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        // Với JWT stateless, logout chủ yếu là xóa token ở client
        // Có thể implement token blacklist nếu cần
        String refreshToken = extractRefreshToken(request);
        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshTokenService.revokeToken(refreshToken);
        }

        ResponseCookie cookie = ResponseCookie.from(refreshCookieName, "")
                .httpOnly(true)
                .secure(refreshCookieSecure)
                .path(refreshCookiePath)
                .sameSite(refreshCookieSameSite)
                .maxAge(0)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of("message", "Đăng xuất thành công"));
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            return ResponseEntity.ok(UserDTO.fromUser(user));
        } catch (Exception e) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Unauthorized", "error", "Unauthorized"));
        }
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(HttpServletRequest request) {
        String refreshToken = extractRefreshToken(request);
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(401)
                .body(Map.of("message", "Missing refresh token", "error", "Unauthorized"));
        }

        String newRefreshToken = refreshTokenService.rotateRefreshToken(refreshToken);
        String username = jwtTokenProvider.extractUsername(newRefreshToken);
        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        String roleCode = user.getRole() != null ? user.getRole().getRoleCode() : "USER";
        String accessToken = jwtTokenProvider.generateToken(
            user.getEmail(),
            roleCode,
            user.getUserId().toString()
        );

        ResponseCookie cookie = ResponseCookie.from(refreshCookieName, newRefreshToken)
            .httpOnly(true)
            .secure(refreshCookieSecure)
            .path(refreshCookiePath)
            .sameSite(refreshCookieSameSite)
            .maxAge(jwtTokenProvider.getRefreshExpirationSeconds())
            .build();

        LoginResponse response = LoginResponse.builder()
            .token(accessToken)
            .refreshToken(null)
            .user(LoginResponse.UserDTO.fromUser(user))
            .build();

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .body(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized", "error", "Unauthorized"));
        }
        try {
            authService.changePassword(authentication.getName(), request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage(), "error", "Bad Request"));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        // Stub for future email service integration
        return ResponseEntity.ok(Map.of("message", "Nếu email tồn tại trong hệ thống, bạn sẽ sớm nhận được hướng dẫn đặt lại mật khẩu."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String token, @RequestParam String newPassword) {
        // Stub for future email service integration
        return ResponseEntity.status(501).body(Map.of("message", "Chức năng đặt lại mật khẩu đang được phát triển.", "error", "Not Implemented"));
    }

    private String extractRefreshToken(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }
        for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
            if (refreshCookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
