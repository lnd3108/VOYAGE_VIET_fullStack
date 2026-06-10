package com.voyageviet.backend.destination.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record DestinationDisplayUpdateRequest(

        @NotNull(message = "Display flag is required")
        @Min(value = 0, message = "Display flag must be 0 or 1")
        @Max(value = 1, message = "Display flag must be 0 or 1")
        Integer isDisplay
) {
}
