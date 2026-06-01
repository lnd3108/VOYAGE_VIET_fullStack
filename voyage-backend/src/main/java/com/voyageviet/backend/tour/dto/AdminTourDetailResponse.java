package com.voyageviet.backend.tour.dto;

public record AdminTourDetailResponse(
        TourDetailResponse tour,
        long schedulesCount,
        long imagesCount,
        long itineraryCount,
        PublishChecklistResponse publishChecklist
) {
}
