package com.voyageviet.backend.tour.dto;

import com.voyageviet.backend.tour.entity.TourScheduleStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TourScheduleResponse(
        Long id,
        Long tourId,
        String tourTitle,
        LocalDate departureDate,
        LocalDate returnDate,
        BigDecimal priceAdult,
        BigDecimal priceChild,
        BigDecimal priceInfant,
        BigDecimal singleSupplement,
        Integer maxSeats,
        Integer bookedSeats,
        Integer availableSeats,
        TourScheduleStatus status,
        String notes,
        Long version,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
