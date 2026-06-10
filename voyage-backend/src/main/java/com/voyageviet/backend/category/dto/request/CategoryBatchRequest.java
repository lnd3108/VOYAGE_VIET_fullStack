package com.voyageviet.backend.category.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CategoryBatchRequest(

        @NotEmpty(message = "Category ids must not be empty")
        List<@NotNull(message = "Category id must not be null") Long> ids
) {
}
