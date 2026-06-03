package com.voyageviet.backend.payment.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voyageviet.backend.booking.entity.Booking;
import com.voyageviet.backend.booking.entity.BookingPaymentStatus;
import com.voyageviet.backend.booking.entity.BookingStatus;
import com.voyageviet.backend.booking.repository.BookingRepository;
import com.voyageviet.backend.common.exception.BusinessException;
import com.voyageviet.backend.common.exception.ErrorCode;
import com.voyageviet.backend.common.paging.PageResponse;
import com.voyageviet.backend.payment.config.PaymentProperties;
import com.voyageviet.backend.payment.config.VnpayProperties;
import com.voyageviet.backend.payment.dto.*;
import com.voyageviet.backend.payment.entity.Payment;
import com.voyageviet.backend.payment.entity.PaymentMethod;
import com.voyageviet.backend.payment.entity.PaymentStatus;
import com.voyageviet.backend.payment.repository.PaymentRepository;
import com.voyageviet.backend.user.entity.User;
import com.voyageviet.backend.user.repository.UserRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentService {

    private static final int PENDING_REUSE_MINUTES = 15;

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final VnpayGatewayService vnpayGatewayService;
    private final VnpayProperties vnpayProperties;
    private final PaymentProperties paymentProperties;
    private final ObjectMapper objectMapper;
    private final Environment environment;

    @Transactional
    public CreateVnpayPaymentResponse createVnpayPayment(
            Authentication authentication,
            CreateVnpayPaymentRequest request,
            HttpServletRequest servletRequest
    ) {
        User user = getCurrentUser(authentication);
        Booking booking = bookingRepository.findById(request.bookingId())
                .orElseThrow(() -> new BusinessException(ErrorCode.BOOKING_NOT_FOUND, "Booking không tồn tại."));

        validateBookingOwner(booking, user);
        validatePayableBooking(booking);

        Payment payment = getOrCreatePendingPayment(booking, PaymentMethod.VNPAY);
        booking.setPaymentStatus(BookingPaymentStatus.PENDING);

        String paymentUrl = vnpayGatewayService.createPaymentUrl(payment, servletRequest);
        Payment savedPayment = paymentRepository.save(payment);

        return new CreateVnpayPaymentResponse(
                paymentUrl,
                savedPayment.getGatewayOrderId(),
                savedPayment.getAmount(),
                savedPayment.getId()
        );
    }

    @Transactional
    public String handleVnpayCallback(Map<String, String> params) {
        String status = "invalid";
        String bookingCode = null;

        try {
            if (!vnpayGatewayService.verifySignature(params)) {
                return buildResultRedirect(status, bookingCode);
            }

            Optional<Payment> paymentOptional = paymentRepository.findByGatewayOrderId(params.get("vnp_TxnRef"));
            if (paymentOptional.isEmpty()) {
                return buildResultRedirect("not_found", bookingCode);
            }

            Payment payment = paymentOptional.get();
            payment.setGatewayResponse(toJson(params));
            bookingCode = payment.getBooking().getBookingCode();
            status = vnpayGatewayService.isSuccess(params) ? "success" : "failed";
            paymentRepository.save(payment);
        } catch (BusinessException ex) {
            status = "invalid";
        }

        return buildResultRedirect(status, bookingCode);
    }

    @Transactional
    public Map<String, String> handleVnpayIpn(Map<String, String> params) {
        try {
            if (!vnpayGatewayService.verifySignature(params)) {
                return ipnResponse("97", "Invalid signature");
            }
        } catch (BusinessException ex) {
            return ipnResponse("97", "Invalid signature");
        }

        Optional<Payment> paymentOptional = paymentRepository.findByGatewayOrderId(params.get("vnp_TxnRef"));
        if (paymentOptional.isEmpty()) {
            return ipnResponse("01", "Order not found");
        }

        Payment payment = paymentOptional.get();
        BigDecimal vnpayAmount;
        try {
            vnpayAmount = vnpayGatewayService.parseVnpayAmount(params);
        } catch (RuntimeException ex) {
            return ipnResponse("04", "Invalid amount");
        }

        if (payment.getAmount() == null || payment.getAmount().compareTo(vnpayAmount) != 0) {
            return ipnResponse("04", "Invalid amount");
        }

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return ipnResponse("00", "Confirm Success");
        }

        if (payment.getStatus() == PaymentStatus.REFUNDED) {
            return ipnResponse("00", "Confirm Success");
        }

        if (payment.getStatus() == PaymentStatus.FAILED) {
            return ipnResponse("00", "Confirm Success");
        }

        Booking booking = payment.getBooking();
        payment.setGatewayResponse(toJson(params));

        if (vnpayGatewayService.isSuccess(params)) {
            handleSuccessfulIpn(payment, booking, params);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            if (booking.getPaymentStatus() != BookingPaymentStatus.PAID) {
                booking.setPaymentStatus(BookingPaymentStatus.FAILED);
            }
        }

        paymentRepository.save(payment);
        return ipnResponse("00", "Confirm Success");
    }

    public BookingPaymentResponse getBookingPayment(Authentication authentication, Long bookingId) {
        User user = getCurrentUser(authentication);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOOKING_NOT_FOUND, "Booking không tồn tại."));

        if (!isAdmin(authentication) && !booking.getUser().getId().equals(user.getId())) {
            throw new BusinessException(ErrorCode.BOOKING_FORBIDDEN, "Bạn không có quyền thanh toán booking này.");
        }

        Optional<Payment> latestPayment = paymentRepository.findFirstByBookingIdOrderByCreatedAtDesc(booking.getId());
        if (latestPayment.isEmpty()) {
            return new BookingPaymentResponse(
                    booking.getId(),
                    booking.getBookingCode(),
                    effectivePaymentStatus(booking).name(),
                    null,
                    booking.getTotalAmount(),
                    null,
                    null
            );
        }

        Payment payment = latestPayment.get();
        return new BookingPaymentResponse(
                booking.getId(),
                booking.getBookingCode(),
                effectivePaymentStatus(booking).name(),
                payment.getMethod().name(),
                payment.getAmount(),
                payment.getPaidAt(),
                payment.getId()
        );
    }

    public PageResponse<AdminPaymentResponse> getAdminPayments(
            PaymentStatus status,
            PaymentMethod method,
            String bookingCode,
            LocalDate dateFrom,
            LocalDate dateTo,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        Pageable pageable = buildPageable(page, size, sortBy, sortDir);
        Specification<Payment> spec = buildPaymentSpecification(status, method, bookingCode, dateFrom, dateTo);
        Page<Payment> paymentPage = paymentRepository.findAll(spec, pageable);
        return PageResponse.from(paymentPage, this::toAdminResponse);
    }

    public PaymentDetailResponse getPaymentDetail(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND, "Không tìm thấy giao dịch thanh toán."));
        return toDetailResponse(payment);
    }

    @Transactional
    public PaymentDetailResponse refund(Authentication authentication, Long id, RefundRequest request) {
        if (!vnpayProperties.isRefundEnabled() && !isLocalOrDev()) {
            throw new BusinessException(ErrorCode.PAYMENT_GATEWAY_NOT_CONFIGURED, "Refund online chưa được cấu hình.");
        }

        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND, "Không tìm thấy giao dịch thanh toán."));

        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new BusinessException(ErrorCode.PAYMENT_INVALID_STATUS, "Không thể hoàn tiền giao dịch chưa thành công.");
        }

        if (request.refundAmount() == null
                || request.refundAmount().compareTo(BigDecimal.ZERO) <= 0
                || request.refundAmount().compareTo(payment.getAmount()) > 0) {
            throw new BusinessException(ErrorCode.PAYMENT_INVALID_AMOUNT, "Số tiền hoàn không hợp lệ.");
        }

        User refundedBy = getCurrentUser(authentication);
        payment.setStatus(PaymentStatus.REFUNDED);
        payment.setRefundAmount(request.refundAmount());
        payment.setRefundReason(trimToNull(request.refundReason()));
        payment.setRefundedAt(LocalDateTime.now());
        payment.setRefundedBy(refundedBy);
        payment.getBooking().setPaymentStatus(BookingPaymentStatus.REFUNDED);

        // TODO: Tích hợp VNPay refund API thật trước khi bật cho production.
        return toDetailResponse(paymentRepository.save(payment));
    }

    @Transactional
    public BookingPaymentResponse completeMockPayment(Authentication authentication, MockPaymentRequest request) {
        if (!isMockPaymentEnabled()) {
            throw new BusinessException(ErrorCode.FEATURE_DISABLED, "Mock payment chỉ được bật ở môi trường local/dev.");
        }

        User user = getCurrentUser(authentication);
        Booking booking = bookingRepository.findById(request.bookingId())
                .orElseThrow(() -> new BusinessException(ErrorCode.BOOKING_NOT_FOUND, "Booking không tồn tại."));

        validateBookingOwner(booking, user);
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BusinessException(ErrorCode.BOOKING_INVALID_STATUS, "Booking đã bị hủy, không thể thanh toán.");
        }
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BusinessException(ErrorCode.BOOKING_INVALID_STATUS, "Booking đã hoàn thành, không thể thanh toán.");
        }

        Payment payment = getOrCreatePendingPayment(booking, PaymentMethod.MOCK);
        payment.setGatewayResponse("{\"mock\":true,\"success\":" + request.success() + "}");

        if (Boolean.TRUE.equals(request.success())) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setPaidAt(LocalDateTime.now());
            booking.setPaymentStatus(BookingPaymentStatus.PAID);
            if (booking.getStatus() == BookingStatus.PENDING) {
                booking.setStatus(BookingStatus.CONFIRMED);
            }
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            booking.setPaymentStatus(BookingPaymentStatus.FAILED);
        }

        Payment savedPayment = paymentRepository.save(payment);
        return new BookingPaymentResponse(
                booking.getId(),
                booking.getBookingCode(),
                effectivePaymentStatus(booking).name(),
                savedPayment.getMethod().name(),
                savedPayment.getAmount(),
                savedPayment.getPaidAt(),
                savedPayment.getId()
        );
    }

    private void handleSuccessfulIpn(Payment payment, Booking booking, Map<String, String> params) {
        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.COMPLETED) {
            payment.setStatus(PaymentStatus.FAILED);
            if (booking.getPaymentStatus() != BookingPaymentStatus.PAID) {
                booking.setPaymentStatus(BookingPaymentStatus.FAILED);
            }
            return;
        }

        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setGatewayTxnId(trimToNull(params.get("vnp_TransactionNo")));
        payment.setPaidAt(LocalDateTime.now());
        booking.setPaymentStatus(BookingPaymentStatus.PAID);

        if (booking.getStatus() == BookingStatus.PENDING) {
            booking.setStatus(BookingStatus.CONFIRMED);
        }
    }

    private Payment getOrCreatePendingPayment(Booking booking, PaymentMethod method) {
        if (booking.getPaymentStatus() == BookingPaymentStatus.PAID
                || paymentRepository.existsByBookingIdAndStatus(booking.getId(), PaymentStatus.SUCCESS)) {
            throw new BusinessException(ErrorCode.PAYMENT_ALREADY_PAID, "Booking đã được thanh toán.");
        }

        Optional<Payment> pendingPayment = paymentRepository.findFirstByBookingIdAndStatusOrderByCreatedAtDesc(
                booking.getId(),
                PaymentStatus.PENDING
        );

        if (pendingPayment.isPresent()) {
            Payment payment = pendingPayment.get();
            LocalDateTime initiatedAt = payment.getInitiatedAt() == null ? payment.getCreatedAt() : payment.getInitiatedAt();
            if (initiatedAt != null && initiatedAt.isAfter(LocalDateTime.now().minusMinutes(PENDING_REUSE_MINUTES))) {
                return payment;
            }
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
        }

        return Payment.builder()
                .booking(booking)
                .amount(booking.getTotalAmount())
                .method(method)
                .status(PaymentStatus.PENDING)
                .gatewayOrderId(generateGatewayOrderId(booking))
                .initiatedAt(LocalDateTime.now())
                .build();
    }

    private void validatePayableBooking(Booking booking) {
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BusinessException(ErrorCode.BOOKING_INVALID_STATUS, "Booking đã bị hủy, không thể thanh toán.");
        }
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BusinessException(ErrorCode.BOOKING_INVALID_STATUS, "Booking đã hoàn thành, không thể thanh toán.");
        }
        if (booking.getTotalAmount() == null || booking.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(ErrorCode.PAYMENT_INVALID_AMOUNT, "Số tiền thanh toán không hợp lệ.");
        }
        if (booking.getPaymentStatus() == BookingPaymentStatus.PAID) {
            throw new BusinessException(ErrorCode.PAYMENT_ALREADY_PAID, "Booking đã được thanh toán.");
        }
    }

    private void validateBookingOwner(Booking booking, User user) {
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new BusinessException(ErrorCode.BOOKING_FORBIDDEN, "Bạn không có quyền thanh toán booking này.");
        }
    }

    private Specification<Payment> buildPaymentSpecification(
            PaymentStatus status,
            PaymentMethod method,
            String bookingCode,
            LocalDate dateFrom,
            LocalDate dateTo
    ) {
        return (root, query, criteriaBuilder) -> {
            Join<Payment, Booking> booking = root.join("booking", JoinType.LEFT);
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }
            if (method != null) {
                predicates.add(criteriaBuilder.equal(root.get("method"), method));
            }
            if (hasText(bookingCode)) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(booking.get("bookingCode")),
                        "%" + bookingCode.trim().toLowerCase() + "%"
                ));
            }
            if (dateFrom != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("createdAt"),
                        dateFrom.atStartOfDay()
                ));
            }
            if (dateTo != null) {
                predicates.add(criteriaBuilder.lessThan(
                        root.get("createdAt"),
                        dateTo.plusDays(1).atStartOfDay()
                ));
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private Pageable buildPageable(int page, int size, String sortBy, String sortDir) {
        if (page < 0) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Page index must be greater than or equal to 0");
        }
        if (size < 1 || size > 50) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Page size must be between 1 and 50");
        }

        String safeSortBy = resolveSortBy(sortBy);
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.ASC
                : "desc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.DESC
                : null;

        if (direction == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Sort direction must be either asc or desc");
        }

        return PageRequest.of(page, size, Sort.by(direction, safeSortBy));
    }

    private String resolveSortBy(String sortBy) {
        Set<String> allowedSortFields = Set.of(
                "createdAt",
                "updatedAt",
                "id",
                "amount",
                "status",
                "method",
                "initiatedAt",
                "paidAt",
                "refundedAt"
        );
        if (!hasText(sortBy)) {
            return "createdAt";
        }
        if (!allowedSortFields.contains(sortBy)) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Invalid sort field. Allowed fields: " + String.join(", ", allowedSortFields)
            );
        }
        return sortBy;
    }

    private AdminPaymentResponse toAdminResponse(Payment payment) {
        Booking booking = payment.getBooking();
        return new AdminPaymentResponse(
                payment.getId(),
                booking.getId(),
                booking.getBookingCode(),
                booking.getUser().getEmail(),
                payment.getAmount(),
                payment.getMethod(),
                payment.getStatus(),
                payment.getGatewayTxnId(),
                payment.getGatewayOrderId(),
                payment.getInitiatedAt(),
                payment.getPaidAt(),
                payment.getRefundedAt()
        );
    }

    private PaymentDetailResponse toDetailResponse(Payment payment) {
        Booking booking = payment.getBooking();
        return new PaymentDetailResponse(
                payment.getId(),
                booking.getId(),
                booking.getBookingCode(),
                booking.getUser().getEmail(),
                payment.getAmount(),
                payment.getMethod(),
                payment.getStatus(),
                payment.getGatewayTxnId(),
                payment.getGatewayOrderId(),
                payment.getInitiatedAt(),
                payment.getPaidAt(),
                payment.getRefundedAt(),
                payment.getGatewayResponse(),
                payment.getRefundAmount(),
                payment.getRefundReason(),
                payment.getRefundedBy() == null ? null : payment.getRefundedBy().getEmail()
        );
    }

    private User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "Current user not found"));
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority())
                        || "ROLE_SUPER_ADMIN".equals(authority.getAuthority()));
    }

    private boolean isMockPaymentEnabled() {
        return paymentProperties.isMockEnabled() || isLocalOrDev();
    }

    private boolean isLocalOrDev() {
        return environment.acceptsProfiles(Profiles.of("local", "dev"));
    }

    private BookingPaymentStatus effectivePaymentStatus(Booking booking) {
        return booking.getPaymentStatus() == null ? BookingPaymentStatus.UNPAID : booking.getPaymentStatus();
    }

    private String generateGatewayOrderId(Booking booking) {
        return booking.getBookingCode() + "-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8);
    }

    private String buildResultRedirect(String status, String bookingCode) {
        String baseUrl = hasText(vnpayProperties.getReturnUrl())
                ? vnpayProperties.getReturnUrl()
                : "/payment/result";
        String separator = baseUrl.contains("?") ? "&" : "?";
        String redirect = baseUrl + separator + "status=" + status;
        if (hasText(bookingCode)) {
            redirect += "&bookingCode=" + bookingCode;
        }
        return redirect;
    }

    private Map<String, String> ipnResponse(String code, String message) {
        return Map.of(
                "RspCode", code,
                "Message", message
        );
    }

    private String toJson(Map<String, String> params) {
        try {
            return objectMapper.writeValueAsString(new TreeMap<>(params));
        } catch (JsonProcessingException ex) {
            return "{}";
        }
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
