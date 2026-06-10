package com.voyageviet.backend.category.dto.request;

import jakarta.validation.constraints.Size;

public record CategoryRejectRequest(

        @Size(max = 500, message = "Reject reason must not exceed 500 characters")
        String reason
) {
}
