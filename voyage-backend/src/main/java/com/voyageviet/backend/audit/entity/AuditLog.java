package com.voyageviet.backend.audit.entity;

import com.voyageviet.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "AUDIT_LOGS",
        indexes = {
                @Index(name = "IDX_AUDIT_LOGS_ACTION", columnList = "ACTION"),
                @Index(name = "IDX_AUDIT_LOGS_ACTOR_EMAIL", columnList = "ACTOR_EMAIL"),
                @Index(name = "IDX_AUDIT_LOGS_TARGET_TYPE", columnList = "TARGET_TYPE"),
                @Index(name = "IDX_AUDIT_LOGS_TARGET_ID", columnList = "TARGET_ID")
        }
)
public class AuditLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "ACTION", nullable = false, length = 80)
    private AuditAction action;

    @Column(name = "ACTOR_ID")
    private Long actorId;

    @Column(name = "ACTOR_EMAIL", length = 150)
    private String actorEmail;

    @Column(name = "TARGET_TYPE", nullable = false, length = 80)
    private String targetType;

    @Column(name = "TARGET_ID")
    private Long targetId;

    @Column(name = "TARGET_LABEL", length = 255)
    private String targetLabel;

    @Column(name = "OLD_VALUE", length = 500)
    private String oldValue;

    @Column(name = "NEW_VALUE", length = 500)
    private String newValue;

    @Column(name = "DESCRIPTION", length = 1000)
    private String description;
}