package com.voyageviet.backend.user.dto;

import com.voyageviet.backend.role.entity.RoleCode;
import jakarta.validation.constraints.NotNull;

public record UserRoleUpdateRequest(

        @NotNull(message = "Role is required")
        RoleCode role
) {
}