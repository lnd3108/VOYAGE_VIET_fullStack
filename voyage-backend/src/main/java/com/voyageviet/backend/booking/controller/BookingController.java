package com.voyageviet.backend.booking.controller;

import com.voyageviet.backend.booking.dto.BookingCreateRequest;
import com.voyageviet.backend.booking.dto.BookingResponse;
import com.voyageviet.backend.booking.entity.BookingStatus;
import com.voyageviet.backend.booking.service.BookingService;
import com.voyageviet.backend.common.paging.PageResponse;
import com.voyageviet.backend.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ApiResponse<BookingResponse> createBooking(
            Authentication authentication,
            @Valid @RequestBody BookingCreateRequest request
    ) {
        return ApiResponse.success(
                "Create booking successfully",
                bookingService.createBooking(authentication, request)
        );
    }

    @GetMapping("/me")
    public ApiResponse<PageResponse<BookingResponse>> getMyBookings(
            Authentication authentication,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        return ApiResponse.success(
                "Get my bookings successfully",
                bookingService.getMyBookings(authentication, status, page, size, sortBy, sortDir)
        );
    }

    @PatchMapping("/{id}/cancel")
    public ApiResponse<BookingResponse> cancelMyBooking(
            Authentication authentication,
            @PathVariable Long id
    ) {
        return ApiResponse.success(
                "Cancel booking successfully",
                bookingService.cancelMyBooking(authentication, id)
        );
    }
}