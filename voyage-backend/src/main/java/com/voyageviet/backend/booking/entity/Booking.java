package com.voyageviet.backend.booking.entity;

import com.voyageviet.backend.common.entity.BaseEntity;
import com.voyageviet.backend.tour.entity.Tour;
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
                @Index(name = "IDX_BOOKINGS_STATUS", columnList = "STATUS")
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

    @Column(name = "UNIT_PRICE", nullable = false, precision = 15, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "TOTAL_AMOUNT", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false, length = 30)
    private BookingStatus status = BookingStatus.PENDING;

    @Column(name = "NOTE", length = 1000)
    private String note;
}