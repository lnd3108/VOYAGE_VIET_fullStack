package com.voyageviet.backend.booking.dto;

import com.voyageviet.backend.booking.entity.BookingPaymentStatus;
import com.voyageviet.backend.booking.entity.BookingStatus;
import com.voyageviet.backend.payment.entity.PaymentMethod;
import com.voyageviet.backend.payment.entity.PaymentStatus;
import com.voyageviet.backend.tour.entity.TourScheduleStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record AdminBookingDetailResponse(
        Long id,
        String bookingCode,
        BookingStatus status,
        BookingPaymentStatus paymentStatus,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,

        Long userId,
        String userFullName,
        String userEmail,
        String userPhone,
        String userAvatarUrl,

        Long tourId,
        String tourTitle,
        String tourSlug,
        String tourThumbnailUrl,
        String categoryName,
        String destinationName,

        Long scheduleId,
        LocalDate departureDate,
        LocalDate returnDate,
        TourScheduleStatus scheduleStatus,
        Integer maxSeats,
        Integer bookedSeats,
        Integer remainingSeats,

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

        String contactName,
        String contactEmail,
        String contactPhone,
        String note,

        Long promotionId,
        String promotionCode,
        String promotionName,

        Long latestPaymentId,
        PaymentMethod paymentMethod,
        PaymentStatus latestPaymentStatus,
        BigDecimal paymentAmount,
        LocalDateTime paidAt,
        String gatewayTxnId,
        String gatewayOrderId
) {
}
