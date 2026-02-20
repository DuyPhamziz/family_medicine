package com.familymed.admin.user.dto;

import com.familymed.user.entity.User;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class AdminUserResponse {
    private UUID userId;
    private String username;
    private String email;
    private String fullName;
    private String role;
    private String status;
    private LocalDateTime createdAt;

    public static AdminUserResponse fromEntity(User user) {
        return AdminUserResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole() != null ? user.getRole().getRoleCode() : null)
                .status(Boolean.TRUE.equals(user.getActive()) ? "ACTIVE" : "INACTIVE")
                .createdAt(user.getCreatedAt())
                .build();
    }
}
