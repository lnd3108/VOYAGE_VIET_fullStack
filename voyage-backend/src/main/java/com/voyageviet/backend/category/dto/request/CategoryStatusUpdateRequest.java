package com.voyageviet.backend.category.dto.request;

import com.voyageviet.backend.category.entity.CategoryStatus;
import jakarta.validation.constraints.NotNull;

public record CategoryStatusUpdateRequest(

        @NotNull(message = "Status is required")
        CategoryStatus status
) {
}
