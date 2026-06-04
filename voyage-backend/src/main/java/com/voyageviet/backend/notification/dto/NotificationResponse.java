package com.voyageviet.backend.notification.dto;

import com.voyageviet.backend.notification.entity.NotificationType;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        NotificationType type,
        String title,
        String body,
        Object data,
        Boolean read,
        LocalDateTime readAt,
        LocalDateTime createdAt
) {
}
