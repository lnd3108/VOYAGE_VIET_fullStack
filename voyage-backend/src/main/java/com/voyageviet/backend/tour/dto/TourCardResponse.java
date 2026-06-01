package com.voyageviet.backend.tour.dto;

import com.voyageviet.backend.tour.entity.TourStatus;

import java.math.BigDecimal;

public record TourCardResponse(
        Long id,
        String title,
        String slug,
        String shortDescription,
        String thumbnailUrl,
        BigDecimal originalPrice,
        BigDecimal salePrice,
        Integer durationDays,
        Integer durationNights,
        String departureLocation,
        Integer availableSeats,
        Boolean featured,
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