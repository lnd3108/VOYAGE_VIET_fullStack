package com.voyageviet.backend.review.controller;

import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.review.dto.ReviewCreateRequest;
import com.voyageviet.backend.review.dto.ReviewResponse;
import com.voyageviet.backend.review.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ApiResponse<ReviewResponse> createReview(
            Authentication authentication,
            @Valid @RequestBody ReviewCreateRequest request
    ) {
        return ApiResponse.success(
                "Create review successfully",
                reviewService.createReview(authentication, request)
        );
    }
}