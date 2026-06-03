package com.voyageviet.backend.payment.repository;

import com.voyageviet.backend.payment.entity.Payment;
import com.voyageviet.backend.payment.entity.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

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

    boolean existsByBookingIdAndStatus(Long bookingId, PaymentStatus status);

    @Override
    @EntityGraph(attributePaths = {"booking", "booking.user", "booking.tour"})
    Page<Payment> findAll(Specification<Payment> spec, Pageable pageable);
}
