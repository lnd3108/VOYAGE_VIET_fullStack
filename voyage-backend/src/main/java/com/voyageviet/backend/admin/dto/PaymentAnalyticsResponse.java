package com.voyageviet.backend.admin.dto;

import java.math.BigDecimal;
import java.util.List;

public record PaymentAnalyticsResponse(
        long totalAttempts,
        long successCount,
        long pendingCount,
        long failedCount,
        long refundedCount,
        BigDecimal successAmount,
        BigDecimal refundedAmount,
        List<PaymentMethodStatsResponse> byMethod
) {
}
