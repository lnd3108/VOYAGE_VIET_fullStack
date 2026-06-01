package com.voyageviet.backend.common.controller;

import com.voyageviet.backend.common.exception.BusinessException;
import com.voyageviet.backend.common.exception.ErrorCode;
import com.voyageviet.backend.common.response.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class PublicTestController {

    @GetMapping("/api/public/ping")
    public ApiResponse<Map<String, Object>> ping() {
        return ApiResponse.success("VoyageViet backend is running", Map.of(
                "app", "voyage-backend",
                "status", "UP"
        ));
    }

    @GetMapping("/api/public/test-error")
    public ApiResponse<Void> testError() {
        throw new BusinessException(ErrorCode.INVALID_REQUEST, "This is a test business error");
    }
}