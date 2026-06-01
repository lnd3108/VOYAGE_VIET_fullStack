package com.voyageviet.backend.tour.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record TourItineraryItemRequest(
        Long id,

        @NotNull(message = "Day number is required")
        @Min(value = 1, message = "Day number must be greater than or equal to 1")
        Integer dayNumber,

        @NotBlank(message = "Itinerary title is required")
        @Size(max = 200, message = "Itinerary title must not exceed 200 characters")
        String title,

        String description,

        @Size(max = 200, message = "Hotel name must not exceed 200 characters")
        String hotelName,

        List<String> meals,
        List<String> transportModes,
        List<String> placeNames,
        List<String> activities,

        @Min(value = 0, message = "Sort order must be greater than or equal to 0")
        Integer sortOrder
) {
}
