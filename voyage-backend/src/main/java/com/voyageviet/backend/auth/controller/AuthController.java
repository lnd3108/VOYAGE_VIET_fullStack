package com.voyageviet.backend.auth.controller;

import com.voyageviet.backend.auth.dto.LoginRequest;
import com.voyageviet.backend.auth.dto.LoginResponse;
import com.voyageviet.backend.auth.dto.RegisterRequest;
import com.voyageviet.backend.auth.service.AuthService;
import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.user.dto.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ApiResponse<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success("Register successfully", authService.register(request));
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success("Login successfully", authService.login(request));
    }
}