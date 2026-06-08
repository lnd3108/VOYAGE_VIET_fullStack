package com.voyageviet.backend.category.entity;

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
        name = "CATEGORIES",
        uniqueConstraints = {
                @UniqueConstraint(name = "UK_CATEGORIES_SLUG", columnNames = "SLUG")
        }
)
public class Category extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "NAME", nullable = false, length = 150)
    private String name;

    @Column(name = "SLUG", nullable = false, length = 180)
    private String slug;

    @Column(name = "DESCRIPTION", length = 500)
    private String description;

    @Column(name = "IMAGE_URL", length = 500)
    private String imageUrl;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false, length = 30)
    private CategoryStatus status = CategoryStatus.ACTIVE;

    @Builder.Default
    @Column(name = "DISPLAY_ORDER", nullable = false)
    private Integer displayOrder = 0;
}
