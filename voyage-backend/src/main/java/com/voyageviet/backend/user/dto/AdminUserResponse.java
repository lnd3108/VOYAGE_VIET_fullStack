package com.voyageviet.backend.user.dto;

import com.voyageviet.backend.role.entity.RoleCode;
import com.voyageviet.backend.user.entity.UserStatus;

import java.time.LocalDateTime;

public record AdminUserResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        String avatarUrl,
        UserStatus status,
        Boolean emailVerified,
        RoleCode role,
        LocalDateTime lastLoginAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}