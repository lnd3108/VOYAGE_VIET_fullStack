package com.voyageviet.backend.admin.controller;

import com.voyageviet.backend.admin.dto.*;
import com.voyageviet.backend.admin.service.AdminAnalyticsService;
import com.voyageviet.backend.common.exception.BusinessException;
import com.voyageviet.backend.common.exception.ErrorCode;
import com.voyageviet.backend.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
@Tag(name = "Admin Analytics", description = "Advanced admin analytics APIs")
public class AdminAnalyticsController {

    private final AdminAnalyticsService adminAnalyticsService;

    @GetMapping("/revenue")
    @Operation(summary = "Get revenue analytics by date range")
    public ApiResponse<RevenueAnalyticsResponse> getRevenueAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(defaultValue = "DAY") String groupBy
    ) {
        try {
            return ApiResponse.success(
                    "Get revenue analytics successfully",
                    adminAnalyticsService.getRevenueAnalytics(dateFrom, dateTo, groupBy)
            );
        } catch (BusinessException ex) {
            throw ex;
        } catch (RuntimeException ex) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Không thể lấy thống kê doanh thu.");
        }
    }

    @GetMapping("/bookings")
    @Operation(summary = "Get booking analytics by date range")
    public ApiResponse<BookingAnalyticsResponse> getBookingAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo
    ) {
        try {
            return ApiResponse.success(
                    "Get booking analytics successfully",
                    adminAnalyticsService.getBookingAnalytics(dateFrom, dateTo)
            );
        } catch (BusinessException ex) {
            throw ex;
        } catch (RuntimeException ex) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Không thể lấy thống kê booking.");
        }
    }

    @GetMapping("/top-tours")
    @Operation(summary = "Get top tour analytics by revenue, booking count or rating")
    public ApiResponse<List<TopTourAnalyticsResponse>> getTopTours(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(defaultValue = "REVENUE") String metric,
            @RequestParam(defaultValue = "10") Integer limit
    ) {
        try {
            return ApiResponse.success(
                    "Get top tour analytics successfully",
                    adminAnalyticsService.getTopTours(dateFrom, dateTo, metric, limit)
            );
        } catch (BusinessException ex) {
            throw ex;
        } catch (RuntimeException ex) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Không thể lấy thống kê tour.");
        }
    }

    @GetMapping("/payments")
    @Operation(summary = "Get payment analytics by date range")
    public ApiResponse<PaymentAnalyticsResponse> getPaymentAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo
    ) {
        try {
            return ApiResponse.success(
                    "Get payment analytics successfully",
                    adminAnalyticsService.getPaymentAnalytics(dateFrom, dateTo)
            );
        } catch (BusinessException ex) {
            throw ex;
        } catch (RuntimeException ex) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Không thể lấy thống kê payment.");
        }
    }

    @GetMapping("/promotions")
    @Operation(summary = "Get promotion usage analytics by date range")
    public ApiResponse<PromotionAnalyticsResponse> getPromotionAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(defaultValue = "10") Integer limit
    ) {
        try {
            return ApiResponse.success(
                    "Get promotion analytics successfully",
                    adminAnalyticsService.getPromotionAnalytics(dateFrom, dateTo, limit)
            );
        } catch (BusinessException ex) {
            throw ex;
        } catch (RuntimeException ex) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Không thể lấy thống kê promotion.");
        }
    }
}
