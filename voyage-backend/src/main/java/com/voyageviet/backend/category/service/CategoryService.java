package com.voyageviet.backend.category.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voyageviet.backend.category.dto.request.CategoryBatchDisplayRequest;
import com.voyageviet.backend.category.dto.request.CategoryBatchRejectRequest;
import com.voyageviet.backend.category.dto.request.CategoryBatchRequest;
import com.voyageviet.backend.category.dto.request.CategoryCreateRequest;
import com.voyageviet.backend.category.dto.request.CategoryDisplayUpdateRequest;
import com.voyageviet.backend.category.dto.request.CategoryPatchRequest;
import com.voyageviet.backend.category.dto.request.CategoryStatusUpdateRequest;
import com.voyageviet.backend.category.dto.request.CategoryUpdateRequest;
import com.voyageviet.backend.category.dto.response.CategoryBatchActionItemResponse;
import com.voyageviet.backend.category.dto.response.CategoryBatchActionResponse;
import com.voyageviet.backend.category.dto.response.CategoryNewData;
import com.voyageviet.backend.category.dto.response.CategoryResponse;
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
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
    private static final Integer ACTIVE = 1;
    private static final Integer INACTIVE = 0;

    private final CategoryRepository categoryRepository;
    private final TourRepository tourRepository;
    private final ObjectMapper objectMapper;

    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findByStatusAndIsActiveAndIsDisplayOrderByDisplayOrderAsc(
                        CategoryStatus.APPROVED,
                        ACTIVE,
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
        Category category = buildNewCategory(request, CategoryStatus.DRAFT);
        return toResponse(categoryRepository.save(category), true);
    }

    @Transactional
    public CategoryResponse submitCreateCategory(CategoryCreateRequest request) {
        Category category = buildNewCategory(request, CategoryStatus.PENDING);
        return toResponse(categoryRepository.save(category), true);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryUpdateRequest request) {
        return patchCategory(id, new CategoryPatchRequest(
                request.name(),
                request.slug(),
                request.description(),
                request.imageUrl(),
                request.displayOrder(),
                request.isDisplay(),
                request.isActive()
        ));
    }

    @Transactional
    public CategoryResponse updateCategoryStatus(Long id, CategoryStatusUpdateRequest request) {
        throw new BusinessException(
                ErrorCode.INVALID_REQUEST,
                "Category workflow status must be changed through submit, approve, reject or cancel-approve endpoints"
        );
    }

    @Transactional
    public CategoryResponse patchCategory(Long id, CategoryPatchRequest request) {
        Category category = findCategoryById(id);

        if (category.getStatus() == CategoryStatus.PENDING) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "PENDING categories cannot be updated");
        }

        if (category.getStatus() == CategoryStatus.APPROVED) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "APPROVED categories cannot be updated directly");
        }

        CategoryNewData nextData = buildNewData(category, request);
        validateCategoryData(nextData);
        validateUniqueSlugChange(category.getSlug(), nextData.slug(), id);

        if (category.getStatus() == CategoryStatus.DRAFT) {
            CategoryNewData currentData = toComparableData(category);
            if (Objects.equals(currentData, nextData)) {
                throw new BusinessException(ErrorCode.NO_DATA_CHANGED, "No category data changed");
            }

            applyNewData(category, nextData);
            category.clearNewData();
            category.setRejectReason(null);
            return toResponse(categoryRepository.save(category), true);
        }

        if (!EnumSet.of(CategoryStatus.REJECTED, CategoryStatus.CANCEL_APPROVE).contains(category.getStatus())) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Category status does not allow update");
        }

        if (isNoPendingDataChange(category, nextData)) {
            throw new BusinessException(ErrorCode.NO_DATA_CHANGED, "No category data changed");
        }

        category.replaceNewData(writeNewData(nextData));
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

        CategoryNewData submitData = category.hasNewData()
                ? readNewData(category.getNewData())
                : toComparableData(category);
        validateCategoryData(submitData);
        validateUniqueSlugChange(category.getSlug(), submitData.slug(), id);
        category.markAsPending();

        return toResponse(categoryRepository.save(category), true);
    }

    @Transactional
    public CategoryResponse approveCategory(Long id) {
        Category category = findCategoryById(id);
        requirePending(category, "Only PENDING categories can be approved");

        if (category.hasNewData()) {
            CategoryNewData newData = readNewData(category.getNewData());
            validateCategoryData(newData);
            validateUniqueSlugChange(category.getSlug(), newData.slug(), id);
            applyNewData(category, newData);
            category.clearNewData();
        }

        category.markAsApproved();
        category.setRejectReason(null);
        enforceInactiveHidden(category);

        return toResponse(categoryRepository.save(category), true);
    }

    @Transactional
    public CategoryResponse rejectCategory(Long id, String reason) {
        Category category = findCategoryById(id);
        requirePending(category, "Only PENDING categories can be rejected");

        String normalizedReason = trimToNull(reason);
        if (normalizedReason == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Reject reason is required");
        }

        category.markAsRejected(normalizedReason);
        category.hide();

        return toResponse(categoryRepository.save(category), true);
    }

    @Transactional
    public CategoryResponse cancelApproveCategory(Long id) {
        Category category = findCategoryById(id);

        if (category.getStatus() != CategoryStatus.APPROVED) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Only APPROVED categories can be cancel-approved");
        }

        category.clearNewData();
        category.setRejectReason(null);
        category.hide();
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

        if (Objects.equals(normalizeActiveFlag(category.getIsActive()), INACTIVE)) {
            category.hide();
            categoryRepository.save(category);
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Inactive categories cannot be shown publicly"
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

        if (!EnumSet.of(CategoryStatus.DRAFT, CategoryStatus.REJECTED, CategoryStatus.CANCEL_APPROVE)
                .contains(category.getStatus())) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Only DRAFT, REJECTED or CANCEL_APPROVE categories can be deleted"
            );
        }

        if (Objects.equals(normalizeDisplayFlag(category.getIsDisplay()), DISPLAY_VISIBLE)) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Displayed categories cannot be deleted");
        }

        if (category.hasNewData()) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Categories with pending data cannot be deleted");
        }

        if (tourRepository.existsByCategoryId(id)) {
            throw new BusinessException(
                    ErrorCode.CATEGORY_IN_USE,
                    "Cannot delete category because it is being used by tours"
            );
        }

        categoryRepository.delete(category);
    }

    @Transactional
    public CategoryResponse copyCategory(Long id) {
        Category source = findCategoryById(id);
        String timestamp = DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS").format(LocalDateTime.now());
        String slug = "copy-" + source.getId() + "-" + timestamp;

        Category copy = Category.builder()
                .name(" ")
                .slug(slug)
                .description(trimToNull(source.getDescription()))
                .imageUrl(trimToNull(source.getImageUrl()))
                .displayOrder(normalizeDisplayOrder(source.getDisplayOrder()))
                .status(CategoryStatus.DRAFT)
                .isActive(normalizeActiveFlag(source.getIsActive()))
                .isDisplay(DISPLAY_HIDDEN)
                .rejectReason(null)
                .newData(null)
                .build();
        enforceInactiveHidden(copy);

        return toResponse(categoryRepository.save(copy), true);
    }

    @Transactional
    public CategoryResponse updateCategoryImage(Long id, ImageUrlUpdateRequest request) {
        Category category = findCategoryById(id);
        CategoryPatchRequest patchRequest = new CategoryPatchRequest(
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                request.imageUrl().trim(),
                category.getDisplayOrder(),
                category.getIsDisplay(),
                category.getIsActive()
        );

        return patchCategory(id, patchRequest);
    }

    private Category buildNewCategory(CategoryCreateRequest request, CategoryStatus status) {
        String slug = buildSlug(request.name(), request.slug());

        if (categoryRepository.existsBySlug(slug)) {
            throw new BusinessException(
                    ErrorCode.CATEGORY_ALREADY_EXISTS,
                    "Category slug already exists"
            );
        }

        Integer isActive = normalizeActiveFlag(request.isActive());
        Category category = Category.builder()
                .name(request.name().trim())
                .slug(slug)
                .description(trimToNull(request.description()))
                .imageUrl(trimToNull(request.imageUrl()))
                .displayOrder(normalizeDisplayOrder(request.displayOrder()))
                .status(status)
                .isActive(isActive)
                .isDisplay(DISPLAY_HIDDEN)
                .rejectReason(null)
                .newData(null)
                .build();
        enforceInactiveHidden(category);
        return category;
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

    private void validateCategoryData(CategoryNewData data) {
        if (data.name() == null || data.name().isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Category name is required");
        }

        if (data.slug() == null || data.slug().isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Category slug is required");
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

    private boolean isNoPendingDataChange(Category category, CategoryNewData nextData) {
        if (!category.hasNewData()) {
            return Objects.equals(toComparableData(category), nextData);
        }

        return Objects.equals(readNewData(category.getNewData()), nextData);
    }

    private void applyNewData(Category category, CategoryNewData newData) {
        category.setName(newData.name().trim());
        category.setSlug(newData.slug());
        category.setDescription(trimToNull(newData.description()));
        category.setImageUrl(trimToNull(newData.imageUrl()));
        category.setDisplayOrder(normalizeDisplayOrder(newData.displayOrder()));
        category.setIsActive(normalizeActiveFlag(newData.isActive()));
        category.setIsDisplay(newData.isDisplay() == null
                ? normalizeDisplayFlag(category.getIsDisplay())
                : normalizeDisplayFlag(newData.isDisplay()));
        enforceInactiveHidden(category);
    }

    private void enforceInactiveHidden(Category category) {
        category.setIsActive(normalizeActiveFlag(category.getIsActive()));
        category.setIsDisplay(normalizeDisplayFlag(category.getIsDisplay()));
        if (Objects.equals(category.getIsActive(), INACTIVE)) {
            category.hide();
        }
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
                normalizeActiveFlag(category.getIsActive()),
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
                normalizeDisplayFlag(category.getIsDisplay()),
                normalizeActiveFlag(category.getIsActive())
        );
    }

    private CategoryNewData buildNewData(Category category, CategoryPatchRequest request) {
        String name = normalizeRequiredText(request.name());
        String slug = buildSlug(name, request.slug());
        Integer isActive = request.isActive() == null
                ? normalizeActiveFlag(category.getIsActive())
                : normalizeActiveFlag(request.isActive());
        Integer isDisplay = request.isDisplay() == null
                ? normalizeDisplayFlag(category.getIsDisplay())
                : normalizeDisplayFlag(request.isDisplay());

        if (Objects.equals(isActive, INACTIVE)) {
            isDisplay = DISPLAY_HIDDEN;
        }

        return new CategoryNewData(
                name,
                slug,
                trimToNull(request.description()),
                trimToNull(request.imageUrl()),
                category.getStatus(),
                request.displayOrder() == null
                        ? normalizeDisplayOrder(category.getDisplayOrder())
                        : normalizeDisplayOrder(request.displayOrder()),
                isDisplay,
                isActive
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
            Integer isActive = intValue(root, "isActive");
            Integer isDisplay = intValue(root, "isDisplay");
            isActive = normalizeActiveFlag(isActive);
            isDisplay = normalizeDisplayFlag(isDisplay);
            if (Objects.equals(isActive, INACTIVE)) {
                isDisplay = DISPLAY_HIDDEN;
            }

            return new CategoryNewData(
                    textValue(root, "name"),
                    textValue(root, "slug"),
                    textValue(root, "description"),
                    textValue(root, "imageUrl"),
                    parseWorkflowStatus(textValue(root, "status")),
                    intValue(root, "displayOrder"),
                    isDisplay,
                    isActive
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

    private Integer normalizeActiveFlag(Integer value) {
        return Objects.equals(value, INACTIVE) ? INACTIVE : ACTIVE;
    }
}
