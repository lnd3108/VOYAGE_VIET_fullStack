package com.voyageviet.backend.tour.dto;

import com.voyageviet.backend.tour.entity.TourScheduleStatus;
import jakarta.validation.constraints.NotNull;

public record TourScheduleStatusRequest(
        @NotNull(message = "Schedule status is required")
        TourScheduleStatus status
) {
}
