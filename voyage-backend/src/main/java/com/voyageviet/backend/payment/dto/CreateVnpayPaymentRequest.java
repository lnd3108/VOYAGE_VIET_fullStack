package com.voyageviet.backend.payment.dto;

import jakarta.validation.constraints.NotNull;

public record CreateVnpayPaymentRequest(
        @NotNull(message = "Booking ID is required")
        Long bookingId,

        String returnUrl
) {
}
