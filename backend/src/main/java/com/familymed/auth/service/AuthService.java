package com.familymed.auth.service;

import com.familymed.auth.dto.AuthTokens;
import com.familymed.auth.dto.LoginRequest;
import com.familymed.auth.dto.LoginResponse;
import com.familymed.auth.refresh.RefreshTokenService;
import com.familymed.auth.util.JwtTokenProvider;
import com.familymed.security.LoginAttemptService;
import com.familymed.user.entity.User;
import com.familymed.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;
    private final LoginAttemptService loginAttemptService;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    
    public void changePassword(String emailOrUsername, String currentPassword, String newPassword) {
        User user = userRepository.findByEmailOrUsername(emailOrUsername, emailOrUsername)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public AuthTokens login(LoginRequest request) {
        User user = null;
        try {
            // Tìm user theo email hoặc username
            user = userRepository.findByEmailOrUsername(
                request.getEmailOrCode(),
                request.getEmailOrCode()
            ).orElseThrow(() -> new RuntimeException("Email hoặc mật khẩu không đúng"));

            // Kiểm tra user có active không
            if (!Boolean.TRUE.equals(user.getActive())) {
            loginAttemptService.recordFailure(request.getEmailOrCode(), user.getUserId());
            throw new RuntimeException("Tài khoản đã bị vô hiệu hóa");
            }

            // Xác thực với Spring Security - luôn dùng email làm username
            // Spring Security sẽ gọi loadUserByUsername() với email này
            try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    user.getEmail(),
                    request.getPassword()
                )
            );
            } catch (org.springframework.security.core.AuthenticationException e) {
            loginAttemptService.recordFailure(request.getEmailOrCode(), user.getUserId());
            throw new RuntimeException("Email hoặc mật khẩu không đúng");
            }

            String roleCode = user.getRole() != null ? user.getRole().getRoleCode() : "USER";

            // Tạo JWT token sau khi authenticate thành công
            String token = jwtTokenProvider.generateToken(
                user.getEmail(),
                roleCode,
                user.getUserId().toString()
            );

            String refreshToken = refreshTokenService.issueRefreshToken(user);

            // Tạo response
            LoginResponse response = LoginResponse.builder()
                .token(token)
                .refreshToken(null)
                .user(LoginResponse.UserDTO.fromUser(user))
                .build();
            loginAttemptService.recordSuccess(request.getEmailOrCode(), user.getUserId());
            return AuthTokens.builder()
                .accessToken(token)
                .refreshToken(refreshToken)
                .response(response)
                .build();
        } catch (DataAccessException e) {
            throw new RuntimeException("Hệ thống đang bận, vui lòng thử lại sau");
        } catch (RuntimeException ex) {
            if (user == null) {
                loginAttemptService.recordFailure(request.getEmailOrCode(), null);
            }
            throw ex;
        }
    }
}

