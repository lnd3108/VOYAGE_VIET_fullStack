package com.voyageviet.backend.destination.controller;

import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.destination.dto.DestinationCreateRequest;
import com.voyageviet.backend.destination.dto.DestinationResponse;
import com.voyageviet.backend.destination.dto.DestinationStatusUpdateRequest;
import com.voyageviet.backend.destination.dto.DestinationUpdateRequest;
import com.voyageviet.backend.destination.service.DestinationService;
import com.voyageviet.backend.media.dto.ImageUrlUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/destinations")
@RequiredArgsConstructor
public class AdminDestinationController {

    private final DestinationService destinationService;

    @GetMapping
    public ApiResponse<List<DestinationResponse>> getAllDestinations() {
        return ApiResponse.success(
                "Get admin destinations successfully",
                destinationService.getAllDestinationsForAdmin()
        );
    }

    @PostMapping
    public ApiResponse<DestinationResponse> createDestination(
            @Valid @RequestBody DestinationCreateRequest request
    ) {
        return ApiResponse.success(
                "Create destination successfully",
                destinationService.createDestination(request)
        );
    }

    @PutMapping("/{id}")
    public ApiResponse<DestinationResponse> updateDestination(
            @PathVariable Long id,
            @Valid @RequestBody DestinationUpdateRequest request
    ) {
        return ApiResponse.success(
                "Update destination successfully",
                destinationService.updateDestination(id, request)
        );
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<DestinationResponse> updateDestinationStatus(
            @PathVariable Long id,
            @Valid @RequestBody DestinationStatusUpdateRequest request
    ) {
        return ApiResponse.success(
                "Update destination status successfully",
                destinationService.updateDestinationStatus(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteDestination(@PathVariable Long id) {
        destinationService.deleteDestination(id);
        return ApiResponse.success("Delete destination successfully", null);
    }

    @PatchMapping("/{id}/image")
    public ApiResponse<DestinationResponse> updateDestinationImage(
            @PathVariable Long id,
            @Valid @RequestBody ImageUrlUpdateRequest request
    ) {
        return ApiResponse.success(
                "Update destination image successfully",
                destinationService.updateDestinationImage(id, request)
        );
    }
}