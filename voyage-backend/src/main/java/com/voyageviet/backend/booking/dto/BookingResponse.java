package com.voyageviet.backend.booking.dto;

import com.voyageviet.backend.booking.entity.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record BookingResponse(
        Long id,
        Long bookingId,
        String bookingCode,

        Long userId,
        String userEmail,

        Long tourId,
        String tourTitle,
        String tourSlug,
        String thumbnailUrl,

        Long scheduleId,
        LocalDate departureDate,
        LocalDate returnDate,

        String contactName,
        String contactEmail,
        String contactPhone,

        LocalDate startDate,
        Integer numberOfPeople,
        BigDecimal unitPrice,
        Integer adultCount,
        Integer childCount,
        Integer infantCount,
        Integer totalPeople,
        BigDecimal priceAdultSnapshot,
        BigDecimal priceChildSnapshot,
        BigDecimal priceInfantSnapshot,
        BigDecimal singleSupplementSnapshot,
        BigDecimal originalAmount,
        BigDecimal discountAmount,
        BigDecimal totalAmount,
        String promoCode,
        BookingStatus status,
        String note,
        String paymentStatus,

        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
