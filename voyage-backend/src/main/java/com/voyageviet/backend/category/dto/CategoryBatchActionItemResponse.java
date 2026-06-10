package com.voyageviet.backend.category.dto;

public record CategoryBatchActionItemResponse(
        Long id,
        String name,
        boolean success,
        String message
) {
}
