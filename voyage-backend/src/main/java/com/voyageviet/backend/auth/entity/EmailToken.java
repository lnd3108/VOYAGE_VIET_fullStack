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
        name = "EMAIL_TOKENS",
        uniqueConstraints = {
                @UniqueConstraint(name = "UK_EMAIL_TOKENS_TOKEN", columnNames = "TOKEN")
        },
        indexes = {
                @Index(name = "IDX_EMAIL_TOKENS_USER_ID", columnList = "USER_ID"),
                @Index(name = "IDX_EMAIL_TOKENS_TYPE", columnList = "TYPE")
        }
)
public class EmailToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "TOKEN", nullable = false, length = 100)
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(name = "TYPE", nullable = false, length = 30)
    private EmailTokenType type;

    @Column(name = "EXPIRES_AT", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "USED_AT")
    private LocalDateTime usedAt;

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
