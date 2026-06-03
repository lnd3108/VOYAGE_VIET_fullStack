package com.voyageviet.backend.promotion.dto;

import com.voyageviet.backend.promotion.entity.PromotionStatus;
import jakarta.validation.constraints.NotNull;

public record PromotionStatusRequest(
        @NotNull(message = "Promotion status is required")
        PromotionStatus status
) {
}
