package com.voyageviet.backend.destination.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record DestinationBatchRejectRequest(

        @NotEmpty(message = "Destination ids must not be empty")
        List<@NotNull(message = "Destination id must not be null") Long> ids,

        @Size(max = 500, message = "Reject reason must not exceed 500 characters")
        String reason
) {
}
