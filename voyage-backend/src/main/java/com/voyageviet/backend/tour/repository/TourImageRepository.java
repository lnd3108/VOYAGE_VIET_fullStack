package com.voyageviet.backend.tour.repository;

import com.voyageviet.backend.tour.entity.TourImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TourImageRepository extends JpaRepository<TourImage, Long> {

    List<TourImage> findByTourIdOrderBySortOrderAscIdAsc(Long tourId);

    long countByTourId(Long tourId);

    Optional<TourImage> findByIdAndTourId(Long id, Long tourId);

    Optional<TourImage> findFirstByTourIdAndThumbnailTrue(Long tourId);

    boolean existsByTourIdAndThumbnailTrue(Long tourId);

    long countByTourIdAndThumbnailTrue(Long tourId);

    @Modifying
    @Query("UPDATE TourImage i SET i.thumbnail = false WHERE i.tour.id = :tourId")
    void unsetThumbnailByTourId(@Param("tourId") Long tourId);
}
