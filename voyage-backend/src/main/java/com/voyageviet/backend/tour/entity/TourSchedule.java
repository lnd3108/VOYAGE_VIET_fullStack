package com.voyageviet.backend.tour.entity;

import com.voyageviet.backend.common.entity.BaseEntity;
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
        name = "TOUR_SCHEDULES",
        indexes = {
                @Index(name = "IDX_TOUR_SCHEDULES_TOUR_ID", columnList = "TOUR_ID"),
                @Index(name = "IDX_TOUR_SCHEDULES_STATUS", columnList = "STATUS"),
                @Index(name = "IDX_TOUR_SCHEDULES_DEPARTURE", columnList = "DEPARTURE_DATE")
        }
)
public class TourSchedule extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "tour_schedule_seq")
    @SequenceGenerator(name = "tour_schedule_seq", sequenceName = "SEQ_TOUR_SCHEDULE", allocationSize = 1)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TOUR_ID", nullable = false)
    private Tour tour;

    @Column(name = "DEPARTURE_DATE", nullable = false)
    private LocalDate departureDate;

    @Column(name = "RETURN_DATE", nullable = false)
    private LocalDate returnDate;

    @Column(name = "PRICE_ADULT", nullable = false, precision = 15, scale = 2)
    private BigDecimal priceAdult;

    @Builder.Default
    @Column(name = "PRICE_CHILD", nullable = false, precision = 15, scale = 2)
    private BigDecimal priceChild = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "PRICE_INFANT", nullable = false, precision = 15, scale = 2)
    private BigDecimal priceInfant = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "SINGLE_SUPPLEMENT", nullable = false, precision = 15, scale = 2)
    private BigDecimal singleSupplement = BigDecimal.ZERO;

    @Column(name = "MAX_SEATS", nullable = false)
    private Integer maxSeats;

    @Builder.Default
    @Column(name = "BOOKED_SEATS", nullable = false)
    private Integer bookedSeats = 0;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false, length = 30)
    private TourScheduleStatus status = TourScheduleStatus.OPEN;

    @Lob
    @Column(name = "NOTES")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CREATED_BY")
    private User createdBy;

    @Version
    @Column(name = "VERSION")
    private Long version;
}
