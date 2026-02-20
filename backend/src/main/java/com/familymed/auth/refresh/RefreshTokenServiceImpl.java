package com.familymed.auth.refresh;

import com.familymed.auth.util.JwtTokenProvider;
import com.familymed.user.entity.User;
import com.familymed.user.repository.UserRepository;
import com.familymed.auth.entity.RefreshToken;
import com.familymed.auth.repository.RefreshTokenRepository;
// import com.lowagie.text.List;
import java.util.List;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${jwt.refresh-expiration:604800000}")
    private long refreshExpirationMs;

    @Override
    @Transactional
    public String issueRefreshToken(User user) {
        String rawToken = jwtTokenProvider.generateRefreshToken(user);
        saveToken(rawToken, user, null);
        return rawToken;
    }

    @Override
    @Transactional
    public String rotateRefreshToken(String rawToken) {
        Claims claims = jwtTokenProvider.parseRefreshClaims(rawToken);
        String username = claims.getSubject();
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String hash = hashToken(rawToken);
        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));

        if (stored.getRevokedAt() != null) {
            revokeAllForUser(user.getUserId());
            throw new RuntimeException("Refresh token has been revoked");
        }

        if (stored.getExpiresAt().isBefore(LocalDateTime.now())) {
            stored.setRevokedAt(LocalDateTime.now());
            refreshTokenRepository.save(stored);
            throw new RuntimeException("Refresh token expired");
        }

        String newToken = jwtTokenProvider.generateRefreshToken(user);
        RefreshToken replacement = saveToken(newToken, user, stored.getId());

        stored.setRevokedAt(LocalDateTime.now());
        stored.setReplacedBy(replacement.getId());
        refreshTokenRepository.save(stored);

        return newToken;
    }

    @Override
    @Transactional
    public void revokeToken(String rawToken) {
        String hash = hashToken(rawToken);
        refreshTokenRepository.findByTokenHash(hash).ifPresent(token -> {
            token.setRevokedAt(LocalDateTime.now());
            refreshTokenRepository.save(token);
        });
    }

    @Override
    @Transactional
    public void revokeAllForUser(UUID userId) {
        List<RefreshToken> tokens = refreshTokenRepository.findByUserUserId(userId);
        if (tokens.isEmpty()) {
            return;
        }
        for (RefreshToken token : tokens) {
            token.setRevokedAt(LocalDateTime.now());
        }
        refreshTokenRepository.saveAll(tokens);
    }

    private RefreshToken saveToken(String rawToken, User user, UUID replacedBy) {
        RefreshToken token = new RefreshToken();
        token.setId(UUID.randomUUID());
        token.setUser(user);
        token.setTokenHash(hashToken(rawToken));
        token.setCreatedAt(LocalDateTime.now());
        token.setExpiresAt(LocalDateTime.now().plusNanos(refreshExpirationMs * 1_000_000));
        token.setReplacedBy(replacedBy);
        refreshTokenRepository.save(token);
        return token;
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (Exception ex) {
            throw new RuntimeException("Failed to hash token", ex);
        }
    }
}
