package com.voyageviet.backend.auth.controller;

import com.voyageviet.backend.auth.dto.*;
import com.voyageviet.backend.auth.service.AuthService;
import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.user.dto.UserResponse;
import jakarta.servlet.http.HttpServletRequest;
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
    public ApiResponse<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest servletRequest
    ) {
        return ApiResponse.success(
                "Login successfully",
                authService.login(request, clientIp(servletRequest), servletRequest.getHeader("User-Agent"))
        );
    }

    @PostMapping("/refresh")
    public ApiResponse<LoginResponse> refresh(
            @Valid @RequestBody RefreshTokenRequest request,
            HttpServletRequest servletRequest
    ) {
        return ApiResponse.success(
                "Refresh token successfully",
                authService.refresh(request.refreshToken(), clientIp(servletRequest), servletRequest.getHeader("User-Agent"))
        );
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestBody(required = false) LogoutRequest request) {
        authService.logout(request == null ? null : request.refreshToken());
        return ApiResponse.success("Logout successfully", null);
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.email());
        return ApiResponse.success("Nếu email tồn tại, hệ thống đã gửi hướng dẫn đặt lại mật khẩu.", null);
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ApiResponse.success("Đặt lại mật khẩu thành công, vui lòng đăng nhập lại.", null);
    }

    @PostMapping("/verify-email")
    public ApiResponse<UserResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        return ApiResponse.success("Verify email successfully", authService.verifyEmail(request.token()));
    }

    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
