package com.voyageviet.backend.wishlist.repository;

import com.voyageviet.backend.wishlist.entity.Wishlist;
import com.voyageviet.backend.tour.entity.TourStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    Optional<Wishlist> findByUserIdAndTourId(Long userId, Long tourId);

    boolean existsByUserIdAndTourId(Long userId, Long tourId);

    @EntityGraph(attributePaths = {"tour", "tour.category", "tour.destination"})
    Page<Wishlist> findByUserId(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"tour", "tour.category", "tour.destination"})
    Page<Wishlist> findByUserIdAndTourStatus(Long userId, TourStatus status, Pageable pageable);

    long countByUserId(Long userId);

    void deleteByUserIdAndTourId(Long userId, Long tourId);
}
