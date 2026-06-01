package com.voyageviet.backend.tour.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record TourScheduleDuplicateRequest(
        @NotNull(message = "Departure date is required")
        LocalDate departureDate
) {
}
