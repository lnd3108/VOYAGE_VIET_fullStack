package com.voyageviet.backend.tour.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record TourItinerarySaveRequest(
        @NotNull(message = "Itinerary items is required")
        List<@Valid TourItineraryItemRequest> items
) {
}
