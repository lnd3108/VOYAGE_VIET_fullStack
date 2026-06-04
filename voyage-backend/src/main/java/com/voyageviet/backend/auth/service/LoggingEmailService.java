package com.voyageviet.backend.auth.service;

import com.voyageviet.backend.user.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class LoggingEmailService implements EmailService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final Environment environment;
    private final boolean mailEnabled;
    private final String mailFrom;
    private final String frontendBaseUrl;

    public LoggingEmailService(
            ObjectProvider<JavaMailSender> mailSenderProvider,
            Environment environment,
            @Value("${app.mail.enabled:false}") boolean mailEnabled,
            @Value("${app.mail.from:no-reply@voyageviet.local}") String mailFrom,
            @Value("${app.frontend.base-url:http://localhost:4200}") String frontendBaseUrl
    ) {
        this.mailSenderProvider = mailSenderProvider;
        this.environment = environment;
        this.mailEnabled = mailEnabled;
        this.mailFrom = mailFrom;
        this.frontendBaseUrl = trimTrailingSlash(frontendBaseUrl);
    }

    @Override
    public void sendPasswordResetEmail(User user, String token) {
        String resetLink = frontendBaseUrl + "/reset-password?token=" + token;
        sendOrLog(
                user,
                "Đặt lại mật khẩu VoyageViet",
                "Xin chào " + user.getFullName() + ",\n\n"
                        + "Bạn vừa yêu cầu đặt lại mật khẩu VoyageViet.\n"
                        + "Vui lòng mở liên kết sau trong vòng 15 phút:\n"
                        + resetLink + "\n\n"
                        + "Nếu bạn không yêu cầu thao tác này, vui lòng bỏ qua email.",
                "Password reset",
                resetLink
        );
    }

    @Override
    public void sendVerifyEmail(User user, String token) {
        String verifyLink = frontendBaseUrl + "/verify-email?token=" + token;
        sendOrLog(
                user,
                "Xác thực email VoyageViet",
                "Xin chào " + user.getFullName() + ",\n\n"
                        + "Vui lòng xác thực email VoyageViet bằng liên kết sau trong vòng 15 phút:\n"
                        + verifyLink + "\n\n"
                        + "Nếu bạn không tạo tài khoản VoyageViet, vui lòng bỏ qua email.",
                "Email verification",
                verifyLink
        );
    }

    private void sendOrLog(User user, String subject, String body, String label, String link) {
        if (!mailEnabled) {
            log.info("{} link for {}: {}", label, user.getEmail(), link);
            return;
        }

        try {
            JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
            if (mailSender == null) {
                log.warn("Gửi email xác thực thất bại, vui lòng kiểm tra cấu hình SMTP. JavaMailSender is not available.");
                logInLocal(label, user, link);
                return;
            }

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(user.getEmail());
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);

            logInLocal(label, user, link);
        } catch (RuntimeException ex) {
            log.warn("Gửi email xác thực thất bại, vui lòng kiểm tra cấu hình SMTP.", ex);
            logInLocal(label, user, link);
        }
    }

    private void logInLocal(String label, User user, String link) {
        if (environment.acceptsProfiles(Profiles.of("local", "dev"))) {
            log.info("{} link for {}: {}", label, user.getEmail(), link);
        }
    }

    private String trimTrailingSlash(String value) {
        if (value == null || value.isBlank()) {
            return "http://localhost:4200";
        }
        String trimmed = value.trim();
        while (trimmed.endsWith("/")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed;
    }
}
