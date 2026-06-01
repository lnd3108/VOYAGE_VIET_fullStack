package com.voyageviet.backend.tour.dto;

import com.voyageviet.backend.tour.entity.TourScheduleStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TourScheduleUpdateRequest(
        @NotNull(message = "Departure date is required")
        LocalDate departureDate,

        @NotNull(message = "Return date is required")
        LocalDate returnDate,

        @NotNull(message = "Adult price is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Adult price must be greater than 0")
        BigDecimal priceAdult,

        @DecimalMin(value = "0.0", message = "Child price must be greater than or equal to 0")
        BigDecimal priceChild,

        @DecimalMin(value = "0.0", message = "Infant price must be greater than or equal to 0")
        BigDecimal priceInfant,

        @DecimalMin(value = "0.0", message = "Single supplement must be greater than or equal to 0")
        BigDecimal singleSupplement,

        @NotNull(message = "Max seats is required")
        @Min(value = 1, message = "Max seats must be greater than 0")
        Integer maxSeats,

        @Min(value = 0, message = "Booked seats must be greater than or equal to 0")
        Integer bookedSeats,

        TourScheduleStatus status,

        @Size(max = 4000, message = "Notes must not exceed 4000 characters")
        String notes
) {
}
