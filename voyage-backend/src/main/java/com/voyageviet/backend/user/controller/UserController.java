package com.voyageviet.backend.user.controller;

import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.user.dto.AvatarUploadResponse;
import com.voyageviet.backend.user.dto.UserMeResponse;
import com.voyageviet.backend.user.dto.UserProfileUpdateRequest;
import com.voyageviet.backend.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ApiResponse<UserMeResponse> getCurrentUser(Authentication authentication) {
        return ApiResponse.success("Get current user successfully", userService.getCurrentUser(authentication));
    }

    @PutMapping("/me")
    public ApiResponse<UserMeResponse> updateCurrentUser(
            Authentication authentication,
            @Valid @RequestBody UserProfileUpdateRequest request
    ) {
        return ApiResponse.success("Update current user successfully", userService.updateCurrentUser(authentication, request));
    }

    @PostMapping("/me/avatar")
    public ApiResponse<AvatarUploadResponse> uploadAvatar(
            Authentication authentication,
            @RequestParam("file") MultipartFile file
    ) {
        return ApiResponse.success("Upload avatar successfully", userService.uploadAvatar(authentication, file));
    }
}
