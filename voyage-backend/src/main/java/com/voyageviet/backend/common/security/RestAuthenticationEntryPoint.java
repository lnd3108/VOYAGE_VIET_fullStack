package com.voyageviet.backend.common.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.voyageviet.backend.common.exception.ErrorCode;
import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.common.response.ErrorDetail;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class RestAuthenticationEntryPoint implements org.springframework.security.web.AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException {
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;

        ErrorDetail errorDetail = ErrorDetail.builder()
                .code(errorCode.getCode())
                .details("Authentication token is missing, invalid, or expired")
                .build();

        ApiResponse<Void> body = ApiResponse.fail(
                "Unauthorized",
                errorDetail
        );

        response.setStatus(errorCode.getStatus().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        objectMapper.writeValue(response.getWriter(), body);
    }
}