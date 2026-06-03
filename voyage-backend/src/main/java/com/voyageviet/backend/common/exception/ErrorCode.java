package com.voyageviet.backend.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    INVALID_REQUEST("CM_400", "Invalid request", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED("CM_401", "Unauthorized", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("CM_403", "Forbidden", HttpStatus.FORBIDDEN),
    NOT_FOUND("CM_404", "Resource not found", HttpStatus.NOT_FOUND),
    CONFLICT("CM_409", "Resource already exists", HttpStatus.CONFLICT),
    VALIDATION_FAILED("CM_422", "Validation failed", HttpStatus.UNPROCESSABLE_ENTITY),
    INTERNAL_ERROR("CM_500", "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR),

    USER_NOT_FOUND("USER_404", "User not found", HttpStatus.NOT_FOUND),
    USER_ALREADY_EXISTS("USER_409", "User already exists", HttpStatus.CONFLICT),
    USER_INVALID_STATUS("USER_422", "Invalid user status", HttpStatus.UNPROCESSABLE_ENTITY),
    USER_INVALID_ROLE("USER_422", "Invalid user role", HttpStatus.UNPROCESSABLE_ENTITY),
    USER_FORBIDDEN_ACTION("USER_403", "You are not allowed to perform this user action", HttpStatus.FORBIDDEN),
    ROLE_NOT_FOUND("ROLE_404", "Role not found", HttpStatus.NOT_FOUND),

    INVALID_CREDENTIALS("AUTH_401", "Invalid email or password", HttpStatus.UNAUTHORIZED),
    ACCOUNT_DISABLED("AUTH_403", "Account is disabled", HttpStatus.FORBIDDEN),

    TOUR_NOT_FOUND("TOUR_404", "Tour not found", HttpStatus.NOT_FOUND),
    TOUR_ALREADY_EXISTS("TOUR_409", "Tour already exists", HttpStatus.CONFLICT),

    TOUR_INVALID_PRICE("TOUR_422", "Tour price is invalid", HttpStatus.UNPROCESSABLE_ENTITY),
    TOUR_SCHEDULE_NOT_FOUND("TOUR_SCHEDULE_404", "Tour schedule not found", HttpStatus.NOT_FOUND),
    TOUR_SCHEDULE_INVALID("TOUR_SCHEDULE_422", "Tour schedule is invalid", HttpStatus.UNPROCESSABLE_ENTITY),
    TOUR_ITINERARY_INVALID("TOUR_ITINERARY_422", "Tour itinerary is invalid", HttpStatus.UNPROCESSABLE_ENTITY),
    TOUR_IMAGE_NOT_FOUND("TOUR_IMAGE_404", "Tour image not found", HttpStatus.NOT_FOUND),
    TOUR_IMAGE_INVALID("TOUR_IMAGE_422", "Tour image is invalid", HttpStatus.UNPROCESSABLE_ENTITY),
    TOUR_PUBLISH_INVALID("TOUR_PUBLISH_422", "Tour cannot be published", HttpStatus.UNPROCESSABLE_ENTITY),

    CATEGORY_NOT_FOUND("CATEGORY_404", "Category not found", HttpStatus.NOT_FOUND),
    CATEGORY_ALREADY_EXISTS("CATEGORY_409", "Category already exists", HttpStatus.CONFLICT),
    CATEGORY_IN_USE("CATEGORY_422", "Category is being used by tours", HttpStatus.UNPROCESSABLE_ENTITY),

    DESTINATION_NOT_FOUND("DESTINATION_404", "Destination not found", HttpStatus.NOT_FOUND),
    DESTINATION_ALREADY_EXISTS("DESTINATION_409", "Destination already exists", HttpStatus.CONFLICT),
    DESTINATION_IN_USE("DESTINATION_422", "Destination is being used by tours", HttpStatus.UNPROCESSABLE_ENTITY),

    BOOKING_NOT_ENOUGH_SEATS("BOOKING_409", "Not enough seats available", HttpStatus.CONFLICT),
    BOOKING_FORBIDDEN("BOOKING_403", "You are not allowed to access this booking", HttpStatus.FORBIDDEN),
    BOOKING_NOT_FOUND("BOOKING_404", "Booking not found", HttpStatus.NOT_FOUND),
    BOOKING_INVALID_STATUS("BOOKING_422", "Invalid booking status", HttpStatus.UNPROCESSABLE_ENTITY),

    PAYMENT_NOT_FOUND("PAYMENT_404", "Payment not found", HttpStatus.NOT_FOUND),
    PAYMENT_INVALID_STATUS("PAYMENT_422", "Invalid payment status", HttpStatus.UNPROCESSABLE_ENTITY),
    PAYMENT_INVALID_AMOUNT("PAYMENT_422", "Invalid payment amount", HttpStatus.UNPROCESSABLE_ENTITY),
    PAYMENT_ALREADY_PAID("PAYMENT_409", "Booking has already been paid", HttpStatus.CONFLICT),
    PAYMENT_GATEWAY_NOT_CONFIGURED("PAYMENT_503", "Payment gateway is not configured", HttpStatus.SERVICE_UNAVAILABLE),
    PAYMENT_SIGNATURE_INVALID("PAYMENT_400", "Invalid payment signature", HttpStatus.BAD_REQUEST),

    PROMOTION_NOT_FOUND("PROMOTION_404", "Promotion not found", HttpStatus.NOT_FOUND),
    PROMOTION_ALREADY_EXISTS("PROMOTION_409", "Promotion already exists", HttpStatus.CONFLICT),
    PROMOTION_INVALID("PROMOTION_422", "Promotion is invalid", HttpStatus.UNPROCESSABLE_ENTITY),
    PROMOTION_IN_USE("PROMOTION_422", "Promotion is already used", HttpStatus.UNPROCESSABLE_ENTITY),

    FEATURE_FLAG_NOT_FOUND("FEATURE_404", "Feature flag not found", HttpStatus.NOT_FOUND),

    REVIEW_NOT_FOUND("REVIEW_404", "Review not found", HttpStatus.NOT_FOUND),
    REVIEW_ALREADY_EXISTS("REVIEW_409", "Review already exists", HttpStatus.CONFLICT),
    REVIEW_NOT_ALLOWED("REVIEW_403", "You are not allowed to review this tour", HttpStatus.FORBIDDEN),
    REVIEW_INVALID_RATING("REVIEW_422", "Review rating is invalid", HttpStatus.UNPROCESSABLE_ENTITY),
    FEATURE_DISABLED("FEATURE_403", "Feature is disabled", HttpStatus.FORBIDDEN),

    MEDIA_NOT_FOUND("MEDIA_404", "Media not found", HttpStatus.NOT_FOUND),
    MEDIA_UPLOAD_FAILED("MEDIA_500", "Media upload failed", HttpStatus.INTERNAL_SERVER_ERROR),
    MEDIA_INVALID_FILE("MEDIA_400", "Invalid media file", HttpStatus.BAD_REQUEST);


    private final String code;
    private final String message;
    private final HttpStatus status;

    ErrorCode(String code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }
}
