package com.voyageviet.backend.user.dto;

import com.voyageviet.backend.user.entity.UserStatus;
import jakarta.validation.constraints.NotNull;

public record UserStatusUpdateRequest(

        @NotNull(message = "Status is required")
        UserStatus status
) {
}