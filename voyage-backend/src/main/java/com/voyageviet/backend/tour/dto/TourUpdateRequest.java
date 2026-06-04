package com.voyageviet.backend.tour.dto;

import com.voyageviet.backend.tour.entity.TourStatus;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public record TourUpdateRequest(

        @NotBlank(message = "Tour title is required")
        @Size(max = 200, message = "Tour title must not exceed 200 characters")
        String title,

        @Size(max = 220, message = "Slug must not exceed 220 characters")
        String slug,

        @Size(max = 500, message = "Short description must not exceed 500 characters")
        String shortDescription,

        String description,

        @Size(max = 500, message = "Thumbnail URL must not exceed 500 characters")
        String thumbnailUrl,

        @NotNull(message = "Original price is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Original price must be greater than 0")
        BigDecimal originalPrice,

        @DecimalMin(value = "0.0", inclusive = false, message = "Sale price must be greater than 0")
        BigDecimal salePrice,

        @NotNull(message = "Duration days is required")
        @Min(value = 1, message = "Duration days must be greater than or equal to 1")
        Integer durationDays,

        @Min(value = 0, message = "Duration nights must be greater than or equal to 0")
        Integer durationNights,

        @Size(max = 150, message = "Departure location must not exceed 150 characters")
        String departureLocation,

        @Min(value = 0, message = "Max participants must be greater than or equal to 0")
        Integer maxParticipants,

        @Min(value = 0, message = "Available seats must be greater than or equal to 0")
        Integer availableSeats,

        Boolean featured,

        Boolean isDomestic,

        List<String> highlightTags,

        TourStatus status,

        @NotNull(message = "Category ID is required")
        Long categoryId,

        @NotNull(message = "Destination ID is required")
        Long destinationId
) {
}
