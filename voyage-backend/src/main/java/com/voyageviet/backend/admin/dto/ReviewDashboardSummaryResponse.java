package com.voyageviet.backend.admin.dto;

import java.util.List;

public record ReviewDashboardSummaryResponse(
        long totalReviews,
        long activeReviews,
        long hiddenReviews,
        Double averageRating,
        List<TopRatedTourResponse> topRatedTours
) {
}