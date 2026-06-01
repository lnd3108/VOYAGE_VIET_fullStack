package com.voyageviet.backend.review.controller;

import com.voyageviet.backend.common.paging.PageResponse;
import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.review.dto.ReviewResponse;
import com.voyageviet.backend.review.dto.ReviewStatusUpdateRequest;
import com.voyageviet.backend.review.entity.ReviewStatus;
import com.voyageviet.backend.review.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ApiResponse<PageResponse<ReviewResponse>> getAllReviews(
            @RequestParam(required = false) ReviewStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        return ApiResponse.success(
                "Get admin reviews successfully",
                reviewService.getAllReviewsForAdmin(status, page, size, sortBy, sortDir)
        );
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<ReviewResponse> updateReviewStatus(
            @PathVariable Long id,
            @Valid @RequestBody ReviewStatusUpdateRequest request
    ) {
        return ApiResponse.success(
                "Update review status successfully",
                reviewService.updateReviewStatus(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ApiResponse.success("Delete review successfully", null);
    }
}