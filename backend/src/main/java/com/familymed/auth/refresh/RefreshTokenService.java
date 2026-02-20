package com.familymed.auth.refresh;

import com.familymed.user.entity.User;

public interface RefreshTokenService {
    String issueRefreshToken(User user);

    String rotateRefreshToken(String rawToken);

    void revokeToken(String rawToken);

    void revokeAllForUser(java.util.UUID userId);
}
