package com.voyageviet.backend.tour.dto;

public record PublishChecklistItemResponse(
        String code,
        String label,
        boolean passed,
        String message
) {
}
