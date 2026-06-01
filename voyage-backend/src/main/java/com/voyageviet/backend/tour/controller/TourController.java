package com.voyageviet.backend.tour.controller;

import com.voyageviet.backend.common.paging.PageResponse;
import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.tour.dto.TourCardResponse;
import com.voyageviet.backend.tour.dto.TourDetailResponse;
import com.voyageviet.backend.tour.service.TourService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/public/tours")
@RequiredArgsConstructor
public class TourController {

    private final TourService tourService;

    @GetMapping
    public ApiResponse<PageResponse<TourCardResponse>> getPublicTours(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String categorySlug,
            @RequestParam(required = false) String destinationSlug,

            @RequestParam(required = false) String region,
            @RequestParam(required = false) String departureLocation,

            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,

            @RequestParam(required = false) Integer minDurationDays,
            @RequestParam(required = false) Integer maxDurationDays,

            @RequestParam(required = false) Integer people,

            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        return ApiResponse.success(
                "Get public tours successfully",
                tourService.getPublicTours(
                        keyword,
                        categorySlug,
                        destinationSlug,
                        region,
                        departureLocation,
                        minPrice,
                        maxPrice,
                        minDurationDays,
                        maxDurationDays,
                        people,
                        page,
                        size,
                        sortBy,
                        sortDir
                )
        );
    }

    @GetMapping("/featured")
    public ApiResponse<List<TourCardResponse>> getFeaturedTours() {
        return ApiResponse.success("Get featured tours successfully", tourService.getFeaturedTours());
    }

    @GetMapping("/{slug}")
    public ApiResponse<TourDetailResponse> getTourDetail(@PathVariable String slug) {
        return ApiResponse.success(
                "Get tour detail successfully",
                tourService.getPublicTourDetail(slug)
        );
    }
}