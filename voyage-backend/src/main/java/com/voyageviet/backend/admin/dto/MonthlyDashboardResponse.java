package com.voyageviet.backend.admin.dto;

import java.math.BigDecimal;

public record MonthlyDashboardResponse(
        String period,
        int month,
        long totalBookings,
        BigDecimal confirmedRevenue,
        BigDecimal completedRevenue
) {
}