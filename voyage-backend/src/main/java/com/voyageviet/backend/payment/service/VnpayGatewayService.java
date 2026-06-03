package com.voyageviet.backend.payment.service;

import com.voyageviet.backend.common.exception.BusinessException;
import com.voyageviet.backend.common.exception.ErrorCode;
import com.voyageviet.backend.payment.config.VnpayProperties;
import com.voyageviet.backend.payment.entity.Payment;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VnpayGatewayService {

    private static final DateTimeFormatter VNPAY_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final VnpayProperties properties;

    public String createPaymentUrl(Payment payment, HttpServletRequest request) {
        validateConfigured();

        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", properties.getVersion());
        params.put("vnp_Command", properties.getCommand());
        params.put("vnp_TmnCode", properties.getTmnCode());
        params.put("vnp_Amount", toVnpayAmount(payment.getAmount()));
        params.put("vnp_CurrCode", properties.getCurrCode());
        params.put("vnp_TxnRef", payment.getGatewayOrderId());
        params.put("vnp_OrderInfo", "Thanh toan booking " + payment.getBooking().getBookingCode());
        params.put("vnp_OrderType", properties.getOrderType());
        params.put("vnp_Locale", properties.getLocale());
        params.put("vnp_ReturnUrl", properties.getReturnUrl());
        params.put("vnp_IpAddr", clientIp(request));
        params.put("vnp_CreateDate", VNPAY_DATE_FORMAT.format(LocalDateTime.now()));
        params.put("vnp_ExpireDate", VNPAY_DATE_FORMAT.format(LocalDateTime.now().plusMinutes(15)));

        String secureHash = hmacSha512(buildHashData(params));
        params.put("vnp_SecureHash", secureHash);

        return properties.getPayUrl() + "?" + buildQuery(params);
    }

    public boolean verifySignature(Map<String, String> params) {
        validateConfigured();

        String secureHash = params.get("vnp_SecureHash");
        if (!hasText(secureHash)) {
            return false;
        }

        Map<String, String> signedParams = new TreeMap<>(params);
        signedParams.remove("vnp_SecureHash");
        signedParams.remove("vnp_SecureHashType");

        String expectedHash = hmacSha512(buildHashData(signedParams));
        return MessageDigest.isEqual(
                expectedHash.getBytes(StandardCharsets.UTF_8),
                secureHash.getBytes(StandardCharsets.UTF_8)
        );
    }

    public boolean isSuccess(Map<String, String> params) {
        return "00".equals(params.get("vnp_ResponseCode"))
                && "00".equals(params.get("vnp_TransactionStatus"));
    }

    public BigDecimal parseVnpayAmount(Map<String, String> params) {
        String amount = params.get("vnp_Amount");
        if (!hasText(amount)) {
            throw new BusinessException(ErrorCode.PAYMENT_INVALID_AMOUNT, "Số tiền thanh toán không hợp lệ.");
        }
        return new BigDecimal(amount).divide(BigDecimal.valueOf(100), 2, RoundingMode.UNNECESSARY);
    }

    private String toVnpayAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(ErrorCode.PAYMENT_INVALID_AMOUNT, "Số tiền thanh toán không hợp lệ.");
        }
        return amount.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).toPlainString();
    }

    private void validateConfigured() {
        if (!properties.isEnabled()
                || !hasText(properties.getTmnCode())
                || !hasText(properties.getHashSecret())
                || !hasText(properties.getPayUrl())
                || !hasText(properties.getReturnUrl())) {
            throw new BusinessException(ErrorCode.PAYMENT_GATEWAY_NOT_CONFIGURED, "VNPay chưa được cấu hình.");
        }
    }

    private String buildHashData(Map<String, String> params) {
        return params.entrySet().stream()
                .filter(entry -> hasText(entry.getValue()))
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .collect(Collectors.joining("&"));
    }

    private String buildQuery(Map<String, String> params) {
        return params.entrySet().stream()
                .filter(entry -> hasText(entry.getValue()))
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .collect(Collectors.joining("&"));
    }

    private String hmacSha512(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(
                    properties.getHashSecret().getBytes(StandardCharsets.UTF_8),
                    "HmacSHA512"
            );
            mac.init(secretKey);
            byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hash = new StringBuilder(bytes.length * 2);
            for (byte b : bytes) {
                hash.append(String.format("%02x", b & 0xff));
            }
            return hash.toString();
        } catch (Exception ex) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Không thể tạo chữ ký VNPay.");
        }
    }

    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (hasText(forwardedFor)) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
