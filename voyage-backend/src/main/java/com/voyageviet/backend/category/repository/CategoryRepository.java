package com.voyageviet.backend.category.repository;

import com.voyageviet.backend.category.entity.Category;
import com.voyageviet.backend.category.entity.CategoryStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    List<Category> findByStatusAndIsActiveAndIsDisplayOrderByDisplayOrderAsc(
            CategoryStatus status,
            Integer isActive,
            Integer isDisplay
    );

    long countByStatus(CategoryStatus status);

    long countByStatusAndIsDisplay(CategoryStatus status, Integer isDisplay);

    long countByStatusAndIsActiveAndIsDisplay(CategoryStatus status, Integer isActive, Integer isDisplay);
}
