package com.voyageviet.backend.destination.dto;

import com.voyageviet.backend.destination.entity.DestinationStatus;

import java.math.BigDecimal;

public record DestinationNewData(
        String name,
        String slug,
        String region,
        String country,
        String description,
        String imageUrl,
        BigDecimal latitude,
        BigDecimal longitude,
        DestinationStatus status,
        Integer isDisplay
) {
}
