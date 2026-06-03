package com.voyageviet.backend.promotion.entity;

import com.voyageviet.backend.booking.entity.Booking;
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
        name = "PROMOTION_USAGES",
        indexes = {
                @Index(name = "IDX_PROMOTION_USAGES_PROMOTION_ID", columnList = "PROMOTION_ID"),
                @Index(name = "IDX_PROMOTION_USAGES_USER_ID", columnList = "USER_ID"),
                @Index(name = "IDX_PROMOTION_USAGES_BOOKING_ID", columnList = "BOOKING_ID")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "UK_PROMOTION_USAGE_BOOKING", columnNames = {"PROMOTION_ID", "BOOKING_ID"})
        }
)
public class PromotionUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PROMOTION_ID", nullable = false)
    private Promotion promotion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BOOKING_ID", nullable = false)
    private Booking booking;

    @Column(name = "DISCOUNT_AMOUNT", nullable = false, precision = 15, scale = 2)
    private BigDecimal discountAmount;

    @Column(name = "USED_AT", nullable = false)
    private LocalDateTime usedAt;

    @PrePersist
    protected void onCreate() {
        if (this.usedAt == null) {
            this.usedAt = LocalDateTime.now();
        }
    }
}
