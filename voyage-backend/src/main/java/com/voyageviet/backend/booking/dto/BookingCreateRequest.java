package com.voyageviet.backend.booking.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record BookingCreateRequest(

        @NotNull(message = "Tour ID is required")
        Long tourId,

        @NotBlank(message = "Contact name is required")
        @Size(max = 150, message = "Contact name must not exceed 150 characters")
        String contactName,

        @NotBlank(message = "Contact email is required")
        @Email(message = "Contact email is invalid")
        @Size(max = 150, message = "Contact email must not exceed 150 characters")
        String contactEmail,

        @NotBlank(message = "Contact phone is required")
        @Pattern(regexp = "^[0-9]{9,11}$", message = "Contact phone must contain 9 to 11 digits")
        String contactPhone,

        LocalDate startDate,

        @NotNull(message = "Number of people is required")
        @Min(value = 1, message = "Number of people must be greater than or equal to 1")
        Integer numberOfPeople,

        @Size(max = 1000, message = "Note must not exceed 1000 characters")
        String note
) {
}