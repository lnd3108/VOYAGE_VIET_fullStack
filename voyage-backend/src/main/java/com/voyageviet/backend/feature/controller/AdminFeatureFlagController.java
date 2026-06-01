package com.voyageviet.backend.feature.controller;

import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.feature.dto.FeatureFlagResponse;
import com.voyageviet.backend.feature.dto.FeatureFlagUpdateRequest;
import com.voyageviet.backend.feature.entity.FeatureCode;
import com.voyageviet.backend.feature.service.FeatureFlagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/features")
@RequiredArgsConstructor
public class AdminFeatureFlagController {

    private final FeatureFlagService featureFlagService;

    @GetMapping
    public ApiResponse<List<FeatureFlagResponse>> getAllFeatures() {
        return ApiResponse.success(
                "Get admin feature flags successfully",
                featureFlagService.getAllFeaturesForAdmin()
        );
    }

    @PatchMapping("/{code}")
    public ApiResponse<FeatureFlagResponse> updateFeatureStatus(
            Authentication authentication,
            @PathVariable FeatureCode code,
            @Valid @RequestBody FeatureFlagUpdateRequest request
    ) {
        return ApiResponse.success(
                "Update feature flag successfully",
                featureFlagService.updateFeatureStatus(authentication, code, request)
        );
    }
}