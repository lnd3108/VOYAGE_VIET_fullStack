package com.voyageviet.backend.tour.service;

import com.voyageviet.backend.common.exception.BusinessException;
import com.voyageviet.backend.common.exception.ErrorCode;
import com.voyageviet.backend.media.dto.MediaUploadResponse;
import com.voyageviet.backend.media.service.MediaService;
import com.voyageviet.backend.tour.dto.*;
import com.voyageviet.backend.tour.entity.Tour;
import com.voyageviet.backend.tour.entity.TourImage;
import com.voyageviet.backend.tour.repository.TourImageRepository;
import com.voyageviet.backend.tour.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TourImageService {

    private static final long MAX_IMAGES_PER_TOUR = 10;
    private static final long MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    private final TourRepository tourRepository;
    private final TourImageRepository imageRepository;
    private final MediaService mediaService;

    public List<TourImageResponse> getImages(Long tourId) {
        findTour(tourId);
        return imageRepository.findByTourIdOrderBySortOrderAscIdAsc(tourId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TourImageResponse uploadImage(Long tourId, MultipartFile file, String altText) {
        Tour tour = findTour(tourId);
        validateImage(file);

        long imageCount = imageRepository.countByTourId(tourId);
        if (imageCount >= MAX_IMAGES_PER_TOUR) {
            throw new BusinessException(ErrorCode.TOUR_IMAGE_INVALID, "Tối đa 10 ảnh cho một tour");
        }

        MediaUploadResponse uploaded = mediaService.uploadImage(file, "tour-" + tourId);
        boolean firstImage = imageCount == 0;

        TourImage image = TourImage.builder()
                .tour(tour)
                .url(uploaded.secureUrl())
                .publicId(uploaded.publicId())
                .altText(trimToNull(altText))
                .sortOrder((int) imageCount)
                .thumbnail(firstImage)
                .width(uploaded.width())
                .height(uploaded.height())
                .fileSizeBytes(uploaded.bytes())
                .build();

        TourImage saved = imageRepository.save(image);
        if (firstImage) {
            tour.setThumbnailUrl(saved.getUrl());
        }

        return toResponse(saved);
    }

    @Transactional
    public void deleteImage(Long tourId, Long imageId) {
        TourImage image = findImage(tourId, imageId);
        long imageCount = imageRepository.countByTourId(tourId);
        if (Boolean.TRUE.equals(image.getThumbnail()) && imageCount > 1) {
            throw new BusinessException(ErrorCode.TOUR_IMAGE_INVALID, "Không thể xóa thumbnail khi tour còn ảnh khác. Hãy chọn thumbnail khác trước.");
        }

        mediaService.deleteImageByPublicId(image.getPublicId());
        imageRepository.delete(image);

        if (Boolean.TRUE.equals(image.getThumbnail())) {
            image.getTour().setThumbnailUrl(null);
        }
    }

    @Transactional
    public TourImageResponse setThumbnail(Long tourId, Long imageId) {
        TourImage image = findImage(tourId, imageId);
        imageRepository.unsetThumbnailByTourId(tourId);
        image.setThumbnail(true);
        image.getTour().setThumbnailUrl(image.getUrl());
        return toResponse(image);
    }

    @Transactional
    public List<TourImageResponse> reorderImages(Long tourId, TourImageReorderRequest request) {
        List<TourImage> existing = imageRepository.findByTourIdOrderBySortOrderAscIdAsc(tourId);
        Map<Long, TourImage> byId = new HashMap<>();
        existing.forEach(image -> byId.put(image.getId(), image));

        for (TourImageReorderRequest.Item item : request.items()) {
            TourImage image = byId.get(item.id());
            if (image == null) {
                throw new BusinessException(ErrorCode.TOUR_IMAGE_INVALID, "Image does not belong to this tour");
            }
            image.setSortOrder(item.sortOrder());
        }

        return existing.stream()
                .sorted(Comparator.comparing(TourImage::getSortOrder).thenComparing(TourImage::getId))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TourImageResponse updateAltText(Long tourId, Long imageId, String altText) {
        TourImage image = findImage(tourId, imageId);
        image.setAltText(trimToNull(altText));
        return toResponse(image);
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.MEDIA_INVALID_FILE, "File ảnh không hợp lệ");
        }
        if (file.getSize() > MAX_IMAGE_SIZE_BYTES) {
            throw new BusinessException(ErrorCode.MEDIA_INVALID_FILE, "Image size must not exceed 5MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
            throw new BusinessException(ErrorCode.MEDIA_INVALID_FILE, "Chỉ hỗ trợ jpg/jpeg/png/webp");
        }
    }

    private Tour findTour(Long tourId) {
        return tourRepository.findById(tourId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TOUR_NOT_FOUND, "Tour không tồn tại"));
    }

    private TourImage findImage(Long tourId, Long imageId) {
        return imageRepository.findByIdAndTourId(imageId, tourId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TOUR_IMAGE_NOT_FOUND, "Tour image not found"));
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private TourImageResponse toResponse(TourImage image) {
        return new TourImageResponse(
                image.getId(),
                image.getTour().getId(),
                image.getUrl(),
                image.getPublicId(),
                image.getAltText(),
                image.getSortOrder(),
                image.getThumbnail(),
                image.getWidth(),
                image.getHeight(),
                image.getFileSizeBytes(),
                image.getCreatedAt()
        );
    }
}
