package com.voyageviet.backend.tour.service;

import com.voyageviet.backend.category.entity.Category;
import com.voyageviet.backend.category.repository.CategoryRepository;
import com.voyageviet.backend.common.exception.BusinessException;
import com.voyageviet.backend.common.exception.ErrorCode;
import com.voyageviet.backend.common.paging.PageResponse;
import com.voyageviet.backend.common.util.SlugUtils;
import com.voyageviet.backend.destination.entity.Destination;
import com.voyageviet.backend.destination.repository.DestinationRepository;
import com.voyageviet.backend.media.dto.ImageUrlUpdateRequest;
import com.voyageviet.backend.review.entity.ReviewStatus;
import com.voyageviet.backend.review.repository.ReviewRepository;
import com.voyageviet.backend.review.repository.projection.TourReviewSummaryProjection;
import com.voyageviet.backend.tour.dto.*;
import com.voyageviet.backend.tour.entity.Tour;
import com.voyageviet.backend.tour.entity.TourStatus;
import com.voyageviet.backend.tour.repository.TourRepository;
import com.voyageviet.backend.tour.repository.specification.TourSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TourService {

    private final TourRepository tourRepository;
    private final CategoryRepository categoryRepository;
    private final DestinationRepository destinationRepository;

    private final ReviewRepository reviewRepository;

    public List<TourCardResponse> getFeaturedTours() {
        List<Tour> tours = tourRepository.findTop6ByFeaturedTrueAndStatusOrderByCreatedAtDesc(TourStatus.PUBLISHED);
        Map<Long, TourReviewSummaryProjection> reviewSummaryMap = getReviewSummaryMap(tours);

        return tours.stream()
                .map(tour -> toCardResponse(tour, reviewSummaryMap))
                .toList();
    }

    public List<TourCardResponse> getAllToursForAdmin() {
        List<Tour> tours = tourRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        Map<Long, TourReviewSummaryProjection> reviewSummaryMap = getReviewSummaryMap(tours);

        return tours.stream()
                .map(tour -> toCardResponse(tour, reviewSummaryMap))
                .toList();
    }

    @Transactional
    public TourCardResponse createTour(TourCreateRequest request) {
        String slug = buildSlug(request.title(), request.slug());

        if (tourRepository.existsBySlug(slug)) {
            throw new BusinessException(
                    ErrorCode.TOUR_ALREADY_EXISTS,
                    "Tour slug already exists"
            );
        }

        validatePrice(request.originalPrice(), request.salePrice());
        validateSeats(request.maxParticipants(), request.availableSeats());

        Category category = findCategoryById(request.categoryId());
        Destination destination = findDestinationById(request.destinationId());

        Tour tour = Tour.builder()
                .title(request.title().trim())
                .slug(slug)
                .shortDescription(trimToNull(request.shortDescription()))
                .description(trimToNull(request.description()))
                .thumbnailUrl(trimToNull(request.thumbnailUrl()))
                .originalPrice(request.originalPrice())
                .salePrice(request.salePrice())
                .durationDays(request.durationDays())
                .durationNights(request.durationNights() == null ? 0 : request.durationNights())
                .departureLocation(trimToNull(request.departureLocation()))
                .maxParticipants(request.maxParticipants() == null ? 0 : request.maxParticipants())
                .availableSeats(request.availableSeats() == null ? 0 : request.availableSeats())
                .featured(request.featured() != null && request.featured())
                .status(request.status() == null ? TourStatus.DRAFT : request.status())
                .category(category)
                .destination(destination)
                .build();

        return toCardResponse(tourRepository.save(tour));
    }

    @Transactional
    public TourCardResponse updateTour(Long id, TourUpdateRequest request) {
        Tour tour = findTourById(id);

        String slug = buildSlug(request.title(), request.slug());

        if (tourRepository.existsBySlugAndIdNot(slug, id)) {
            throw new BusinessException(
                    ErrorCode.TOUR_ALREADY_EXISTS,
                    "Tour slug already exists"
            );
        }

        validatePrice(request.originalPrice(), request.salePrice());
        validateSeats(request.maxParticipants(), request.availableSeats());

        Category category = findCategoryById(request.categoryId());
        Destination destination = findDestinationById(request.destinationId());

        tour.setTitle(request.title().trim());
        tour.setSlug(slug);
        tour.setShortDescription(trimToNull(request.shortDescription()));
        tour.setDescription(trimToNull(request.description()));
        tour.setThumbnailUrl(trimToNull(request.thumbnailUrl()));
        tour.setOriginalPrice(request.originalPrice());
        tour.setSalePrice(request.salePrice());
        tour.setDurationDays(request.durationDays());
        tour.setDurationNights(request.durationNights() == null ? 0 : request.durationNights());
        tour.setDepartureLocation(trimToNull(request.departureLocation()));
        tour.setMaxParticipants(request.maxParticipants() == null ? 0 : request.maxParticipants());
        tour.setAvailableSeats(request.availableSeats() == null ? 0 : request.availableSeats());
        tour.setFeatured(request.featured() != null && request.featured());
        tour.setStatus(request.status() == null ? tour.getStatus() : request.status());
        tour.setCategory(category);
        tour.setDestination(destination);

        return toCardResponse(tourRepository.save(tour));
    }

    @Transactional
    public TourCardResponse updateTourStatus(Long id, TourStatusUpdateRequest request) {
        Tour tour = findTourById(id);
        tour.setStatus(request.status());

        return toCardResponse(tourRepository.save(tour));
    }

    @Transactional
    public void deleteTour(Long id) {
        Tour tour = findTourById(id);
        tourRepository.delete(tour);
    }

    @Transactional
    public TourCardResponse updateTourThumbnail(Long id, ImageUrlUpdateRequest request) {
        Tour tour = findTourById(id);

        tour.setThumbnailUrl(request.imageUrl().trim());

        return toCardResponse(tourRepository.save(tour));
    }

    public PageResponse<TourCardResponse> getPublicTours(
            String keyword,
            String categorySlug,
            String destinationSlug,
            String region,
            String departureLocation,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer minDurationDays,
            Integer maxDurationDays,
            Integer people,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        TourSearchCriteria criteria = new TourSearchCriteria(
                keyword,
                categorySlug,
                destinationSlug,
                region,
                departureLocation,
                minPrice,
                maxPrice,
                minDurationDays,
                maxDurationDays,
                people,
                sortBy,
                sortDir
        );

        validatePublicTourSearchCriteria(criteria);

        Pageable pageable = buildSearchPageable(page, size);

        Page<Tour> tourPage = tourRepository.findAll(
                TourSpecification.publicSearch(criteria),
                pageable
        );

        Map<Long, TourReviewSummaryProjection> reviewSummaryMap =
                getReviewSummaryMap(tourPage.getContent());

        return PageResponse.from(
                tourPage,
                tour -> toCardResponse(tour, reviewSummaryMap)
        );
    }

    public TourDetailResponse getPublicTourDetail(String slug) {
        Tour tour = tourRepository.findBySlugAndStatus(slug, TourStatus.PUBLISHED)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.TOUR_NOT_FOUND,
                        "Tour not found"
                ));

        return toDetailResponse(tour);
    }

    private Pageable buildSearchPageable(int page, int size) {
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

        return PageRequest.of(page, size);
    }

    private void validatePublicTourSearchCriteria(TourSearchCriteria criteria) {
        if (criteria.minPrice() != null && criteria.minPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Min price must be greater than or equal to 0"
            );
        }

        if (criteria.maxPrice() != null && criteria.maxPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Max price must be greater than or equal to 0"
            );
        }

        if (
                criteria.minPrice() != null
                        && criteria.maxPrice() != null
                        && criteria.minPrice().compareTo(criteria.maxPrice()) > 0
        ) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Min price must be less than or equal to max price"
            );
        }

        if (criteria.minDurationDays() != null && criteria.minDurationDays() < 1) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Min duration days must be greater than or equal to 1"
            );
        }

        if (criteria.maxDurationDays() != null && criteria.maxDurationDays() < 1) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Max duration days must be greater than or equal to 1"
            );
        }

        if (
                criteria.minDurationDays() != null
                        && criteria.maxDurationDays() != null
                        && criteria.minDurationDays() > criteria.maxDurationDays()
        ) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Min duration days must be less than or equal to max duration days"
            );
        }

        if (criteria.people() != null && criteria.people() < 1) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "People must be greater than or equal to 1"
            );
        }

        validatePublicTourSort(criteria.sortBy(), criteria.sortDir());
    }

    private void validatePublicTourSort(String sortBy, String sortDir) {
        Set<String> allowedSortFields = Set.of(
                "createdAt",
                "effectivePrice",
                "originalPrice",
                "salePrice",
                "durationDays",
                "availableSeats",
                "id"
        );

        String safeSortBy = sortBy == null || sortBy.isBlank()
                ? "createdAt"
                : sortBy.trim();

        if (!allowedSortFields.contains(safeSortBy)) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Invalid sort field. Allowed fields: " + String.join(", ", allowedSortFields)
            );
        }

        String safeSortDir = sortDir == null || sortDir.isBlank()
                ? "desc"
                : sortDir.trim();

        if (!"asc".equalsIgnoreCase(safeSortDir) && !"desc".equalsIgnoreCase(safeSortDir)) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Sort direction must be either asc or desc"
            );
        }
    }

    private Map<Long, TourReviewSummaryProjection> getReviewSummaryMap(List<Tour> tours) {
        if (tours == null || tours.isEmpty()) {
            return Map.of();
        }

        List<Long> tourIds = tours.stream()
                .map(Tour::getId)
                .toList();

        List<TourReviewSummaryProjection> summaries =
                reviewRepository.summarizeByTourIdsAndStatus(tourIds, ReviewStatus.ACTIVE);

        Map<Long, TourReviewSummaryProjection> result = new HashMap<>();

        summaries.forEach(summary -> result.put(summary.getTourId(), summary));

        return result;
    }

    private TourCardResponse toCardResponse(
            Tour tour,
            Map<Long, TourReviewSummaryProjection> reviewSummaryMap
    ) {
        TourReviewSummaryProjection summary = reviewSummaryMap.get(tour.getId());

        Double averageRating = summary == null || summary.getAverageRating() == null
                ? 0.0
                : Math.round(summary.getAverageRating() * 10.0) / 10.0;

        Long reviewCount = summary == null || summary.getReviewCount() == null
                ? 0L
                : summary.getReviewCount();

        return new TourCardResponse(
                tour.getId(),
                tour.getTitle(),
                tour.getSlug(),
                tour.getShortDescription(),
                tour.getThumbnailUrl(),
                tour.getOriginalPrice(),
                tour.getSalePrice(),
                tour.getDurationDays(),
                tour.getDurationNights(),
                tour.getDepartureLocation(),
                tour.getAvailableSeats(),
                tour.getFeatured(),
                tour.getStatus(),
                tour.getCategory().getName(),
                tour.getCategory().getSlug(),
                tour.getDestination().getName(),
                tour.getDestination().getSlug(),
                tour.getDestination().getRegion(),
                averageRating,
                reviewCount
        );
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
                "originalPrice",
                "salePrice",
                "durationDays",
                "availableSeats",
                "id"
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

    private TourDetailResponse toDetailResponse(Tour tour) {
        return new TourDetailResponse(
                tour.getId(),
                tour.getTitle(),
                tour.getSlug(),
                tour.getShortDescription(),
                tour.getDescription(),
                tour.getThumbnailUrl(),
                tour.getOriginalPrice(),
                tour.getSalePrice(),
                tour.getDurationDays(),
                tour.getDurationNights(),
                tour.getDepartureLocation(),
                tour.getMaxParticipants(),
                tour.getAvailableSeats(),
                tour.getFeatured(),
                tour.getStatus(),

                getAverageRating(tour.getId()),
                getReviewCount(tour.getId()),

                tour.getCategory().getId(),
                tour.getCategory().getName(),
                tour.getCategory().getSlug(),

                tour.getDestination().getId(),
                tour.getDestination().getName(),
                tour.getDestination().getSlug(),
                tour.getDestination().getRegion(),
                tour.getDestination().getCountry(),

                tour.getCreatedAt(),
                tour.getUpdatedAt()
        );
    }

    private Tour findTourById(Long id) {
        return tourRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.TOUR_NOT_FOUND,
                        "Tour not found"
                ));
    }

    private Category findCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.CATEGORY_NOT_FOUND,
                        "Category not found"
                ));
    }

    private Destination findDestinationById(Long id) {
        return destinationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.DESTINATION_NOT_FOUND,
                        "Destination not found"
                ));
    }

    private void validatePrice(BigDecimal originalPrice, BigDecimal salePrice) {
        if (salePrice == null) {
            return;
        }

        if (salePrice.compareTo(originalPrice) > 0) {
            throw new BusinessException(
                    ErrorCode.TOUR_INVALID_PRICE,
                    "Sale price must be less than or equal to original price"
            );
        }
    }

    private void validateSeats(Integer maxParticipants, Integer availableSeats) {
        if (maxParticipants == null || availableSeats == null) {
            return;
        }

        if (availableSeats > maxParticipants) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Available seats must be less than or equal to max participants"
            );
        }
    }

    private String buildSlug(String title, String customSlug) {
        String rawSlug = customSlug == null || customSlug.isBlank()
                ? title
                : customSlug;

        return SlugUtils.toSlug(rawSlug);
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private Double getAverageRating(Long tourId) {
        Double averageRating = reviewRepository.averageRatingByTourIdAndStatus(
                tourId,
                ReviewStatus.ACTIVE
        );

        if (averageRating == null) {
            return 0.0;
        }

        return Math.round(averageRating * 10.0) / 10.0;
    }

    private Long getReviewCount(Long tourId) {
        return reviewRepository.countByTourIdAndStatus(
                tourId,
                ReviewStatus.ACTIVE
        );
    }

    private TourCardResponse toCardResponse(Tour tour) {
        return new TourCardResponse(
                tour.getId(),
                tour.getTitle(),
                tour.getSlug(),
                tour.getShortDescription(),
                tour.getThumbnailUrl(),
                tour.getOriginalPrice(),
                tour.getSalePrice(),
                tour.getDurationDays(),
                tour.getDurationNights(),
                tour.getDepartureLocation(),
                tour.getAvailableSeats(),
                tour.getFeatured(),
                tour.getStatus(),
                tour.getCategory().getName(),
                tour.getCategory().getSlug(),
                tour.getDestination().getName(),
                tour.getDestination().getSlug(),
                tour.getDestination().getRegion(),
                getAverageRating(tour.getId()),
                getReviewCount(tour.getId())
        );
    }
}