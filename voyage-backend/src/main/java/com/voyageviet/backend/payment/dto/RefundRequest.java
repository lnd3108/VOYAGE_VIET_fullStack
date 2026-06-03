package com.voyageviet.backend.payment.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record RefundRequest(
        @NotNull(message = "Refund amount is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Refund amount must be greater than 0")
        BigDecimal refundAmount,

        @Size(max = 1000, message = "Refund reason must not exceed 1000 characters")
        String refundReason
) {
}
