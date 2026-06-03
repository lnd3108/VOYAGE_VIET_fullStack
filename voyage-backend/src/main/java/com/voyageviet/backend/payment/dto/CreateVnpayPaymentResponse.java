package com.voyageviet.backend.payment.dto;

import java.math.BigDecimal;

public record CreateVnpayPaymentResponse(
        String paymentUrl,
        String orderId,
        BigDecimal amount,
        Long paymentId
) {
}
