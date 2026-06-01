package com.voyageviet.backend.feature.dto;

import com.voyageviet.backend.feature.entity.FeatureCode;

public record FeatureFlagResponse(
        Long id,
        FeatureCode code,
        String name,
        String description,
        Boolean enabled
) {
}