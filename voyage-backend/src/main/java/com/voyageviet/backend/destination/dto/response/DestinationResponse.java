package com.voyageviet.backend.destination.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.voyageviet.backend.destination.entity.DestinationStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record DestinationResponse(
        Long id,
        String name,
        String slug,
        String region,
        String country,
        String description,
        String imageUrl,
        BigDecimal latitude,
        BigDecimal longitude,
        DestinationStatus status,
        Integer isDisplay,
        @JsonInclude(JsonInclude.Include.NON_NULL)
        String newData,
        @JsonInclude(JsonInclude.Include.NON_NULL)
        String rejectReason,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
