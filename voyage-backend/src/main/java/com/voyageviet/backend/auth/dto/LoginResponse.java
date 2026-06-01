package com.voyageviet.backend.auth.dto;

import com.voyageviet.backend.user.dto.UserResponse;

public record LoginResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn,
        UserResponse user
) {
}
