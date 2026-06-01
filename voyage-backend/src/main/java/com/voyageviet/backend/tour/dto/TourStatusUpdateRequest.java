package com.voyageviet.backend.tour.dto;

import com.voyageviet.backend.tour.entity.TourStatus;
import jakarta.validation.constraints.NotNull;

public record TourStatusUpdateRequest(

        @NotNull(message = "Status is required")
        TourStatus status
) {
}