package com.voyageviet.backend.category.dto;

import java.util.List;

public record CategoryBatchActionResponse(
        int total,
        int successCount,
        int failedCount,
        List<CategoryBatchActionItemResponse> successItems,
        List<CategoryBatchActionItemResponse> failedItems
) {
}
