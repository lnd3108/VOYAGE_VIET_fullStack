package com.voyageviet.backend.payment.dto;

import com.voyageviet.backend.payment.entity.PaymentMethod;
import com.voyageviet.backend.payment.entity.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentDetailResponse(
        Long id,
        Long bookingId,
        String bookingCode,
        String userEmail,
        BigDecimal amount,
        PaymentMethod method,
        PaymentStatus status,
        String gatewayTxnId,
        String gatewayOrderId,
        LocalDateTime initiatedAt,
        LocalDateTime paidAt,
        LocalDateTime refundedAt,
        String gatewayResponse,
        BigDecimal refundAmount,
        String refundReason,
        String refundedBy
) {
}
