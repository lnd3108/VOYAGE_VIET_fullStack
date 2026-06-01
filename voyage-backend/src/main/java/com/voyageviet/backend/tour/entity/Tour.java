package com.voyageviet.backend.tour.entity;

import com.voyageviet.backend.category.entity.Category;
import com.voyageviet.backend.common.entity.BaseEntity;
import com.voyageviet.backend.destination.entity.Destination;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "TOURS",
        uniqueConstraints = {
                @UniqueConstraint(name = "UK_TOURS_SLUG", columnNames = "SLUG")
        },
        indexes = {
                @Index(name = "IDX_TOURS_CATEGORY_ID", columnList = "CATEGORY_ID"),
                @Index(name = "IDX_TOURS_DESTINATION_ID", columnList = "DESTINATION_ID"),
                @Index(name = "IDX_TOURS_STATUS", columnList = "STATUS")
        }
)
public class Tour extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "TITLE", nullable = false, length = 200)
    private String title;

    @Column(name = "SLUG", nullable = false, length = 220)
    private String slug;

    @Column(name = "SHORT_DESCRIPTION", length = 500)
    private String shortDescription;

    @Lob
    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "THUMBNAIL_URL", length = 500)
    private String thumbnailUrl;

    @Column(name = "ORIGINAL_PRICE", nullable = false, precision = 15, scale = 2)
    private BigDecimal originalPrice;

    @Column(name = "SALE_PRICE", precision = 15, scale = 2)
    private BigDecimal salePrice;

    @Column(name = "DURATION_DAYS", nullable = false)
    private Integer durationDays;

    @Builder.Default
    @Column(name = "DURATION_NIGHTS", nullable = false)
    private Integer durationNights = 0;

    @Column(name = "DEPARTURE_LOCATION", length = 150)
    private String departureLocation;

    @Builder.Default
    @Column(name = "MAX_PARTICIPANTS", nullable = false)
    private Integer maxParticipants = 0;

    @Builder.Default
    @Column(name = "AVAILABLE_SEATS", nullable = false)
    private Integer availableSeats = 0;

    @Builder.Default
    @Column(name = "FEATURED", nullable = false)
    private Boolean featured = false;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false, length = 30)
    private TourStatus status = TourStatus.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CATEGORY_ID", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DESTINATION_ID", nullable = false)
    private Destination destination;
}