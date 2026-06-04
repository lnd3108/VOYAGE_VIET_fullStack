package com.voyageviet.backend.booking.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "booking.expiry")
public class BookingExpiryProperties {

    private boolean enabled = true;
    private long pendingTimeoutMinutes = 30;
    private long fixedRateMs = 60000;
    private int batchSize = 100;
}
