package com.voyageviet.backend.destination.entity;

import com.voyageviet.backend.common.entity.BaseEntity;
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
        name = "DESTINATIONS",
        uniqueConstraints = {
                @UniqueConstraint(name = "UK_DESTINATIONS_SLUG", columnNames = "SLUG")
        }
)
public class Destination extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "NAME", nullable = false, length = 150)
    private String name;

    @Column(name = "SLUG", nullable = false, length = 180)
    private String slug;

    @Column(name = "REGION", length = 100)
    private String region;

    @Column(name = "COUNTRY", length = 100)
    private String country;

    @Column(name = "DESCRIPTION", length = 1000)
    private String description;

    @Column(name = "IMAGE_URL", length = 500)
    private String imageUrl;

    @Column(name = "LATITUDE", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "LONGITUDE", precision = 10, scale = 7)
    private BigDecimal longitude;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false, length = 30)
    private DestinationStatus status = DestinationStatus.ACTIVE;
}