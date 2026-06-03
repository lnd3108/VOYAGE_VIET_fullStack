package com.voyageviet.backend.promotion.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ValidatePromoRequest(
        @NotBlank(message = "Promotion code is required")
        String code,

        @NotNull(message = "Booking total is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Booking total must be greater than 0")
        BigDecimal bookingTotal,

        @NotNull(message = "Tour ID is required")
        Long tourId
) {
}
