package com.familymed.common;

import com.familymed.user.Role;
import com.familymed.user.RoleRepository;
import com.familymed.user.User;
import com.familymed.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Order(2)
public class DefaultUserSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        Role adminRole = roleRepository.findByRoleCode("ADMIN")
                .orElseThrow(() -> new RuntimeException("ADMIN role not found"));

        Role doctorRole = roleRepository.findByRoleCode("DOCTOR")
                .orElseThrow(() -> new RuntimeException("DOCTOR role not found"));

        createUserIfMissing(
                "admin@familymed.vn",
                "ADMIN001",
                "Administrator",
                "Admin@123456",
                adminRole
        );

        createUserIfMissing(
                "doctor@familymed.vn",
                "DOCTOR001",
                "Dr. Nguyễn Văn A",
                "Doctor@123456",
                doctorRole
        );
    }

    private void createUserIfMissing(String email,
                                     String username,
                                     String fullName,
                                     String rawPassword,
                                     Role role) {
        if (userRepository.existsByEmail(email)) {
            return;
        }

        User user = new User();
        user.setUserId(UUID.randomUUID());
        user.setEmail(email);
        user.setUsername(username);
        user.setFullName(fullName);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setActive(true);

        userRepository.save(user);
    }
}
