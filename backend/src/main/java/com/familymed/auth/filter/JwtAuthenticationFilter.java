package com.familymed.auth.filter;

import com.familymed.auth.util.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtTokenProvider jwtTokenProvider;
    
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, 
                                    @NonNull HttpServletResponse response, 
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.debug("No Authorization header or invalid format for: " + request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }
        
        String token = authHeader.substring(7);
        logger.debug("Processing JWT token for: " + request.getRequestURI());
        
        try {
            // Validate token trước khi extract
            if (!jwtTokenProvider.validateToken(token)) {
                logger.warn("Invalid or expired JWT token for: " + request.getRequestURI());
                filterChain.doFilter(request, response);
                return;
            }
            
            String username = jwtTokenProvider.extractUsername(token);
            String role = jwtTokenProvider.extractRole(token);
            String tokenType = jwtTokenProvider.extractTokenType(token);
            
            logger.debug("Token details - Username: " + username + ", Role: " + role + ", Type: " + tokenType);
            
            if (tokenType == null || !"access".equals(tokenType)) {
                logger.warn("Invalid token type: " + tokenType);
                filterChain.doFilter(request, response);
                return;
            }
            
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Fix: Kiểm tra role đã có prefix ROLE_ chưa để tránh duplicate
                String authority;
                if (role != null && !role.isEmpty()) {
                    // Nếu role đã có ROLE_ prefix thì giữ nguyên, không thì thêm vào
                    authority = role.startsWith("ROLE_") ? role : "ROLE_" + role;
                } else {
                    // Default role nếu không có trong token
                    authority = "ROLE_USER";
                    logger.warn("No role found in token for user: " + username + ", using default: ROLE_USER");
                }
                
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        username,
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority(authority))
                );
                
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                logger.info("✓ Authentication set for user: " + username + " with authority: " + authority);
            }
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            logger.warn("JWT token expired: " + e.getMessage());
            // Token hết hạn, không set authentication
        } catch (io.jsonwebtoken.security.SignatureException | io.jsonwebtoken.MalformedJwtException e) {
            logger.error("Invalid JWT token: " + e.getMessage());
            // Token không hợp lệ, không set authentication
        } catch (Exception e) {
            logger.error("Cannot set user authentication: " + e.getMessage(), e);
            // Không throw exception để request vẫn có thể tiếp tục (sẽ bị reject bởi Spring Security nếu cần auth)
        }
        
        filterChain.doFilter(request, response);
    }
}
