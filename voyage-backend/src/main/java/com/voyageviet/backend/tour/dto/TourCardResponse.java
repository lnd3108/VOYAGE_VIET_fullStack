package com.voyageviet.backend.tour.dto;

import com.voyageviet.backend.tour.entity.TourStatus;

import java.math.BigDecimal;
import java.util.List;

public record TourCardResponse(
        Long id,
        String title,
        String slug,
        String shortDescription,
        String thumbnailUrl,
        BigDecimal originalPrice,
        BigDecimal salePrice,
        BigDecimal minPrice,
        Integer durationDays,
        Integer durationNights,
        String departureLocation,
        Integer availableSeats,
        Boolean featured,
        Boolean isDomestic,
        Double avgRating,
        Integer totalReviews,
        List<String> highlightTags,
        TourStatus status,
        String categoryName,
        String categorySlug,
        String destinationName,
        String destinationSlug,
        String destinationRegion,
        Double averageRating,
        Long reviewCount
) {
}
