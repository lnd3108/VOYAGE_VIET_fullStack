package com.voyageviet.backend.destination.dto.response;

public record DestinationBatchActionItemResponse(
        Long id,
        String name,
        boolean success,
        String message
) {
}
