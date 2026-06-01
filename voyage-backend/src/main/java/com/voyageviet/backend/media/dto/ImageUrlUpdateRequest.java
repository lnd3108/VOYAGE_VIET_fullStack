package com.voyageviet.backend.media.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ImageUrlUpdateRequest(

        @NotBlank(message = "Image URL is required")
        @Size(max = 1000, message = "Image URL must not exceed 1000 characters")
        String imageUrl
) {
}