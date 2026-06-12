package com.voyageviet.backend.destination.controller;

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
}
