package com.voyageviet.backend.admin.dto;

import java.math.BigDecimal;
import java.util.List;

public record PromotionAnalyticsResponse(
        long totalUsage,
        BigDecimal totalDiscountAmount,
        List<PromotionUsageStatsResponse> topPromotions
) {
}
