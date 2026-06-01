package com.voyageviet.backend.auth.service;

import com.voyageviet.backend.user.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class LoggingEmailService implements EmailService {

    @Override
    public void sendPasswordResetEmail(User user, String token) {
        log.info("Password reset token for {}: {}", user.getEmail(), token);
    }

    @Override
    public void sendVerifyEmail(User user, String token) {
        log.info("Email verification token for {}: {}", user.getEmail(), token);
    }
}
