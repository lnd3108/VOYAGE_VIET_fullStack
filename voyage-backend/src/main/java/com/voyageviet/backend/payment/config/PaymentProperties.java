package com.voyageviet.backend.payment.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "payment")
public class PaymentProperties {

    private boolean mockEnabled;

    public boolean isMockEnabled() {
        return mockEnabled;
    }

    public void setMockEnabled(boolean mockEnabled) {
        this.mockEnabled = mockEnabled;
    }
}
