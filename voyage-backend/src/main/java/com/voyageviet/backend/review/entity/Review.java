package com.voyageviet.backend.review.entity;

import com.voyageviet.backend.common.entity.BaseEntity;
import com.voyageviet.backend.tour.entity.Tour;
import com.voyageviet.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "REVIEWS",
        uniqueConstraints = {
                @UniqueConstraint(name = "UK_REVIEWS_USER_TOUR", columnNames = {"USER_ID", "TOUR_ID"})
        },
        indexes = {
                @Index(name = "IDX_REVIEWS_USER_ID", columnList = "USER_ID"),
                @Index(name = "IDX_REVIEWS_TOUR_ID", columnList = "TOUR_ID"),
                @Index(name = "IDX_REVIEWS_STATUS", columnList = "STATUS")
        }
)
public class Review extends BaseEntity {

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

    @Column(name = "RATING", nullable = false)
    private Integer rating;

    @Column(name = "COMMENT_TEXT", length = 1000)
    private String comment;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false, length = 30)
    private ReviewStatus status = ReviewStatus.ACTIVE;
}