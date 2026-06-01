package com.voyageviet.backend.user.entity;

import com.voyageviet.backend.common.entity.BaseEntity;
import com.voyageviet.backend.role.entity.Role;
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
        name = "USERS",
        uniqueConstraints = {
                @UniqueConstraint(name = "UK_USERS_EMAIL", columnNames = "EMAIL")
        }
)
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "FULL_NAME", nullable = false, length = 150)
    private String fullName;

    @Column(name = "EMAIL", nullable = false, length = 150)
    private String email;

    @Column(name = "PASSWORD_HASH", length = 255)
    private String passwordHash;

    @Column(name = "PHONE", length = 20)
    private String phone;

    @Column(name = "AVATAR_URL", length = 500)
    private String avatarUrl;

    @Column(name = "AVATAR_PUBLIC_ID", length = 200)
    private String avatarPublicId;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false, length = 30)
    private UserStatus status = UserStatus.ACTIVE;

    @Builder.Default
    @Column(name = "EMAIL_VERIFIED", nullable = false)
    private Boolean emailVerified = false;

    @Column(name = "EMAIL_VERIFIED_AT")
    private LocalDateTime emailVerifiedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ROLE_ID", nullable = false)
    private Role role;

    @Column(name = "LAST_LOGIN_AT")
    private LocalDateTime lastLoginAt;

}
