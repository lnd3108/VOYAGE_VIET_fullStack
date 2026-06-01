package com.voyageviet.backend.admin.dto;

import java.math.BigDecimal;
import java.util.List;

public record AdminDashboardSummaryResponse(
        long totalUsers,
        long activeUsers,
        long bannedUsers,

        long totalTours,
        long publishedTours,
        long draftTours,
        long inactiveTours,
        long soldOutTours,

        long totalCategories,
        long activeCategories,

        long totalDestinations,
        long activeDestinations,

        long totalBookings,
        long pendingBookings,
        long confirmedBookings,
        long cancelledBookings,
        long completedBookings,

        BigDecimal confirmedRevenue,
        BigDecimal completedRevenue,

        List<BookingStatusSummaryResponse> bookingStatusSummary
) {
}