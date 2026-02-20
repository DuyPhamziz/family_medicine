package com.familymed.security;

public interface RateLimitService {
    boolean allowRequest(String key, int limitPerMinute);
}
