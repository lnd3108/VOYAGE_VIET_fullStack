package com.voyageviet.backend.admin.dto;

import com.voyageviet.backend.booking.entity.BookingStatus;

public record BookingStatusSummaryResponse(
        BookingStatus status,
        long total
) {
}