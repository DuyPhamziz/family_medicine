package com.familymed.admin.user;

import com.familymed.admin.user.dto.AdminUserCreateRequest;
import com.familymed.admin.user.dto.AdminUserResponse;
import com.familymed.admin.user.dto.AdminUserUpdateRequest;
import com.familymed.user.entity.Role;
import com.familymed.user.repository.RoleRepository;
import com.familymed.user.entity.User;
import com.familymed.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(AdminUserResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public AdminUserResponse createUser(AdminUserCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        Role role = roleRepository.findByRoleCode(request.getRoleCode())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        User user = new User();
        user.setUserId(UUID.randomUUID());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setActive(request.getActive() != null ? request.getActive() : Boolean.TRUE);
        user.setCreatedAt(LocalDateTime.now());

        return AdminUserResponse.fromEntity(userRepository.save(user));
    }

    @Override
    @Transactional
    public AdminUserResponse updateUser(UUID userId, AdminUserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Role role = roleRepository.findByRoleCode(request.getRoleCode())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        user.setFullName(request.getFullName());
        user.setRole(role);
        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }

        return AdminUserResponse.fromEntity(userRepository.save(user));
    }
}
