package com.voyageviet.backend.auth.service;

import com.voyageviet.backend.auth.dto.RegisterRequest;
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
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

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

        return toResponse(savedUser);
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
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

        return new LoginResponse(
                accessToken,
                "Bearer",
                toResponse(savedUser)
        );
    }

    private String normalizePhone(String phone) {
        if (phone == null || phone.isBlank()) {
            return null;
        }

        return phone.trim();
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