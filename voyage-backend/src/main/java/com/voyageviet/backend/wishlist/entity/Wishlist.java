package com.voyageviet.backend.wishlist.entity;

import com.voyageviet.backend.tour.entity.Tour;
import com.voyageviet.backend.user.entity.User;
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
        name = "WISHLISTS",
        uniqueConstraints = {
                @UniqueConstraint(name = "UK_WISHLISTS_USER_TOUR", columnNames = {"USER_ID", "TOUR_ID"})
        },
        indexes = {
                @Index(name = "IDX_WISHLISTS_USER_ID", columnList = "USER_ID"),
                @Index(name = "IDX_WISHLISTS_TOUR_ID", columnList = "TOUR_ID")
        }
)
public class Wishlist {

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

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
