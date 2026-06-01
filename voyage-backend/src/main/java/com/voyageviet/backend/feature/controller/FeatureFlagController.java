package com.voyageviet.backend.feature.controller;

import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.feature.entity.FeatureCode;
import com.voyageviet.backend.feature.service.FeatureFlagService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/public/features")
@RequiredArgsConstructor
public class FeatureFlagController {

    private final FeatureFlagService featureFlagService;

    @GetMapping
    public ApiResponse<Map<FeatureCode, Boolean>> getPublicFeatures() {
        return ApiResponse.success(
                "Get feature flags successfully",
                featureFlagService.getPublicFeatureMap()
        );
    }
}