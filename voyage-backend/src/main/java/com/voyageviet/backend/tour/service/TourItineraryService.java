package com.voyageviet.backend.tour.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voyageviet.backend.common.exception.BusinessException;
import com.voyageviet.backend.common.exception.ErrorCode;
import com.voyageviet.backend.tour.dto.*;
import com.voyageviet.backend.tour.entity.Tour;
import com.voyageviet.backend.tour.entity.TourItinerary;
import com.voyageviet.backend.tour.entity.TourStatus;
import com.voyageviet.backend.tour.repository.TourItineraryRepository;
import com.voyageviet.backend.tour.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TourItineraryService {

    private static final TypeReference<List<String>> STRING_LIST = new TypeReference<>() {
    };

    private final TourRepository tourRepository;
    private final TourItineraryRepository itineraryRepository;
    private final ObjectMapper objectMapper;

    public List<TourItineraryResponse> getAdminItineraries(Long tourId) {
        findTour(tourId);
        return itineraryRepository.findByTourIdOrderByDayNumberAscSortOrderAsc(tourId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<TourItineraryResponse> saveAllItineraries(Long tourId, TourItinerarySaveRequest request) {
        Tour tour = findTour(tourId);
        validateNoDuplicateDayNumber(request.items());

        itineraryRepository.deleteByTourId(tourId);
        itineraryRepository.flush();
        if (request.items().isEmpty()) {
            return List.of();
        }

        List<TourItinerary> saved = itineraryRepository.saveAll(
                request.items().stream()
                        .map(item -> toEntity(tour, item))
                        .toList()
        );

        return saved.stream()
                .sorted(Comparator.comparing(TourItinerary::getDayNumber).thenComparing(TourItinerary::getSortOrder))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<TourItineraryResponse> reorder(Long tourId, TourItineraryReorderRequest request) {
        List<TourItinerary> existing = itineraryRepository.findByTourIdOrderByDayNumberAscSortOrderAsc(tourId);
        Map<Long, TourItinerary> byId = new HashMap<>();
        existing.forEach(item -> byId.put(item.getId(), item));

        for (TourItineraryReorderRequest.Item item : request.items()) {
            TourItinerary itinerary = byId.get(item.id());
            if (itinerary == null) {
                throw new BusinessException(ErrorCode.TOUR_ITINERARY_INVALID, "Itinerary item does not belong to this tour");
            }
            itinerary.setSortOrder(item.sortOrder());
        }

        return existing.stream()
                .sorted(Comparator.comparing(TourItinerary::getDayNumber).thenComparing(TourItinerary::getSortOrder))
                .map(this::toResponse)
                .toList();
    }

    public List<TourItineraryResponse> getPublicItinerary(String slug) {
        tourRepository.findBySlugAndStatus(slug, TourStatus.PUBLISHED)
                .orElseThrow(() -> new BusinessException(ErrorCode.TOUR_NOT_FOUND, "Tour not found"));

        return itineraryRepository.findByTourSlugOrderByDayNumberAscSortOrderAsc(slug)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private TourItinerary toEntity(Tour tour, TourItineraryItemRequest item) {
        return TourItinerary.builder()
                .tour(tour)
                .dayNumber(item.dayNumber())
                .title(item.title().trim())
                .description(trimToNull(item.description()))
                .hotelName(trimToNull(item.hotelName()))
                .meals(toJson(item.meals()))
                .transportModes(toJson(item.transportModes()))
                .placeNames(toJson(item.placeNames()))
                .activities(toJson(item.activities()))
                .sortOrder(item.sortOrder() == null ? 0 : item.sortOrder())
                .build();
    }

    private void validateNoDuplicateDayNumber(List<TourItineraryItemRequest> items) {
        Set<Integer> dayNumbers = new HashSet<>();
        for (TourItineraryItemRequest item : items) {
            if (!dayNumbers.add(item.dayNumber())) {
                throw new BusinessException(ErrorCode.TOUR_ITINERARY_INVALID, "Một tour không được có trùng dayNumber");
            }
        }
    }

    private Tour findTour(Long tourId) {
        return tourRepository.findById(tourId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TOUR_NOT_FOUND, "Tour không tồn tại"));
    }

    private String toJson(List<String> values) {
        try {
            return objectMapper.writeValueAsString(values == null ? List.of() : values);
        } catch (Exception ex) {
            throw new BusinessException(ErrorCode.TOUR_ITINERARY_INVALID, "Invalid itinerary JSON data");
        }
    }

    private List<String> fromJson(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(json, STRING_LIST);
        } catch (Exception ex) {
            return List.of();
        }
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private TourItineraryResponse toResponse(TourItinerary itinerary) {
        return new TourItineraryResponse(
                itinerary.getId(),
                itinerary.getTour().getId(),
                itinerary.getDayNumber(),
                itinerary.getTitle(),
                itinerary.getDescription(),
                itinerary.getHotelName(),
                fromJson(itinerary.getMeals()),
                fromJson(itinerary.getTransportModes()),
                fromJson(itinerary.getPlaceNames()),
                fromJson(itinerary.getActivities()),
                itinerary.getSortOrder(),
                itinerary.getCreatedAt(),
                itinerary.getUpdatedAt()
        );
    }
}
