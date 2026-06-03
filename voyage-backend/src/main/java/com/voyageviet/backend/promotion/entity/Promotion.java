package com.voyageviet.backend.promotion.entity;

import com.voyageviet.backend.common.entity.BaseEntity;
import com.voyageviet.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "PROMOTIONS",
        indexes = {
                @Index(name = "IDX_PROMOTIONS_CODE", columnList = "CODE"),
                @Index(name = "IDX_PROMOTIONS_STATUS", columnList = "STATUS"),
                @Index(name = "IDX_PROMOTIONS_VALID_UNTIL", columnList = "VALID_UNTIL")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "UK_PROMOTIONS_CODE", columnNames = "CODE")
        }
)
public class Promotion extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "CODE", nullable = false, length = 50)
    private String code;

    @Column(name = "NAME", nullable = false, length = 200)
    private String name;

    @Column(name = "DESCRIPTION", length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "DISCOUNT_TYPE", nullable = false, length = 30)
    private PromotionDiscountType discountType;

    @Column(name = "DISCOUNT_VALUE", nullable = false, precision = 15, scale = 2)
    private BigDecimal discountValue;

    @Column(name = "MAX_DISCOUNT", precision = 15, scale = 2)
    private BigDecimal maxDiscount;

    @Builder.Default
    @Column(name = "MIN_ORDER", nullable = false, precision = 15, scale = 2)
    private BigDecimal minOrder = BigDecimal.ZERO;

    @Column(name = "MAX_USES")
    private Integer maxUses;

    @Builder.Default
    @Column(name = "USED_COUNT", nullable = false)
    private Integer usedCount = 0;

    @Builder.Default
    @Column(name = "MAX_USES_PER_USER", nullable = false)
    private Integer maxUsesPerUser = 1;

    @Column(name = "VALID_FROM", nullable = false)
    private LocalDateTime validFrom;

    @Column(name = "VALID_UNTIL", nullable = false)
    private LocalDateTime validUntil;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false, length = 30)
    private PromotionStatus status = PromotionStatus.ACTIVE;

    @Lob
    @Column(name = "APPLICABLE_TOUR_IDS")
    private String applicableTourIds;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CREATED_BY")
    private User createdBy;
}
