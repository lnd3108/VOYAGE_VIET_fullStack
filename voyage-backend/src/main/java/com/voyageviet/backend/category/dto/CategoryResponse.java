package com.voyageviet.backend.category.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.voyageviet.backend.category.entity.CategoryStatus;

import java.time.LocalDateTime;

public record CategoryResponse(
        Long id,
        String name,
        String slug,
        String description,
        String imageUrl,
        CategoryStatus status,
        Integer isDisplay,
        Integer displayOrder,
        @JsonInclude(JsonInclude.Include.NON_NULL)
        String newData,
        @JsonInclude(JsonInclude.Include.NON_NULL)
        String rejectReason,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
