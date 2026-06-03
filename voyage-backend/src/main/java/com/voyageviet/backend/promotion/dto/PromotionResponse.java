package com.voyageviet.backend.promotion.dto;

import com.voyageviet.backend.promotion.entity.PromotionDiscountType;
import com.voyageviet.backend.promotion.entity.PromotionStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PromotionResponse(
        Long id,
        String code,
        String name,
        String description,
        PromotionDiscountType discountType,
        BigDecimal discountValue,
        BigDecimal maxDiscount,
        BigDecimal minOrder,
        Integer maxUses,
        Integer usedCount,
        Integer maxUsesPerUser,
        LocalDateTime validFrom,
        LocalDateTime validUntil,
        PromotionStatus status,
        List<Long> applicableTourIds,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
