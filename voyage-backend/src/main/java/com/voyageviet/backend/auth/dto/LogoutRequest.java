package com.voyageviet.backend.auth.dto;

public record LogoutRequest(
        String refreshToken
) {
}
