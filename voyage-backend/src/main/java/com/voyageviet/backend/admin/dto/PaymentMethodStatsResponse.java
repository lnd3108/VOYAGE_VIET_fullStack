package com.voyageviet.backend.admin.dto;

import com.voyageviet.backend.payment.entity.PaymentMethod;

import java.math.BigDecimal;

public record PaymentMethodStatsResponse(
        PaymentMethod method,
        long attempts,
        long successCount,
        BigDecimal successAmount
) {
}
