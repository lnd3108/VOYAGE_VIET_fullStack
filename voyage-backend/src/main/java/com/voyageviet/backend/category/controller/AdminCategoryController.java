package com.voyageviet.backend.category.controller;

import com.voyageviet.backend.category.dto.CategoryCreateRequest;
import com.voyageviet.backend.category.dto.CategoryResponse;
import com.voyageviet.backend.category.dto.CategoryStatusUpdateRequest;
import com.voyageviet.backend.category.dto.CategoryUpdateRequest;
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