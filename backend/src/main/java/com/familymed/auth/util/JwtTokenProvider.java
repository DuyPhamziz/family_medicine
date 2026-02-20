package com.familymed.auth.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtTokenProvider {
    
    @Value("${jwt.secret:mySecretKeyForJWTTokenGenerationThatIsAtLeast256BitsLong}")
    private String secret;
    
    @Value("${jwt.expiration:86400000}") // 24 hours default
    private Long expiration;
    
    @Value("${jwt.refresh-expiration:604800000}") // 7 days default
    private Long refreshExpiration;

    @Value("${jwt.clock-skew-ms:120000}")
    private Long clockSkewMs;
    
    private SecretKey getSigningKey() {
        // Đảm bảo secret key đủ dài (tối thiểu 256 bits = 32 bytes)
        byte[] keyBytes = secret.getBytes();
        if (keyBytes.length < 32) {
            // Nếu secret quá ngắn, pad với zeros (không nên dùng trong production)
            byte[] paddedKey = new byte[32];
            System.arraycopy(keyBytes, 0, paddedKey, 0, Math.min(keyBytes.length, 32));
            return Keys.hmacShaKeyFor(paddedKey);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }
    
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }
    
    public String generateToken(String username, String role, String userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("userId", userId);
        claims.put("typ", "access");
        return createToken(claims, username);
    }
    
    public String generateRefreshToken(String username) {
        return Jwts.builder()
                .subject(username)
                .claim("typ", "refresh")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    public long getRefreshExpirationSeconds() {
        return refreshExpiration / 1000;
    }

    public String generateRefreshToken(com.familymed.user.entity.User user) {
        return generateRefreshToken(user.getEmail());
    }
    
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }
    
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    
    public String extractRole(String token) {
        try {
            Object roleObj = extractClaim(token, claims -> claims.get("role"));
            if (roleObj == null) {
                return null;
            }
            return roleObj.toString();
        } catch (Exception e) {
            return null;
        }
    }

    public String extractUserId(String token) {
        try {
            Object userIdObj = extractClaim(token, claims -> claims.get("userId"));
            return userIdObj != null ? userIdObj.toString() : null;
        } catch (Exception e) {
            return null;
        }
    }

    public String extractTokenType(String token) {
        try {
            Object typ = extractClaim(token, claims -> claims.get("typ"));
            return typ != null ? typ.toString() : null;
        } catch (Exception e) {
            return null;
        }
    }
    
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Claims parseRefreshClaims(String token) {
        Claims claims = extractAllClaims(token);
        Object typ = claims.get("typ");
        if (typ == null || !"refresh".equals(typ.toString())) {
            throw new RuntimeException("Invalid refresh token type");
        }
        return claims;
    }
    
    public Boolean isTokenExpired(String token) {
        try {
            Date expiration = extractExpiration(token);
            Date skewedNow = new Date(System.currentTimeMillis() - clockSkewMs);
            return expiration.before(skewedNow);
        } catch (Exception e) {
            return true; // Nếu không extract được expiration thì coi như expired
        }
    }
    
    public Boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            return (username != null && username.equals(userDetails.getUsername()) && !isTokenExpired(token));
        } catch (Exception e) {
            return false;
        }
    }
    
    public Boolean validateToken(String token) {
        try {
            return !isTokenExpired(token) && extractUsername(token) != null;
        } catch (Exception e) {
            return false;
        }
    }
}
