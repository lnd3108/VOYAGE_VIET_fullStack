package com.voyageviet.backend.category.dto;

import com.voyageviet.backend.category.entity.CategoryStatus;

public record CategoryResponse(
        Long id,
        String name,
        String slug,
        String description,
        String imageUrl,
        CategoryStatus status,
        Integer displayOrder
) {
}