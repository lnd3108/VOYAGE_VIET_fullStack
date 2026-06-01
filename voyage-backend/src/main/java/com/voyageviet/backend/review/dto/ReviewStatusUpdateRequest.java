package com.voyageviet.backend.review.dto;

import com.voyageviet.backend.review.entity.ReviewStatus;
import jakarta.validation.constraints.NotNull;

public record ReviewStatusUpdateRequest(

        @NotNull(message = "Status is required")
        ReviewStatus status
) {
}