package com.voyageviet.backend.wishlist.service;

import com.voyageviet.backend.common.exception.BusinessException;
import com.voyageviet.backend.common.exception.ErrorCode;
import com.voyageviet.backend.common.paging.PageResponse;
import com.voyageviet.backend.review.entity.ReviewStatus;
import com.voyageviet.backend.review.repository.ReviewRepository;
import com.voyageviet.backend.tour.entity.Tour;
import com.voyageviet.backend.tour.entity.TourSchedule;
import com.voyageviet.backend.tour.entity.TourScheduleStatus;
import com.voyageviet.backend.tour.entity.TourStatus;
import com.voyageviet.backend.tour.repository.TourRepository;
import com.voyageviet.backend.tour.repository.TourScheduleRepository;
import com.voyageviet.backend.user.entity.User;
import com.voyageviet.backend.user.repository.UserRepository;
import com.voyageviet.backend.wishlist.dto.WishlistToggleResponse;
import com.voyageviet.backend.wishlist.dto.WishlistTourResponse;
import com.voyageviet.backend.wishlist.entity.Wishlist;
import com.voyageviet.backend.wishlist.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final TourRepository tourRepository;
    private final TourScheduleRepository tourScheduleRepository;
    private final ReviewRepository reviewRepository;

    public PageResponse<WishlistTourResponse> getMyWishlist(
            Authentication authentication,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        User user = getCurrentUser(authentication);
        Pageable pageable = buildPageable(page, size, sortBy, sortDir);
        Page<Wishlist> wishlistPage = wishlistRepository.findByUserIdAndTourStatus(user.getId(), TourStatus.PUBLISHED, pageable);
        return PageResponse.from(wishlistPage, this::toResponse);
    }

    @Transactional
    public WishlistToggleResponse toggleWishlist(Authentication authentication, Long tourId) {
        User user = getCurrentUser(authentication);
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TOUR_NOT_FOUND, "Tour không tồn tại."));

        if (tour.getStatus() != TourStatus.PUBLISHED) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Tour hiện không khả dụng.");
        }

        return wishlistRepository.findByUserIdAndTourId(user.getId(), tourId)
                .map(existing -> {
                    wishlistRepository.delete(existing);
                    return new WishlistToggleResponse(false);
                })
                .orElseGet(() -> {
                    try {
                        wishlistRepository.save(Wishlist.builder()
                                .user(user)
                                .tour(tour)
                                .build());
                        return new WishlistToggleResponse(true);
                    } catch (DataIntegrityViolationException ex) {
                        return new WishlistToggleResponse(true);
                    }
                });
    }

    private WishlistTourResponse toResponse(Wishlist wishlist) {
        Tour tour = wishlist.getTour();
        Double rating = reviewRepository.averageRatingByTourIdAndStatus(tour.getId(), ReviewStatus.ACTIVE);
        if (rating != null) {
            rating = Math.round(rating * 10.0) / 10.0;
        }

        return new WishlistTourResponse(
                tour.getId(),
                tour.getTitle(),
                tour.getSlug(),
                tour.getThumbnailUrl(),
                tour.getDestination().getName(),
                tour.getCategory().getName(),
                tour.getOriginalPrice(),
                tour.getSalePrice(),
                resolveMinPrice(tour),
                tour.getDurationDays(),
                tour.getDurationNights(),
                rating == null ? 0.0 : rating,
                tour.getStatus(),
                true
        );
    }

    private BigDecimal resolveMinPrice(Tour tour) {
        List<TourSchedule> schedules = tourScheduleRepository.findByTourSlugAndStatusAndDepartureDateGreaterThanEqual(
                tour.getSlug(),
                TourScheduleStatus.OPEN,
                LocalDate.now(),
                Sort.by(Sort.Direction.ASC, "priceAdult")
        );
        return schedules.stream()
                .map(TourSchedule::getPriceAdult)
                .filter(price -> price != null && price.compareTo(BigDecimal.ZERO) > 0)
                .min(BigDecimal::compareTo)
                .orElse(null);
    }

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "Current user not found"));
    }

    private Pageable buildPageable(int page, int size, String sortBy, String sortDir) {
        if (page < 0) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Page index must be greater than or equal to 0");
        }
        if (size < 1 || size > 50) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Page size must be between 1 and 50");
        }
        Set<String> allowedSortFields = Set.of("createdAt", "id");
        String safeSortBy = sortBy == null || sortBy.isBlank() ? "createdAt" : sortBy;
        if (!allowedSortFields.contains(safeSortBy)) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Invalid sort field. Allowed fields: " + String.join(", ", allowedSortFields));
        }
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.ASC
                : "desc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.DESC
                : null;
        if (direction == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Sort direction must be either asc or desc");
        }
        return PageRequest.of(page, size, Sort.by(direction, safeSortBy));
    }
}
