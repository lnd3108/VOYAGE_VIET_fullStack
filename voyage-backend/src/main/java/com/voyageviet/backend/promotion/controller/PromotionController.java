package com.voyageviet.backend.promotion.controller;

import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.promotion.dto.ValidatePromoRequest;
import com.voyageviet.backend.promotion.dto.ValidatePromoResponse;
import com.voyageviet.backend.promotion.service.PromotionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;

    @PostMapping("/api/bookings/validate-promo")
    public ApiResponse<ValidatePromoResponse> validatePromo(
            Authentication authentication,
            @Valid @RequestBody ValidatePromoRequest request
    ) {
        return ApiResponse.success(
                "Validate promotion successfully",
                promotionService.validatePromo(authentication, request)
        );
    }
}
