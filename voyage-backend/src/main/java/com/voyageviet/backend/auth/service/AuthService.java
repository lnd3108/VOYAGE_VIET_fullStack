package com.voyageviet.backend.auth.service;

import com.voyageviet.backend.auth.dto.RegisterRequest;
import com.voyageviet.backend.auth.dto.ResetPasswordRequest;
import com.voyageviet.backend.auth.entity.EmailToken;
import com.voyageviet.backend.auth.entity.EmailTokenType;
import com.voyageviet.backend.auth.entity.RefreshToken;
import com.voyageviet.backend.auth.repository.EmailTokenRepository;
import com.voyageviet.backend.auth.repository.RefreshTokenRepository;
import com.voyageviet.backend.common.exception.BusinessException;
import com.voyageviet.backend.common.exception.ErrorCode;
import com.voyageviet.backend.role.entity.Role;
import com.voyageviet.backend.role.entity.RoleCode;
import com.voyageviet.backend.role.repository.RoleRepository;
import com.voyageviet.backend.user.dto.UserResponse;
import com.voyageviet.backend.user.entity.User;
import com.voyageviet.backend.user.entity.UserStatus;
import com.voyageviet.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.voyageviet.backend.auth.dto.LoginRequest;
import com.voyageviet.backend.auth.dto.LoginResponse;
import com.voyageviet.backend.auth.token.JwtService;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final int REFRESH_TOKEN_DAYS = 7;
    private static final int EMAIL_TOKEN_MINUTES = 15;

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final EmailTokenRepository emailTokenRepository;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public UserResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new BusinessException(
                    ErrorCode.USER_ALREADY_EXISTS,
                    "Email already exists"
            );
        }

        Role userRole = roleRepository.findByCode(RoleCode.USER)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.ROLE_NOT_FOUND,
                        "Default USER role not found"
                ));

        User user = User.builder()
                .fullName(request.fullName().trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.password()))
                .phone(normalizePhone(request.phone()))
                .status(UserStatus.ACTIVE)
                .emailVerified(false)
                .role(userRole)
                .build();

        User savedUser = userRepository.save(user);
        createEmailToken(savedUser, EmailTokenType.EMAIL_VERIFY);

        return toResponse(savedUser);
    }

    @Transactional
    public LoginResponse login(LoginRequest request, String ipAddress, String userAgent) {
        String normalizedEmail = request.email().trim().toLowerCase();

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.INVALID_CREDENTIALS,
                        "Invalid email or password"
                ));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BusinessException(
                    ErrorCode.INVALID_CREDENTIALS,
                    "Invalid email or password"
            );
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException(
                    ErrorCode.ACCOUNT_DISABLED,
                    "Your account is not active"
            );
        }

        user.setLastLoginAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(savedUser);
        String refreshToken = createRefreshToken(savedUser, ipAddress, userAgent);

        return new LoginResponse(
                accessToken,
                refreshToken,
                "Bearer",
                jwtService.getAccessTokenExpirationSeconds(),
                toResponse(savedUser)
        );
    }

    @Transactional
    public LoginResponse refresh(String rawRefreshToken, String ipAddress, String userAgent) {
        RefreshToken refreshToken = findValidRefreshToken(rawRefreshToken);
        User user = refreshToken.getUser();

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.ACCOUNT_DISABLED, "Tài khoản đã bị khóa hoặc không hoạt động.");
        }

        refreshToken.setRevokedAt(LocalDateTime.now());
        String newRefreshToken = createRefreshToken(user, ipAddress, userAgent);
        String accessToken = jwtService.generateAccessToken(user);

        return new LoginResponse(
                accessToken,
                newRefreshToken,
                "Bearer",
                jwtService.getAccessTokenExpirationSeconds(),
                toResponse(user)
        );
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            return;
        }

        refreshTokenRepository.findByTokenHash(hashToken(rawRefreshToken))
                .ifPresent(token -> {
                    if (token.getRevokedAt() == null) {
                        token.setRevokedAt(LocalDateTime.now());
                    }
                });
    }

    @Transactional
    public void forgotPassword(String email) {
        String normalizedEmail = email.trim().toLowerCase();
        userRepository.findByEmailIgnoreCase(normalizedEmail).ifPresent(user -> {
            revokeEmailTokens(user, EmailTokenType.PASSWORD_RESET);
            EmailToken token = createEmailToken(user, EmailTokenType.PASSWORD_RESET);
            emailService.sendPasswordResetEmail(user, token.getToken());
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Mật khẩu xác nhận không khớp.");
        }

        EmailToken token = emailTokenRepository.findByTokenAndType(request.token(), EmailTokenType.PASSWORD_RESET)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.UNAUTHORIZED,
                        "Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn."
                ));

        validateEmailToken(token);
        User user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        token.setUsedAt(LocalDateTime.now());
        revokeRefreshTokens(user);
    }

    @Transactional
    public UserResponse verifyEmail(String rawToken) {
        EmailToken token = emailTokenRepository.findByTokenAndType(rawToken, EmailTokenType.EMAIL_VERIFY)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.UNAUTHORIZED,
                        "Token xác thực email không hợp lệ hoặc đã hết hạn."
                ));

        validateEmailToken(token);
        User user = token.getUser();
        user.setEmailVerified(true);
        user.setEmailVerifiedAt(LocalDateTime.now());
        token.setUsedAt(LocalDateTime.now());
        return toResponse(user);
    }

    private RefreshToken findValidRefreshToken(String rawRefreshToken) {
        RefreshToken refreshToken = refreshTokenRepository.findByTokenHash(hashToken(rawRefreshToken))
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "Refresh token không hợp lệ."));

        if (refreshToken.getRevokedAt() != null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Refresh token không hợp lệ.");
        }

        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Refresh token đã hết hạn.");
        }

        return refreshToken;
    }

    private String createRefreshToken(User user, String ipAddress, String userAgent) {
        String rawToken = generateSecureToken();
        refreshTokenRepository.save(RefreshToken.builder()
                .user(user)
                .tokenHash(hashToken(rawToken))
                .issuedAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(REFRESH_TOKEN_DAYS))
                .ipAddress(trimToLength(ipAddress, 100))
                .userAgent(trimToLength(userAgent, 500))
                .build());
        return rawToken;
    }

    private EmailToken createEmailToken(User user, EmailTokenType type) {
        String token;
        do {
            token = UUID.randomUUID() + "-" + generateSecureToken();
        } while (emailTokenRepository.existsByToken(token));

        EmailToken emailToken = EmailToken.builder()
                .user(user)
                .token(token)
                .type(type)
                .expiresAt(LocalDateTime.now().plusMinutes(EMAIL_TOKEN_MINUTES))
                .build();
        EmailToken saved = emailTokenRepository.save(emailToken);

        if (type == EmailTokenType.EMAIL_VERIFY) {
            emailService.sendVerifyEmail(user, saved.getToken());
        }

        return saved;
    }

    private void revokeEmailTokens(User user, EmailTokenType type) {
        LocalDateTime now = LocalDateTime.now();
        emailTokenRepository.findByUserIdAndTypeAndUsedAtIsNull(user.getId(), type)
                .forEach(token -> token.setUsedAt(now));
    }

    private void revokeRefreshTokens(User user) {
        LocalDateTime now = LocalDateTime.now();
        refreshTokenRepository.findByUserIdAndRevokedAtIsNull(user.getId())
                .forEach(token -> token.setRevokedAt(now));
    }

    private void validateEmailToken(EmailToken token) {
        if (token.getUsedAt() != null || token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
        }
    }

    private String generateSecureToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Refresh token không hợp lệ.");
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(rawToken.getBytes()));
        } catch (Exception ex) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Cannot hash token");
        }
    }

    private String normalizePhone(String phone) {
        if (phone == null || phone.isBlank()) {
            return null;
        }

        return phone.trim();
    }

    private String trimToLength(String value, int maxLength) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.length() <= maxLength ? trimmed : trimmed.substring(0, maxLength);
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getAvatarUrl(),
                user.getStatus(),
                user.getEmailVerified(),
                user.getRole().getCode(),
                user.getCreatedAt()
        );
    }
}
