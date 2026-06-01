package com.voyageviet.backend.review.service;

import com.voyageviet.backend.booking.entity.BookingStatus;
import com.voyageviet.backend.booking.repository.BookingRepository;
import com.voyageviet.backend.common.exception.BusinessException;
import com.voyageviet.backend.common.exception.ErrorCode;
import com.voyageviet.backend.feature.entity.FeatureCode;
import com.voyageviet.backend.feature.service.FeatureGuardService;
import com.voyageviet.backend.review.dto.ReviewCreateRequest;
import com.voyageviet.backend.review.dto.ReviewResponse;
import com.voyageviet.backend.review.entity.Review;
import com.voyageviet.backend.review.entity.ReviewStatus;
import com.voyageviet.backend.review.repository.ReviewRepository;
import com.voyageviet.backend.tour.entity.Tour;
import com.voyageviet.backend.tour.entity.TourStatus;
import com.voyageviet.backend.tour.repository.TourRepository;
import com.voyageviet.backend.user.entity.User;
import com.voyageviet.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.voyageviet.backend.common.paging.PageResponse;
import com.voyageviet.backend.review.dto.ReviewStatusUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Set;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final TourRepository tourRepository;
    private final UserRepository userRepository;
    private final FeatureGuardService featureGuardService;

    public List<ReviewResponse> getPublicReviewsByTourSlug(String tourSlug) {
        return reviewRepository.findByTourSlugAndStatus(
                        tourSlug,
                        ReviewStatus.ACTIVE,
                        Sort.by(Sort.Direction.DESC, "createdAt", "id")
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ReviewResponse> getPublicReviewsByTourId(Long tourId) {
        return reviewRepository.findByTourIdAndStatus(
                        tourId,
                        ReviewStatus.ACTIVE,
                        Sort.by(Sort.Direction.DESC, "createdAt", "id")
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ReviewResponse createReview(Authentication authentication, ReviewCreateRequest request) {
        featureGuardService.requireEnabled(
                FeatureCode.PUBLIC_REVIEW,
                "Review feature is currently disabled"
        );

        User user = getCurrentUser(authentication);

        Tour tour = tourRepository.findById(request.tourId())
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.TOUR_NOT_FOUND,
                        "Tour not found"
                ));

        if (tour.getStatus() != TourStatus.PUBLISHED) {
            throw new BusinessException(
                    ErrorCode.REVIEW_NOT_ALLOWED,
                    "Only published tours can be reviewed"
            );
        }

        boolean hasCompletedBooking = bookingRepository.existsByUserIdAndTourIdAndStatus(
                user.getId(),
                tour.getId(),
                BookingStatus.COMPLETED
        );

        if (!hasCompletedBooking) {
            throw new BusinessException(
                    ErrorCode.REVIEW_NOT_ALLOWED,
                    "You can only review a tour after completing a booking"
            );
        }

        if (reviewRepository.existsByUserIdAndTourId(user.getId(), tour.getId())) {
            throw new BusinessException(
                    ErrorCode.REVIEW_ALREADY_EXISTS,
                    "You have already reviewed this tour"
            );
        }

        Review review = Review.builder()
                .user(user)
                .tour(tour)
                .rating(request.rating())
                .comment(trimToNull(request.comment()))
                .status(ReviewStatus.ACTIVE)
                .build();

        return toResponse(reviewRepository.save(review));
    }

    public PageResponse<ReviewResponse> getAllReviewsForAdmin(
            ReviewStatus status,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        Pageable pageable = buildPageable(page, size, sortBy, sortDir);

        Page<Review> reviewPage = status == null
                ? reviewRepository.findAll(pageable)
                : reviewRepository.findByStatus(status, pageable);

        return PageResponse.from(reviewPage, this::toResponse);
    }

    @Transactional
    public ReviewResponse updateReviewStatus(Long id, ReviewStatusUpdateRequest request) {
        Review review = reviewRepository.findByIdWithUserAndTour(id)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.REVIEW_NOT_FOUND,
                        "Review not found"
                ));

        review.setStatus(request.status());

        return toResponse(reviewRepository.save(review));
    }

    @Transactional
    public void deleteReview(Long id) {
        Review review = reviewRepository.findByIdWithUserAndTour(id)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.REVIEW_NOT_FOUND,
                        "Review not found"
                ));

        reviewRepository.delete(review);
    }

    private Pageable buildPageable(int page, int size, String sortBy, String sortDir) {
        if (page < 0) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Page index must be greater than or equal to 0"
            );
        }

        if (size < 1 || size > 50) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Page size must be between 1 and 50"
            );
        }

        String safeSortBy = resolveSortBy(sortBy);

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.ASC
                : "desc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.DESC
                : null;

        if (direction == null) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Sort direction must be either asc or desc"
            );
        }

        return PageRequest.of(page, size, Sort.by(direction, safeSortBy));
    }

    private String resolveSortBy(String sortBy) {
        Set<String> allowedSortFields = Set.of(
                "createdAt",
                "updatedAt",
                "id",
                "rating",
                "status"
        );

        if (sortBy == null || sortBy.isBlank()) {
            return "createdAt";
        }

        if (!allowedSortFields.contains(sortBy)) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Invalid sort field. Allowed fields: " + String.join(", ", allowedSortFields)
            );
        }

        return sortBy;
    }

    private User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();

        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.USER_NOT_FOUND,
                        "Current user not found"
                ));
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private ReviewResponse toResponse(Review review) {
        return new ReviewResponse(
                review.getId(),

                review.getUser().getId(),
                review.getUser().getFullName(),
                review.getUser().getAvatarUrl(),

                review.getTour().getId(),
                review.getTour().getTitle(),
                review.getTour().getSlug(),

                review.getRating(),
                review.getComment(),
                review.getStatus(),

                review.getCreatedAt(),
                review.getUpdatedAt()
        );
    }
}