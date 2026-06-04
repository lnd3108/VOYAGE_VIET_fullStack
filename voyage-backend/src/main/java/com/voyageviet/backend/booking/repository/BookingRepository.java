package com.voyageviet.backend.booking.repository;

import com.voyageviet.backend.booking.entity.Booking;
import com.voyageviet.backend.booking.entity.BookingPaymentStatus;
import com.voyageviet.backend.booking.entity.BookingStatus;
import com.voyageviet.backend.booking.repository.projection.BookingStatusCountProjection;
import com.voyageviet.backend.booking.repository.projection.MonthlyBookingRevenueProjection;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @EntityGraph(attributePaths = {"user", "tour", "schedule"})
    List<Booking> findByUserId(Long userId, Sort sort);

    @EntityGraph(attributePaths = {"user", "tour", "schedule"})
    Page<Booking> findByUserId(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "tour", "schedule"})
    Page<Booking> findByUserIdAndStatus(Long userId, BookingStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "tour", "schedule"})
    List<Booking> findAll(Sort sort);

    @Override
    @EntityGraph(attributePaths = {"user", "tour", "schedule"})
    Page<Booking> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"user", "tour", "schedule"})
    Page<Booking> findByStatus(BookingStatus status, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT b
            FROM Booking b
            JOIN FETCH b.user
            JOIN FETCH b.tour
            LEFT JOIN FETCH b.schedule
            WHERE b.id = :id
            """)
    Optional<Booking> findByIdForUpdate(@Param("id") Long id);

    @EntityGraph(attributePaths = {"user", "tour", "schedule"})
    Optional<Booking> findByIdAndUserId(Long id, Long userId);

    @EntityGraph(attributePaths = {"user", "tour", "tour.category", "tour.destination", "schedule", "promotion"})
    Optional<Booking> findWithAdminDetailById(Long id);

    @Query("""
            SELECT b.id
            FROM Booking b
            WHERE b.status = :status
              AND b.createdAt <= :cutoff
              AND b.paymentStatus IN :paymentStatuses
            ORDER BY b.createdAt ASC
            """)
    List<Long> findExpiredPendingBookingIds(
            @Param("status") BookingStatus status,
            @Param("paymentStatuses") Collection<BookingPaymentStatus> paymentStatuses,
            @Param("cutoff") LocalDateTime cutoff,
            Pageable pageable
    );

    long countByStatus(BookingStatus status);

    long countByUserId(Long userId);

    @Query("""
        SELECT COALESCE(SUM(b.totalAmount), 0)
        FROM Booking b
        WHERE b.status = :status
        """)
    BigDecimal sumTotalAmountByStatus(@Param("status") BookingStatus status);

    @Query("""
        SELECT b.status AS status, COUNT(b) AS total
        FROM Booking b
        GROUP BY b.status
        """)
    List<BookingStatusCountProjection> countBookingsGroupByStatus();

    @Query(
            value = """
                SELECT 
                    TO_CHAR(b.CREATED_AT, 'YYYY-MM') AS period,
                    COUNT(*) AS totalBookings,
                    COALESCE(SUM(CASE WHEN b.STATUS = 'CONFIRMED' THEN b.TOTAL_AMOUNT ELSE 0 END), 0) AS confirmedRevenue,
                    COALESCE(SUM(CASE WHEN b.STATUS = 'COMPLETED' THEN b.TOTAL_AMOUNT ELSE 0 END), 0) AS completedRevenue
                FROM BOOKINGS b
                WHERE b.CREATED_AT >= :startDate
                  AND b.CREATED_AT < :endDate
                GROUP BY TO_CHAR(b.CREATED_AT, 'YYYY-MM')
                ORDER BY period
                """,
            nativeQuery = true
    )
    List<MonthlyBookingRevenueProjection> getMonthlyBookingRevenue(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    boolean existsByUserIdAndTourIdAndStatus(Long userId, Long tourId, BookingStatus status);

    boolean existsByScheduleId(Long scheduleId);

    boolean existsByScheduleIdAndStatusIn(Long scheduleId, Collection<BookingStatus> statuses);

    long countByScheduleIdAndStatusIn(Long scheduleId, Collection<BookingStatus> statuses);

    @EntityGraph(attributePaths = {"user", "tour", "schedule"})
    List<Booking> findByScheduleId(Long scheduleId);

    boolean existsByBookingCode(String bookingCode);

    @EntityGraph(attributePaths = {"user", "tour", "schedule"})
    Optional<Booking> findByBookingCode(String bookingCode);

    @EntityGraph(attributePaths = {"tour", "tour.category", "tour.destination"})
    List<Booking> findByCreatedAtGreaterThanEqualAndCreatedAtLessThan(
            LocalDateTime startInclusive,
            LocalDateTime endExclusive
    );
}
