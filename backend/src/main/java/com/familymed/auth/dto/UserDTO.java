package com.familymed.auth.dto;

import com.familymed.user.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private UUID userId;
    private String email;
    private String username;
    private String fullName;
    private String role;
    
    public static UserDTO fromUser(User user) {
        String roleCode = user.getRole() != null ? user.getRole().getRoleCode() : null;
        return UserDTO.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .username(user.getUsername())
                .fullName(user.getFullName())
            .role(roleCode)
                .build();
    }
}

