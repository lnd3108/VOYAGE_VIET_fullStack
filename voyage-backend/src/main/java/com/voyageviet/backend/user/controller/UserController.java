package com.voyageviet.backend.user.controller;

import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.user.dto.UserResponse;
import com.voyageviet.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ApiResponse<UserResponse> getCurrentUser(Authentication authentication) {
        return ApiResponse.success("Get current user successfully", userService.getCurrentUser(authentication));
    }
}