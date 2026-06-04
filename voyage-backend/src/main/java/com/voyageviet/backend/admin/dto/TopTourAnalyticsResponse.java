package com.voyageviet.backend.admin.dto;

import java.math.BigDecimal;

public record TopTourAnalyticsResponse(
        Long tourId,
        String title,
        String slug,
        String thumbnailUrl,
        String destinationName,
        String categoryName,
        long bookingCount,
        long paidBookingCount,
        BigDecimal revenue,
        double averageRating,
        long reviewCount
) {
}
