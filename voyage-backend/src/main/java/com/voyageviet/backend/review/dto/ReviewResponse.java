package com.voyageviet.backend.review.dto;

import com.voyageviet.backend.review.entity.ReviewStatus;

import java.time.LocalDateTime;

public record ReviewResponse(
        Long id,

        Long userId,
        String userFullName,
        String userAvatarUrl,

        Long tourId,
        String tourTitle,
        String tourSlug,

        Integer rating,
        String comment,
        ReviewStatus status,

        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}