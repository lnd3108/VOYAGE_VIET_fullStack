package com.voyageviet.backend.category.controller;

import com.voyageviet.backend.category.dto.request.*;
import com.voyageviet.backend.category.dto.response.CategoryBatchActionResponse;
import com.voyageviet.backend.category.dto.response.CategoryResponse;
import com.voyageviet.backend.category.service.CategoryService;
import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.media.dto.ImageUrlUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ApiResponse<List<CategoryResponse>> getAllCategories() {
        return ApiResponse.success(
                "Get admin categories successfully",
                categoryService.getAllCategoriesForAdmin()
        );
    }

    @PostMapping
    public ApiResponse<CategoryResponse> createCategory(
            @Valid @RequestBody CategoryCreateRequest request
    ) {
        return ApiResponse.success(
                "Create category successfully",
                categoryService.createCategory(request)
        );
    }

    @PutMapping("/{id}")
    public ApiResponse<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryUpdateRequest request
    ) {
        return ApiResponse.success(
                "Update category successfully",
                categoryService.updateCategory(id, request)
        );
    }

    @PatchMapping("/{id}")
    public ApiResponse<CategoryResponse> patchCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryPatchRequest request
    ) {
        return ApiResponse.success(
                "Save category change successfully",
                categoryService.patchCategory(id, request)
        );
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<CategoryResponse> updateCategoryStatus(
            @PathVariable Long id,
            @Valid @RequestBody CategoryStatusUpdateRequest request
    ) {
        return ApiResponse.success(
                "Update category status successfully",
                categoryService.updateCategoryStatus(id, request)
        );
    }

    @PatchMapping("/{id}/submit")
    public ApiResponse<CategoryResponse> submitCategory(@PathVariable Long id) {
        return ApiResponse.success(
                "Submit category successfully",
                categoryService.submitCategory(id)
        );
    }

    @PatchMapping("/batch/submit")
    public ApiResponse<CategoryBatchActionResponse> submitCategories(
            @Valid @RequestBody CategoryBatchRequest request
    ) {
        return ApiResponse.success(
                "Submit categories successfully",
                categoryService.submitCategories(request)
        );
    }

    @PatchMapping("/{id}/approve")
    public ApiResponse<CategoryResponse> approveCategory(@PathVariable Long id) {
        return ApiResponse.success(
                "Approve category successfully",
                categoryService.approveCategory(id)
        );
    }

    @PatchMapping("/batch/approve")
    public ApiResponse<CategoryBatchActionResponse> approveCategories(
            @Valid @RequestBody CategoryBatchRequest request
    ) {
        return ApiResponse.success(
                "Approve categories successfully",
                categoryService.approveCategories(request)
        );
    }

    @PatchMapping("/{id}/reject")
    public ApiResponse<CategoryResponse> rejectCategory(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) CategoryRejectRequest request
    ) {
        return ApiResponse.success(
                "Reject category successfully",
                categoryService.rejectCategory(id, request == null ? null : request.reason())
        );
    }

    @PatchMapping("/batch/reject")
    public ApiResponse<CategoryBatchActionResponse> rejectCategories(
            @Valid @RequestBody CategoryBatchRejectRequest request
    ) {
        return ApiResponse.success(
                "Reject categories successfully",
                categoryService.rejectCategories(request)
        );
    }

    @PatchMapping("/{id}/cancel-approve")
    public ApiResponse<CategoryResponse> cancelApproveCategory(@PathVariable Long id) {
        return ApiResponse.success(
                "Cancel category approval successfully",
                categoryService.cancelApproveCategory(id)
        );
    }

    @PatchMapping("/batch/cancel-approve")
    public ApiResponse<CategoryBatchActionResponse> cancelApproveCategories(
            @Valid @RequestBody CategoryBatchRequest request
    ) {
        return ApiResponse.success(
                "Cancel categories approval successfully",
                categoryService.cancelApproveCategories(request)
        );
    }

    @PatchMapping("/{id}/display")
    public ApiResponse<CategoryResponse> updateCategoryDisplay(
            @PathVariable Long id,
            @Valid @RequestBody CategoryDisplayUpdateRequest request
    ) {
        return ApiResponse.success(
                "Update category display successfully",
                categoryService.updateCategoryDisplay(id, request)
        );
    }

    @PatchMapping("/batch/display")
    public ApiResponse<CategoryBatchActionResponse> updateCategoriesDisplay(
            @Valid @RequestBody CategoryBatchDisplayRequest request
    ) {
        return ApiResponse.success(
                "Update categories display successfully",
                categoryService.updateCategoriesDisplay(request)
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ApiResponse.success("Delete category successfully", null);
    }

    @PatchMapping("/{id}/image")
    public ApiResponse<CategoryResponse> updateCategoryImage(
            @PathVariable Long id,
            @Valid @RequestBody ImageUrlUpdateRequest request
    ) {
        return ApiResponse.success(
                "Update category image successfully",
                categoryService.updateCategoryImage(id, request)
        );
    }
}
