package com.voyageviet.backend.category.dto.response;

import com.voyageviet.backend.category.entity.CategoryStatus;

public record CategoryNewData(
        String name,
        String slug,
        String description,
        String imageUrl,
        CategoryStatus status,
        Integer displayOrder,
        Integer isDisplay,
        Integer isActive
) {
}
