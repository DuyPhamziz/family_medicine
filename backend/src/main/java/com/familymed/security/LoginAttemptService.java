package com.familymed.security;

import java.util.UUID;

public interface LoginAttemptService {
    void recordFailure(String identifier, UUID userId);

    void recordSuccess(String identifier, UUID userId);

    boolean isBlocked(String identifier);
}
