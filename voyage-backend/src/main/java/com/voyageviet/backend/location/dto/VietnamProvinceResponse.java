package com.voyageviet.backend.location.dto;

public record VietnamProvinceResponse(
        Integer code,
        String name,
        String displayName,
        String codename,
        String divisionType
) {
}