package com.voyageviet.backend.tour.controller;

import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.tour.dto.TourItineraryResponse;
import com.voyageviet.backend.tour.service.TourItineraryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/tours")
@RequiredArgsConstructor
public class PublicTourItineraryController {

    private final TourItineraryService itineraryService;

    @GetMapping("/{slug}/itinerary")
    public ApiResponse<List<TourItineraryResponse>> getPublicItinerary(@PathVariable String slug) {
        return ApiResponse.success("Get public tour itinerary successfully", itineraryService.getPublicItinerary(slug));
    }
}
