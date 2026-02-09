package com.familymed.auth.service;

import com.familymed.auth.dto.LoginRequest;
import com.familymed.auth.dto.LoginResponse;
import com.familymed.auth.util.JwtTokenProvider;
import com.familymed.user.User;
import com.familymed.user.UserRepository;
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
    
    public LoginResponse login(LoginRequest request) {
        try {
            // Tìm user theo email hoặc username
            User user = userRepository.findByEmailOrUsername(
                request.getEmailOrCode(),
                request.getEmailOrCode()
            ).orElseThrow(() -> new RuntimeException("Email hoặc mật khẩu không đúng"));

            // Kiểm tra user có active không
            if (!Boolean.TRUE.equals(user.getActive())) {
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
            throw new RuntimeException("Email hoặc mật khẩu không đúng");
            }

            String roleCode = user.getRole() != null ? user.getRole().getRoleCode() : "USER";

            // Tạo JWT token sau khi authenticate thành công
            String token = jwtTokenProvider.generateToken(
                user.getEmail(),
                roleCode
            );

            String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

            // Tạo response
            return LoginResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .user(LoginResponse.UserDTO.fromUser(user))
                .build();
        } catch (DataAccessException e) {
            throw new RuntimeException("Hệ thống đang bận, vui lòng thử lại sau");
        }
    }
}

