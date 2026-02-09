package com.familymed.user.service;

import com.familymed.user.User;
import com.familymed.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public User createUser(User user) {
        try {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            return userRepository.save(user);
        } catch (DataAccessException e) {
            throw new RuntimeException("Không thể tạo tài khoản lúc này, vui lòng thử lại sau");
        }
    }
    
    public Optional<User> findById(UUID id) {
        return userRepository.findById(id);
    }
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public List<User> findAll() {
        return userRepository.findAll();
    }
    
    public User updateUser(User user) {
        try {
            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
            }
            return userRepository.save(user);
        } catch (DataAccessException e) {
            throw new RuntimeException("Không thể cập nhật tài khoản lúc này, vui lòng thử lại sau");
        }
    }
    
    public void deleteUser(UUID id) {
        try {
            userRepository.deleteById(id);
        } catch (DataAccessException e) {
            throw new RuntimeException("Không thể xóa tài khoản lúc này, vui lòng thử lại sau");
        }
    }
}

