package com.voyageviet.backend.category.entity;

import com.voyageviet.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.Objects;

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
    private CategoryStatus status = CategoryStatus.DRAFT;

    @Builder.Default
    @Column(name = "IS_DISPLAY", nullable = false)
    private Integer isDisplay = 0;

    @Builder.Default
    @Column(name = "IS_ACTIVE", nullable = false)
    private Integer isActive = 1;

    @Builder.Default
    @Column(name = "DISPLAY_ORDER", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "REJECT_REASON", length = 500)
    private String rejectReason;

    @Lob
    @Column(name = "NEW_DATA")
    private String newData;

    public void markAsDraft() {
        this.status = CategoryStatus.DRAFT;
    }

    public void markAsPending() {
        this.status = CategoryStatus.PENDING;
    }

    public void markAsApproved() {
        this.status = CategoryStatus.APPROVED;
        this.rejectReason = null;
    }

    public void markAsRejected(String reason) {
        this.status = CategoryStatus.REJECTED;
        this.rejectReason = reason;
    }

    public void markAsCancelApproved() {
        this.status = CategoryStatus.CANCEL_APPROVE;
    }

    public void show() {
        this.isDisplay = 1;
    }

    public void hide() {
        this.isDisplay = 0;
    }

    public void activate() {
        this.isActive = 1;
    }

    public void deactivate() {
        this.isActive = 0;
        hide();
    }

    public void replaceNewData(String newData) {
        this.newData = newData;
    }

    public void clearNewData() {
        this.newData = null;
    }

    public boolean hasNewData() {
        return this.newData != null && !this.newData.isBlank();
    }

    public boolean isPending() {
        return this.status == CategoryStatus.PENDING;
    }

    public boolean isPublished() {
        return this.status == CategoryStatus.APPROVED;
    }

    public boolean isPublicVisible() {
        return this.status == CategoryStatus.APPROVED
                && Objects.equals(this.isActive, 1)
                && Objects.equals(this.isDisplay, 1);
    }
}
