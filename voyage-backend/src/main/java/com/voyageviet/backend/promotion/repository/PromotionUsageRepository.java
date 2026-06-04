package com.voyageviet.backend.promotion.repository;

import com.voyageviet.backend.promotion.entity.PromotionUsage;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PromotionUsageRepository extends JpaRepository<PromotionUsage, Long> {

    long countByPromotionIdAndUserId(Long promotionId, Long userId);

    boolean existsByPromotionIdAndBookingId(Long promotionId, Long bookingId);

    long countByPromotionId(Long promotionId);

    List<PromotionUsage> findByBookingId(Long bookingId);

    boolean existsByPromotionId(Long promotionId);

    @EntityGraph(attributePaths = "promotion")
    List<PromotionUsage> findByUsedAtGreaterThanEqualAndUsedAtLessThan(
            LocalDateTime startInclusive,
            LocalDateTime endExclusive
    );
}
