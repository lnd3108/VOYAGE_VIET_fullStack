package com.voyageviet.backend.tour.dto;

import java.math.BigDecimal;

public record TourSearchCriteria(
        String keyword,
        String categorySlug,
        String destinationSlug,
        String region,
        String departureLocation,

        BigDecimal minPrice,
        BigDecimal maxPrice,

        Integer minDurationDays,
        Integer maxDurationDays,

        Integer people,

        String sortBy,
        String sortDir
) {
}