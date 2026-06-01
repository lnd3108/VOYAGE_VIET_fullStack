package com.voyageviet.backend.audit.service;

import com.voyageviet.backend.audit.dto.AuditLogResponse;
import com.voyageviet.backend.audit.entity.AuditAction;
import com.voyageviet.backend.audit.entity.AuditLog;
import com.voyageviet.backend.audit.repository.AuditLogRepository;
import com.voyageviet.backend.common.exception.BusinessException;
import com.voyageviet.backend.common.exception.ErrorCode;
import com.voyageviet.backend.common.paging.PageResponse;
import com.voyageviet.backend.user.entity.User;
import com.voyageviet.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(
            Authentication authentication,
            AuditAction action,
            String targetType,
            Long targetId,
            String targetLabel,
            String oldValue,
            String newValue,
            String description
    ) {
        User actor = resolveActor(authentication);

        AuditLog auditLog = AuditLog.builder()
                .action(action)
                .actorId(actor == null ? null : actor.getId())
                .actorEmail(actor == null ? null : actor.getEmail())
                .targetType(targetType)
                .targetId(targetId)
                .targetLabel(targetLabel)
                .oldValue(oldValue)
                .newValue(newValue)
                .description(description)
                .build();

        auditLogRepository.save(auditLog);
    }

    public PageResponse<AuditLogResponse> getAuditLogs(
            String actorEmail,
            String targetType,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        Pageable pageable = buildPageable(page, size, sortBy, sortDir);

        Page<AuditLog> auditLogPage;

        if (actorEmail != null && !actorEmail.isBlank()) {
            auditLogPage = auditLogRepository.findByActorEmailContainingIgnoreCase(actorEmail.trim(), pageable);
        } else if (targetType != null && !targetType.isBlank()) {
            auditLogPage = auditLogRepository.findByTargetTypeIgnoreCase(targetType.trim(), pageable);
        } else {
            auditLogPage = auditLogRepository.findAll(pageable);
        }

        return PageResponse.from(auditLogPage, this::toResponse);
    }

    private User resolveActor(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return null;
        }

        return userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElse(null);
    }

    private Pageable buildPageable(int page, int size, String sortBy, String sortDir) {
        if (page < 0) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Page index must be greater than or equal to 0"
            );
        }

        if (size < 1 || size > 50) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Page size must be between 1 and 50"
            );
        }

        String safeSortBy = resolveSortBy(sortBy);

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.ASC
                : "desc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.DESC
                : null;

        if (direction == null) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Sort direction must be either asc or desc"
            );
        }

        return PageRequest.of(page, size, Sort.by(direction, safeSortBy));
    }

    private String resolveSortBy(String sortBy) {
        Set<String> allowedSortFields = Set.of(
                "createdAt",
                "id",
                "action",
                "actorEmail",
                "targetType",
                "targetId"
        );

        if (sortBy == null || sortBy.isBlank()) {
            return "createdAt";
        }

        if (!allowedSortFields.contains(sortBy)) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Invalid sort field. Allowed fields: " + String.join(", ", allowedSortFields)
            );
        }

        return sortBy;
    }

    private AuditLogResponse toResponse(AuditLog auditLog) {
        return new AuditLogResponse(
                auditLog.getId(),
                auditLog.getAction(),
                auditLog.getActorId(),
                auditLog.getActorEmail(),
                auditLog.getTargetType(),
                auditLog.getTargetId(),
                auditLog.getTargetLabel(),
                auditLog.getOldValue(),
                auditLog.getNewValue(),
                auditLog.getDescription(),
                auditLog.getCreatedAt()
        );
    }
}