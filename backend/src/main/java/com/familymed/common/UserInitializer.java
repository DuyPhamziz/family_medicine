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
@Order(1)
public class UserInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        try {
            System.out.println("🔄 Initializing roles...");

                // Create or get ADMIN role
                Role adminRole = roleRepository.findByRoleCode("ADMIN")
                        .orElseGet(() -> {
                            Role role = new Role();
                            role.setRoleId(UUID.randomUUID());
                            role.setRoleCode("ADMIN");
                            role.setRoleName("Administrator");
                            return roleRepository.save(role);
                        });

                // Create or get DOCTOR role
                Role doctorRole = roleRepository.findByRoleCode("DOCTOR")
                        .orElseGet(() -> {
                            Role role = new Role();
                            role.setRoleId(UUID.randomUUID());
                            role.setRoleCode("DOCTOR");
                            role.setRoleName("Doctor");
                            return roleRepository.save(role);
                        });

                // Create or get NURSE role
                Role nurseRole = roleRepository.findByRoleCode("NURSE")
                        .orElseGet(() -> {
                            Role role = new Role();
                            role.setRoleId(UUID.randomUUID());
                            role.setRoleCode("NURSE");
                            role.setRoleName("Nurse");
                            return roleRepository.save(role);
                        });

                System.out.println("✓ Initialized roles: ADMIN, DOCTOR, NURSE");

            // (Temporarily disabled) Fix plaintext passwords (rehash if not BCrypt)
            // int updatedCount = 0;
            // for (User user : userRepository.findAll()) {
            //     String raw = user.getPassword();
            //     if (raw != null && !isBcryptHash(raw)) {
            //         user.setPassword(passwordEncoder.encode(raw));
            //         userRepository.save(user);
            //         updatedCount++;
            //     }
            // }
            // if (updatedCount > 0) {
            //     System.out.println("✓ Re-hashed " + updatedCount + " user password(s)");
            // }

        } catch (Exception e) {
            System.err.println("✗ Error initializing users: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private boolean isBcryptHash(String value) {
        return value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$");
    }
}

