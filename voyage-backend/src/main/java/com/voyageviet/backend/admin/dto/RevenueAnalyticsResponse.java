package com.voyageviet.backend.admin.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record RevenueAnalyticsResponse(
        LocalDate dateFrom,
        LocalDate dateTo,
        String groupBy,
        BigDecimal totalRevenue,
        long totalPaidBookings,
        BigDecimal totalRefundedAmount,
        BigDecimal netRevenue,
        List<RevenuePointResponse> points
) {
}
