package com.familymed.auth.controller;

import com.familymed.auth.dto.LoginRequest;
import com.familymed.auth.dto.LoginResponse;
import com.familymed.auth.dto.UserDTO;
import com.familymed.auth.service.AuthService;
import com.familymed.user.User;
import com.familymed.user.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    
    private final AuthService authService;
    private final UserRepository userRepository;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", e.getMessage(), "error", "Unauthorized"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Có lỗi xảy ra khi đăng nhập", "error", "Internal Server Error"));
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // Với JWT stateless, logout chủ yếu là xóa token ở client
        // Có thể implement token blacklist nếu cần
        return ResponseEntity.ok(Map.of("message", "Đăng xuất thành công"));
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
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        // TODO: Implement refresh token logic
        return ResponseEntity.ok(Map.of("message", "Refresh token endpoint - to be implemented"));
    }
}
