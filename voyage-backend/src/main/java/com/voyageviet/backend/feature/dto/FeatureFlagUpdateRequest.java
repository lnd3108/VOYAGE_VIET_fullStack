package com.voyageviet.backend.feature.dto;

import jakarta.validation.constraints.NotNull;

public record FeatureFlagUpdateRequest(

        @NotNull(message = "Enabled is required")
        Boolean enabled
) {
}