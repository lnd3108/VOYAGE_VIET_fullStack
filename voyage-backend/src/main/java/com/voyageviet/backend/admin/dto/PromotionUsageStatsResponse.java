package com.voyageviet.backend.admin.dto;

import java.math.BigDecimal;

public record PromotionUsageStatsResponse(
        Long promotionId,
        String code,
        String name,
        long usedCount,
        BigDecimal discountAmount
) {
}
