package com.voyageviet.backend.tour.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "TOUR_IMAGES",
        indexes = {
                @Index(name = "IDX_TOUR_IMAGES_TOUR_ID", columnList = "TOUR_ID"),
                @Index(name = "IDX_TOUR_IMAGES_SORT", columnList = "TOUR_ID, SORT_ORDER")
        }
)
public class TourImage {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "tour_image_seq")
    @SequenceGenerator(name = "tour_image_seq", sequenceName = "SEQ_TOUR_IMAGE", allocationSize = 1)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TOUR_ID", nullable = false)
    private Tour tour;

    @Column(name = "URL", nullable = false, length = 500)
    private String url;

    @Column(name = "PUBLIC_ID", nullable = false, length = 200)
    private String publicId;

    @Column(name = "ALT_TEXT", length = 150)
    private String altText;

    @Builder.Default
    @Column(name = "SORT_ORDER", nullable = false)
    private Integer sortOrder = 0;

    @Builder.Default
    @Column(name = "IS_THUMBNAIL", nullable = false)
    private Boolean thumbnail = false;

    @Column(name = "WIDTH")
    private Integer width;

    @Column(name = "HEIGHT")
    private Integer height;

    @Column(name = "FILE_SIZE_BYTES")
    private Long fileSizeBytes;

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
