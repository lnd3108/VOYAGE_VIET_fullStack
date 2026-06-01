package com.voyageviet.backend.tour.entity;

import com.voyageviet.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "TOUR_ITINERARIES",
        uniqueConstraints = {
                @UniqueConstraint(name = "UK_TOUR_ITINERARIES_DAY", columnNames = {"TOUR_ID", "DAY_NUMBER"})
        },
        indexes = {
                @Index(name = "IDX_TOUR_ITINERARIES_TOUR_ID", columnList = "TOUR_ID")
        }
)
public class TourItinerary extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "tour_itinerary_seq")
    @SequenceGenerator(name = "tour_itinerary_seq", sequenceName = "SEQ_TOUR_ITINERARY", allocationSize = 1)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TOUR_ID", nullable = false)
    private Tour tour;

    @Column(name = "DAY_NUMBER", nullable = false)
    private Integer dayNumber;

    @Column(name = "TITLE", nullable = false, length = 200)
    private String title;

    @Lob
    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "HOTEL_NAME", length = 200)
    private String hotelName;

    @Column(name = "MEALS", length = 1000)
    private String meals;

    @Column(name = "TRANSPORT_MODES", length = 1000)
    private String transportModes;

    @Lob
    @Column(name = "PLACE_NAMES")
    private String placeNames;

    @Lob
    @Column(name = "ACTIVITIES")
    private String activities;

    @Builder.Default
    @Column(name = "SORT_ORDER", nullable = false)
    private Integer sortOrder = 0;
}
