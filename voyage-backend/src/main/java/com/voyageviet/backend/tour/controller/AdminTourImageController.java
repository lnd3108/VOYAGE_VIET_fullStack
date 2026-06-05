package com.voyageviet.backend.tour.controller;

import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.tour.dto.*;
import com.voyageviet.backend.tour.service.TourImageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/tours")
@RequiredArgsConstructor
public class AdminTourImageController {

    private final TourImageService imageService;

    @GetMapping("/{id}/images")
    public ApiResponse<List<TourImageResponse>> getImages(@PathVariable Long id) {
        return ApiResponse.success("Get tour images successfully", imageService.getImages(id));
    }

    @PostMapping("/{id}/images")
    public ApiResponse<TourImageResponse> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String altText
    ) {
        return ApiResponse.success("Upload tour image successfully", imageService.uploadImage(id, file, altText));
    }

    @PostMapping("/{id}/images/from-media")
    public ApiResponse<TourImageResponse> attachImageFromMedia(
            @PathVariable Long id,
            @Valid @RequestBody TourImageFromMediaRequest request
    ) {
        return ApiResponse.success("Attach media to tour gallery successfully", imageService.attachImageFromMedia(id, request));
    }

    @DeleteMapping("/{tourId}/images/{imageId}")
    public ApiResponse<Void> deleteImage(
            @PathVariable Long tourId,
            @PathVariable Long imageId
    ) {
        imageService.deleteImage(tourId, imageId);
        return ApiResponse.success("Delete tour image successfully", null);
    }

    @PatchMapping("/{tourId}/images/{imageId}/thumbnail")
    public ApiResponse<TourImageResponse> setThumbnail(
            @PathVariable Long tourId,
            @PathVariable Long imageId
    ) {
        return ApiResponse.success("Set tour thumbnail successfully", imageService.setThumbnail(tourId, imageId));
    }

    @PatchMapping("/{id}/images/reorder")
    public ApiResponse<List<TourImageResponse>> reorderImages(
            @PathVariable Long id,
            @Valid @RequestBody TourImageReorderRequest request
    ) {
        return ApiResponse.success("Reorder tour images successfully", imageService.reorderImages(id, request));
    }

    @PatchMapping("/{tourId}/images/{imageId}/alt")
    public ApiResponse<TourImageResponse> updateAltText(
            @PathVariable Long tourId,
            @PathVariable Long imageId,
            @Valid @RequestBody TourImageAltRequest request
    ) {
        return ApiResponse.success("Update tour image alt text successfully", imageService.updateAltText(tourId, imageId, request.altText()));
    }
}

