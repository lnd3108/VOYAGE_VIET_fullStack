package com.voyageviet.backend.auth.service;

import com.voyageviet.backend.user.entity.User;

public interface EmailService {

    void sendPasswordResetEmail(User user, String token);

    void sendVerifyEmail(User user, String token);
}
