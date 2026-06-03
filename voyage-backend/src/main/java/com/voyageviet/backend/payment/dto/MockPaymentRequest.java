package com.voyageviet.backend.payment.dto;

import jakarta.validation.constraints.NotNull;

public record MockPaymentRequest(
        @NotNull(message = "Booking ID is required")
        Long bookingId,

        @NotNull(message = "Success flag is required")
        Boolean success
) {
}
