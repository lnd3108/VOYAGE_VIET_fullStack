package com.voyageviet.backend.admin.dto;

public record BookingAnalyticsResponse(
        long totalBookings,
        long pendingBookings,
        long confirmedBookings,
        long cancelledBookings,
        long completedBookings,
        long paidBookings,
        long unpaidBookings,
        long failedPaymentBookings,
        long refundedBookings,
        double conversionRate,
        double cancelRate
) {
}
