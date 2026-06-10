package com.voyageviet.backend.destination.entity;

import com.voyageviet.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.Objects;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "DESTINATIONS",
        uniqueConstraints = {
                @UniqueConstraint(name = "UK_DESTINATIONS_SLUG", columnNames = "SLUG")
        }
)
public class Destination extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "NAME", nullable = false, length = 150)
    private String name;

    @Column(name = "SLUG", nullable = false, length = 180)
    private String slug;

    @Column(name = "REGION", length = 100)
    private String region;

    @Column(name = "COUNTRY", length = 100)
    private String country;

    @Column(name = "DESCRIPTION", length = 1000)
    private String description;

    @Column(name = "IMAGE_URL", length = 500)
    private String imageUrl;

    @Column(name = "LATITUDE", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "LONGITUDE", precision = 10, scale = 7)
    private BigDecimal longitude;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false, length = 30)
    private DestinationStatus status = DestinationStatus.DRAFT;

    @Builder.Default
    @Column(name = "IS_DISPLAY", nullable = false)
    private Integer isDisplay = 0;

    @Column(name = "REJECT_REASON", length = 500)
    private String rejectReason;

    @Lob
    @Column(name = "NEW_DATA")
    private String newData;

    public void markAsDraft() {
        this.status = DestinationStatus.DRAFT;
    }

    public void markAsPending() {
        this.status = DestinationStatus.PENDING;
    }

    public void markAsApproved() {
        this.status = DestinationStatus.APPROVED;
        this.rejectReason = null;
    }

    public void markAsRejected(String reason) {
        this.status = DestinationStatus.REJECTED;
        this.rejectReason = reason;
    }

    public void markAsCancelApproved() {
        this.status = DestinationStatus.CANCEL_APPROVE;
    }

    public void show() {
        this.isDisplay = 1;
    }

    public void hide() {
        this.isDisplay = 0;
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
        return this.status == DestinationStatus.PENDING;
    }

    public boolean isPublished() {
        return this.status == DestinationStatus.APPROVED;
    }

    public boolean isPublicVisible() {
        return this.status == DestinationStatus.APPROVED && Objects.equals(this.isDisplay, 1);
    }
}
