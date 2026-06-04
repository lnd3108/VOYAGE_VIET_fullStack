package com.voyageviet.backend.booking.service;

import com.voyageviet.backend.booking.config.BookingExpiryProperties;
import com.voyageviet.backend.booking.entity.Booking;
import com.voyageviet.backend.booking.entity.BookingPaymentStatus;
import com.voyageviet.backend.booking.entity.BookingStatus;
import com.voyageviet.backend.booking.repository.BookingRepository;
import com.voyageviet.backend.notification.service.NotificationEventPublisher;
import com.voyageviet.backend.payment.entity.PaymentStatus;
import com.voyageviet.backend.payment.repository.PaymentRepository;
import com.voyageviet.backend.tour.entity.TourSchedule;
import com.voyageviet.backend.tour.entity.TourScheduleStatus;
import com.voyageviet.backend.tour.repository.TourScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class BookingExpiryService {

    private static final String EXPIRED_NOTE = "Booking đã được tự động hủy do quá thời gian thanh toán.";
    private static final Collection<BookingPaymentStatus> EXPIRABLE_PAYMENT_STATUSES = Set.of(
            BookingPaymentStatus.UNPAID,
            BookingPaymentStatus.PENDING,
            BookingPaymentStatus.FAILED
    );

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final TourScheduleRepository scheduleRepository;
    private final NotificationEventPublisher notificationEventPublisher;
    private final BookingExpiryProperties properties;

    public List<Long> findExpiredPendingBookingIds() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(properties.getPendingTimeoutMinutes());
        int batchSize = Math.max(properties.getBatchSize(), 1);
        return bookingRepository.findExpiredPendingBookingIds(
                BookingStatus.PENDING,
                EXPIRABLE_PAYMENT_STATUSES,
                cutoff,
                PageRequest.of(0, batchSize)
        );
    }

    @Transactional
    public boolean expireOneBooking(Long bookingId) {
        Booking booking = bookingRepository.findByIdForUpdate(bookingId).orElse(null);
        if (booking == null || booking.getStatus() != BookingStatus.PENDING) {
            return false;
        }

        if (booking.getPaymentStatus() == BookingPaymentStatus.PAID) {
            return false;
        }

        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(properties.getPendingTimeoutMinutes());
        if (booking.getCreatedAt() == null || booking.getCreatedAt().isAfter(cutoff)) {
            return false;
        }

        releaseScheduleSeats(booking);
        failPendingPayment(booking.getId());

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setPaymentStatus(BookingPaymentStatus.FAILED);
        booking.setNote(appendExpiryNote(booking.getNote()));

        Booking savedBooking = bookingRepository.save(booking);
        notificationEventPublisher.bookingExpired(savedBooking);
        return true;
    }

    private void releaseScheduleSeats(Booking booking) {
        TourSchedule schedule = booking.getSchedule();
        if (schedule == null) {
            return;
        }

        int totalPeople = booking.getTotalPeople() == null ? booking.getNumberOfPeople() : booking.getTotalPeople();
        int currentBookedSeats = schedule.getBookedSeats() == null ? 0 : schedule.getBookedSeats();
        schedule.setBookedSeats(Math.max(currentBookedSeats - totalPeople, 0));

        boolean hasSeatAfterRelease = schedule.getMaxSeats() != null
                && schedule.getBookedSeats() != null
                && schedule.getBookedSeats() < schedule.getMaxSeats();
        if (schedule.getStatus() == TourScheduleStatus.FULL && hasSeatAfterRelease) {
            schedule.setStatus(TourScheduleStatus.OPEN);
        }

        scheduleRepository.save(schedule);
    }

    private void failPendingPayment(Long bookingId) {
        paymentRepository.findFirstByBookingIdAndStatusOrderByCreatedAtDesc(bookingId, PaymentStatus.PENDING)
                .ifPresent(payment -> {
                    payment.setStatus(PaymentStatus.FAILED);
                    paymentRepository.save(payment);
                });
    }

    private String appendExpiryNote(String currentNote) {
        if (currentNote == null || currentNote.isBlank()) {
            return EXPIRED_NOTE;
        }
        if (currentNote.contains(EXPIRED_NOTE)) {
            return currentNote;
        }
        return currentNote + "\n" + EXPIRED_NOTE;
    }
}
