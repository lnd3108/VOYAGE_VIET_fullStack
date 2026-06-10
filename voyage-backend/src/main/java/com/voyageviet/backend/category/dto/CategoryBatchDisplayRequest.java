package com.voyageviet.backend.category.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CategoryBatchDisplayRequest(

        @NotEmpty(message = "Category ids must not be empty")
        List<@NotNull(message = "Category id must not be null") Long> ids,

        @NotNull(message = "Display flag is required")
        @Min(value = 0, message = "Display flag must be 0 or 1")
        @Max(value = 1, message = "Display flag must be 0 or 1")
        Integer isDisplay
) {
}
