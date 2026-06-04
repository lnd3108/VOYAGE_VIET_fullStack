package com.voyageviet.backend.booking.service;

import com.voyageviet.backend.booking.config.BookingExpiryProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class BookingExpiryScheduler {

    private final BookingExpiryProperties properties;
    private final BookingExpiryService bookingExpiryService;

    @Scheduled(fixedRateString = "${booking.expiry.fixed-rate-ms:60000}")
    public void expirePendingBookings() {
        if (!properties.isEnabled()) {
            return;
        }

        List<Long> bookingIds = bookingExpiryService.findExpiredPendingBookingIds();
        if (bookingIds.isEmpty()) {
            return;
        }

        int expiredCount = 0;
        for (Long bookingId : bookingIds) {
            try {
                if (bookingExpiryService.expireOneBooking(bookingId)) {
                    expiredCount++;
                }
            } catch (RuntimeException ex) {
                log.warn("Failed to expire pending booking id={}", bookingId, ex);
            }
        }

        if (expiredCount > 0) {
            log.info("Expired {} pending bookings", expiredCount);
        }
    }
}
