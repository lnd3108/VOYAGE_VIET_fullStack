package com.voyageviet.backend.tour.controller;

import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.tour.dto.*;
import com.voyageviet.backend.tour.service.TourItineraryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/tours")
@RequiredArgsConstructor
public class AdminTourItineraryController {

    private final TourItineraryService itineraryService;

    @GetMapping("/{id}/itineraries")
    public ApiResponse<List<TourItineraryResponse>> getItineraries(@PathVariable Long id) {
        return ApiResponse.success("Get tour itineraries successfully", itineraryService.getAdminItineraries(id));
    }

    @PutMapping("/{id}/itineraries")
    public ApiResponse<List<TourItineraryResponse>> saveItineraries(
            @PathVariable Long id,
            @Valid @RequestBody TourItinerarySaveRequest request
    ) {
        return ApiResponse.success("Save tour itineraries successfully", itineraryService.saveAllItineraries(id, request));
    }

    @PostMapping("/{id}/itineraries/reorder")
    public ApiResponse<List<TourItineraryResponse>> reorderItineraries(
            @PathVariable Long id,
            @Valid @RequestBody TourItineraryReorderRequest request
    ) {
        return ApiResponse.success("Reorder tour itineraries successfully", itineraryService.reorder(id, request));
    }
}
