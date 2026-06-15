package com.voyageviet.backend.destination.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DestinationRejectRequest(

        @NotBlank(message = "Reject reason is required")
        @Size(max = 500, message = "Reject reason must not exceed 500 characters")
        String reason
) {
}
