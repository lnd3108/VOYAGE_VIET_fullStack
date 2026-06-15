package com.voyageviet.backend.destination.controller;

import com.voyageviet.backend.common.paging.PageResponse;
import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.destination.dto.response.DestinationResponse;
import com.voyageviet.backend.destination.service.DestinationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/destinations")
@RequiredArgsConstructor
public class DestinationController {

    private final DestinationService destinationService;

    @GetMapping
    public ApiResponse<List<DestinationResponse>> getActiveDestinations() {
        return ApiResponse.success("Get destinations successfully", destinationService.getActiveDestinations());
    }

    @GetMapping("/page")
    public ApiResponse<PageResponse<DestinationResponse>> getActiveDestinationsPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String country,
            @RequestParam(defaultValue = "name,asc") String sort
    ) {
        return ApiResponse.success(
                "Get destination page successfully",
                destinationService.getPublicDestinationsPage(page, size, keyword, region, country, sort)
        );
    }
}
