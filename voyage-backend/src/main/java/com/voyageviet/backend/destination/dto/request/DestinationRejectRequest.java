package com.voyageviet.backend.destination.dto.request;

import jakarta.validation.constraints.Size;

public record DestinationRejectRequest(

        @Size(max = 500, message = "Reject reason must not exceed 500 characters")
        String reason
) {
}
