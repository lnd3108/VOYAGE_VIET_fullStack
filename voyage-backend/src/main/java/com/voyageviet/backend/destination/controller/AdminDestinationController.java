package com.voyageviet.backend.destination.controller;

import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.destination.dto.request.*;
import com.voyageviet.backend.destination.dto.response.DestinationBatchActionResponse;
import com.voyageviet.backend.destination.dto.response.DestinationResponse;
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
                "Save destination change successfully",
                destinationService.updateDestination(id, request)
        );
    }

    @PatchMapping("/{id}")
    public ApiResponse<DestinationResponse> patchDestination(
            @PathVariable Long id,
            @Valid @RequestBody DestinationPatchRequest request
    ) {
        return ApiResponse.success(
                "Save destination change successfully",
                destinationService.patchDestination(id, request)
        );
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<DestinationResponse> updateDestinationStatus(
            @PathVariable Long id,
            @Valid @RequestBody DestinationStatusUpdateRequest request
    ) {
        return ApiResponse.success(
                "Update destination workflow status successfully",
                destinationService.updateDestinationStatus(id, request)
        );
    }

    @PatchMapping("/{id}/submit")
    public ApiResponse<DestinationResponse> submitDestination(@PathVariable Long id) {
        return ApiResponse.success(
                "Submit destination successfully",
                destinationService.submitDestination(id)
        );
    }

    @PatchMapping("/batch/submit")
    public ApiResponse<DestinationBatchActionResponse> submitDestinations(
            @Valid @RequestBody DestinationBatchRequest request
    ) {
        return ApiResponse.success(
                "Submit destinations successfully",
                destinationService.submitDestinations(request)
        );
    }

    @PatchMapping("/{id}/approve")
    public ApiResponse<DestinationResponse> approveDestination(@PathVariable Long id) {
        return ApiResponse.success(
                "Approve destination successfully",
                destinationService.approveDestination(id)
        );
    }

    @PatchMapping("/batch/approve")
    public ApiResponse<DestinationBatchActionResponse> approveDestinations(
            @Valid @RequestBody DestinationBatchRequest request
    ) {
        return ApiResponse.success(
                "Approve destinations successfully",
                destinationService.approveDestinations(request)
        );
    }

    @PatchMapping("/{id}/reject")
    public ApiResponse<DestinationResponse> rejectDestination(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) DestinationRejectRequest request
    ) {
        return ApiResponse.success(
                "Reject destination successfully",
                destinationService.rejectDestination(id, request == null ? null : request.reason())
        );
    }

    @PatchMapping("/batch/reject")
    public ApiResponse<DestinationBatchActionResponse> rejectDestinations(
            @Valid @RequestBody DestinationBatchRejectRequest request
    ) {
        return ApiResponse.success(
                "Reject destinations successfully",
                destinationService.rejectDestinations(request)
        );
    }

    @PatchMapping("/{id}/cancel-approve")
    public ApiResponse<DestinationResponse> cancelApproveDestination(@PathVariable Long id) {
        return ApiResponse.success(
                "Cancel destination approval successfully",
                destinationService.cancelApproveDestination(id)
        );
    }

    @PatchMapping("/batch/cancel-approve")
    public ApiResponse<DestinationBatchActionResponse> cancelApproveDestinations(
            @Valid @RequestBody DestinationBatchRequest request
    ) {
        return ApiResponse.success(
                "Cancel destinations approval successfully",
                destinationService.cancelApproveDestinations(request)
        );
    }

    @PatchMapping("/{id}/display")
    public ApiResponse<DestinationResponse> updateDestinationDisplay(
            @PathVariable Long id,
            @Valid @RequestBody DestinationDisplayUpdateRequest request
    ) {
        return ApiResponse.success(
                "Update destination display successfully",
                destinationService.updateDestinationDisplay(id, request)
        );
    }

    @PatchMapping("/batch/display")
    public ApiResponse<DestinationBatchActionResponse> updateDestinationsDisplay(
            @Valid @RequestBody DestinationBatchDisplayRequest request
    ) {
        return ApiResponse.success(
                "Update destinations display successfully",
                destinationService.updateDestinationsDisplay(request)
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
                "Save destination image change successfully",
                destinationService.updateDestinationImage(id, request)
        );
    }
}
