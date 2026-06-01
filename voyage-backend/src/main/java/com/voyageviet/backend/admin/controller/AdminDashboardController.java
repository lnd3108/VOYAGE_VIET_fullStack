package com.voyageviet.backend.admin.controller;

import com.voyageviet.backend.admin.dto.AdminDashboardSummaryResponse;
import com.voyageviet.backend.admin.dto.MonthlyDashboardResponse;
import com.voyageviet.backend.admin.dto.ReviewDashboardSummaryResponse;
import com.voyageviet.backend.admin.service.AdminDashboardService;
import com.voyageviet.backend.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/summary")
    public ApiResponse<AdminDashboardSummaryResponse> getSummary() {
        return ApiResponse.success(
                "Get admin dashboard summary successfully",
                adminDashboardService.getSummary()
        );
    }

    @GetMapping("/monthly")
    public ApiResponse<List<MonthlyDashboardResponse>> getMonthlyDashboard(
            @RequestParam(required = false) Integer year
    ) {
        return ApiResponse.success(
                "Get monthly dashboard successfully",
                adminDashboardService.getMonthlyDashboard(year)
        );
    }

    @GetMapping("/reviews")
    public ApiResponse<ReviewDashboardSummaryResponse> getReviewSummary(
            @RequestParam(required = false) Integer limit
    ) {
        return ApiResponse.success(
                "Get review dashboard summary successfully",
                adminDashboardService.getReviewSummary(limit)
        );
    }
}