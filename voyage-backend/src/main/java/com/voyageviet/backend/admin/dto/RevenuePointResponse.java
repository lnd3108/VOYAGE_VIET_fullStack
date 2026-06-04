package com.voyageviet.backend.admin.dto;

import java.math.BigDecimal;

public record RevenuePointResponse(
        String label,
        BigDecimal revenue,
        long paidBookings,
        BigDecimal refundAmount,
        BigDecimal netRevenue
) {
}
