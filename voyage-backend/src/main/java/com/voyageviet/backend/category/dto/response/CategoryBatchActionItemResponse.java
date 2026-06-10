package com.voyageviet.backend.category.dto.response;

public record CategoryBatchActionItemResponse(
        Long id,
        String name,
        boolean success,
        String message
) {
}
