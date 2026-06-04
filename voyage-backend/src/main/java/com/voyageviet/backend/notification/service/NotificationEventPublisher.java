package com.voyageviet.backend.notification.service;

import com.voyageviet.backend.booking.entity.Booking;
import com.voyageviet.backend.notification.entity.NotificationType;
import com.voyageviet.backend.payment.entity.Payment;
import com.voyageviet.backend.review.entity.Review;
import com.voyageviet.backend.review.entity.ReviewStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventPublisher {

    private final NotificationService notificationService;

    public void bookingCreated(Booking booking) {
        publish(
                booking.getUser().getId(),
                NotificationType.BOOKING_CREATED,
                "Đặt tour thành công",
                "Booking " + booking.getBookingCode() + " đã được tạo và đang chờ xác nhận.",
                bookingData(booking)
        );
    }

    public void bookingConfirmed(Booking booking) {
        publish(
                booking.getUser().getId(),
                NotificationType.BOOKING_CONFIRMED,
                "Booking đã được xác nhận",
                "Booking " + booking.getBookingCode() + " của bạn đã được xác nhận.",
                bookingData(booking)
        );
    }

    public void bookingCancelled(Booking booking) {
        publish(
                booking.getUser().getId(),
                NotificationType.BOOKING_CANCELLED,
                "Booking đã được hủy",
                "Booking " + booking.getBookingCode() + " đã được hủy thành công.",
                bookingData(booking)
        );
    }

    public void paymentSuccess(Payment payment) {
        publishPayment(
                payment,
                NotificationType.PAYMENT_SUCCESS,
                "Thanh toán thành công",
                "Thanh toán cho booking " + payment.getBooking().getBookingCode() + " đã thành công.",
                "amount",
                payment.getAmount()
        );
    }

    public void paymentFailed(Payment payment) {
        publishPayment(
                payment,
                NotificationType.PAYMENT_FAILED,
                "Thanh toán thất bại",
                "Thanh toán cho booking " + payment.getBooking().getBookingCode() + " không thành công. Vui lòng thử lại.",
                "amount",
                payment.getAmount()
        );
    }

    public void paymentRefunded(Payment payment) {
        publishPayment(
                payment,
                NotificationType.PAYMENT_REFUNDED,
                "Hoàn tiền đã được ghi nhận",
                "Giao dịch booking " + payment.getBooking().getBookingCode() + " đã được ghi nhận hoàn tiền.",
                "refundAmount",
                payment.getRefundAmount()
        );
    }

    public void reviewStatusChanged(Review review, ReviewStatus status) {
        if (status == ReviewStatus.ACTIVE) {
            publish(
                    review.getUser().getId(),
                    NotificationType.REVIEW_APPROVED,
                    "Đánh giá đã được duyệt",
                    "Đánh giá của bạn đã được hiển thị công khai.",
                    reviewData(review)
            );
            return;
        }

        if (status == ReviewStatus.HIDDEN) {
            publish(
                    review.getUser().getId(),
                    NotificationType.REVIEW_REJECTED,
                    "Đánh giá đã bị ẩn",
                    "Đánh giá của bạn đã bị ẩn do không phù hợp.",
                    reviewData(review)
            );
        }
    }

    private void publishPayment(
            Payment payment,
            NotificationType type,
            String title,
            String body,
            String amountKey,
            BigDecimal amount
    ) {
        Map<String, Object> data = bookingData(payment.getBooking());
        data.put("paymentId", payment.getId());
        data.put(amountKey, amount);

        publish(payment.getBooking().getUser().getId(), type, title, body, data);
    }

    private void publish(
            Long userId,
            NotificationType type,
            String title,
            String body,
            Map<String, Object> data
    ) {
        try {
            notificationService.createNotification(userId, type, title, body, data);
        } catch (RuntimeException ex) {
            log.warn("Failed to create notification type={} userId={}", type, userId, ex);
        }
    }

    private Map<String, Object> bookingData(Booking booking) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("bookingId", booking.getId());
        data.put("bookingCode", booking.getBookingCode());
        data.put("tourId", booking.getTour() == null ? null : booking.getTour().getId());
        data.put("tourSlug", booking.getTour() == null ? null : booking.getTour().getSlug());
        data.put("scheduleId", booking.getSchedule() == null ? null : booking.getSchedule().getId());
        return data;
    }

    private Map<String, Object> reviewData(Review review) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("reviewId", review.getId());
        data.put("tourId", review.getTour() == null ? null : review.getTour().getId());
        data.put("tourSlug", review.getTour() == null ? null : review.getTour().getSlug());
        return data;
    }
}
