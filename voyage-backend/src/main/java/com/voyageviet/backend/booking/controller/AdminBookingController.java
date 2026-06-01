package com.voyageviet.backend.booking.controller;

import com.voyageviet.backend.booking.dto.BookingResponse;
import com.voyageviet.backend.booking.dto.BookingStatusUpdateRequest;
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
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
public class AdminBookingController {

    private final BookingService bookingService;

    @GetMapping
    public ApiResponse<PageResponse<BookingResponse>> getAllBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        return ApiResponse.success(
                "Get admin bookings successfully",
                bookingService.getAllBookingsForAdmin(status, page, size, sortBy, sortDir)
        );
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<BookingResponse> updateBookingStatus(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody BookingStatusUpdateRequest request
    ) {
        return ApiResponse.success(
                "Update booking status successfully",
                bookingService.updateBookingStatus(authentication, id, request)
        );
    }
}