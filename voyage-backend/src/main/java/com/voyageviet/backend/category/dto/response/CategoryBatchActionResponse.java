package com.voyageviet.backend.category.dto.response;

import java.util.List;

public record CategoryBatchActionResponse(
        int total,
        int successCount,
        int failedCount,
        List<CategoryBatchActionItemResponse> successItems,
        List<CategoryBatchActionItemResponse> failedItems
) {
}
