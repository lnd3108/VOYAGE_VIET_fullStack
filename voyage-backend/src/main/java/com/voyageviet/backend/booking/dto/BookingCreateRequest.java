package com.voyageviet.backend.booking.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record BookingCreateRequest(

        Long scheduleId,

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

        @Min(value = 1, message = "Number of people must be greater than or equal to 1")
        Integer numberOfPeople,

        @Min(value = 1, message = "Adult count must be greater than or equal to 1")
        Integer adultCount,

        @Min(value = 0, message = "Child count must be greater than or equal to 0")
        Integer childCount,

        @Min(value = 0, message = "Infant count must be greater than or equal to 0")
        Integer infantCount,

        @Size(max = 50, message = "Promotion code must not exceed 50 characters")
        String promoCode,

        @Size(max = 1000, message = "Note must not exceed 1000 characters")
        String note
) {
}
