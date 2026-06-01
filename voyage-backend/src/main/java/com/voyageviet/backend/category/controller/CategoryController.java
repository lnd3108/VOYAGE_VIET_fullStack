package com.voyageviet.backend.category.controller;

import com.voyageviet.backend.category.dto.CategoryResponse;
import com.voyageviet.backend.category.service.CategoryService;
import com.voyageviet.backend.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ApiResponse<List<CategoryResponse>> getActiveCategories() {
        return ApiResponse.success("Get categories successfully", categoryService.getActiveCategories());
    }
}