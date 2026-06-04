package com.voyageviet.backend.notification.controller;

import com.voyageviet.backend.common.paging.PageResponse;
import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.notification.dto.NotificationResponse;
import com.voyageviet.backend.notification.dto.UnreadCountResponse;
import com.voyageviet.backend.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "In-app notification APIs for authenticated users")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get my notifications")
    public ApiResponse<PageResponse<NotificationResponse>> getMyNotifications(
            Authentication authentication,
            @RequestParam(required = false) String isRead,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Long userId = notificationService.getCurrentUserId(authentication);
        return ApiResponse.success(
                "Lấy danh sách thông báo thành công",
                notificationService.getMyNotifications(userId, isRead, page, size, sortBy, sortDir)
        );
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count")
    public ApiResponse<UnreadCountResponse> getUnreadCount(Authentication authentication) {
        Long userId = notificationService.getCurrentUserId(authentication);
        return ApiResponse.success(
                "Lấy số thông báo chưa đọc thành công",
                notificationService.getUnreadCount(userId)
        );
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark one notification as read")
    public ApiResponse<NotificationResponse> markAsRead(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long userId = notificationService.getCurrentUserId(authentication);
        return ApiResponse.success(
                "Đánh dấu thông báo đã đọc thành công.",
                notificationService.markAsRead(userId, id)
        );
    }

    @PostMapping("/read-all")
    @Operation(summary = "Mark all my notifications as read")
    public ApiResponse<Integer> markAllAsRead(Authentication authentication) {
        Long userId = notificationService.getCurrentUserId(authentication);
        return ApiResponse.success(
                "Đánh dấu tất cả thông báo đã đọc thành công.",
                notificationService.markAllAsRead(userId)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete one notification")
    public ApiResponse<Void> deleteMyNotification(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long userId = notificationService.getCurrentUserId(authentication);
        notificationService.deleteMyNotification(userId, id);
        return ApiResponse.success("Xóa thông báo thành công.", null);
    }
}
