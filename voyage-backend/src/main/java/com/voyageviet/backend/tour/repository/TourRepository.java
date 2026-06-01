package com.voyageviet.backend.tour.repository;

import com.voyageviet.backend.tour.entity.Tour;
import com.voyageviet.backend.tour.entity.TourStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TourRepository extends JpaRepository<Tour, Long>, JpaSpecificationExecutor<Tour> {

    @EntityGraph(attributePaths = {"category", "destination"})
    Optional<Tour> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    List<Tour> findByStatus(TourStatus status);

    List<Tour> findByFeaturedTrueAndStatus(TourStatus status);

    @EntityGraph(attributePaths = {"category", "destination"})
    List<Tour> findTop6ByFeaturedTrueAndStatusOrderByCreatedAtDesc(TourStatus status);

    @EntityGraph(attributePaths = {"category", "destination"})
    List<Tour> findAll(Sort sort);

    @EntityGraph(attributePaths = {"category", "destination"})
    @Query("""
            SELECT t
            FROM Tour t
            WHERE t.status = :status
              AND (
                    :keyword IS NULL
                    OR LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(t.shortDescription) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(t.departureLocation) LIKE LOWER(CONCAT('%', :keyword, '%'))
                  )
              AND (:categorySlug IS NULL OR t.category.slug = :categorySlug)
              AND (:destinationSlug IS NULL OR t.destination.slug = :destinationSlug)
            """)
    Page<Tour> searchPublicTours(
            @Param("status") TourStatus status,
            @Param("keyword") String keyword,
            @Param("categorySlug") String categorySlug,
            @Param("destinationSlug") String destinationSlug,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"category", "destination"})
    Optional<Tour> findBySlugAndStatus(String slug, TourStatus status);

    boolean existsByCategoryId(Long categoryId);

    boolean existsByDestinationId(Long destinationId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Tour> findWithLockById(Long id);

    long countByStatus(TourStatus status);

    long countByFeaturedTrue();

    @Override
    @EntityGraph(attributePaths = {"category", "destination"})
    Page<Tour> findAll(Specification<Tour> spec, Pageable pageable);
}