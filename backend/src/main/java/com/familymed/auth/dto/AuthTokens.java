package com.familymed.auth.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthTokens {
    private String accessToken;
    private String refreshToken;
    private LoginResponse response;
}
