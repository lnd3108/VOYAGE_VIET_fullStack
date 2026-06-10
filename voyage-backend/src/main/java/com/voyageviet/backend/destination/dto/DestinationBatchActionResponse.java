package com.voyageviet.backend.destination.dto;

import java.util.List;

public record DestinationBatchActionResponse(
        int total,
        int successCount,
        int failedCount,
        List<DestinationBatchActionItemResponse> successItems,
        List<DestinationBatchActionItemResponse> failedItems
) {
}
