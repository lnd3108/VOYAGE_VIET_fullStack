package com.voyageviet.backend.role.entity;

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
        name = "ROLES",
        uniqueConstraints = {
                @UniqueConstraint(name = "UK_ROLES_CODE", columnNames = "CODE")
        }
)
public class Role extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "CODE", nullable = false, length = 50)
    private RoleCode code;

    @Column(name = "NAME", nullable = false, length = 100)
    private String name;

    @Column(name = "DESCRIPTION", length = 255)
    private String description;
}