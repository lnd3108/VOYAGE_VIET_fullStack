package com.voyageviet.backend.admin.controller;

import com.voyageviet.backend.common.response.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class AdminTestController {

    @GetMapping("/api/admin/ping")
    public ApiResponse<Map<String, Object>> adminPing() {
        return ApiResponse.success("Admin API is running", Map.of(
                "module", "admin",
                "status", "UP"
        ));
    }
}