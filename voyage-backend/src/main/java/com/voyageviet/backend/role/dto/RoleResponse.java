package com.voyageviet.backend.role.dto;

import com.voyageviet.backend.role.entity.RoleCode;

public record RoleResponse(
        Long id,
        RoleCode code,
        String name,
        String description
) {
}