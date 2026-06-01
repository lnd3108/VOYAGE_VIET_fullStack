package com.voyageviet.backend.wishlist.dto;

import com.voyageviet.backend.tour.entity.TourStatus;

import java.math.BigDecimal;

public record WishlistTourResponse(
        Long tourId,
        String title,
        String slug,
        String thumbnailUrl,
        String destinationName,
        String categoryName,
        BigDecimal originalPrice,
        BigDecimal salePrice,
        BigDecimal minPrice,
        Integer durationDays,
        Integer durationNights,
        Double ratingAvg,
        TourStatus status,
        boolean wishlisted
) {
}
