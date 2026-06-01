package com.voyageviet.backend.auth.entity;

import com.voyageviet.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "REFRESH_TOKENS",
        uniqueConstraints = {
                @UniqueConstraint(name = "UK_REFRESH_TOKENS_HASH", columnNames = "TOKEN_HASH")
        },
        indexes = {
                @Index(name = "IDX_REFRESH_TOKENS_USER_ID", columnList = "USER_ID"),
                @Index(name = "IDX_REFRESH_TOKENS_EXPIRES_AT", columnList = "EXPIRES_AT")
        }
)
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "TOKEN_HASH", nullable = false, length = 64)
    private String tokenHash;

    @Column(name = "ISSUED_AT", nullable = false)
    private LocalDateTime issuedAt;

    @Column(name = "EXPIRES_AT", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "REVOKED_AT")
    private LocalDateTime revokedAt;

    @Column(name = "IP_ADDRESS", length = 100)
    private String ipAddress;

    @Column(name = "USER_AGENT", length = 500)
    private String userAgent;
}
