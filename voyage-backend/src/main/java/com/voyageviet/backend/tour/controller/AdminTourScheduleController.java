package com.voyageviet.backend.tour.controller;

import com.voyageviet.backend.common.paging.PageResponse;
import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.tour.dto.*;
import com.voyageviet.backend.tour.entity.TourScheduleStatus;
import com.voyageviet.backend.tour.service.TourPublishService;
import com.voyageviet.backend.tour.service.TourScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/tours")
@RequiredArgsConstructor
public class AdminTourScheduleController {

    private final TourScheduleService scheduleService;
    private final TourPublishService publishService;

    @PostMapping("/{id}/schedules")
    public ApiResponse<TourScheduleResponse> createSchedule(
            @PathVariable Long id,
            @Valid @RequestBody TourScheduleCreateRequest request
    ) {
        return ApiResponse.success("Create tour schedule successfully", scheduleService.createSchedule(id, request));
    }

    @GetMapping("/{id}/schedules")
    public ApiResponse<PageResponse<TourScheduleResponse>> getSchedules(
            @PathVariable Long id,
            @RequestParam(required = false) TourScheduleStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.success(
                "Get tour schedules successfully",
                scheduleService.getAdminSchedules(id, status, PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "departureDate", "id")))
        );
    }

    @GetMapping("/{tourId}/schedules/{id}")
    public ApiResponse<TourScheduleResponse> getScheduleDetail(
            @PathVariable Long tourId,
            @PathVariable Long id
    ) {
        return ApiResponse.success("Get tour schedule successfully", scheduleService.getScheduleDetail(tourId, id));
    }

    @PutMapping("/{tourId}/schedules/{id}")
    public ApiResponse<TourScheduleResponse> updateSchedule(
            @PathVariable Long tourId,
            @PathVariable Long id,
            @Valid @RequestBody TourScheduleUpdateRequest request
    ) {
        return ApiResponse.success("Update tour schedule successfully", scheduleService.updateSchedule(tourId, id, request));
    }

    @DeleteMapping("/{tourId}/schedules/{id}")
    public ApiResponse<Void> deleteSchedule(
            @PathVariable Long tourId,
            @PathVariable Long id
    ) {
        scheduleService.deleteSchedule(tourId, id);
        return ApiResponse.success("Delete tour schedule successfully", null);
    }

    @PatchMapping("/{tourId}/schedules/{id}/status")
    public ApiResponse<TourScheduleResponse> updateStatus(
            @PathVariable Long tourId,
            @PathVariable Long id,
            @Valid @RequestBody TourScheduleStatusRequest request
    ) {
        return ApiResponse.success("Update tour schedule status successfully", scheduleService.updateStatus(tourId, id, request.status()));
    }

    @PostMapping("/{tourId}/schedules/{id}/duplicate")
    public ApiResponse<TourScheduleResponse> duplicateSchedule(
            @PathVariable Long tourId,
            @PathVariable Long id,
            @Valid @RequestBody TourScheduleDuplicateRequest request
    ) {
        return ApiResponse.success("Duplicate tour schedule successfully", scheduleService.duplicateSchedule(tourId, id, request.departureDate()));
    }

    @GetMapping("/{id}/publish-checklist")
    public ApiResponse<PublishChecklistResponse> getPublishChecklist(@PathVariable Long id) {
        return ApiResponse.success("Get publish checklist successfully", publishService.getPublishChecklist(id));
    }

    @PostMapping("/{id}/publish")
    public ApiResponse<PublishChecklistResponse> publishTour(@PathVariable Long id) {
        return ApiResponse.success("Publish tour successfully", publishService.publishTour(id));
    }
}
