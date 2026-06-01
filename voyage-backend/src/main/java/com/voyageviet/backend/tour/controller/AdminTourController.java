package com.voyageviet.backend.tour.controller;

import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.media.dto.ImageUrlUpdateRequest;
import com.voyageviet.backend.tour.dto.AdminTourDetailResponse;
import com.voyageviet.backend.tour.dto.TourCardResponse;
import com.voyageviet.backend.tour.dto.TourCreateRequest;
import com.voyageviet.backend.tour.dto.TourStatusUpdateRequest;
import com.voyageviet.backend.tour.dto.TourUpdateRequest;
import com.voyageviet.backend.tour.service.TourService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/tours")
@RequiredArgsConstructor
public class AdminTourController {

    private final TourService tourService;

    @GetMapping
    public ApiResponse<List<TourCardResponse>> getAllTours() {
        return ApiResponse.success(
                "Get admin tours successfully",
                tourService.getAllToursForAdmin()
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<AdminTourDetailResponse> getTourDetail(@PathVariable Long id) {
        return ApiResponse.success(
                "Get admin tour detail successfully",
                tourService.getAdminTourDetail(id)
        );
    }

    @PostMapping
    public ApiResponse<TourCardResponse> createTour(
            @Valid @RequestBody TourCreateRequest request
    ) {
        return ApiResponse.success(
                "Create tour successfully",
                tourService.createTour(request)
        );
    }

    @PutMapping("/{id}")
    public ApiResponse<TourCardResponse> updateTour(
            @PathVariable Long id,
            @Valid @RequestBody TourUpdateRequest request
    ) {
        return ApiResponse.success(
                "Update tour successfully",
                tourService.updateTour(id, request)
        );
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<TourCardResponse> updateTourStatus(
            @PathVariable Long id,
            @Valid @RequestBody TourStatusUpdateRequest request
    ) {
        return ApiResponse.success(
                "Update tour status successfully",
                tourService.updateTourStatus(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteTour(@PathVariable Long id) {
        tourService.deleteTour(id);
        return ApiResponse.success("Delete tour successfully", null);
    }

    @PatchMapping("/{id}/thumbnail")
    public ApiResponse<TourCardResponse> updateTourThumbnail(
            @PathVariable Long id,
            @Valid @RequestBody ImageUrlUpdateRequest request
    ) {
        return ApiResponse.success(
                "Update tour thumbnail successfully",
                tourService.updateTourThumbnail(id, request)
        );
    }
}
