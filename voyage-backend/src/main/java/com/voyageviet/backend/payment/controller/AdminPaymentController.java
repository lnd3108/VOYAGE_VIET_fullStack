package com.voyageviet.backend.payment.controller;

import com.voyageviet.backend.common.paging.PageResponse;
import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.payment.dto.AdminPaymentResponse;
import com.voyageviet.backend.payment.dto.PaymentDetailResponse;
import com.voyageviet.backend.payment.dto.RefundRequest;
import com.voyageviet.backend.payment.entity.PaymentMethod;
import com.voyageviet.backend.payment.entity.PaymentStatus;
import com.voyageviet.backend.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/payments")
@RequiredArgsConstructor
public class AdminPaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public ApiResponse<PageResponse<AdminPaymentResponse>> getPayments(
            @RequestParam(required = false) PaymentStatus status,
            @RequestParam(required = false) PaymentMethod method,
            @RequestParam(required = false) String bookingCode,
            @RequestParam(required = false) LocalDate dateFrom,
            @RequestParam(required = false) LocalDate dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        return ApiResponse.success(
                "Lấy danh sách thanh toán thành công",
                paymentService.getAdminPayments(status, method, bookingCode, dateFrom, dateTo, page, size, sortBy, sortDir)
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<PaymentDetailResponse> getPaymentDetail(@PathVariable Long id) {
        return ApiResponse.success(
                "Lấy chi tiết thanh toán thành công",
                paymentService.getPaymentDetail(id)
        );
    }

    @PostMapping("/{id}/refund")
    public ApiResponse<PaymentDetailResponse> refund(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody RefundRequest request
    ) {
        return ApiResponse.success(
                "Hoàn tiền giao dịch thành công",
                paymentService.refund(authentication, id, request)
        );
    }
}
