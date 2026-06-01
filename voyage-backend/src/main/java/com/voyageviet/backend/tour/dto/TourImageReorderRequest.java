package com.voyageviet.backend.tour.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record TourImageReorderRequest(
        @NotNull(message = "Reorder items is required")
        List<@Valid Item> items
) {
    public record Item(
            @NotNull(message = "Image ID is required")
            Long id,

            @NotNull(message = "Sort order is required")
            @Min(value = 0, message = "Sort order must be greater than or equal to 0")
            Integer sortOrder
    ) {
    }
}
