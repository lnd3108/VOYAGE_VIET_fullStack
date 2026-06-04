package com.voyageviet.backend.notification.entity;

import com.voyageviet.backend.common.entity.BaseEntity;
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
        name = "NOTIFICATIONS",
        indexes = {
                @Index(name = "IDX_NOTIFICATIONS_USER_READ_CREATED", columnList = "USER_ID, IS_READ, CREATED_AT"),
                @Index(name = "IDX_NOTIFICATIONS_USER_CREATED", columnList = "USER_ID, CREATED_AT")
        }
)
public class Notification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "TYPE", nullable = false, length = 50)
    private NotificationType type;

    @Column(name = "TITLE", nullable = false, length = 200)
    private String title;

    @Column(name = "BODY", nullable = false, length = 500)
    private String body;

    @Lob
    @Column(name = "DATA")
    private String data;

    @Builder.Default
    @Column(name = "IS_READ", nullable = false)
    private Boolean isRead = false;

    @Column(name = "READ_AT")
    private LocalDateTime readAt;
}
