package com.voyageviet.backend.booking.dto;

import com.voyageviet.backend.booking.entity.BookingStatus;
import jakarta.validation.constraints.NotNull;

public record BookingStatusUpdateRequest(

        @NotNull(message = "Status is required")
        BookingStatus status
) {
}