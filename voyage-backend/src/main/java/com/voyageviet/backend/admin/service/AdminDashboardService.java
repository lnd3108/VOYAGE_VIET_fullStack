package com.voyageviet.backend.admin.service;

import com.voyageviet.backend.admin.dto.*;
import com.voyageviet.backend.booking.entity.BookingStatus;
import com.voyageviet.backend.booking.repository.BookingRepository;
import com.voyageviet.backend.booking.repository.projection.BookingStatusCountProjection;
import com.voyageviet.backend.booking.repository.projection.MonthlyBookingRevenueProjection;
import com.voyageviet.backend.category.entity.CategoryStatus;
import com.voyageviet.backend.category.repository.CategoryRepository;
import com.voyageviet.backend.common.exception.BusinessException;
import com.voyageviet.backend.common.exception.ErrorCode;
import com.voyageviet.backend.destination.entity.DestinationStatus;
import com.voyageviet.backend.destination.repository.DestinationRepository;
import com.voyageviet.backend.review.entity.ReviewStatus;
import com.voyageviet.backend.review.repository.ReviewRepository;
import com.voyageviet.backend.review.repository.projection.AdminTopRatedTourProjection;
import com.voyageviet.backend.tour.entity.TourStatus;
import com.voyageviet.backend.tour.repository.TourRepository;
import com.voyageviet.backend.user.entity.UserStatus;
import com.voyageviet.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final TourRepository tourRepository;
    private final CategoryRepository categoryRepository;
    private final DestinationRepository destinationRepository;
    private final BookingRepository bookingRepository;

    private final ReviewRepository reviewRepository;

    public AdminDashboardSummaryResponse getSummary() {
        Map<BookingStatus, Long> bookingStatusMap = getBookingStatusMap();

        long pendingBookings = bookingStatusMap.get(BookingStatus.PENDING);
        long confirmedBookings = bookingStatusMap.get(BookingStatus.CONFIRMED);
        long cancelledBookings = bookingStatusMap.get(BookingStatus.CANCELLED);
        long completedBookings = bookingStatusMap.get(BookingStatus.COMPLETED);

        List<BookingStatusSummaryResponse> bookingStatusSummary = Arrays.stream(BookingStatus.values())
                .map(status -> new BookingStatusSummaryResponse(
                        status,
                        bookingStatusMap.get(status)
                ))
                .toList();

        return new AdminDashboardSummaryResponse(
                userRepository.count(),
                userRepository.countByStatus(UserStatus.ACTIVE),
                userRepository.countByStatus(UserStatus.BANNED),

                tourRepository.count(),
                tourRepository.countByStatus(TourStatus.PUBLISHED),
                tourRepository.countByStatus(TourStatus.DRAFT),
                tourRepository.countByStatus(TourStatus.INACTIVE),
                tourRepository.countByStatus(TourStatus.SOLD_OUT),

                categoryRepository.count(),
                categoryRepository.countByStatus(CategoryStatus.ACTIVE),

                destinationRepository.count(),
                destinationRepository.countByStatus(DestinationStatus.ACTIVE),

                bookingRepository.count(),
                pendingBookings,
                confirmedBookings,
                cancelledBookings,
                completedBookings,

                safeAmount(bookingRepository.sumTotalAmountByStatus(BookingStatus.CONFIRMED)),
                safeAmount(bookingRepository.sumTotalAmountByStatus(BookingStatus.COMPLETED)),

                bookingStatusSummary
        );
    }

    public List<MonthlyDashboardResponse> getMonthlyDashboard(Integer year) {
        int targetYear = year == null ? Year.now().getValue() : year;

        if (targetYear < 2000 || targetYear > 2100) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Year must be between 2000 and 2100"
            );
        }

        LocalDateTime startDate = LocalDate.of(targetYear, 1, 1).atStartOfDay();
        LocalDateTime endDate = LocalDate.of(targetYear + 1, 1, 1).atStartOfDay();

        List<MonthlyBookingRevenueProjection> rows =
                bookingRepository.getMonthlyBookingRevenue(startDate, endDate);

        Map<String, MonthlyBookingRevenueProjection> rowMap = new HashMap<>();

        rows.forEach(row -> rowMap.put(row.getPeriod(), row));

        return java.util.stream.IntStream.rangeClosed(1, 12)
                .mapToObj(month -> {
                    String period = String.format("%d-%02d", targetYear, month);
                    MonthlyBookingRevenueProjection row = rowMap.get(period);

                    if (row == null) {
                        return new MonthlyDashboardResponse(
                                period,
                                month,
                                0L,
                                BigDecimal.ZERO,
                                BigDecimal.ZERO
                        );
                    }

                    return new MonthlyDashboardResponse(
                            period,
                            month,
                            row.getTotalBookings() == null ? 0L : row.getTotalBookings(),
                            safeAmount(row.getConfirmedRevenue()),
                            safeAmount(row.getCompletedRevenue())
                    );
                })
                .toList();
    }

    public ReviewDashboardSummaryResponse getReviewSummary(Integer limit) {
        int safeLimit = limit == null ? 5 : limit;

        if (safeLimit < 1 || safeLimit > 20) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Limit must be between 1 and 20"
            );
        }

        long activeReviews = reviewRepository.countByStatus(ReviewStatus.ACTIVE);
        long hiddenReviews = reviewRepository.countByStatus(ReviewStatus.HIDDEN);

        Double averageRating = reviewRepository.averageRatingByStatus(ReviewStatus.ACTIVE);

        List<TopRatedTourResponse> topRatedTours = reviewRepository.findTopRatedTours(
                        ReviewStatus.ACTIVE,
                        PageRequest.of(0, safeLimit)
                )
                .stream()
                .map(this::toTopRatedTourResponse)
                .toList();

        return new ReviewDashboardSummaryResponse(
                reviewRepository.count(),
                activeReviews,
                hiddenReviews,
                roundRating(averageRating),
                topRatedTours
        );
    }

    private TopRatedTourResponse toTopRatedTourResponse(AdminTopRatedTourProjection projection) {
        return new TopRatedTourResponse(
                projection.getTourId(),
                projection.getTourTitle(),
                projection.getTourSlug(),
                projection.getReviewCount() == null ? 0L : projection.getReviewCount(),
                roundRating(projection.getAverageRating())
        );
    }

    private Double roundRating(Double value) {
        if (value == null) {
            return 0.0;
        }

        return Math.round(value * 10.0) / 10.0;
    }

    private Map<BookingStatus, Long> getBookingStatusMap() {
        Map<BookingStatus, Long> result = new EnumMap<>(BookingStatus.class);

        Arrays.stream(BookingStatus.values())
                .forEach(status -> result.put(status, 0L));

        List<BookingStatusCountProjection> rows = bookingRepository.countBookingsGroupByStatus();

        rows.forEach(row -> result.put(
                row.getStatus(),
                row.getTotal() == null ? 0L : row.getTotal()
        ));

        return result;
    }

    private BigDecimal safeAmount(BigDecimal amount) {
        return amount == null ? BigDecimal.ZERO : amount;
    }
}