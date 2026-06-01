package com.voyageviet.backend.media.controller;

import com.voyageviet.backend.common.paging.PageResponse;
import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.media.dto.MediaUploadResponse;
import com.voyageviet.backend.media.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/media")
@RequiredArgsConstructor
public class AdminMediaController {

    private final MediaService mediaService;

    @GetMapping
    public ApiResponse<PageResponse<MediaUploadResponse>> getMediaList(
            @RequestParam(required = false) String module,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        return ApiResponse.success(
                "Get media list successfully",
                mediaService.getMediaList(module, page, size, sortBy, sortDir)
        );
    }

    @PostMapping("/upload")
    public ApiResponse<MediaUploadResponse> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "general") String module
    ) {
        return ApiResponse.success(
                "Upload image successfully",
                mediaService.uploadImage(file, module)
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteMedia(@PathVariable Long id) {
        mediaService.deleteMedia(id);
        return ApiResponse.success("Delete media successfully", null);
    }
}