package com.voyageviet.backend.tour.dto;

import com.voyageviet.backend.tour.entity.TourStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record TourDetailResponse(
        Long id,
        String title,
        String slug,
        String shortDescription,
        String description,
        String thumbnailUrl,
        BigDecimal originalPrice,
        BigDecimal salePrice,
        BigDecimal minPrice,
        Integer durationDays,
        Integer durationNights,
        String departureLocation,
        Integer maxParticipants,
        Integer availableSeats,
        Boolean featured,
        Boolean isDomestic,
        Double avgRating,
        Integer totalReviews,
        List<String> highlightTags,
        TourStatus status,

        Double averageRating,
        Long reviewCount,

        Long categoryId,
        String categoryName,
        String categorySlug,

        Long destinationId,
        String destinationName,
        String destinationSlug,
        String destinationRegion,
        String destinationCountry,

        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
