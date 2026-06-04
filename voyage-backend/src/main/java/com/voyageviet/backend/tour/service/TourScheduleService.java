package com.voyageviet.backend.tour.service;

import com.voyageviet.backend.booking.repository.BookingRepository;
import com.voyageviet.backend.common.exception.BusinessException;
import com.voyageviet.backend.common.exception.ErrorCode;
import com.voyageviet.backend.common.paging.PageResponse;
import com.voyageviet.backend.tour.dto.*;
import com.voyageviet.backend.tour.entity.Tour;
import com.voyageviet.backend.tour.entity.TourSchedule;
import com.voyageviet.backend.tour.entity.TourScheduleStatus;
import com.voyageviet.backend.tour.repository.TourRepository;
import com.voyageviet.backend.tour.repository.TourScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TourScheduleService {

    private final TourRepository tourRepository;
    private final TourScheduleRepository scheduleRepository;
    private final BookingRepository bookingRepository;
    private final TourStatsService tourStatsService;

    @Transactional
    public TourScheduleResponse createSchedule(Long tourId, TourScheduleCreateRequest request) {
        Tour tour = findTour(tourId);
        validateSchedule(request.departureDate(), request.returnDate(), request.priceAdult(), request.maxSeats(), request.bookedSeats(), true);

        TourSchedule schedule = TourSchedule.builder()
                .tour(tour)
                .departureDate(request.departureDate())
                .returnDate(request.returnDate())
                .priceAdult(request.priceAdult())
                .priceChild(defaultMoney(request.priceChild()))
                .priceInfant(defaultMoney(request.priceInfant()))
                .singleSupplement(defaultMoney(request.singleSupplement()))
                .maxSeats(request.maxSeats())
                .bookedSeats(request.bookedSeats() == null ? 0 : request.bookedSeats())
                .status(request.status() == null ? TourScheduleStatus.OPEN : request.status())
                .notes(trimToNull(request.notes()))
                .build();

        normalizeStatus(schedule);
        TourSchedule savedSchedule = scheduleRepository.save(schedule);
        tourStatsService.recomputeMinPrice(tourId);
        return toResponse(savedSchedule);
    }

    public PageResponse<TourScheduleResponse> getAdminSchedules(Long tourId, TourScheduleStatus status, Pageable pageable) {
        findTour(tourId);
        Page<TourSchedule> page = status == null
                ? scheduleRepository.findByTourId(tourId, pageable)
                : scheduleRepository.findByTourIdAndStatus(tourId, status, pageable);
        return PageResponse.from(page, this::toResponse);
    }

    public TourScheduleResponse getScheduleDetail(Long tourId, Long scheduleId) {
        return toResponse(findSchedule(tourId, scheduleId));
    }

    @Transactional
    public TourScheduleResponse updateSchedule(Long tourId, Long scheduleId, TourScheduleUpdateRequest request) {
        TourSchedule schedule = findSchedule(tourId, scheduleId);
        assertNoBooking(scheduleId, "Không thể cập nhật lịch khởi hành đã có booking.");
        validateSchedule(request.departureDate(), request.returnDate(), request.priceAdult(), request.maxSeats(), request.bookedSeats(), false);

        schedule.setDepartureDate(request.departureDate());
        schedule.setReturnDate(request.returnDate());
        schedule.setPriceAdult(request.priceAdult());
        schedule.setPriceChild(defaultMoney(request.priceChild()));
        schedule.setPriceInfant(defaultMoney(request.priceInfant()));
        schedule.setSingleSupplement(defaultMoney(request.singleSupplement()));
        schedule.setMaxSeats(request.maxSeats());
        schedule.setBookedSeats(request.bookedSeats() == null ? schedule.getBookedSeats() : request.bookedSeats());
        schedule.setStatus(request.status() == null ? schedule.getStatus() : request.status());
        schedule.setNotes(trimToNull(request.notes()));

        normalizeStatus(schedule);
        tourStatsService.recomputeMinPrice(tourId);
        return toResponse(schedule);
    }

    @Transactional
    public void deleteSchedule(Long tourId, Long scheduleId) {
        TourSchedule schedule = findSchedule(tourId, scheduleId);
        assertNoBooking(scheduleId, "Không thể xóa lịch đã có booking.");
        scheduleRepository.delete(schedule);
        scheduleRepository.flush();
        tourStatsService.recomputeMinPrice(tourId);
    }

    @Transactional
    public TourScheduleResponse updateStatus(Long tourId, Long scheduleId, TourScheduleStatus status) {
        TourSchedule schedule = findSchedule(tourId, scheduleId);
        if (status == TourScheduleStatus.FULL) {
            throw new BusinessException(ErrorCode.TOUR_SCHEDULE_INVALID, "FULL status is set automatically when booked seats reach max seats");
        }
        if (schedule.getStatus() == TourScheduleStatus.FULL && status == TourScheduleStatus.CLOSED) {
            throw new BusinessException(ErrorCode.TOUR_SCHEDULE_INVALID, "Không thể set schedule CLOSED khi đã FULL");
        }
        if (status == TourScheduleStatus.OPEN && schedule.getDepartureDate().isBefore(LocalDate.now())) {
            throw new BusinessException(ErrorCode.TOUR_SCHEDULE_INVALID, "Không thể OPEN lịch khởi hành trong quá khứ");
        }
        schedule.setStatus(status);
        normalizeStatus(schedule);
        tourStatsService.recomputeMinPrice(tourId);
        return toResponse(schedule);
    }

    @Transactional
    public TourScheduleResponse duplicateSchedule(Long tourId, Long scheduleId, LocalDate departureDate) {
        TourSchedule source = findSchedule(tourId, scheduleId);
        if (departureDate == null || departureDate.isBefore(LocalDate.now())) {
            throw new BusinessException(ErrorCode.TOUR_SCHEDULE_INVALID, "Ngày khởi hành không được trong quá khứ");
        }

        long days = ChronoUnit.DAYS.between(source.getDepartureDate(), source.getReturnDate());
        TourSchedule duplicate = TourSchedule.builder()
                .tour(source.getTour())
                .departureDate(departureDate)
                .returnDate(departureDate.plusDays(days))
                .priceAdult(source.getPriceAdult())
                .priceChild(source.getPriceChild())
                .priceInfant(source.getPriceInfant())
                .singleSupplement(source.getSingleSupplement())
                .maxSeats(source.getMaxSeats())
                .bookedSeats(0)
                .status(TourScheduleStatus.OPEN)
                .notes(source.getNotes())
                .build();

        TourSchedule savedSchedule = scheduleRepository.save(duplicate);
        tourStatsService.recomputeMinPrice(tourId);
        return toResponse(savedSchedule);
    }

    public List<TourScheduleResponse> getPublicSchedulesByTourSlug(String slug) {
        return scheduleRepository.findByTourSlugAndStatusAndDepartureDateGreaterThanEqual(
                        slug,
                        TourScheduleStatus.OPEN,
                        LocalDate.now(),
                        Sort.by(Sort.Direction.ASC, "departureDate", "id")
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<PublicTourScheduleResponse> getPublicScheduleSummariesByTourSlug(String slug) {
        return scheduleRepository.findByTourSlugAndStatusAndDepartureDateGreaterThanEqual(
                        slug,
                        TourScheduleStatus.OPEN,
                        LocalDate.now(),
                        Sort.by(Sort.Direction.ASC, "departureDate", "id")
                )
                .stream()
                .map(schedule -> new PublicTourScheduleResponse(
                        schedule.getId(),
                        schedule.getDepartureDate(),
                        schedule.getReturnDate(),
                        schedule.getPriceAdult(),
                        schedule.getPriceChild(),
                        schedule.getPriceInfant(),
                        schedule.getSingleSupplement(),
                        schedule.getMaxSeats(),
                        Math.max(schedule.getMaxSeats() - (schedule.getBookedSeats() == null ? 0 : schedule.getBookedSeats()), 0),
                        schedule.getStatus()
                ))
                .toList();
    }

    private void validateSchedule(LocalDate departureDate, LocalDate returnDate, BigDecimal priceAdult, Integer maxSeats, Integer bookedSeats, boolean creating) {
        if (creating && departureDate.isBefore(LocalDate.now())) {
            throw new BusinessException(ErrorCode.TOUR_SCHEDULE_INVALID, "Ngày khởi hành không được trong quá khứ");
        }
        if (returnDate.isBefore(departureDate)) {
            throw new BusinessException(ErrorCode.TOUR_SCHEDULE_INVALID, "Ngày về không được trước ngày đi");
        }
        if (priceAdult == null || priceAdult.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(ErrorCode.TOUR_INVALID_PRICE, "Giá người lớn phải lớn hơn 0");
        }
        if (maxSeats == null || maxSeats <= 0) {
            throw new BusinessException(ErrorCode.TOUR_SCHEDULE_INVALID, "Số chỗ tối đa phải lớn hơn 0");
        }
        int safeBookedSeats = bookedSeats == null ? 0 : bookedSeats;
        if (safeBookedSeats < 0 || safeBookedSeats > maxSeats) {
            throw new BusinessException(ErrorCode.TOUR_SCHEDULE_INVALID, "Số chỗ đã đặt phải từ 0 đến số chỗ tối đa");
        }
    }

    private void normalizeStatus(TourSchedule schedule) {
        if (schedule.getBookedSeats() != null && schedule.getMaxSeats() != null && schedule.getBookedSeats() >= schedule.getMaxSeats()) {
            schedule.setStatus(TourScheduleStatus.FULL);
        }
    }

    private void assertNoBooking(Long scheduleId, String message) {
        if (bookingRepository.existsByScheduleId(scheduleId)) {
            throw new BusinessException(ErrorCode.TOUR_SCHEDULE_INVALID, message);
        }
    }

    private Tour findTour(Long tourId) {
        return tourRepository.findById(tourId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TOUR_NOT_FOUND, "Tour không tồn tại"));
    }

    private TourSchedule findSchedule(Long tourId, Long scheduleId) {
        return scheduleRepository.findByIdAndTourId(scheduleId, tourId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TOUR_SCHEDULE_NOT_FOUND, "Lịch khởi hành không tồn tại"));
    }

    private BigDecimal defaultMoney(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private TourScheduleResponse toResponse(TourSchedule schedule) {
        int bookedSeats = schedule.getBookedSeats() == null ? 0 : schedule.getBookedSeats();
        int maxSeats = schedule.getMaxSeats() == null ? 0 : schedule.getMaxSeats();
        return new TourScheduleResponse(
                schedule.getId(),
                schedule.getTour().getId(),
                schedule.getTour().getTitle(),
                schedule.getDepartureDate(),
                schedule.getReturnDate(),
                schedule.getPriceAdult(),
                schedule.getPriceChild(),
                schedule.getPriceInfant(),
                schedule.getSingleSupplement(),
                schedule.getMaxSeats(),
                schedule.getBookedSeats(),
                Math.max(maxSeats - bookedSeats, 0),
                schedule.getStatus(),
                schedule.getNotes(),
                schedule.getVersion(),
                schedule.getCreatedAt(),
                schedule.getUpdatedAt()
        );
    }
}
