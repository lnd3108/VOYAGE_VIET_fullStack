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
import com.voyageviet.backend.tour.entity.TourStatus;
import com.voyageviet.backend.tour.repository.TourRepository;
import com.voyageviet.backend.user.entity.User;
import com.voyageviet.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import com.voyageviet.backend.common.paging.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;


import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookingService {

    private final BookingRepository bookingRepository;
    private final TourRepository tourRepository;
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

        Tour tour = tourRepository.findWithLockById(request.tourId())
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.TOUR_NOT_FOUND,
                        "Tour not found"
                ));

        if (tour.getStatus() != TourStatus.PUBLISHED) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Only published tours can be booked"
            );
        }

        if (tour.getAvailableSeats() < request.numberOfPeople()) {
            throw new BusinessException(
                    ErrorCode.BOOKING_NOT_ENOUGH_SEATS,
                    "Not enough seats available"
            );
        }

        BigDecimal unitPrice = tour.getSalePrice() != null
                ? tour.getSalePrice()
                : tour.getOriginalPrice();

        BigDecimal totalAmount = unitPrice.multiply(BigDecimal.valueOf(request.numberOfPeople()));

        tour.setAvailableSeats(tour.getAvailableSeats() - request.numberOfPeople());

        Booking booking = Booking.builder()
                .user(user)
                .tour(tour)
                .contactName(request.contactName().trim())
                .contactEmail(request.contactEmail().trim().toLowerCase())
                .contactPhone(request.contactPhone().trim())
                .startDate(request.startDate())
                .numberOfPeople(request.numberOfPeople())
                .unitPrice(unitPrice)
                .totalAmount(totalAmount)
                .status(BookingStatus.PENDING)
                .note(trimToNull(request.note()))
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        return toResponse(savedBooking);
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
            restoreSeats(booking);
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
                    "Booking has already been cancelled"
            );
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BusinessException(
                    ErrorCode.BOOKING_INVALID_STATUS,
                    "Completed booking cannot be cancelled"
            );
        }

        restoreSeats(booking);

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

                booking.getUser().getId(),
                booking.getUser().getEmail(),

                booking.getTour().getId(),
                booking.getTour().getTitle(),
                booking.getTour().getSlug(),

                booking.getContactName(),
                booking.getContactEmail(),
                booking.getContactPhone(),

                booking.getStartDate(),
                booking.getNumberOfPeople(),
                booking.getUnitPrice(),
                booking.getTotalAmount(),
                booking.getStatus(),
                booking.getNote(),

                booking.getCreatedAt(),
                booking.getUpdatedAt()
        );
    }

    private void validateStatusTransition(BookingStatus currentStatus, BookingStatus newStatus) {
        if (currentStatus == BookingStatus.CANCELLED) {
            throw new BusinessException(
                    ErrorCode.BOOKING_INVALID_STATUS,
                    "Cancelled booking cannot be changed"
            );
        }

        if (currentStatus == BookingStatus.COMPLETED) {
            throw new BusinessException(
                    ErrorCode.BOOKING_INVALID_STATUS,
                    "Completed booking cannot be changed"
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

    private void restoreSeats(Booking booking) {
        Tour tour = booking.getTour();

        tour.setAvailableSeats(
                tour.getAvailableSeats() + booking.getNumberOfPeople()
        );
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
                "numberOfPeople",
                "startDate"
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