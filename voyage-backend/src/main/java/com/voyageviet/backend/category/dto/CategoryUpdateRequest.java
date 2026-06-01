package com.voyageviet.backend.category.dto;

import com.voyageviet.backend.category.entity.CategoryStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryUpdateRequest(

        @NotBlank(message = "Category name is required")
        @Size(max = 150, message = "Category name must not exceed 150 characters")
        String name,

        @Size(max = 180, message = "Slug must not exceed 180 characters")
        String slug,

        @Size(max = 500, message = "Description must not exceed 500 characters")
        String description,

        @Size(max = 500, message = "Image URL must not exceed 500 characters")
        String imageUrl,

        CategoryStatus status,

        @Min(value = 0, message = "Display order must be greater than or equal to 0")
        Integer displayOrder
) {
}