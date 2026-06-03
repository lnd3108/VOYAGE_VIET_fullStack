package com.voyageviet.backend.booking.entity;

import com.voyageviet.backend.common.entity.BaseEntity;
import com.voyageviet.backend.promotion.entity.Promotion;
import com.voyageviet.backend.tour.entity.Tour;
import com.voyageviet.backend.tour.entity.TourSchedule;
import com.voyageviet.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "BOOKINGS",
        indexes = {
                @Index(name = "IDX_BOOKINGS_USER_ID", columnList = "USER_ID"),
                @Index(name = "IDX_BOOKINGS_TOUR_ID", columnList = "TOUR_ID"),
                @Index(name = "IDX_BOOKINGS_SCHEDULE_ID", columnList = "SCHEDULE_ID"),
                @Index(name = "IDX_BOOKINGS_CODE", columnList = "BOOKING_CODE"),
                @Index(name = "IDX_BOOKINGS_STATUS", columnList = "STATUS"),
                @Index(name = "IDX_BOOKINGS_PAYMENT_STATUS", columnList = "PAYMENT_STATUS"),
                @Index(name = "IDX_BOOKINGS_PROMOTION_ID", columnList = "PROMOTION_ID")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "UK_BOOKINGS_CODE", columnNames = "BOOKING_CODE")
        }
)
public class Booking extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TOUR_ID", nullable = false)
    private Tour tour;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SCHEDULE_ID")
    private TourSchedule schedule;

    @Column(name = "BOOKING_CODE", length = 30)
    private String bookingCode;

    @Column(name = "CONTACT_NAME", nullable = false, length = 150)
    private String contactName;

    @Column(name = "CONTACT_EMAIL", nullable = false, length = 150)
    private String contactEmail;

    @Column(name = "CONTACT_PHONE", nullable = false, length = 20)
    private String contactPhone;

    @Column(name = "START_DATE")
    private LocalDate startDate;

    @Column(name = "NUMBER_OF_PEOPLE", nullable = false)
    private Integer numberOfPeople;

    @Builder.Default
    @Column(name = "ADULT_COUNT", nullable = false)
    private Integer adultCount = 1;

    @Builder.Default
    @Column(name = "CHILD_COUNT", nullable = false)
    private Integer childCount = 0;

    @Builder.Default
    @Column(name = "INFANT_COUNT", nullable = false)
    private Integer infantCount = 0;

    @Column(name = "TOTAL_PEOPLE")
    private Integer totalPeople;

    @Column(name = "UNIT_PRICE", nullable = false, precision = 15, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "PRICE_ADULT_SNAPSHOT", precision = 15, scale = 2)
    private BigDecimal priceAdultSnapshot;

    @Column(name = "PRICE_CHILD_SNAPSHOT", precision = 15, scale = 2)
    private BigDecimal priceChildSnapshot;

    @Column(name = "PRICE_INFANT_SNAPSHOT", precision = 15, scale = 2)
    private BigDecimal priceInfantSnapshot;

    @Column(name = "SINGLE_SUPPLEMENT_SNAPSHOT", precision = 15, scale = 2)
    private BigDecimal singleSupplementSnapshot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PROMOTION_ID")
    private Promotion promotion;

    @Column(name = "PROMO_CODE_SNAPSHOT", length = 50)
    private String promoCodeSnapshot;

    @Column(name = "ORIGINAL_AMOUNT", precision = 15, scale = 2)
    private BigDecimal originalAmount;

    @Builder.Default
    @Column(name = "DISCOUNT_AMOUNT", nullable = false, precision = 15, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "TOTAL_AMOUNT", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false, length = 30)
    private BookingStatus status = BookingStatus.PENDING;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "PAYMENT_STATUS", nullable = false, length = 30)
    private BookingPaymentStatus paymentStatus = BookingPaymentStatus.UNPAID;

    @Column(name = "NOTE", length = 1000)
    private String note;
}
