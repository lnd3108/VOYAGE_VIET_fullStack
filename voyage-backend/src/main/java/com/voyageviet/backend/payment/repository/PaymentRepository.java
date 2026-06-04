package com.voyageviet.backend.payment.repository;

import com.voyageviet.backend.payment.entity.Payment;
import com.voyageviet.backend.payment.entity.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long>, JpaSpecificationExecutor<Payment> {

    @EntityGraph(attributePaths = {"booking", "booking.user", "booking.tour"})
    Optional<Payment> findByGatewayOrderId(String gatewayOrderId);

    @EntityGraph(attributePaths = {"booking", "booking.user", "booking.tour"})
    Optional<Payment> findByGatewayTxnId(String gatewayTxnId);

    @EntityGraph(attributePaths = {"booking", "booking.user", "booking.tour"})
    Optional<Payment> findFirstByBookingIdOrderByCreatedAtDesc(Long bookingId);

    @EntityGraph(attributePaths = {"booking", "booking.user", "booking.tour"})
    Optional<Payment> findFirstByBookingIdAndStatusOrderByCreatedAtDesc(Long bookingId, PaymentStatus status);

    @EntityGraph(attributePaths = {"booking", "booking.tour", "booking.tour.category", "booking.tour.destination"})
    List<Payment> findByCreatedAtGreaterThanEqualAndCreatedAtLessThan(LocalDateTime startInclusive, LocalDateTime endExclusive);

    @EntityGraph(attributePaths = {"booking", "booking.tour", "booking.tour.category", "booking.tour.destination"})
    @Query("""
            SELECT p
            FROM Payment p
            WHERE (
                    p.status = :successStatus
                    AND p.paidAt >= :startInclusive
                    AND p.paidAt < :endExclusive
                  )
               OR (
                    p.status = :refundedStatus
                    AND (
                        (p.refundedAt IS NOT NULL AND p.refundedAt >= :startInclusive AND p.refundedAt < :endExclusive)
                        OR (p.refundedAt IS NULL AND p.createdAt >= :startInclusive AND p.createdAt < :endExclusive)
                    )
                  )
            """)
    List<Payment> findRevenueAnalyticsPayments(
            @Param("successStatus") PaymentStatus successStatus,
            @Param("refundedStatus") PaymentStatus refundedStatus,
            @Param("startInclusive") LocalDateTime startInclusive,
            @Param("endExclusive") LocalDateTime endExclusive
    );

    boolean existsByBookingIdAndStatus(Long bookingId, PaymentStatus status);

    @Override
    @EntityGraph(attributePaths = {"booking", "booking.user", "booking.tour"})
    Page<Payment> findAll(Specification<Payment> spec, Pageable pageable);
}
