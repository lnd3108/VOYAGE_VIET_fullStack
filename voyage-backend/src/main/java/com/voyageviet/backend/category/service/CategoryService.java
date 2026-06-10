package com.voyageviet.backend.category.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voyageviet.backend.category.dto.CategoryBatchActionItemResponse;
import com.voyageviet.backend.category.dto.CategoryBatchActionResponse;
import com.voyageviet.backend.category.dto.CategoryBatchDisplayRequest;
import com.voyageviet.backend.category.dto.CategoryBatchRejectRequest;
import com.voyageviet.backend.category.dto.CategoryBatchRequest;
import com.voyageviet.backend.category.dto.CategoryCreateRequest;
import com.voyageviet.backend.category.dto.CategoryDisplayUpdateRequest;
import com.voyageviet.backend.category.dto.CategoryNewData;
import com.voyageviet.backend.category.dto.CategoryPatchRequest;
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

import java.io.IOException;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private static final Integer DISPLAY_VISIBLE = 1;
    private static final Integer DISPLAY_HIDDEN = 0;

    private final CategoryRepository categoryRepository;
    private final TourRepository tourRepository;
    private final ObjectMapper objectMapper;

    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findByStatusAndIsDisplayOrderByDisplayOrderAsc(
                        CategoryStatus.APPROVED,
                        DISPLAY_VISIBLE
                )
                .stream()
                .map(category -> toResponse(category, false))
                .toList();
    }

    public List<CategoryResponse> getAllCategoriesForAdmin() {
        return categoryRepository.findAll(Sort.by(Sort.Direction.ASC, "displayOrder", "id"))
                .stream()
                .map(category -> toResponse(category, true))
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
                .displayOrder(normalizeDisplayOrder(request.displayOrder()))
                .status(CategoryStatus.DRAFT)
                .isDisplay(request.isDisplay() == null ? DISPLAY_HIDDEN : normalizeDisplayFlag(request.isDisplay()))
                .build();
        category.clearNewData();

        return toResponse(categoryRepository.save(category), true);
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
        category.setDisplayOrder(request.displayOrder() == null
                ? normalizeDisplayOrder(category.getDisplayOrder())
                : normalizeDisplayOrder(request.displayOrder()));
        category.setIsDisplay(request.isDisplay() == null ? normalizeDisplayFlag(category.getIsDisplay()) : request.isDisplay());

        return toResponse(categoryRepository.save(category), true);
    }

    @Transactional
    public CategoryResponse updateCategoryStatus(Long id, CategoryStatusUpdateRequest request) {
        Category category = findCategoryById(id);
        category.setStatus(request.status());

        return toResponse(categoryRepository.save(category), true);
    }

    @Transactional
    public CategoryResponse patchCategory(Long id, CategoryPatchRequest request) {
        Category category = findCategoryById(id);

        CategoryNewData currentData = toComparableData(category);
        CategoryNewData nextData = buildNewData(category, request);

        if (Objects.equals(currentData, nextData)) {
            throw new BusinessException(
                    ErrorCode.NO_DATA_CHANGED,
                    "No category data changed"
            );
        }

        validateUniqueSlugChange(currentData.slug(), nextData.slug(), id);

        category.replaceNewData(writeNewData(nextData));
        category.markAsPending();

        return toResponse(categoryRepository.save(category), true);
    }

    @Transactional
    public CategoryResponse submitCategory(Long id) {
        Category category = findCategoryById(id);

        if (!EnumSet.of(CategoryStatus.DRAFT, CategoryStatus.REJECTED, CategoryStatus.CANCEL_APPROVE)
                .contains(category.getStatus())) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Only DRAFT, REJECTED or CANCEL_APPROVE categories can be submitted"
            );
        }

        category.markAsPending();

        return toResponse(categoryRepository.save(category), true);
    }

    @Transactional
    public CategoryResponse approveCategory(Long id) {
        Category category = findCategoryById(id);
        requirePending(category, "Only PENDING categories can be approved");

        if (category.hasNewData()) {
            CategoryNewData newData = readNewData(category.getNewData());
            validateUniqueSlugChange(category.getSlug(), newData.slug(), id);
            applyNewData(category, newData);
            category.clearNewData();
        }

        category.markAsApproved();

        return toResponse(categoryRepository.save(category), true);
    }

    @Transactional
    public CategoryResponse rejectCategory(Long id, String reason) {
        Category category = findCategoryById(id);
        requirePending(category, "Only PENDING categories can be rejected");

        category.markAsRejected(trimToNull(reason));

        return toResponse(categoryRepository.save(category), true);
    }

    @Transactional
    public CategoryResponse cancelApproveCategory(Long id) {
        Category category = findCategoryById(id);
        requirePending(category, "Only PENDING categories can be cancel-approved");

        category.clearNewData();
        category.markAsCancelApproved();

        return toResponse(categoryRepository.save(category), true);
    }

    @Transactional
    public CategoryResponse updateCategoryDisplay(Long id, CategoryDisplayUpdateRequest request) {
        Category category = findCategoryById(id);

        if (!category.isPublished()) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Only APPROVED categories can be shown publicly"
            );
        }

        if (Objects.equals(request.isDisplay(), DISPLAY_VISIBLE)) {
            category.show();
        } else {
            category.hide();
        }

        return toResponse(categoryRepository.save(category), true);
    }

    @Transactional
    public CategoryBatchActionResponse submitCategories(CategoryBatchRequest request) {
        return runBatchAction(request.ids(), this::submitCategory);
    }

    @Transactional
    public CategoryBatchActionResponse approveCategories(CategoryBatchRequest request) {
        return runBatchAction(request.ids(), this::approveCategory);
    }

    @Transactional
    public CategoryBatchActionResponse rejectCategories(CategoryBatchRejectRequest request) {
        return runBatchAction(request.ids(), id -> rejectCategory(id, request.reason()));
    }

    @Transactional
    public CategoryBatchActionResponse cancelApproveCategories(CategoryBatchRequest request) {
        return runBatchAction(request.ids(), this::cancelApproveCategory);
    }

    @Transactional
    public CategoryBatchActionResponse updateCategoriesDisplay(CategoryBatchDisplayRequest request) {
        CategoryDisplayUpdateRequest displayRequest = new CategoryDisplayUpdateRequest(request.isDisplay());
        return runBatchAction(request.ids(), id -> updateCategoryDisplay(id, displayRequest));
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

        return toResponse(categoryRepository.save(category), true);
    }

    private Category findCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.CATEGORY_NOT_FOUND,
                        "Category not found"
                ));
    }

    private CategoryBatchActionResponse runBatchAction(
            List<Long> rawIds,
            Function<Long, CategoryResponse> action
    ) {
        List<Long> ids = normalizeBatchIds(rawIds);
        List<CategoryBatchActionItemResponse> successItems = new ArrayList<>();
        List<CategoryBatchActionItemResponse> failedItems = new ArrayList<>();

        for (Long id : ids) {
            try {
                CategoryResponse response = action.apply(id);
                successItems.add(new CategoryBatchActionItemResponse(
                        response.id(),
                        response.name(),
                        true,
                        "Success"
                ));
            } catch (BusinessException exception) {
                failedItems.add(buildFailedBatchItem(id, exception.getMessage()));
            } catch (Exception exception) {
                failedItems.add(buildFailedBatchItem(id, "Cannot process category"));
            }
        }

        return new CategoryBatchActionResponse(
                ids.size(),
                successItems.size(),
                failedItems.size(),
                successItems,
                failedItems
        );
    }

    private List<Long> normalizeBatchIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Category ids must not be empty"
            );
        }

        List<Long> normalizedIds = new ArrayList<>(new LinkedHashSet<>(ids));

        if (normalizedIds.isEmpty()) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Category ids must not be empty"
            );
        }

        return normalizedIds;
    }

    private CategoryBatchActionItemResponse buildFailedBatchItem(Long id, String message) {
        return new CategoryBatchActionItemResponse(
                id,
                id == null ? null : categoryRepository.findById(id).map(Category::getName).orElse(null),
                false,
                message
        );
    }

    private void requirePending(Category category, String message) {
        if (!category.isPending()) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, message);
        }
    }

    private void validateUniqueSlugChange(String currentSlug, String nextSlug, Long id) {
        if (!Objects.equals(currentSlug, nextSlug)
                && categoryRepository.existsBySlugAndIdNot(nextSlug, id)) {
            throw new BusinessException(
                    ErrorCode.CATEGORY_ALREADY_EXISTS,
                    "Category slug already exists"
            );
        }
    }

    private void applyNewData(Category category, CategoryNewData newData) {
        category.setName(newData.name());
        category.setSlug(newData.slug());
        category.setDescription(trimToNull(newData.description()));
        category.setImageUrl(trimToNull(newData.imageUrl()));
        category.setDisplayOrder(normalizeDisplayOrder(newData.displayOrder()));
        category.setIsDisplay(newData.isDisplay() == null
                ? normalizeDisplayFlag(category.getIsDisplay())
                : normalizeDisplayFlag(newData.isDisplay()));
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

    private CategoryResponse toResponse(Category category, boolean includeNewData) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getImageUrl(),
                category.getStatus(),
                normalizeDisplayFlag(category.getIsDisplay()),
                category.getDisplayOrder(),
                includeNewData ? category.getNewData() : null,
                includeNewData ? category.getRejectReason() : null,
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }

    private CategoryNewData toComparableData(Category category) {
        return new CategoryNewData(
                normalizeRequiredText(category.getName()),
                buildSlug(category.getName(), category.getSlug()),
                trimToNull(category.getDescription()),
                trimToNull(category.getImageUrl()),
                category.getStatus(),
                normalizeDisplayOrder(category.getDisplayOrder()),
                normalizeDisplayFlag(category.getIsDisplay())
        );
    }

    private CategoryNewData buildNewData(Category category, CategoryPatchRequest request) {
        String name = normalizeRequiredText(request.name());
        String slug = buildSlug(name, request.slug());

        return new CategoryNewData(
                name,
                slug,
                trimToNull(request.description()),
                trimToNull(request.imageUrl()),
                request.status() == null ? category.getStatus() : request.status(),
                request.displayOrder() == null
                        ? normalizeDisplayOrder(category.getDisplayOrder())
                        : normalizeDisplayOrder(request.displayOrder()),
                request.isDisplay() == null
                        ? normalizeDisplayFlag(category.getIsDisplay())
                        : normalizeDisplayFlag(request.isDisplay())
        );
    }

    private String writeNewData(CategoryNewData newData) {
        try {
            return objectMapper.writeValueAsString(newData);
        } catch (JsonProcessingException exception) {
            throw new BusinessException(
                    ErrorCode.INTERNAL_ERROR,
                    "Cannot serialize category pending data"
            );
        }
    }

    private CategoryNewData readNewData(String newData) {
        try {
            JsonNode root = objectMapper.readTree(newData);
            return new CategoryNewData(
                    textValue(root, "name"),
                    textValue(root, "slug"),
                    textValue(root, "description"),
                    textValue(root, "imageUrl"),
                    parseWorkflowStatus(textValue(root, "status")),
                    intValue(root, "displayOrder"),
                    intValue(root, "isDisplay")
            );
        } catch (IOException exception) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Category pending data is invalid"
            );
        }
    }

    private CategoryStatus parseWorkflowStatus(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        if ("ACTIVE".equals(value) || "INACTIVE".equals(value)) {
            return CategoryStatus.APPROVED;
        }

        try {
            return CategoryStatus.valueOf(value);
        } catch (IllegalArgumentException exception) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Category pending status is invalid"
            );
        }
    }

    private String textValue(JsonNode root, String fieldName) {
        JsonNode field = root.get(fieldName);
        if (field == null || field.isNull()) {
            return null;
        }

        return field.asText();
    }

    private Integer intValue(JsonNode root, String fieldName) {
        JsonNode field = root.get(fieldName);
        if (field == null || field.isNull()) {
            return null;
        }

        return field.asInt();
    }

    private String normalizeRequiredText(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }

        return value.trim();
    }

    private Integer normalizeDisplayOrder(Integer value) {
        if (value == null || value < 0) {
            return 0;
        }

        return value;
    }

    private Integer normalizeDisplayFlag(Integer value) {
        return Objects.equals(value, DISPLAY_VISIBLE) ? DISPLAY_VISIBLE : DISPLAY_HIDDEN;
    }
}
