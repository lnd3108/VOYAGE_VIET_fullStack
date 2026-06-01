package com.voyageviet.backend.media.dto;

import com.voyageviet.backend.media.entity.MediaType;

public record MediaUploadResponse(
        Long id,
        String publicId,
        String secureUrl,
        String originalFilename,
        String format,
        String resourceType,
        MediaType mediaType,
        String folder,
        Long bytes,
        Integer width,
        Integer height
) {
}