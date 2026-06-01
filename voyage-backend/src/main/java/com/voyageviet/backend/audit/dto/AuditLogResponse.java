package com.voyageviet.backend.audit.dto;

import com.voyageviet.backend.audit.entity.AuditAction;

import java.time.LocalDateTime;

public record AuditLogResponse(
        Long id,
        AuditAction action,
        Long actorId,
        String actorEmail,
        String targetType,
        Long targetId,
        String targetLabel,
        String oldValue,
        String newValue,
        String description,
        LocalDateTime createdAt
) {
}