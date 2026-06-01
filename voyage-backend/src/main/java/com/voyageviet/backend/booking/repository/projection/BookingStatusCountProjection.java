package com.voyageviet.backend.booking.repository.projection;

import com.voyageviet.backend.booking.entity.BookingStatus;

public interface BookingStatusCountProjection {

    BookingStatus getStatus();

    Long getTotal();
}