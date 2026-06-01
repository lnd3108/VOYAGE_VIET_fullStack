package com.voyageviet.backend.user.controller;

import com.voyageviet.backend.common.paging.PageResponse;
import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.user.dto.AdminUserDetailResponse;
import com.voyageviet.backend.user.dto.AdminUserResponse;
import com.voyageviet.backend.user.dto.UserRoleUpdateRequest;
import com.voyageviet.backend.user.dto.UserStatusUpdateRequest;
import com.voyageviet.backend.user.entity.UserStatus;
import com.voyageviet.backend.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public ApiResponse<PageResponse<AdminUserResponse>> getUsers(
            Authentication authentication,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        return ApiResponse.success(
                "Get admin users successfully",
                userService.getUsersForAdmin(authentication, keyword, status, page, size, sortBy, sortDir)
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<AdminUserDetailResponse> getUserDetail(@PathVariable Long id) {
        return ApiResponse.success(
                "Get admin user detail successfully",
                userService.getUserDetailForAdmin(id)
        );
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<AdminUserResponse> updateUserStatus(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UserStatusUpdateRequest request
    ) {
        return ApiResponse.success(
                "Update user status successfully",
                userService.updateUserStatus(authentication, id, request)
        );
    }

    @PatchMapping("/{id}/role")
    public ApiResponse<AdminUserResponse> updateUserRole(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UserRoleUpdateRequest request
    ) {
        return ApiResponse.success(
                "Update user role successfully",
                userService.updateUserRole(authentication, id, request)
        );
    }
}
