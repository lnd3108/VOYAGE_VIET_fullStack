package com.voyageviet.backend.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserProfileUpdateRequest(
        @NotBlank(message = "Full name is required")
        @Size(max = 150, message = "Full name must not exceed 150 characters")
        String fullName,

        @Pattern(regexp = "^(|[0-9]{9,11})$", message = "Phone must contain 9 to 11 digits")
        String phone
) {
}
