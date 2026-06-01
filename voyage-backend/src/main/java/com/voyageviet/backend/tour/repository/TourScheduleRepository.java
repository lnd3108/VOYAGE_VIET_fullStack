package com.voyageviet.backend.tour.repository;

import com.voyageviet.backend.tour.entity.TourSchedule;
import com.voyageviet.backend.tour.entity.TourScheduleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TourScheduleRepository extends JpaRepository<TourSchedule, Long> {

    List<TourSchedule> findByTourId(Long tourId);

    @EntityGraph(attributePaths = {"tour"})
    Page<TourSchedule> findByTourId(Long tourId, Pageable pageable);

    List<TourSchedule> findByTourIdAndStatus(Long tourId, TourScheduleStatus status);

    @EntityGraph(attributePaths = {"tour"})
    Page<TourSchedule> findByTourIdAndStatus(Long tourId, TourScheduleStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"tour"})
    List<TourSchedule> findByTourSlugAndStatusAndDepartureDateGreaterThanEqual(
            String slug,
            TourScheduleStatus status,
            LocalDate departureDate,
            Sort sort
    );

    boolean existsByTourIdAndStatus(Long tourId, TourScheduleStatus status);

    long countByTourId(Long tourId);

    long countByTourIdAndStatus(Long tourId, TourScheduleStatus status);

    Optional<TourSchedule> findByIdAndTourId(Long id, Long tourId);
}
