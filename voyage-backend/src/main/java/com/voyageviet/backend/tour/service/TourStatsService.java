package com.voyageviet.backend.tour.service;

import com.voyageviet.backend.common.exception.BusinessException;
import com.voyageviet.backend.common.exception.ErrorCode;
import com.voyageviet.backend.review.entity.ReviewStatus;
import com.voyageviet.backend.review.repository.ReviewRepository;
import com.voyageviet.backend.tour.entity.Tour;
import com.voyageviet.backend.tour.entity.TourScheduleStatus;
import com.voyageviet.backend.tour.repository.TourRepository;
import com.voyageviet.backend.tour.repository.TourScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class TourStatsService {

    private final TourRepository tourRepository;
    private final TourScheduleRepository tourScheduleRepository;
    private final ReviewRepository reviewRepository;

    @Transactional
    public void recomputeMinPrice(Long tourId) {
        try {
            Tour tour = findTour(tourId);
            BigDecimal minPrice = tourScheduleRepository.findMinPriceAdultByTourIdAndStatusFromDate(
                    tourId,
                    TourScheduleStatus.OPEN,
                    LocalDate.now()
            );
            tour.setMinPrice(minPrice);
        } catch (BusinessException ex) {
            throw ex;
        } catch (RuntimeException ex) {
            throw new BusinessException(
                    ErrorCode.INTERNAL_ERROR,
                    "Không thể tính giá thấp nhất của tour."
            );
        }
    }

    @Transactional
    public void recomputeRatingSummary(Long tourId) {
        try {
            Tour tour = findTour(tourId);
            Long totalReviews = reviewRepository.countByTourIdAndStatus(tourId, ReviewStatus.ACTIVE);
            Double averageRating = reviewRepository.averageRatingByTourIdAndStatus(tourId, ReviewStatus.ACTIVE);

            tour.setTotalReviews(Math.toIntExact(totalReviews == null ? 0L : totalReviews));
            tour.setAvgRating(averageRating == null
                    ? BigDecimal.ZERO
                    : BigDecimal.valueOf(averageRating).setScale(1, RoundingMode.HALF_UP));
        } catch (BusinessException ex) {
            throw ex;
        } catch (RuntimeException ex) {
            throw new BusinessException(
                    ErrorCode.INTERNAL_ERROR,
                    "Không thể tính điểm đánh giá của tour."
            );
        }
    }

    private Tour findTour(Long tourId) {
        return tourRepository.findById(tourId)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.TOUR_NOT_FOUND,
                        "Tour không tồn tại."
                ));
    }
}
