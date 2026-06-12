package com.voyageviet.backend.destination.dto.request;

import com.voyageviet.backend.destination.entity.DestinationStatus;
import jakarta.validation.constraints.NotNull;

public record DestinationStatusUpdateRequest(

        @NotNull(message = "Status is required")
        DestinationStatus status
) {
}
