package com.voyageviet.backend.user.dto;

import com.voyageviet.backend.role.entity.RoleCode;
import com.voyageviet.backend.user.entity.UserStatus;

import java.time.LocalDateTime;

public record AdminUserDetailResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        String avatarUrl,
        RoleCode role,
        UserStatus status,
        long bookingCount,
        long reviewCount,
        long wishlistCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
