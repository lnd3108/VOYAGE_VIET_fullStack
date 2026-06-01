package com.voyageviet.backend.admin.dto;

public record TopRatedTourResponse(
        Long tourId,
        String tourTitle,
        String tourSlug,
        Long reviewCount,
        Double averageRating
) {
}