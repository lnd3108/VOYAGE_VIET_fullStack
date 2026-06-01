package com.voyageviet.backend.booking.service;

import com.voyageviet.backend.audit.entity.AuditAction;
import com.voyageviet.backend.audit.service.AuditLogService;
import com.voyageviet.backend.booking.dto.BookingCreateRequest;
import com.voyageviet.backend.booking.dto.BookingResponse;
import com.voyageviet.backend.booking.dto.BookingStatusUpdateRequest;
import com.voyageviet.backend.booking.entity.Booking;
import com.voyageviet.backend.booking.entity.BookingStatus;
import com.voyageviet.backend.booking.repository.BookingRepository;
import com.voyageviet.backend.common.exception.BusinessException;
import com.voyageviet.backend.common.exception.ErrorCode;
import com.voyageviet.backend.common.paging.PageResponse;
import com.voyageviet.backend.feature.entity.FeatureCode;
import com.voyageviet.backend.feature.service.FeatureGuardService;
import com.voyageviet.backend.tour.entity.Tour;
import com.voyageviet.backend.tour.entity.TourSchedule;
import com.voyageviet.backend.tour.entity.TourScheduleStatus;
import com.voyageviet.backend.tour.entity.TourStatus;
import com.voyageviet.backend.tour.repository.TourRepository;
import com.voyageviet.backend.tour.repository.TourScheduleRepository;
import com.voyageviet.backend.user.entity.User;
import com.voyageviet.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;


