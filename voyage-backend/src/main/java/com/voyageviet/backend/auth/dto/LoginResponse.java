package com.voyageviet.backend.auth.dto;

import com.voyageviet.backend.user.dto.UserResponse;

public record LoginResponse(
        String accessToken,
        String tokenType,
        UserResponse user
) {
}