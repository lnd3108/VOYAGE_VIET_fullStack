package com.voyageviet.backend.common.exception;

import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.common.response.ErrorDetail;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException ex) {
        ErrorCode errorCode = ex.getErrorCode();

        ErrorDetail errorDetail = ErrorDetail.builder()
                .code(errorCode.getCode())
                .details(ex.getDetails())
                .build();

        ApiResponse<Void> response = ApiResponse.fail(ex.getMessage(), errorDetail);

        return ResponseEntity
                .status(errorCode.getStatus())
                .body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> details = new LinkedHashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(error ->
                details.put(error.getField(), error.getDefaultMessage())
        );

        ErrorCode errorCode = ErrorCode.VALIDATION_FAILED;

        ErrorDetail errorDetail = ErrorDetail.builder()
                .code(errorCode.getCode())
                .details(details)
                .build();

        ApiResponse<Void> response = ApiResponse.fail(errorCode.getMessage(), errorDetail);

        return ResponseEntity
                .status(errorCode.getStatus())
                .body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleConstraintViolationException(ConstraintViolationException ex) {
        Map<String, String> details = new LinkedHashMap<>();

        ex.getConstraintViolations().forEach(violation ->
                details.put(violation.getPropertyPath().toString(), violation.getMessage())
        );

        ErrorCode errorCode = ErrorCode.VALIDATION_FAILED;

        ErrorDetail errorDetail = ErrorDetail.builder()
                .code(errorCode.getCode())
                .details(details)
                .build();

        ApiResponse<Void> response = ApiResponse.fail(errorCode.getMessage(), errorDetail);

        return ResponseEntity
                .status(errorCode.getStatus())
                .body(response);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleHttpMessageNotReadableException(HttpMessageNotReadableException ex) {
        ErrorCode errorCode = ErrorCode.INVALID_REQUEST;

        ErrorDetail errorDetail = ErrorDetail.builder()
                .code(errorCode.getCode())
                .details("Request body is missing or malformed")
                .build();

        ApiResponse<Void> response = ApiResponse.fail(errorCode.getMessage(), errorDetail);

        return ResponseEntity
                .status(errorCode.getStatus())
                .body(response);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthenticationException(AuthenticationException ex) {
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;

        ErrorDetail errorDetail = ErrorDetail.builder()
                .code(errorCode.getCode())
                .details("Authentication is required")
                .build();

        ApiResponse<Void> response = ApiResponse.fail(errorCode.getMessage(), errorDetail);

        return ResponseEntity
                .status(errorCode.getStatus())
                .body(response);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(AccessDeniedException ex) {
        ErrorCode errorCode = ErrorCode.FORBIDDEN;

        ErrorDetail errorDetail = ErrorDetail.builder()
                .code(errorCode.getCode())
                .details("You do not have permission to access this resource")
                .build();

        ApiResponse<Void> response = ApiResponse.fail(errorCode.getMessage(), errorDetail);

        return ResponseEntity
                .status(errorCode.getStatus())
                .body(response);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleMaxUploadSizeExceededException(
            MaxUploadSizeExceededException ex
    ) {
        ErrorCode errorCode = ErrorCode.MEDIA_INVALID_FILE;

        ErrorDetail errorDetail = ErrorDetail.builder()
                .code(errorCode.getCode())
                .details("File size exceeds the maximum allowed upload size")
                .build();

        ApiResponse<Void> response = ApiResponse.fail(
                "File size must not exceed allowed upload limit",
                errorDetail
        );

        return ResponseEntity
                .status(errorCode.getStatus())
                .body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception ex) {
        log.error("Unexpected error occurred", ex);

        ErrorCode errorCode = ErrorCode.INTERNAL_ERROR;

        ErrorDetail errorDetail = ErrorDetail.builder()
                .code(errorCode.getCode())
                .details("Unexpected error occurred")
                .build();

        ApiResponse<Void> response = ApiResponse.fail(errorCode.getMessage(), errorDetail);

        return ResponseEntity
                .status(errorCode.getStatus())
                .body(response);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodArgumentTypeMismatchException(
            MethodArgumentTypeMismatchException ex
    ) {
        ErrorCode errorCode = ErrorCode.INVALID_REQUEST;

        Map<String, String> details = new LinkedHashMap<>();

        String paramName = ex.getName();
        Object invalidValue = ex.getValue();
        Class<?> requiredType = ex.getRequiredType();

        if (requiredType != null && requiredType.isEnum()) {
            String allowedValues = Arrays.stream(requiredType.getEnumConstants())
                    .map(Object::toString)
                    .collect(Collectors.joining(", "));

            details.put(
                    paramName,
                    "Invalid value '" + invalidValue + "'. Allowed values: " + allowedValues
            );
        } else {
            String expectedType = requiredType == null
                    ? "valid value"
                    : requiredType.getSimpleName();

            details.put(
                    paramName,
                    "Invalid value '" + invalidValue + "'. Expected type: " + expectedType
            );
        }

        ErrorDetail errorDetail = ErrorDetail.builder()
                .code(errorCode.getCode())
                .details(details)
                .build();

        ApiResponse<Void> response = ApiResponse.fail("Invalid request parameter", errorDetail);

        return ResponseEntity
                .status(errorCode.getStatus())
                .body(response);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingServletRequestParameterException(
            MissingServletRequestParameterException ex
    ) {
        ErrorCode errorCode = ErrorCode.INVALID_REQUEST;

        Map<String, String> details = new LinkedHashMap<>();
        details.put(
                ex.getParameterName(),
                "Required request parameter is missing"
        );

        ErrorDetail errorDetail = ErrorDetail.builder()
                .code(errorCode.getCode())
                .details(details)
                .build();

        ApiResponse<Void> response = ApiResponse.fail("Missing request parameter", errorDetail);

        return ResponseEntity
                .status(errorCode.getStatus())
                .body(response);
    }
}