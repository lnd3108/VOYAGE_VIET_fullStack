package com.voyageviet.backend.tour.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TourImageFromMediaRequest(
        @NotNull(message = "Media id is required")
        Long mediaId,

        @Size(max = 150, message = "Alt text must not exceed 150 characters")
        String altText,

        @Min(value = 0, message = "Sort order must be greater than or equal to 0")
        Integer sortOrder,

        Boolean thumbnail,

        Boolean isThumbnail
) {

    public boolean thumbnailRequested() {
        return Boolean.TRUE.equals(thumbnail) || Boolean.TRUE.equals(isThumbnail);
    }
}
