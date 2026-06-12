package com.voyageviet.backend.destination.dto.request;

import com.voyageviet.backend.destination.entity.DestinationStatus;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record DestinationPatchRequest(

        @NotBlank(message = "Destination name is required")
        @Size(max = 150, message = "Destination name must not exceed 150 characters")
        String name,

        @Size(max = 180, message = "Slug must not exceed 180 characters")
        String slug,

        @Size(max = 100, message = "Region must not exceed 100 characters")
        String region,

        @Size(max = 100, message = "Country must not exceed 100 characters")
        String country,

        @Size(max = 1000, message = "Description must not exceed 1000 characters")
        String description,

        @Size(max = 500, message = "Image URL must not exceed 500 characters")
        String imageUrl,

        @DecimalMin(value = "-90.0", message = "Latitude must be greater than or equal to -90")
        @DecimalMax(value = "90.0", message = "Latitude must be less than or equal to 90")
        BigDecimal latitude,

        @DecimalMin(value = "-180.0", message = "Longitude must be greater than or equal to -180")
        @DecimalMax(value = "180.0", message = "Longitude must be less than or equal to 180")
        BigDecimal longitude,

        DestinationStatus status,

        @Min(value = 0, message = "Display flag must be 0 or 1")
        @Max(value = 1, message = "Display flag must be 0 or 1")
        Integer isDisplay
) {
}