import org.springframework.data.domain.Sort;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookingService {

    private final BookingRepository bookingRepository;
    private final TourRepository tourRepository;
    private final TourScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final FeatureGuardService featureGuardService;
    private final AuditLogService auditLogService;

    @Transactional
    public BookingResponse createBooking(Authentication authentication, BookingCreateRequest request) {
        featureGuardService.requireEnabled(
                FeatureCode.PUBLIC_BOOKING,
                "Booking feature is currently disabled"
        );

        User user = getCurrentUser(authentication);

        if (request.scheduleId() == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Vui lòng chọn lịch khởi hành.");
        }

        TourSchedule schedule = scheduleRepository.findById(request.scheduleId())
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.TOUR_SCHEDULE_NOT_FOUND,
                        "Lịch khởi hành không tồn tại."
                ));

        Tour tour = schedule.getTour();
        if (tour.getStatus() != TourStatus.PUBLISHED) {
            throw new BusinessException(
                ErrorCode.INVALID_REQUEST,
                    "Tour chưa được publish."
            );
        }

        validateScheduleForBooking(schedule);

        int adultCount = request.adultCount() == null ? 1 : request.adultCount();
        int childCount = request.childCount() == null ? 0 : request.childCount();
        int infantCount = request.infantCount() == null ? 0 : request.infantCount();
        int totalPeople = adultCount + childCount + infantCount;

        if (totalPeople <= 0) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Total people must be greater than 0");
        }

        int currentBookedSeats = schedule.getBookedSeats() == null ? 0 : schedule.getBookedSeats();
        int remainingSeats = schedule.getMaxSeats() - currentBookedSeats;
        if (totalPeople > remainingSeats) {
            throw new BusinessException(ErrorCode.BOOKING_NOT_ENOUGH_SEATS, "Số khách vượt quá số chỗ còn lại.");
        }

        BigDecimal priceAdult = defaultMoney(schedule.getPriceAdult());
        BigDecimal priceChild = defaultMoney(schedule.getPriceChild());
        BigDecimal priceInfant = defaultMoney(schedule.getPriceInfant());
        BigDecimal singleSupplement = defaultMoney(schedule.getSingleSupplement());
        BigDecimal totalAmount = priceAdult.multiply(BigDecimal.valueOf(adultCount))
                .add(priceChild.multiply(BigDecimal.valueOf(childCount)))
                .add(priceInfant.multiply(BigDecimal.valueOf(infantCount)));

        schedule.setBookedSeats(currentBookedSeats + totalPeople);
        if (schedule.getBookedSeats() >= schedule.getMaxSeats()) {
            schedule.setStatus(TourScheduleStatus.FULL);
        }

        Booking booking = Booking.builder()
                .user(user)
                .tour(tour)
                .schedule(schedule)
                .bookingCode(generateBookingCode())
                .contactName(request.contactName().trim())
                .contactEmail(request.contactEmail().trim().toLowerCase())
                .contactPhone(request.contactPhone().trim())
                .startDate(schedule.getDepartureDate())
                .numberOfPeople(totalPeople)
                .adultCount(adultCount)
                .childCount(childCount)
                .infantCount(infantCount)
                .totalPeople(totalPeople)
                .unitPrice(priceAdult)
                .priceAdultSnapshot(priceAdult)
                .priceChildSnapshot(priceChild)
                .priceInfantSnapshot(priceInfant)
                .singleSupplementSnapshot(singleSupplement)
                .totalAmount(totalAmount)
                .status(BookingStatus.PENDING)
                .note(trimToNull(request.note()))
                .build();

        try {
            scheduleRepository.saveAndFlush(schedule);
            Booking savedBooking = bookingRepository.save(booking);
            return toResponse(savedBooking);
        } catch (ObjectOptimisticLockingFailureException ex) {
            throw new BusinessException(ErrorCode.CONFLICT, "Có người vừa đặt lịch này, vui lòng thử lại.");
        }
    }

    public PageResponse<BookingResponse> getMyBookings(
            Authentication authentication,
            BookingStatus status,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        User user = getCurrentUser(authentication);
        Pageable pageable = buildPageable(page, size, sortBy, sortDir);

        Page<Booking> bookingPage = status == null
                ? bookingRepository.findByUserId(user.getId(), pageable)
                : bookingRepository.findByUserIdAndStatus(user.getId(), status, pageable);

        return PageResponse.from(bookingPage, this::toResponse);
    }

    public PageResponse<BookingResponse> getAllBookingsForAdmin(
            BookingStatus status,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        Pageable pageable = buildPageable(page, size, sortBy, sortDir);

        Page<Booking> bookingPage = status == null
                ? bookingRepository.findAll(pageable)
                : bookingRepository.findByStatus(status, pageable);

        return PageResponse.from(bookingPage, this::toResponse);
    }

    @Transactional
    public BookingResponse updateBookingStatus(
            Authentication authentication,
            Long id,
            BookingStatusUpdateRequest request
    ) {
        Booking booking = bookingRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.BOOKING_NOT_FOUND,
                        "Booking not found"
                ));

        BookingStatus currentStatus = booking.getStatus();
        BookingStatus newStatus = request.status();

        if (currentStatus == newStatus) {
            return toResponse(booking);
        }

        validateStatusTransition(currentStatus, newStatus);

        if (newStatus == BookingStatus.CANCELLED) {
            releaseScheduleSeats(booking);
        }

        booking.setStatus(newStatus);

        auditLogService.log(
                authentication,
                AuditAction.BOOKING_STATUS_UPDATED,
                "BOOKING",
                booking.getId(),
                booking.getTour().getTitle(),
                currentStatus.name(),
                newStatus.name(),
                "Admin updated booking status"
        );

        return toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse cancelMyBooking(Authentication authentication, Long bookingId) {
        User currentUser = getCurrentUser(authentication);

        Booking booking = bookingRepository.findByIdForUpdate(bookingId)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.BOOKING_NOT_FOUND,
                        "Booking not found"
                ));

        if (!booking.getUser().getId().equals(currentUser.getId())) {
            throw new BusinessException(
                    ErrorCode.BOOKING_FORBIDDEN,
                    "You are not allowed to cancel this booking"
            );
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BusinessException(
                    ErrorCode.BOOKING_INVALID_STATUS,
                    "Booking đã bị hủy trước đó."
            );
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BusinessException(
                    ErrorCode.BOOKING_INVALID_STATUS,
                    "Không thể hủy booking đã hoàn thành."
            );
        }

        releaseScheduleSeats(booking);

        booking.setStatus(BookingStatus.CANCELLED);

        return toResponse(bookingRepository.save(booking));
    }

    private User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();

        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.USER_NOT_FOUND,
                        "Current user not found"
                ));
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private BookingResponse toResponse(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getId(),
                booking.getBookingCode(),

                booking.getUser().getId(),
                booking.getUser().getEmail(),

                booking.getTour().getId(),
                booking.getTour().getTitle(),
                booking.getTour().getSlug(),
                booking.getTour().getThumbnailUrl(),

                booking.getSchedule() == null ? null : booking.getSchedule().getId(),
                booking.getSchedule() == null ? booking.getStartDate() : booking.getSchedule().getDepartureDate(),
                booking.getSchedule() == null ? null : booking.getSchedule().getReturnDate(),

                booking.getContactName(),
                booking.getContactEmail(),
                booking.getContactPhone(),

                booking.getStartDate(),
                booking.getNumberOfPeople(),
                booking.getUnitPrice(),
                booking.getAdultCount(),
                booking.getChildCount(),
                booking.getInfantCount(),
                booking.getTotalPeople() == null ? booking.getNumberOfPeople() : booking.getTotalPeople(),
                booking.getPriceAdultSnapshot(),
                booking.getPriceChildSnapshot(),
                booking.getPriceInfantSnapshot(),
                booking.getSingleSupplementSnapshot(),
                booking.getTotalAmount(),
                booking.getStatus(),
                booking.getNote(),
                null,

                booking.getCreatedAt(),
                booking.getUpdatedAt()
        );
    }

    private void validateStatusTransition(BookingStatus currentStatus, BookingStatus newStatus) {
        if (currentStatus == BookingStatus.CANCELLED) {
            throw new BusinessException(
                    ErrorCode.BOOKING_INVALID_STATUS,
                    "Không cho chuyển booking đã hủy sang trạng thái khác trong phase này"
            );
        }

        if (currentStatus == BookingStatus.COMPLETED) {
            throw new BusinessException(
                    ErrorCode.BOOKING_INVALID_STATUS,
                    "Không thể cập nhật booking đã hoàn thành"
            );
        }

        if (currentStatus == BookingStatus.PENDING) {
            if (newStatus == BookingStatus.CONFIRMED || newStatus == BookingStatus.CANCELLED) {
                return;
            }
        }

        if (currentStatus == BookingStatus.CONFIRMED) {
            if (newStatus == BookingStatus.COMPLETED || newStatus == BookingStatus.CANCELLED) {
                return;
            }
        }

        throw new BusinessException(
                ErrorCode.BOOKING_INVALID_STATUS,
                "Invalid booking status transition"
        );
    }

    private void releaseScheduleSeats(Booking booking) {
        TourSchedule schedule = booking.getSchedule();
        if (schedule == null) {
            return;
        }

        int totalPeople = booking.getTotalPeople() == null ? booking.getNumberOfPeople() : booking.getTotalPeople();
        int currentBookedSeats = schedule.getBookedSeats() == null ? 0 : schedule.getBookedSeats();
        schedule.setBookedSeats(Math.max(currentBookedSeats - totalPeople, 0));
        if (schedule.getStatus() == TourScheduleStatus.FULL && schedule.getBookedSeats() < schedule.getMaxSeats()) {
            schedule.setStatus(TourScheduleStatus.OPEN);
        }
        scheduleRepository.save(schedule);
    }

    private void validateScheduleForBooking(TourSchedule schedule) {
        if (schedule.getStatus() == TourScheduleStatus.CLOSED || schedule.getStatus() == TourScheduleStatus.CANCELLED) {
            throw new BusinessException(ErrorCode.BOOKING_INVALID_STATUS, "Lịch khởi hành đã đóng.");
        }
        int currentBookedSeats = schedule.getBookedSeats() == null ? 0 : schedule.getBookedSeats();
        if (schedule.getStatus() == TourScheduleStatus.FULL || currentBookedSeats >= schedule.getMaxSeats()) {
            throw new BusinessException(ErrorCode.BOOKING_NOT_ENOUGH_SEATS, "Lịch khởi hành đã hết chỗ.");
        }
        if (schedule.getDepartureDate().isBefore(LocalDate.now())) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Lịch khởi hành đã đóng.");
        }
    }

    private BigDecimal defaultMoney(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String generateBookingCode() {
        String prefix = "VV" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        Random random = new Random();
        for (int i = 0; i < 10; i++) {
            String code = prefix + String.format("%06d", random.nextInt(1_000_000));
            if (!bookingRepository.existsByBookingCode(code)) {
                return code;
            }
        }
        return prefix + System.nanoTime();
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
                "status",
                "totalAmount",
                "totalPeople",
                "numberOfPeople",
                "startDate",
                "bookingCode"
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
}
