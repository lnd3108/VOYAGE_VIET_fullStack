package com.voyageviet.backend.payment.entity;

import com.voyageviet.backend.booking.entity.Booking;
import com.voyageviet.backend.common.entity.BaseEntity;
import com.voyageviet.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "PAYMENTS",
        indexes = {
                @Index(name = "IDX_PAYMENTS_BOOKING_ID", columnList = "BOOKING_ID"),
                @Index(name = "IDX_PAYMENTS_STATUS", columnList = "STATUS"),
                @Index(name = "IDX_PAYMENTS_METHOD", columnList = "METHOD"),
                @Index(name = "IDX_PAYMENTS_GATEWAY_ORDER", columnList = "GATEWAY_ORDER_ID")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "UK_PAYMENTS_GATEWAY_TXN", columnNames = "GATEWAY_TXN_ID")
        }
)
public class Payment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "payment_seq")
    @SequenceGenerator(name = "payment_seq", sequenceName = "SEQ_PAYMENT", allocationSize = 1)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BOOKING_ID", nullable = false)
    private Booking booking;

    @Column(name = "AMOUNT", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "METHOD", nullable = false, length = 30)
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false, length = 30)
    private PaymentStatus status;

    @Column(name = "GATEWAY_TXN_ID", length = 100)
    private String gatewayTxnId;

    @Column(name = "GATEWAY_ORDER_ID", length = 100)
    private String gatewayOrderId;

    @Lob
    @Column(name = "GATEWAY_RESPONSE")
    private String gatewayResponse;

    @Column(name = "REFUND_AMOUNT", precision = 15, scale = 2)
    private BigDecimal refundAmount;

    @Column(name = "REFUND_REASON", length = 1000)
    private String refundReason;

    @Column(name = "REFUNDED_AT")
    private LocalDateTime refundedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "REFUNDED_BY")
    private User refundedBy;

    @Column(name = "INITIATED_AT", nullable = false)
    private LocalDateTime initiatedAt;

    @Column(name = "PAID_AT")
    private LocalDateTime paidAt;
}
