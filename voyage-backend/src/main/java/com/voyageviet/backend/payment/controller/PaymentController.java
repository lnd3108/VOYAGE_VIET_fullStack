package com.voyageviet.backend.payment.controller;

import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.payment.dto.*;
import com.voyageviet.backend.payment.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/api/payments/vnpay/create")
    public ApiResponse<CreateVnpayPaymentResponse> createVnpayPayment(
            Authentication authentication,
            @Valid @RequestBody CreateVnpayPaymentRequest request,
            HttpServletRequest servletRequest
    ) {
        return ApiResponse.success(
                "Tạo URL thanh toán thành công",
                paymentService.createVnpayPayment(authentication, request, servletRequest)
        );
    }

    @GetMapping("/api/payments/vnpay/callback")
    public RedirectView vnpayCallback(@RequestParam Map<String, String> params) {
        return new RedirectView(paymentService.handleVnpayCallback(params));
    }

    @PostMapping("/api/payments/vnpay/ipn")
    public Map<String, String> vnpayIpnPost(@RequestParam Map<String, String> params) {
        return paymentService.handleVnpayIpn(params);
    }

    @GetMapping("/api/payments/vnpay/ipn")
    public Map<String, String> vnpayIpnGet(@RequestParam Map<String, String> params) {
        return paymentService.handleVnpayIpn(params);
    }

    @GetMapping("/api/bookings/{id}/payment")
    public ApiResponse<BookingPaymentResponse> getBookingPayment(
            Authentication authentication,
            @PathVariable Long id
    ) {
        return ApiResponse.success(
                "Lấy trạng thái thanh toán thành công",
                paymentService.getBookingPayment(authentication, id)
        );
    }

    @PostMapping("/api/payments/mock/complete")
    public ApiResponse<BookingPaymentResponse> completeMockPayment(
            Authentication authentication,
            @Valid @RequestBody MockPaymentRequest request
    ) {
        return ApiResponse.success(
                "Hoàn tất mock payment thành công",
                paymentService.completeMockPayment(authentication, request)
        );
    }
}
