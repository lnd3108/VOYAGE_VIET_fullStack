package com.voyageviet.backend.booking.dto;

import com.voyageviet.backend.booking.entity.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record BookingResponse(
        Long id,

        Long userId,
        String userEmail,

        Long tourId,
        String tourTitle,
        String tourSlug,

        String contactName,
        String contactEmail,
        String contactPhone,

        LocalDate startDate,
        Integer numberOfPeople,
        BigDecimal unitPrice,
        BigDecimal totalAmount,
        BookingStatus status,
        String note,

        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}