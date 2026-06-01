package com.voyageviet.backend.review.repository;

import com.voyageviet.backend.review.entity.Review;
import com.voyageviet.backend.review.entity.ReviewStatus;
import com.voyageviet.backend.review.repository.projection.AdminTopRatedTourProjection;
import com.voyageviet.backend.review.repository.projection.TourReviewSummaryProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    boolean existsByUserIdAndTourId(Long userId, Long tourId);

    @EntityGraph(attributePaths = {"user", "tour"})
    List<Review> findByTourIdAndStatus(Long tourId, ReviewStatus status, Sort sort);

    @EntityGraph(attributePaths = {"user", "tour"})
    List<Review> findByTourSlugAndStatus(String tourSlug, ReviewStatus status, Sort sort);

    @Override
    @EntityGraph(attributePaths = {"user", "tour"})
    Page<Review> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"user", "tour"})
    Page<Review> findByStatus(ReviewStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "tour"})
    @Query("""
            SELECT r
            FROM Review r
            WHERE r.id = :id
            """)
    Optional<Review> findByIdWithUserAndTour(@Param("id") Long id);

    long countByTourIdAndStatus(Long tourId, ReviewStatus status);

    long countByUserId(Long userId);

    @Query("""
        SELECT AVG(r.rating)
        FROM Review r
        WHERE r.tour.id = :tourId
          AND r.status = :status
        """)
    Double averageRatingByTourIdAndStatus(
            @Param("tourId") Long tourId,
            @Param("status") ReviewStatus status
    );

    @Query("""
        SELECT 
            r.tour.id AS tourId,
            COUNT(r) AS reviewCount,
            AVG(r.rating) AS averageRating
        FROM Review r
        WHERE r.status = :status
          AND r.tour.id IN :tourIds
        GROUP BY r.tour.id
        """)
    List<TourReviewSummaryProjection> summarizeByTourIdsAndStatus(
            @Param("tourIds") List<Long> tourIds,
            @Param("status") ReviewStatus status
    );

    long countByStatus(ReviewStatus status);

    @Query("""
        SELECT AVG(r.rating)
        FROM Review r
        WHERE r.status = :status
        """)
    Double averageRatingByStatus(@Param("status") ReviewStatus status);

    @Query("""
        SELECT 
            r.tour.id AS tourId,
            r.tour.title AS tourTitle,
            r.tour.slug AS tourSlug,
            COUNT(r) AS reviewCount,
            AVG(r.rating) AS averageRating
        FROM Review r
        WHERE r.status = :status
        GROUP BY r.tour.id, r.tour.title, r.tour.slug
        ORDER BY AVG(r.rating) DESC, COUNT(r) DESC
        """)
    List<AdminTopRatedTourProjection> findTopRatedTours(
            @Param("status") ReviewStatus status,
            Pageable pageable
    );
}
