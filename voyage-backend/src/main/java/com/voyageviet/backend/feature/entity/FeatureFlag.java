package com.voyageviet.backend.feature.entity;

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
        name = "FEATURE_FLAGS",
        uniqueConstraints = {
                @UniqueConstraint(name = "UK_FEATURE_FLAGS_CODE", columnNames = "FEATURE_CODE")
        }
)
public class FeatureFlag extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "FEATURE_CODE", nullable = false, length = 80)
    private FeatureCode code;

    @Column(name = "NAME", nullable = false, length = 150)
    private String name;

    @Column(name = "DESCRIPTION", length = 500)
    private String description;

    @Builder.Default
    @Column(name = "ENABLED", nullable = false)
    private Boolean enabled = true;
}