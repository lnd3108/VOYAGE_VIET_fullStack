package com.voyageviet.backend.tour.dto;

import java.util.List;

public record PublishChecklistResponse(
        Long tourId,
        boolean canPublish,
        List<PublishChecklistItemResponse> items
) {
}
