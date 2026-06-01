package com.voyageviet.backend.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReviewCreateRequest(

        @NotNull(message = "Tour ID is required")
        Long tourId,

        @NotNull(message = "Rating is required")
        @Min(value = 1, message = "Rating must be greater than or equal to 1")
        @Max(value = 5, message = "Rating must be less than or equal to 5")
        Integer rating,

        @Size(max = 1000, message = "Comment must not exceed 1000 characters")
        String comment
) {
}