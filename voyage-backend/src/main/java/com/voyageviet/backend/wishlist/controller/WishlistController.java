package com.voyageviet.backend.wishlist.controller;

import com.voyageviet.backend.common.paging.PageResponse;
import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.wishlist.dto.WishlistToggleResponse;
import com.voyageviet.backend.wishlist.dto.WishlistTourResponse;
import com.voyageviet.backend.wishlist.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ApiResponse<PageResponse<WishlistTourResponse>> getMyWishlist(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        return ApiResponse.success(
                "Get wishlist successfully",
                wishlistService.getMyWishlist(authentication, page, size, sortBy, sortDir)
        );
    }

    @PostMapping("/{tourId}")
    public ApiResponse<WishlistToggleResponse> toggleWishlist(
            Authentication authentication,
            @PathVariable Long tourId
    ) {
        WishlistToggleResponse response = wishlistService.toggleWishlist(authentication, tourId);
        String message = response.wishlisted()
                ? "Đã thêm tour vào danh sách yêu thích."
                : "Đã xóa tour khỏi danh sách yêu thích.";
        return ApiResponse.success(message, response);
    }
}
