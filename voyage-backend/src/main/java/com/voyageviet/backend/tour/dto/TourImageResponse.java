package com.voyageviet.backend.tour.dto;

import java.time.LocalDateTime;

public record TourImageResponse(
        Long id,
        Long tourId,
        String url,
        String publicId,
        String sourceType,
        Long mediaId,
        String altText,
        Integer sortOrder,
        Boolean thumbnail,
        Integer width,
        Integer height,
        Long fileSizeBytes,
        LocalDateTime createdAt
) {
}
