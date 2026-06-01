package com.voyageviet.backend.booking.repository.projection;

import java.math.BigDecimal;

public interface MonthlyBookingRevenueProjection {

    String getPeriod();

    Long getTotalBookings();

    BigDecimal getConfirmedRevenue();

    BigDecimal getCompletedRevenue();
}