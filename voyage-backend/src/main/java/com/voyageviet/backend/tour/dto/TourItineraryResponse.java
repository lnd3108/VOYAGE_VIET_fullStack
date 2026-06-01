package com.voyageviet.backend.tour.dto;

import java.time.LocalDateTime;
import java.util.List;

public record TourItineraryResponse(
        Long id,
        Long tourId,
        Integer dayNumber,
        String title,
        String description,
        String hotelName,
        List<String> meals,
        List<String> transportModes,
        List<String> placeNames,
        List<String> activities,
        Integer sortOrder,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
