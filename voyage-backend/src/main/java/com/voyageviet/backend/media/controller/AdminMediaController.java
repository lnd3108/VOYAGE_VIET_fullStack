package com.voyageviet.backend.media.controller;

import com.voyageviet.backend.common.paging.PageResponse;
import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.media.dto.MediaUploadResponse;
import com.voyageviet.backend.media.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/media")
@RequiredArgsConstructor
public class AdminMediaController {

    private static final String CATEGORY_MEDIA_MODULE = "categories";
    private static final String DESTINATION_MEDIA_MODULE = "destinations";

    private final MediaService mediaService;

    @GetMapping
    public ApiResponse<PageResponse<MediaUploadResponse>> getMediaList(
            @RequestParam(required = false) String module,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Authentication authentication
    ) {
        if (isStaffOnly(authentication)) {
            assertStaffMediaModule(module);
            return ApiResponse.success(
                    "Get staff media list successfully",
                    mediaService.getMediaListByModule(module.trim().toLowerCase(), page, size, sortBy, sortDir)
            );
        }

        return ApiResponse.success(
                "Get media list successfully",
                mediaService.getMediaList(module, page, size, sortBy, sortDir)
        );
    }

    @PostMapping("/upload")
    public ApiResponse<MediaUploadResponse> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "general") String module,
            Authentication authentication
    ) {
        if (isStaffOnly(authentication)) {
            assertStaffMediaModule(module);
        }

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

    private void assertStaffMediaModule(String module) {
        String normalizedModule = module == null ? "" : module.trim().toLowerCase();

        if (!CATEGORY_MEDIA_MODULE.equals(normalizedModule) && !DESTINATION_MEDIA_MODULE.equals(normalizedModule)) {
            throw new AccessDeniedException("STAFF can only access category or destination media");
        }
    }

    private boolean isStaffOnly(Authentication authentication) {
        if (authentication == null) {
            return false;
        }

        boolean staff = hasAuthority(authentication, "ROLE_STAFF");
        boolean admin = hasAuthority(authentication, "ROLE_ADMIN")
                || hasAuthority(authentication, "ROLE_SUPER_ADMIN");

        return staff && !admin;
    }

    private boolean hasAuthority(Authentication authentication, String authority) {
        return authentication.getAuthorities().stream()
                .anyMatch(item -> authority.equals(item.getAuthority()));
    }
}
