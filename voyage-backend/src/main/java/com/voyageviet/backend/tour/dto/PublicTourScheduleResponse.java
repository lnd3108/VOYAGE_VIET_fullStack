package com.voyageviet.backend.tour.dto;

import com.voyageviet.backend.tour.entity.TourScheduleStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PublicTourScheduleResponse(
        Long scheduleId,
        LocalDate departureDate,
        LocalDate returnDate,
        BigDecimal priceAdult,
        BigDecimal priceChild,
        BigDecimal priceInfant,
        BigDecimal singleSupplement,
        Integer maxSeats,
        Integer remainingSeats,
        TourScheduleStatus status
) {
}
