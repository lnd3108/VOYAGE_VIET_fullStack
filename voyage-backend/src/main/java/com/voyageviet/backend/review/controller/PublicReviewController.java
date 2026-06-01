package com.voyageviet.backend.review.controller;

import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.review.dto.ReviewResponse;
import com.voyageviet.backend.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicReviewController {

    private final ReviewService reviewService;

    @GetMapping("/tours/{tourSlug}/reviews")
    public ApiResponse<List<ReviewResponse>> getReviewsByTourSlug(
            @PathVariable String tourSlug
    ) {
        return ApiResponse.success(
                "Get tour reviews successfully",
                reviewService.getPublicReviewsByTourSlug(tourSlug)
        );
    }
}