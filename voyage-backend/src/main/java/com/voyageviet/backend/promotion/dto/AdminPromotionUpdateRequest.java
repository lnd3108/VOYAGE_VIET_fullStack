package com.voyageviet.backend.promotion.dto;

import com.voyageviet.backend.promotion.entity.PromotionDiscountType;
import com.voyageviet.backend.promotion.entity.PromotionStatus;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record AdminPromotionUpdateRequest(
        @NotBlank(message = "Promotion name is required")
        @Size(max = 200, message = "Promotion name must not exceed 200 characters")
        String name,

        @Size(max = 500, message = "Description must not exceed 500 characters")
        String description,

        @NotNull(message = "Discount type is required")
        PromotionDiscountType discountType,

        @NotNull(message = "Discount value is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Discount value must be greater than 0")
        BigDecimal discountValue,

        @DecimalMin(value = "0.0", inclusive = false, message = "Max discount must be greater than 0")
        BigDecimal maxDiscount,

        @DecimalMin(value = "0.0", message = "Min order must be greater than or equal to 0")
        BigDecimal minOrder,

        @Min(value = 1, message = "Max uses must be greater than 0")
        Integer maxUses,

        @Min(value = 1, message = "Max uses per user must be greater than 0")
        Integer maxUsesPerUser,

        @NotNull(message = "Valid from is required")
        LocalDateTime validFrom,

        @NotNull(message = "Valid until is required")
        LocalDateTime validUntil,

        PromotionStatus status,

        List<Long> applicableTourIds
) {
}
