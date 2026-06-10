package com.voyageviet.backend.destination.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record DestinationBatchRequest(

        @NotEmpty(message = "Destination ids must not be empty")
        List<@NotNull(message = "Destination id must not be null") Long> ids
) {
}
