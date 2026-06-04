package com.voyageviet.backend.notification.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voyageviet.backend.common.exception.BusinessException;
import com.voyageviet.backend.common.exception.ErrorCode;
import com.voyageviet.backend.common.paging.PageResponse;
import com.voyageviet.backend.notification.dto.NotificationResponse;
import com.voyageviet.backend.notification.dto.UnreadCountResponse;
import com.voyageviet.backend.notification.entity.Notification;
import com.voyageviet.backend.notification.entity.NotificationType;
import com.voyageviet.backend.notification.repository.NotificationRepository;
import com.voyageviet.backend.user.entity.User;
import com.voyageviet.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final ObjectProvider<SimpMessagingTemplate> messagingTemplateProvider;

    public Long getCurrentUserId(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "Current user not found"))
                .getId();
    }

    public PageResponse<NotificationResponse> getMyNotifications(
            Long userId,
            String isRead,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        Pageable pageable = buildPageable(page, size, sortBy, sortDir);
        Boolean readFilter = parseReadFilter(isRead);

        Page<Notification> notificationPage = readFilter == null
                ? notificationRepository.findByUserId(userId, pageable)
                : notificationRepository.findByUserIdAndIsRead(userId, readFilter, pageable);

        return PageResponse.from(notificationPage, this::toResponse);
    }

    public UnreadCountResponse getUnreadCount(Long userId) {
        return new UnreadCountResponse(notificationRepository.countByUserIdAndIsReadFalse(userId));
    }

    @Transactional
    public NotificationResponse markAsRead(Long userId, Long notificationId) {
        Notification notification = getOwnedNotification(userId, notificationId);

        if (!Boolean.TRUE.equals(notification.getIsRead())) {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
            notification = notificationRepository.save(notification);
        }

        return toResponse(notification);
    }

    @Transactional
    public int markAllAsRead(Long userId) {
        return notificationRepository.markAllReadByUserId(userId, LocalDateTime.now());
    }

    @Transactional
    public void deleteMyNotification(Long userId, Long notificationId) {
        Notification notification = getOwnedNotification(userId, notificationId);
        notificationRepository.delete(notification);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public NotificationResponse createNotification(
            Long userId,
            NotificationType type,
            String title,
            String body,
            Map<String, Object> data
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "Current user not found"));

        return createNotification(user, type, title, body, data);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public NotificationResponse createNotification(
            User user,
            NotificationType type,
            String title,
            String body,
            Map<String, Object> data
    ) {
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(trimToLength(title, 200))
                .body(trimToLength(body, 500))
                .data(toJson(data))
                .isRead(false)
                .build();

        Notification savedNotification = notificationRepository.save(notification);
        NotificationResponse response = toResponse(savedNotification);
        pushToUser(user.getId(), response);
        return response;
    }

    public void pushToUser(Long userId, NotificationResponse payload) {
        SimpMessagingTemplate messagingTemplate = messagingTemplateProvider.getIfAvailable();
        if (messagingTemplate == null) {
            return;
        }

        try {
            // JWT HTTP principal currently uses email; /topic fallback is kept until WebSocket JWT auth is added.
            messagingTemplate.convertAndSend("/topic/users/" + userId + "/notifications", payload);
        } catch (RuntimeException ex) {
            log.warn("Không thể gửi thông báo realtime, đã lưu thông báo vào hệ thống.", ex);
        }
    }

    public String toJson(Map<String, Object> data) {
        if (data == null || data.isEmpty()) {
            return null;
        }

        try {
            return objectMapper.writeValueAsString(data);
        } catch (JsonProcessingException ex) {
            log.warn("Cannot serialize notification data", ex);
            return null;
        }
    }

    private Notification getOwnedNotification(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findWithUserById(notificationId)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.NOTIFICATION_NOT_FOUND,
                        "Thông báo không tồn tại."
                ));

        if (!notification.getUser().getId().equals(userId)) {
            throw new BusinessException(
                    ErrorCode.NOTIFICATION_FORBIDDEN,
                    "Bạn không có quyền xem thông báo này."
            );
        }

        return notification;
    }

    private Pageable buildPageable(int page, int size, String sortBy, String sortDir) {
        if (page < 0) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Page index must be greater than or equal to 0");
        }
        if (size < 1 || size > 50) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Page size must be between 1 and 50");
        }

        String safeSortBy = resolveSortBy(sortBy);
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.ASC
                : "desc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.DESC
                : null;

        if (direction == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Sort direction must be either asc or desc");
        }

        return PageRequest.of(page, size, Sort.by(direction, safeSortBy));
    }

    private String resolveSortBy(String sortBy) {
        Set<String> allowedSortFields = Set.of(
                "createdAt",
                "updatedAt",
                "id",
                "type",
                "isRead",
                "readAt"
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

    private Boolean parseReadFilter(String isRead) {
        if (isRead == null || isRead.isBlank() || "all".equalsIgnoreCase(isRead)) {
            return null;
        }
        if ("true".equalsIgnoreCase(isRead)) {
            return true;
        }
        if ("false".equalsIgnoreCase(isRead)) {
            return false;
        }
        throw new BusinessException(ErrorCode.INVALID_REQUEST, "isRead must be true, false or all");
    }

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getBody(),
                parseData(notification.getData()),
                Boolean.TRUE.equals(notification.getIsRead()),
                notification.getReadAt(),
                notification.getCreatedAt()
        );
    }

    private Object parseData(String data) {
        if (data == null || data.isBlank()) {
            return null;
        }

        try {
            return objectMapper.readValue(data, Object.class);
        } catch (Exception ex) {
            return data;
        }
    }

    private String trimToLength(String value, int maxLength) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.length() <= maxLength ? trimmed : trimmed.substring(0, maxLength);
    }
}
