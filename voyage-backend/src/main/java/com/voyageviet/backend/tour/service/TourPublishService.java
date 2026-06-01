package com.voyageviet.backend.tour.service;

import com.voyageviet.backend.common.exception.BusinessException;
import com.voyageviet.backend.common.exception.ErrorCode;
import com.voyageviet.backend.tour.dto.PublishChecklistItemResponse;
import com.voyageviet.backend.tour.dto.PublishChecklistResponse;
import com.voyageviet.backend.tour.entity.Tour;
import com.voyageviet.backend.tour.entity.TourSchedule;
import com.voyageviet.backend.tour.entity.TourScheduleStatus;
import com.voyageviet.backend.tour.entity.TourStatus;
import com.voyageviet.backend.tour.repository.TourImageRepository;
import com.voyageviet.backend.tour.repository.TourItineraryRepository;
import com.voyageviet.backend.tour.repository.TourRepository;
import com.voyageviet.backend.tour.repository.TourScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TourPublishService {

    private final TourRepository tourRepository;
    private final TourImageRepository imageRepository;
    private final TourItineraryRepository itineraryRepository;
    private final TourScheduleRepository scheduleRepository;

    public PublishChecklistResponse getPublishChecklist(Long tourId) {
        Tour tour = findTour(tourId);
        return buildChecklist(tour);
    }

    @Transactional
    public PublishChecklistResponse publishTour(Long tourId) {
        Tour tour = findTour(tourId);
        if (tour.getStatus() != TourStatus.DRAFT) {
            throw new BusinessException(ErrorCode.TOUR_PUBLISH_INVALID, "Chỉ cho phép publish tour ở trạng thái DRAFT");
        }

        PublishChecklistResponse checklist = buildChecklist(tour);
        if (!checklist.canPublish()) {
            throw new BusinessException(
                    ErrorCode.TOUR_PUBLISH_INVALID,
                    "Không thể publish vì tour chưa đủ thông tin",
                    checklist
            );
        }

        tour.setStatus(TourStatus.PUBLISHED);
        return checklist;
    }

    private PublishChecklistResponse buildChecklist(Tour tour) {
        long galleryCount = imageRepository.countByTourId(tour.getId());
        boolean hasThumbnail = imageRepository.existsByTourIdAndThumbnailTrue(tour.getId());
        long itineraryCount = itineraryRepository.countByTourId(tour.getId());
        List<TourSchedule> openSchedules = scheduleRepository.findByTourSlugAndStatusAndDepartureDateGreaterThanEqual(
                tour.getSlug(),
                TourScheduleStatus.OPEN,
                LocalDate.now(),
                Sort.by(Sort.Direction.ASC, "departureDate")
        );

        boolean hasOpenSchedule = !openSchedules.isEmpty();
        boolean hasValidPrice = openSchedules.stream()
                .anyMatch(schedule -> schedule.getPriceAdult() != null && schedule.getPriceAdult().compareTo(BigDecimal.ZERO) > 0);
        boolean hasMaxSeats = openSchedules.stream()
                .anyMatch(schedule -> schedule.getMaxSeats() != null && schedule.getMaxSeats() > 0);

        List<PublishChecklistItemResponse> items = new ArrayList<>();
        items.add(item("TOUR_NAME", "Tên tour", hasText(tour.getTitle()), "Tour cần có tên"));
        items.add(item("CATEGORY", "Danh mục", tour.getCategory() != null, "Tour cần có danh mục"));
        items.add(item("DESTINATION", "Điểm đến", tour.getDestination() != null, "Tour cần có điểm đến"));
        items.add(item("THUMBNAIL", "Thumbnail", hasThumbnail, "Tour cần có thumbnail"));
        items.add(item("GALLERY", "Gallery", galleryCount >= 1, "Tour cần có ít nhất 1 ảnh gallery"));
        items.add(item("ITINERARY", "Lịch trình", itineraryCount >= 1, "Tour cần có ít nhất 1 ngày lịch trình"));
        items.add(item("OPEN_SCHEDULE", "Lịch khởi hành", hasOpenSchedule, "Tour cần có ít nhất 1 lịch OPEN trong tương lai"));
        items.add(item("VALID_PRICE", "Giá hợp lệ", hasValidPrice, "Tour cần có lịch OPEN với giá người lớn > 0"));
        items.add(item("MAX_SEATS", "Số chỗ", hasMaxSeats, "Tour cần có lịch OPEN với số chỗ tối đa > 0"));

        boolean canPublish = items.stream().allMatch(PublishChecklistItemResponse::passed);
        return new PublishChecklistResponse(tour.getId(), canPublish, items);
    }

    private PublishChecklistItemResponse item(String code, String label, boolean passed, String message) {
        return new PublishChecklistItemResponse(code, label, passed, passed ? null : message);
    }

    private Tour findTour(Long tourId) {
        return tourRepository.findById(tourId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TOUR_NOT_FOUND, "Tour không tồn tại"));
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
