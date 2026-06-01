package com.voyageviet.backend.media.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.voyageviet.backend.common.exception.BusinessException;
import com.voyageviet.backend.common.exception.ErrorCode;
import com.voyageviet.backend.common.paging.PageResponse;
import com.voyageviet.backend.media.dto.MediaUploadResponse;
import com.voyageviet.backend.media.entity.Media;
import com.voyageviet.backend.media.entity.MediaType;
import com.voyageviet.backend.media.repository.MediaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class MediaService {

    private static final long MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private final Cloudinary cloudinary;
    private final MediaRepository mediaRepository;

    @Value("${cloudinary.folder:voyage-viet}")
    private String rootFolder;

    @Transactional
    public MediaUploadResponse uploadImage(MultipartFile file, String module) {
        validateImage(file);

        String folder = buildFolder(module);

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "image",
                            "use_filename", true,
                            "unique_filename", true,
                            "overwrite", false
                    )
            );

            Media media = Media.builder()
                    .publicId(getString(uploadResult, "public_id"))
                    .secureUrl(getString(uploadResult, "secure_url"))
                    .originalFilename(file.getOriginalFilename())
                    .format(getString(uploadResult, "format"))
                    .resourceType(getString(uploadResult, "resource_type"))
                    .mediaType(MediaType.IMAGE)
                    .folder(folder)
                    .bytes(getLong(uploadResult, "bytes"))
                    .width(getInteger(uploadResult, "width"))
                    .height(getInteger(uploadResult, "height"))
                    .build();

            return toResponse(mediaRepository.save(media));
        } catch (Exception ex) {
            throw new BusinessException(
                    ErrorCode.MEDIA_UPLOAD_FAILED,
                    "Upload image failed: " + ex.getMessage()
            );
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<MediaUploadResponse> getMediaList(
            String module,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        Pageable pageable = buildPageable(page, size, sortBy, sortDir);

        Page<Media> mediaPage;

        if (module == null || module.isBlank()) {
            mediaPage = mediaRepository.findAll(pageable);
        } else {
            String folderKeyword = module.trim().toLowerCase();
            mediaPage = mediaRepository.findByFolderContainingIgnoreCase(folderKeyword, pageable);
        }

        return PageResponse.from(mediaPage, this::toResponse);
    }

    @Transactional
    public void deleteMedia(Long id) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.MEDIA_NOT_FOUND,
                        "Media not found"
                ));

        try {
            cloudinary.uploader().destroy(
                    media.getPublicId(),
                    ObjectUtils.asMap(
                            "resource_type", media.getResourceType() == null ? "image" : media.getResourceType()
                    )
            );

            mediaRepository.delete(media);
        } catch (Exception ex) {
            throw new BusinessException(
                    ErrorCode.MEDIA_UPLOAD_FAILED,
                    "Delete media failed: " + ex.getMessage()
            );
        }
    }

    private Pageable buildPageable(int page, int size, String sortBy, String sortDir) {
        if (page < 0) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Page index must be greater than or equal to 0"
            );
        }

        if (size < 1 || size > 50) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Page size must be between 1 and 50"
            );
        }

        String safeSortBy = resolveSortBy(sortBy);

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.ASC
                : "desc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.DESC
                : null;

        if (direction == null) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Sort direction must be either asc or desc"
            );
        }

        return PageRequest.of(page, size, Sort.by(direction, safeSortBy));
    }

    private String resolveSortBy(String sortBy) {
        Set<String> allowedSortFields = Set.of(
                "createdAt",
                "updatedAt",
                "id",
                "bytes",
                "folder",
                "mediaType"
        );

        if (sortBy == null || sortBy.isBlank()) {
            return "createdAt";
        }

        if (!allowedSortFields.contains(sortBy)) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Invalid sort field. Allowed fields: " + String.join(", ", allowedSortFields)
            );
        }

        return sortBy;
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(
                    ErrorCode.MEDIA_INVALID_FILE,
                    "Image file is required"
            );
        }

        if (file.getSize() > MAX_IMAGE_SIZE_BYTES) {
            throw new BusinessException(
                    ErrorCode.MEDIA_INVALID_FILE,
                    "Image size must not exceed 5MB"
            );
        }

        String contentType = file.getContentType();

        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
            throw new BusinessException(
                    ErrorCode.MEDIA_INVALID_FILE,
                    "Only JPG, PNG and WEBP images are allowed"
            );
        }
    }

    private String buildFolder(String module) {
        String safeModule = module == null || module.isBlank()
                ? "general"
                : module.trim().toLowerCase().replaceAll("[^a-z0-9-]", "-");

        return rootFolder + "/" + safeModule;
    }

    private String getString(Map<?, ?> map, String key) {
        Object value = map.get(key);
        return value == null ? null : value.toString();
    }

    private Long getLong(Map<?, ?> map, String key) {
        Object value = map.get(key);
        if (value == null) {
            return null;
        }

        if (value instanceof Number number) {
            return number.longValue();
        }

        return Long.valueOf(value.toString());
    }

    private Integer getInteger(Map<?, ?> map, String key) {
        Object value = map.get(key);
        if (value == null) {
            return null;
        }

        if (value instanceof Number number) {
            return number.intValue();
        }

        return Integer.valueOf(value.toString());
    }

    private MediaUploadResponse toResponse(Media media) {
        return new MediaUploadResponse(
                media.getId(),
                media.getPublicId(),
                media.getSecureUrl(),
                media.getOriginalFilename(),
                media.getFormat(),
                media.getResourceType(),
                media.getMediaType(),
                media.getFolder(),
                media.getBytes(),
                media.getWidth(),
                media.getHeight()
        );
    }
}