package com.voyageviet.backend.media.entity;

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
        name = "MEDIA",
        indexes = {
                @Index(name = "IDX_MEDIA_PUBLIC_ID", columnList = "PUBLIC_ID"),
                @Index(name = "IDX_MEDIA_FOLDER", columnList = "FOLDER")
        }
)
public class Media extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "PUBLIC_ID", nullable = false, length = 255)
    private String publicId;

    @Column(name = "SECURE_URL", nullable = false, length = 1000)
    private String secureUrl;

    @Column(name = "ORIGINAL_FILENAME", length = 255)
    private String originalFilename;

    @Column(name = "FORMAT", length = 50)
    private String format;

    @Column(name = "RESOURCE_TYPE", length = 50)
    private String resourceType;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "MEDIA_TYPE", nullable = false, length = 30)
    private MediaType mediaType = MediaType.IMAGE;

    @Column(name = "FOLDER", length = 255)
    private String folder;

    @Column(name = "BYTES")
    private Long bytes;

    @Column(name = "WIDTH")
    private Integer width;

    @Column(name = "HEIGHT")
    private Integer height;
}