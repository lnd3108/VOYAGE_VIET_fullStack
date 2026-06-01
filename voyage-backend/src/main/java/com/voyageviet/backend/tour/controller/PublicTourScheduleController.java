package com.voyageviet.backend.tour.controller;

import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.tour.dto.PublicTourScheduleResponse;
import com.voyageviet.backend.tour.service.TourScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/tours")
@RequiredArgsConstructor
public class PublicTourScheduleController {

    private final TourScheduleService scheduleService;

    @GetMapping("/{slug}/schedules")
    public ApiResponse<List<PublicTourScheduleResponse>> getPublicSchedules(@PathVariable String slug) {
        return ApiResponse.success("Get public tour schedules successfully", scheduleService.getPublicScheduleSummariesByTourSlug(slug));
    }
}
