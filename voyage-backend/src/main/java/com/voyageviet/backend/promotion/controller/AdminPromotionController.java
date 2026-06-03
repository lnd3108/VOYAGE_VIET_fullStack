package com.voyageviet.backend.promotion.controller;

import com.voyageviet.backend.common.paging.PageResponse;
import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.promotion.dto.AdminPromotionCreateRequest;
import com.voyageviet.backend.promotion.dto.AdminPromotionUpdateRequest;
import com.voyageviet.backend.promotion.dto.PromotionResponse;
import com.voyageviet.backend.promotion.dto.PromotionStatusRequest;
import com.voyageviet.backend.promotion.entity.PromotionStatus;
import com.voyageviet.backend.promotion.service.PromotionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/promotions")
@RequiredArgsConstructor
public class AdminPromotionController {

    private final PromotionService promotionService;

    @GetMapping
    public ApiResponse<PageResponse<PromotionResponse>> getPromotions(
            @RequestParam(required = false) PromotionStatus status,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) LocalDate dateFrom,
            @RequestParam(required = false) LocalDate dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        return ApiResponse.success(
                "Get promotions successfully",
                promotionService.getPromotions(status, code, dateFrom, dateTo, page, size, sortBy, sortDir)
        );
    }

    @PostMapping
    public ApiResponse<PromotionResponse> createPromotion(
            Authentication authentication,
            @Valid @RequestBody AdminPromotionCreateRequest request
    ) {
        return ApiResponse.success(
                "Create promotion successfully",
                promotionService.createPromotion(authentication, request)
        );
    }

    @PutMapping("/{id}")
    public ApiResponse<PromotionResponse> updatePromotion(
            @PathVariable Long id,
            @Valid @RequestBody AdminPromotionUpdateRequest request
    ) {
        return ApiResponse.success(
                "Update promotion successfully",
                promotionService.updatePromotion(id, request)
        );
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<PromotionResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody PromotionStatusRequest request
    ) {
        return ApiResponse.success(
                "Update promotion status successfully",
                promotionService.updateStatus(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deletePromotion(@PathVariable Long id) {
        promotionService.deletePromotion(id);
        return ApiResponse.success("Delete promotion successfully", null);
    }
}
