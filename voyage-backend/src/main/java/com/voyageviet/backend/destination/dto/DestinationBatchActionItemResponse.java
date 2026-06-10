package com.voyageviet.backend.destination.dto;

public record DestinationBatchActionItemResponse(
        Long id,
        String name,
        boolean success,
        String message
) {
}
