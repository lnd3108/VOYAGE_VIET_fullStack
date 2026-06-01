package com.voyageviet.backend.tour.repository;

import com.voyageviet.backend.tour.entity.TourItinerary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TourItineraryRepository extends JpaRepository<TourItinerary, Long> {

    List<TourItinerary> findByTourIdOrderByDayNumberAscSortOrderAsc(Long tourId);

    List<TourItinerary> findByTourSlugOrderByDayNumberAscSortOrderAsc(String slug);

    boolean existsByTourIdAndDayNumber(Long tourId, Integer dayNumber);

    void deleteByTourId(Long tourId);

    long countByTourId(Long tourId);
}
