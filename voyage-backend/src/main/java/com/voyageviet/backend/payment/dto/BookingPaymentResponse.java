package com.voyageviet.backend.payment.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BookingPaymentResponse(
        Long bookingId,
        String bookingCode,
        String paymentStatus,
        String method,
        BigDecimal amount,
        LocalDateTime paidAt,
        Long latestPaymentId
) {
}
