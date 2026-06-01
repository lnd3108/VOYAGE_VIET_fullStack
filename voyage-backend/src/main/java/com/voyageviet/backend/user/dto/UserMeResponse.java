package com.voyageviet.backend.user.dto;

import com.voyageviet.backend.role.entity.RoleCode;
import com.voyageviet.backend.user.entity.UserStatus;

import java.time.LocalDateTime;

public record UserMeResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        String avatarUrl,
        RoleCode role,
        UserStatus status,
        Boolean emailVerified,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
