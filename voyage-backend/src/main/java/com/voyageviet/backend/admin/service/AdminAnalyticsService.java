package com.voyageviet.backend.admin.service;

import com.voyageviet.backend.admin.dto.*;
import com.voyageviet.backend.booking.entity.Booking;
import com.voyageviet.backend.booking.entity.BookingPaymentStatus;
import com.voyageviet.backend.booking.entity.BookingStatus;
import com.voyageviet.backend.booking.repository.BookingRepository;
import com.voyageviet.backend.common.exception.BusinessException;
import com.voyageviet.backend.common.exception.ErrorCode;
import com.voyageviet.backend.payment.entity.Payment;
import com.voyageviet.backend.payment.entity.PaymentMethod;
import com.voyageviet.backend.payment.entity.PaymentStatus;
import com.voyageviet.backend.payment.repository.PaymentRepository;
import com.voyageviet.backend.promotion.entity.PromotionUsage;
import com.voyageviet.backend.promotion.repository.PromotionUsageRepository;
import com.voyageviet.backend.review.entity.Review;
import com.voyageviet.backend.review.entity.ReviewStatus;
import com.voyageviet.backend.review.repository.ReviewRepository;
import com.voyageviet.backend.tour.entity.Tour;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminAnalyticsService {

    private static final int DEFAULT_LIMIT = 10;
    private static final int MAX_LIMIT = 50;
    private static final DateTimeFormatter DAY_LABEL = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter MONTH_LABEL = DateTimeFormatter.ofPattern("yyyy-MM");

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final ReviewRepository reviewRepository;
    private final PromotionUsageRepository promotionUsageRepository;

    public RevenueAnalyticsResponse getRevenueAnalytics(LocalDate dateFrom, LocalDate dateTo, String groupBy) {
        DateRange range = normalizeRange(dateFrom, dateTo);
        RevenueGroupBy safeGroupBy = parseGroupBy(groupBy);

        Map<String, RevenueBucket> buckets = initRevenueBuckets(range, safeGroupBy);
        List<Payment> payments = findRevenuePayments(range);

        for (Payment payment : payments) {
            if (payment.getStatus() == PaymentStatus.SUCCESS) {
                String label = revenueLabel(payment.getPaidAt().toLocalDate(), safeGroupBy);
                buckets.computeIfAbsent(label, ignored -> new RevenueBucket())
                        .addRevenue(payment.getAmount(), payment.getBooking().getId());
            } else if (payment.getStatus() == PaymentStatus.REFUNDED) {
                LocalDate refundDate = payment.getRefundedAt() == null
                        ? payment.getCreatedAt().toLocalDate()
                        : payment.getRefundedAt().toLocalDate();
                String label = revenueLabel(refundDate, safeGroupBy);
                buckets.computeIfAbsent(label, ignored -> new RevenueBucket())
                        .addRefund(payment.getRefundAmount());
            }
        }

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalRefundedAmount = BigDecimal.ZERO;
        Set<Long> paidBookingIds = new HashSet<>();

        List<RevenuePointResponse> points = buckets.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    RevenueBucket bucket = entry.getValue();
                    paidBookingIds.addAll(bucket.paidBookingIds);
                    return bucket.toResponse(entry.getKey());
                })
                .toList();

        for (RevenueBucket bucket : buckets.values()) {
            totalRevenue = totalRevenue.add(bucket.revenue);
            totalRefundedAmount = totalRefundedAmount.add(bucket.refundAmount);
        }

        return new RevenueAnalyticsResponse(
                range.from(),
                range.to(),
                safeGroupBy.name(),
                totalRevenue,
                paidBookingIds.size(),
                totalRefundedAmount,
                totalRevenue.subtract(totalRefundedAmount),
                points
        );
    }

    public BookingAnalyticsResponse getBookingAnalytics(LocalDate dateFrom, LocalDate dateTo) {
        DateRange range = normalizeRange(dateFrom, dateTo);
        List<Booking> bookings = bookingRepository.findByCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                range.start(),
                range.endExclusive()
        );

        long totalBookings = bookings.size();
        long pendingBookings = countBookingsByStatus(bookings, BookingStatus.PENDING);
        long confirmedBookings = countBookingsByStatus(bookings, BookingStatus.CONFIRMED);
        long cancelledBookings = countBookingsByStatus(bookings, BookingStatus.CANCELLED);
        long completedBookings = countBookingsByStatus(bookings, BookingStatus.COMPLETED);

        long paidBookings = countBookingsByPaymentStatus(bookings, BookingPaymentStatus.PAID);
        long unpaidBookings = countBookingsByPaymentStatus(bookings, BookingPaymentStatus.UNPAID);
        long failedPaymentBookings = countBookingsByPaymentStatus(bookings, BookingPaymentStatus.FAILED);
        long refundedBookings = countBookingsByPaymentStatus(bookings, BookingPaymentStatus.REFUNDED);

        return new BookingAnalyticsResponse(
                totalBookings,
                pendingBookings,
                confirmedBookings,
                cancelledBookings,
                completedBookings,
                paidBookings,
                unpaidBookings,
                failedPaymentBookings,
                refundedBookings,
                percentage(paidBookings, totalBookings),
                percentage(cancelledBookings, totalBookings)
        );
    }

    public List<TopTourAnalyticsResponse> getTopTours(
            LocalDate dateFrom,
            LocalDate dateTo,
            String metric,
            Integer limit
    ) {
        DateRange range = normalizeRange(dateFrom, dateTo);
        TopTourMetric safeMetric = parseMetric(metric);
        int safeLimit = validateLimit(limit);

        Map<Long, TourStats> stats = new HashMap<>();
        applyBookingStats(stats, bookingRepository.findByCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                range.start(),
                range.endExclusive()
        ));
        applyRevenueStats(stats, findRevenuePayments(range));
        applyReviewStats(stats, reviewRepository.findByStatusAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                ReviewStatus.ACTIVE,
                range.start(),
                range.endExclusive()
        ));

        return stats.values().stream()
                .filter(stat -> stat.hasMetric(safeMetric))
                .sorted(topTourComparator(safeMetric))
                .limit(safeLimit)
                .map(TourStats::toResponse)
                .toList();
    }

    public PaymentAnalyticsResponse getPaymentAnalytics(LocalDate dateFrom, LocalDate dateTo) {
        DateRange range = normalizeRange(dateFrom, dateTo);
        List<Payment> payments = paymentRepository.findByCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                range.start(),
                range.endExclusive()
        );

        EnumMap<PaymentMethod, PaymentMethodBucket> methodBuckets = new EnumMap<>(PaymentMethod.class);
        for (PaymentMethod method : PaymentMethod.values()) {
            methodBuckets.put(method, new PaymentMethodBucket(method));
        }

        long successCount = 0;
        long pendingCount = 0;
        long failedCount = 0;
        long refundedCount = 0;
        BigDecimal successAmount = BigDecimal.ZERO;
        BigDecimal refundedAmount = BigDecimal.ZERO;

        for (Payment payment : payments) {
            PaymentMethodBucket methodBucket = methodBuckets.computeIfAbsent(
                    payment.getMethod(),
                    PaymentMethodBucket::new
            );
            methodBucket.attempts++;

            if (payment.getStatus() == PaymentStatus.SUCCESS) {
                successCount++;
                successAmount = successAmount.add(safeAmount(payment.getAmount()));
                methodBucket.successCount++;
                methodBucket.successAmount = methodBucket.successAmount.add(safeAmount(payment.getAmount()));
            } else if (payment.getStatus() == PaymentStatus.PENDING) {
                pendingCount++;
            } else if (payment.getStatus() == PaymentStatus.FAILED) {
                failedCount++;
            } else if (payment.getStatus() == PaymentStatus.REFUNDED) {
                refundedCount++;
                refundedAmount = refundedAmount.add(safeAmount(payment.getRefundAmount()));
            }
        }

        return new PaymentAnalyticsResponse(
                payments.size(),
                successCount,
                pendingCount,
                failedCount,
                refundedCount,
                successAmount,
                refundedAmount,
                methodBuckets.values().stream()
                        .filter(bucket -> bucket.attempts > 0)
                        .map(PaymentMethodBucket::toResponse)
                        .toList()
        );
    }

    public PromotionAnalyticsResponse getPromotionAnalytics(LocalDate dateFrom, LocalDate dateTo, Integer limit) {
        DateRange range = normalizeRange(dateFrom, dateTo);
        int safeLimit = validateLimit(limit);
        List<PromotionUsage> usages = promotionUsageRepository.findByUsedAtGreaterThanEqualAndUsedAtLessThan(
                range.start(),
                range.endExclusive()
        );

        BigDecimal totalDiscountAmount = BigDecimal.ZERO;
        Map<Long, PromotionBucket> promotionBuckets = new HashMap<>();

        for (PromotionUsage usage : usages) {
            BigDecimal discountAmount = safeAmount(usage.getDiscountAmount());
            totalDiscountAmount = totalDiscountAmount.add(discountAmount);

            promotionBuckets.computeIfAbsent(
                            usage.getPromotion().getId(),
                            ignored -> new PromotionBucket(
                                    usage.getPromotion().getId(),
                                    usage.getPromotion().getCode(),
                                    usage.getPromotion().getName()
                            )
                    )
                    .addUsage(discountAmount);
        }

        return new PromotionAnalyticsResponse(
                usages.size(),
                totalDiscountAmount,
                promotionBuckets.values().stream()
                        .sorted(Comparator.comparing(PromotionBucket::discountAmount).reversed()
                                .thenComparing(Comparator.comparing(PromotionBucket::usedCount).reversed()))
                        .limit(safeLimit)
                        .map(PromotionBucket::toResponse)
                        .toList()
        );
    }

    private void applyBookingStats(Map<Long, TourStats> stats, List<Booking> bookings) {
        for (Booking booking : bookings) {
            TourStats tourStats = statsFor(stats, booking.getTour());
            tourStats.bookingCount++;
            tourStats.bookingIds.add(booking.getId());
            if (booking.getPaymentStatus() == BookingPaymentStatus.PAID) {
                tourStats.paidBookingIds.add(booking.getId());
            }
        }
    }

    private void applyRevenueStats(Map<Long, TourStats> stats, List<Payment> payments) {
        for (Payment payment : payments) {
            if (payment.getStatus() != PaymentStatus.SUCCESS) {
                continue;
            }
            TourStats tourStats = statsFor(stats, payment.getBooking().getTour());
            tourStats.revenue = tourStats.revenue.add(safeAmount(payment.getAmount()));
            tourStats.paidBookingIds.add(payment.getBooking().getId());
        }
    }

    private List<Payment> findRevenuePayments(DateRange range) {
        return paymentRepository.findRevenueAnalyticsPayments(
                PaymentStatus.SUCCESS,
                PaymentStatus.REFUNDED,
                range.start(),
                range.endExclusive()
        );
    }

    private void applyReviewStats(Map<Long, TourStats> stats, List<Review> reviews) {
        for (Review review : reviews) {
            TourStats tourStats = statsFor(stats, review.getTour());
            tourStats.ratingSum += review.getRating() == null ? 0 : review.getRating();
            tourStats.reviewCount++;
        }
    }

    private TourStats statsFor(Map<Long, TourStats> stats, Tour tour) {
        return stats.computeIfAbsent(tour.getId(), ignored -> new TourStats(tour));
    }

    private Comparator<TourStats> topTourComparator(TopTourMetric metric) {
        if (metric == TopTourMetric.REVENUE) {
            return Comparator.comparing(TourStats::revenue).reversed()
                    .thenComparing(Comparator.comparing(TourStats::bookingCount).reversed());
        }
        if (metric == TopTourMetric.BOOKINGS) {
            return Comparator.comparing(TourStats::bookingCount).reversed()
                    .thenComparing(Comparator.comparing(TourStats::revenue).reversed());
        }
        return Comparator.comparing(TourStats::averageRating).reversed()
                .thenComparing(Comparator.comparing(TourStats::reviewCount).reversed());
    }

    private DateRange normalizeRange(LocalDate dateFrom, LocalDate dateTo) {
        LocalDate normalizedTo = dateTo == null ? LocalDate.now() : dateTo;
        LocalDate normalizedFrom = dateFrom == null ? normalizedTo.minusDays(29) : dateFrom;

        if (normalizedTo.isBefore(normalizedFrom)) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Khoảng ngày không hợp lệ.");
        }

        return new DateRange(
                normalizedFrom,
                normalizedTo,
                normalizedFrom.atStartOfDay(),
                normalizedTo.plusDays(1).atStartOfDay()
        );
    }

    private RevenueGroupBy parseGroupBy(String groupBy) {
        if (groupBy == null || groupBy.isBlank()) {
            return RevenueGroupBy.DAY;
        }
        try {
            return RevenueGroupBy.valueOf(groupBy.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "groupBy chỉ hỗ trợ DAY hoặc MONTH.");
        }
    }

    private TopTourMetric parseMetric(String metric) {
        if (metric == null || metric.isBlank()) {
            return TopTourMetric.REVENUE;
        }
        try {
            return TopTourMetric.valueOf(metric.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "metric chỉ hỗ trợ REVENUE, BOOKINGS hoặc RATING.");
        }
    }

    private int validateLimit(Integer limit) {
        int safeLimit = limit == null ? DEFAULT_LIMIT : limit;
        if (safeLimit < 1) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "limit must be greater than or equal to 1.");
        }
        if (safeLimit > MAX_LIMIT) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "limit tối đa là 50.");
        }
        return safeLimit;
    }

    private Map<String, RevenueBucket> initRevenueBuckets(DateRange range, RevenueGroupBy groupBy) {
        Map<String, RevenueBucket> buckets = new LinkedHashMap<>();
        if (groupBy == RevenueGroupBy.DAY) {
            LocalDate current = range.from();
            while (!current.isAfter(range.to())) {
                buckets.put(current.format(DAY_LABEL), new RevenueBucket());
                current = current.plusDays(1);
            }
            return buckets;
        }

        YearMonth current = YearMonth.from(range.from());
        YearMonth end = YearMonth.from(range.to());
        while (!current.isAfter(end)) {
            buckets.put(current.format(MONTH_LABEL), new RevenueBucket());
            current = current.plusMonths(1);
        }
        return buckets;
    }

    private String revenueLabel(LocalDate date, RevenueGroupBy groupBy) {
        return groupBy == RevenueGroupBy.DAY
                ? date.format(DAY_LABEL)
                : YearMonth.from(date).format(MONTH_LABEL);
    }

    private long countBookingsByStatus(List<Booking> bookings, BookingStatus status) {
        return bookings.stream().filter(booking -> booking.getStatus() == status).count();
    }

    private long countBookingsByPaymentStatus(List<Booking> bookings, BookingPaymentStatus status) {
        return bookings.stream().filter(booking -> booking.getPaymentStatus() == status).count();
    }

    private double percentage(long numerator, long denominator) {
        if (denominator == 0) {
            return 0.0;
        }
        return BigDecimal.valueOf(numerator)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(denominator), 2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private double roundRating(double value) {
        return BigDecimal.valueOf(value).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }

    private BigDecimal safeAmount(BigDecimal amount) {
        return amount == null ? BigDecimal.ZERO : amount;
    }

    private enum RevenueGroupBy {
        DAY,
        MONTH
    }

    private enum TopTourMetric {
        REVENUE,
        BOOKINGS,
        RATING
    }

    private record DateRange(
            LocalDate from,
            LocalDate to,
            LocalDateTime start,
            LocalDateTime endExclusive
    ) {
    }

    private class TourStats {
        private final Tour tour;
        private final Set<Long> bookingIds = new HashSet<>();
        private final Set<Long> paidBookingIds = new HashSet<>();
        private long bookingCount;
        private BigDecimal revenue = BigDecimal.ZERO;
        private long reviewCount;
        private double ratingSum;

        private TourStats(Tour tour) {
            this.tour = tour;
        }

        private boolean hasMetric(TopTourMetric metric) {
            if (metric == TopTourMetric.REVENUE) {
                return revenue.compareTo(BigDecimal.ZERO) > 0;
            }
            if (metric == TopTourMetric.BOOKINGS) {
                return bookingCount > 0;
            }
            return reviewCount > 0;
        }

        private long bookingCount() {
            return bookingCount;
        }

        private long reviewCount() {
            return reviewCount;
        }

        private BigDecimal revenue() {
            return revenue;
        }

        private double averageRating() {
            if (reviewCount == 0) {
                return 0.0;
            }
            return roundRating(ratingSum / reviewCount);
        }

        private TopTourAnalyticsResponse toResponse() {
            return new TopTourAnalyticsResponse(
                    tour.getId(),
                    tour.getTitle(),
                    tour.getSlug(),
                    tour.getThumbnailUrl(),
                    tour.getDestination().getName(),
                    tour.getCategory().getName(),
                    bookingIds.size(),
                    paidBookingIds.size(),
                    revenue,
                    averageRating(),
                    reviewCount
            );
        }
    }

    private class RevenueBucket {
        private BigDecimal revenue = BigDecimal.ZERO;
        private BigDecimal refundAmount = BigDecimal.ZERO;
        private final Set<Long> paidBookingIds = new HashSet<>();

        private void addRevenue(BigDecimal amount, Long bookingId) {
            revenue = revenue.add(safeAmount(amount));
            if (bookingId != null) {
                paidBookingIds.add(bookingId);
            }
        }

        private void addRefund(BigDecimal amount) {
            refundAmount = refundAmount.add(safeAmount(amount));
        }

        private RevenuePointResponse toResponse(String label) {
            return new RevenuePointResponse(
                    label,
                    revenue,
                    paidBookingIds.size(),
                    refundAmount,
                    revenue.subtract(refundAmount)
            );
        }
    }

    private static class PaymentMethodBucket {
        private final PaymentMethod method;
        private long attempts;
        private long successCount;
        private BigDecimal successAmount = BigDecimal.ZERO;

        private PaymentMethodBucket(PaymentMethod method) {
            this.method = method;
        }

        private PaymentMethodStatsResponse toResponse() {
            return new PaymentMethodStatsResponse(method, attempts, successCount, successAmount);
        }
    }

    private static class PromotionBucket {
        private final Long promotionId;
        private final String code;
        private final String name;
        private long usedCount;
        private BigDecimal discountAmount = BigDecimal.ZERO;

        private PromotionBucket(Long promotionId, String code, String name) {
            this.promotionId = promotionId;
            this.code = code;
            this.name = name;
        }

        private void addUsage(BigDecimal amount) {
            usedCount++;
            discountAmount = discountAmount.add(amount == null ? BigDecimal.ZERO : amount);
        }

        private long usedCount() {
            return usedCount;
        }

        private BigDecimal discountAmount() {
            return discountAmount;
        }

        private PromotionUsageStatsResponse toResponse() {
            return new PromotionUsageStatsResponse(
                    promotionId,
                    code,
                    name,
                    usedCount,
                    discountAmount
            );
        }
    }
}
