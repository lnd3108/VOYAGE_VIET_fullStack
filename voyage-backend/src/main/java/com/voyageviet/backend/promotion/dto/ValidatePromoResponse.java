package com.voyageviet.backend.promotion.dto;

import java.math.BigDecimal;

public record ValidatePromoResponse(
        boolean valid,
        String code,
        BigDecimal discountAmount,
        BigDecimal finalAmount,
        String message
) {
}
