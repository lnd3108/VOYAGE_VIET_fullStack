package com.voyageviet.backend.tour.dto;

import jakarta.validation.constraints.Size;

public record TourImageAltRequest(
        @Size(max = 150, message = "Alt text must not exceed 150 characters")
        String altText
) {
}
