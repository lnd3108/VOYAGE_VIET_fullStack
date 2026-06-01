package com.voyageviet.backend.category.service;

import com.voyageviet.backend.category.dto.CategoryCreateRequest;
import com.voyageviet.backend.category.dto.CategoryResponse;
import com.voyageviet.backend.category.dto.CategoryStatusUpdateRequest;
import com.voyageviet.backend.category.dto.CategoryUpdateRequest;
import com.voyageviet.backend.category.entity.Category;
import com.voyageviet.backend.category.entity.CategoryStatus;
import com.voyageviet.backend.category.repository.CategoryRepository;
import com.voyageviet.backend.common.exception.BusinessException;
import com.voyageviet.backend.common.exception.ErrorCode;
import com.voyageviet.backend.common.util.SlugUtils;
import com.voyageviet.backend.media.dto.ImageUrlUpdateRequest;
import com.voyageviet.backend.tour.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final TourRepository tourRepository;

    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findByStatusOrderByDisplayOrderAsc(CategoryStatus.ACTIVE)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<CategoryResponse> getAllCategoriesForAdmin() {
        return categoryRepository.findAll(Sort.by(Sort.Direction.ASC, "displayOrder", "id"))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CategoryResponse createCategory(CategoryCreateRequest request) {
        String slug = buildSlug(request.name(), request.slug());

        if (categoryRepository.existsBySlug(slug)) {
            throw new BusinessException(
                    ErrorCode.CATEGORY_ALREADY_EXISTS,
                    "Category slug already exists"
            );
        }

        Category category = Category.builder()
                .name(request.name().trim())
                .slug(slug)
                .description(trimToNull(request.description()))
                .imageUrl(trimToNull(request.imageUrl()))
                .displayOrder(request.displayOrder() == null ? 0 : request.displayOrder())
                .status(CategoryStatus.ACTIVE)
                .build();

        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryUpdateRequest request) {
        Category category = findCategoryById(id);

        String slug = buildSlug(request.name(), request.slug());

        if (categoryRepository.existsBySlugAndIdNot(slug, id)) {
            throw new BusinessException(
                    ErrorCode.CATEGORY_ALREADY_EXISTS,
                    "Category slug already exists"
            );
        }

        category.setName(request.name().trim());
        category.setSlug(slug);
        category.setDescription(trimToNull(request.description()));
        category.setImageUrl(trimToNull(request.imageUrl()));
        category.setStatus(request.status() == null ? category.getStatus() : request.status());
        category.setDisplayOrder(request.displayOrder() == null ? category.getDisplayOrder() : request.displayOrder());

        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse updateCategoryStatus(Long id, CategoryStatusUpdateRequest request) {
        Category category = findCategoryById(id);
        category.setStatus(request.status());

        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = findCategoryById(id);

        if (tourRepository.existsByCategoryId(id)) {
            throw new BusinessException(
                    ErrorCode.CATEGORY_IN_USE,
                    "Cannot delete category because it is being used by tours"
            );
        }

        categoryRepository.delete(category);
    }

    @Transactional
    public CategoryResponse updateCategoryImage(Long id, ImageUrlUpdateRequest request) {
        Category category = findCategoryById(id);

        category.setImageUrl(request.imageUrl().trim());

        return toResponse(categoryRepository.save(category));
    }

    private Category findCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.CATEGORY_NOT_FOUND,
                        "Category not found"
                ));
    }

    private String buildSlug(String name, String customSlug) {
        String rawSlug = customSlug == null || customSlug.isBlank()
                ? name
                : customSlug;

        return SlugUtils.toSlug(rawSlug);
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getImageUrl(),
                category.getStatus(),
                category.getDisplayOrder()
        );
    }
}