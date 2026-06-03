package com.voyageviet.backend.promotion.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voyageviet.backend.booking.entity.Booking;
import com.voyageviet.backend.common.exception.BusinessException;
import com.voyageviet.backend.common.exception.ErrorCode;
import com.voyageviet.backend.common.paging.PageResponse;
import com.voyageviet.backend.promotion.dto.*;
import com.voyageviet.backend.promotion.entity.Promotion;
import com.voyageviet.backend.promotion.entity.PromotionDiscountType;
import com.voyageviet.backend.promotion.entity.PromotionStatus;
import com.voyageviet.backend.promotion.entity.PromotionUsage;
import com.voyageviet.backend.promotion.repository.PromotionRepository;
import com.voyageviet.backend.promotion.repository.PromotionUsageRepository;
import com.voyageviet.backend.user.entity.User;
import com.voyageviet.backend.user.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PromotionService {

    private static final TypeReference<List<Long>> LONG_LIST_TYPE = new TypeReference<>() {
    };

    private final PromotionRepository promotionRepository;
    private final PromotionUsageRepository usageRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public ValidatePromoResponse validatePromo(Authentication authentication, ValidatePromoRequest request) {
        User user = getCurrentUser(authentication);
        return validatePromoForUser(request.code(), request.bookingTotal(), request.tourId(), user.getId());
    }

    public ValidatePromoResponse validatePromoForUser(
            String code,
            BigDecimal bookingTotal,
            Long tourId,
            Long userId
    ) {
        try {
            ApplyPromotionResult result = applyPromotionForBooking(code, bookingTotal, tourId, userId);
            return new ValidatePromoResponse(
                    true,
                    result.code(),
                    result.discountAmount(),
                    result.finalAmount(),
                    "Áp dụng mã giảm giá thành công"
            );
        } catch (BusinessException ex) {
            return new ValidatePromoResponse(
                    false,
                    normalizeCode(code),
                    BigDecimal.ZERO,
                    bookingTotal,
                    ex.getMessage()
            );
        }
    }

    public ApplyPromotionResult applyPromotionForBooking(
            String code,
            BigDecimal bookingTotal,
            Long tourId,
            Long userId
    ) {
        String normalizedCode = normalizeCode(code);
        if (!hasText(normalizedCode)) {
            throw new BusinessException(ErrorCode.PROMOTION_INVALID, "Mã giảm giá không tồn tại.");
        }
        if (bookingTotal == null || bookingTotal.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(ErrorCode.PROMOTION_INVALID, "Giá trị giảm giá không hợp lệ.");
        }

        Promotion promotion = promotionRepository.findByCode(normalizedCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROMOTION_NOT_FOUND, "Mã giảm giá không tồn tại."));

        validatePromotionUsable(promotion, bookingTotal, tourId, userId);

        BigDecimal discountAmount = calculateDiscount(promotion, bookingTotal);
        BigDecimal finalAmount = bookingTotal.subtract(discountAmount).max(BigDecimal.ZERO);

        return new ApplyPromotionResult(
                promotion,
                normalizedCode,
                discountAmount,
                finalAmount
        );
    }

    @Transactional
    public void recordPromotionUsage(
            Promotion promotion,
            User user,
            Booking booking,
            BigDecimal discountAmount
    ) {
        if (promotion == null) {
            return;
        }
        if (usageRepository.existsByPromotionIdAndBookingId(promotion.getId(), booking.getId())) {
            return;
        }
        int usedCount = promotion.getUsedCount() == null ? 0 : promotion.getUsedCount();
        if (promotion.getMaxUses() != null && usedCount >= promotion.getMaxUses()) {
            throw new BusinessException(ErrorCode.PROMOTION_INVALID, "Mã giảm giá đã hết lượt sử dụng.");
        }

        PromotionUsage usage = PromotionUsage.builder()
                .promotion(promotion)
                .user(user)
                .booking(booking)
                .discountAmount(discountAmount == null ? BigDecimal.ZERO : discountAmount)
                .usedAt(LocalDateTime.now())
                .build();

        promotion.setUsedCount(usedCount + 1);
        usageRepository.save(usage);
        promotionRepository.save(promotion);
    }

    public PageResponse<PromotionResponse> getPromotions(
            PromotionStatus status,
            String code,
            LocalDate dateFrom,
            LocalDate dateTo,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        Pageable pageable = buildPageable(page, size, sortBy, sortDir);
        Specification<Promotion> spec = buildSpecification(status, code, dateFrom, dateTo);
        Page<Promotion> promotionPage = promotionRepository.findAll(spec, pageable);
        return PageResponse.from(promotionPage, this::toResponse);
    }

    @Transactional
    public PromotionResponse createPromotion(Authentication authentication, AdminPromotionCreateRequest request) {
        String code = normalizeCode(request.code());
        if (promotionRepository.existsByCode(code)) {
            throw new BusinessException(ErrorCode.PROMOTION_ALREADY_EXISTS, "Promotion code already exists");
        }

        validatePromotionConfig(
                request.discountType(),
                request.discountValue(),
                request.maxDiscount(),
                request.minOrder(),
                request.validFrom(),
                request.validUntil()
        );

        Promotion promotion = Promotion.builder()
                .code(code)
                .name(request.name().trim())
                .description(trimToNull(request.description()))
                .discountType(request.discountType())
                .discountValue(request.discountValue())
                .maxDiscount(request.maxDiscount())
                .minOrder(defaultMoney(request.minOrder()))
                .maxUses(request.maxUses())
                .usedCount(0)
                .maxUsesPerUser(request.maxUsesPerUser() == null ? 1 : request.maxUsesPerUser())
                .validFrom(request.validFrom())
                .validUntil(request.validUntil())
                .status(request.status() == null ? PromotionStatus.ACTIVE : request.status())
                .applicableTourIds(toJsonTourIds(request.applicableTourIds()))
                .createdBy(getCurrentUser(authentication))
                .build();

        return toResponse(promotionRepository.save(promotion));
    }

    @Transactional
    public PromotionResponse updatePromotion(Long id, AdminPromotionUpdateRequest request) {
        Promotion promotion = getPromotion(id);
        validatePromotionConfig(
                request.discountType(),
                request.discountValue(),
                request.maxDiscount(),
                request.minOrder(),
                request.validFrom(),
                request.validUntil()
        );

        if (isUsed(promotion)) {
            validateImmutablePricingFields(promotion, request);
        }

        promotion.setName(request.name().trim());
        promotion.setDescription(trimToNull(request.description()));
        promotion.setMaxUses(request.maxUses());
        promotion.setMaxUsesPerUser(request.maxUsesPerUser() == null ? 1 : request.maxUsesPerUser());
        promotion.setStatus(request.status() == null ? promotion.getStatus() : request.status());

        if (!isUsed(promotion)) {
            promotion.setDiscountType(request.discountType());
            promotion.setDiscountValue(request.discountValue());
            promotion.setMaxDiscount(request.maxDiscount());
            promotion.setMinOrder(defaultMoney(request.minOrder()));
            promotion.setValidFrom(request.validFrom());
            promotion.setValidUntil(request.validUntil());
            promotion.setApplicableTourIds(toJsonTourIds(request.applicableTourIds()));
        }

        return toResponse(promotionRepository.save(promotion));
    }

    @Transactional
    public PromotionResponse updateStatus(Long id, PromotionStatusRequest request) {
        Promotion promotion = getPromotion(id);
        if (request.status() == PromotionStatus.EXPIRED) {
            throw new BusinessException(ErrorCode.PROMOTION_INVALID, "Admin chỉ được bật hoặc tắt mã giảm giá.");
        }
        if (request.status() == PromotionStatus.ACTIVE && promotion.getValidUntil().isBefore(LocalDateTime.now())) {
            throw new BusinessException(ErrorCode.PROMOTION_INVALID, "Không thể kích hoạt mã giảm giá đã hết hạn.");
        }
        promotion.setStatus(request.status());
        return toResponse(promotionRepository.save(promotion));
    }

    @Transactional
    public void deletePromotion(Long id) {
        Promotion promotion = getPromotion(id);
        if (isUsed(promotion)) {
            throw new BusinessException(ErrorCode.PROMOTION_IN_USE, "Không thể xóa mã giảm giá đã được sử dụng.");
        }
        promotionRepository.delete(promotion);
    }

    private void validatePromotionUsable(Promotion promotion, BigDecimal bookingTotal, Long tourId, Long userId) {
        LocalDateTime now = LocalDateTime.now();

        if (promotion.getStatus() == PromotionStatus.INACTIVE) {
            throw new BusinessException(ErrorCode.PROMOTION_INVALID, "Mã giảm giá chưa được kích hoạt.");
        }
        if (promotion.getStatus() == PromotionStatus.EXPIRED) {
            throw new BusinessException(ErrorCode.PROMOTION_INVALID, "Mã giảm giá đã hết hạn.");
        }
        if (now.isBefore(promotion.getValidFrom())) {
            throw new BusinessException(ErrorCode.PROMOTION_INVALID, "Mã giảm giá chưa đến thời gian sử dụng.");
        }
        if (now.isAfter(promotion.getValidUntil())) {
            promotion.setStatus(PromotionStatus.EXPIRED);
            promotionRepository.save(promotion);
            throw new BusinessException(ErrorCode.PROMOTION_INVALID, "Mã giảm giá đã hết hạn.");
        }
        if (bookingTotal.compareTo(defaultMoney(promotion.getMinOrder())) < 0) {
            throw new BusinessException(ErrorCode.PROMOTION_INVALID, "Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã.");
        }
        if (promotion.getMaxUses() != null
                && (promotion.getUsedCount() == null ? 0 : promotion.getUsedCount()) >= promotion.getMaxUses()) {
            throw new BusinessException(ErrorCode.PROMOTION_INVALID, "Mã giảm giá đã hết lượt sử dụng.");
        }
        long usedByUser = usageRepository.countByPromotionIdAndUserId(promotion.getId(), userId);
        int maxUsesPerUser = promotion.getMaxUsesPerUser() == null ? 1 : promotion.getMaxUsesPerUser();
        if (usedByUser >= maxUsesPerUser) {
            throw new BusinessException(ErrorCode.PROMOTION_INVALID, "Bạn đã sử dụng mã giảm giá này quá số lần cho phép.");
        }
        if (!isApplicableToTour(promotion, tourId)) {
            throw new BusinessException(ErrorCode.PROMOTION_INVALID, "Mã giảm giá không áp dụng cho tour này.");
        }
    }

    private BigDecimal calculateDiscount(Promotion promotion, BigDecimal bookingTotal) {
        BigDecimal discountAmount;
        if (promotion.getDiscountType() == PromotionDiscountType.FIXED) {
            discountAmount = promotion.getDiscountValue().min(bookingTotal);
        } else {
            discountAmount = bookingTotal
                    .multiply(promotion.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }
        if (promotion.getMaxDiscount() != null) {
            discountAmount = discountAmount.min(promotion.getMaxDiscount());
        }
        if (discountAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException(ErrorCode.PROMOTION_INVALID, "Giá trị giảm giá không hợp lệ.");
        }
        return discountAmount.min(bookingTotal);
    }

    private void validatePromotionConfig(
            PromotionDiscountType discountType,
            BigDecimal discountValue,
            BigDecimal maxDiscount,
            BigDecimal minOrder,
            LocalDateTime validFrom,
            LocalDateTime validUntil
    ) {
        if (discountType == null || discountValue == null || discountValue.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(ErrorCode.PROMOTION_INVALID, "Giá trị giảm giá không hợp lệ.");
        }
        if (discountType == PromotionDiscountType.PERCENT
                && discountValue.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new BusinessException(ErrorCode.PROMOTION_INVALID, "Giá trị giảm giá không hợp lệ.");
        }
        if (maxDiscount != null && maxDiscount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(ErrorCode.PROMOTION_INVALID, "Giá trị giảm giá không hợp lệ.");
        }
        if (minOrder != null && minOrder.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException(ErrorCode.PROMOTION_INVALID, "Giá trị giảm giá không hợp lệ.");
        }
        if (validFrom == null || validUntil == null || !validUntil.isAfter(validFrom)) {
            throw new BusinessException(ErrorCode.PROMOTION_INVALID, "validUntil must be after validFrom");
        }
    }

    private void validateImmutablePricingFields(Promotion promotion, AdminPromotionUpdateRequest request) {
        String requestTourIds = toJsonTourIds(request.applicableTourIds());
        boolean changed = promotion.getDiscountType() != request.discountType()
                || compareMoney(promotion.getDiscountValue(), request.discountValue()) != 0
                || compareMoney(promotion.getMaxDiscount(), request.maxDiscount()) != 0
                || compareMoney(defaultMoney(promotion.getMinOrder()), defaultMoney(request.minOrder())) != 0
                || !Objects.equals(promotion.getValidFrom(), request.validFrom())
                || !Objects.equals(promotion.getValidUntil(), request.validUntil())
                || !Objects.equals(nullIfBlank(promotion.getApplicableTourIds()), nullIfBlank(requestTourIds));

        if (changed) {
            throw new BusinessException(
                    ErrorCode.PROMOTION_IN_USE,
                    "Mã giảm giá đã được sử dụng, không thể chỉnh sửa cấu hình giảm giá."
            );
        }
    }

    private Specification<Promotion> buildSpecification(
            PromotionStatus status,
            String code,
            LocalDate dateFrom,
            LocalDate dateTo
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }
            if (hasText(code)) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("code")),
                        "%" + code.trim().toLowerCase() + "%"
                ));
            }
            if (dateFrom != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), dateFrom.atStartOfDay()));
            }
            if (dateTo != null) {
                predicates.add(criteriaBuilder.lessThan(root.get("createdAt"), dateTo.plusDays(1).atStartOfDay()));
            }
            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private Pageable buildPageable(int page, int size, String sortBy, String sortDir) {
        if (page < 0) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Page index must be greater than or equal to 0");
        }
        if (size < 1 || size > 50) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Page size must be between 1 and 50");
        }
        String safeSortBy = resolveSortBy(sortBy);
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.ASC
                : "desc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.DESC
                : null;
        if (direction == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Sort direction must be either asc or desc");
        }
        return PageRequest.of(page, size, Sort.by(direction, safeSortBy));
    }

    private String resolveSortBy(String sortBy) {
        Set<String> allowedSortFields = Set.of(
                "createdAt",
                "updatedAt",
                "id",
                "code",
                "status",
                "validFrom",
                "validUntil",
                "usedCount"
        );
        if (!hasText(sortBy)) {
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

    private Promotion getPromotion(Long id) {
        return promotionRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROMOTION_NOT_FOUND, "Promotion not found"));
    }

    private boolean isUsed(Promotion promotion) {
        return (promotion.getUsedCount() != null && promotion.getUsedCount() > 0)
                || usageRepository.existsByPromotionId(promotion.getId());
    }

    private boolean isApplicableToTour(Promotion promotion, Long tourId) {
        List<Long> tourIds = parseTourIds(promotion.getApplicableTourIds());
        return tourIds.isEmpty() || tourIds.contains(tourId);
    }

    private String toJsonTourIds(List<Long> tourIds) {
        if (tourIds == null || tourIds.isEmpty()) {
            return null;
        }
        List<Long> normalizedIds = tourIds.stream()
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        if (normalizedIds.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(normalizedIds);
        } catch (JsonProcessingException ex) {
            throw new BusinessException(ErrorCode.PROMOTION_INVALID, "Applicable tour IDs are invalid");
        }
    }

    private List<Long> parseTourIds(String rawJson) {
        if (!hasText(rawJson)) {
            return List.of();
        }
        try {
            return objectMapper.readValue(rawJson, LONG_LIST_TYPE);
        } catch (Exception ex) {
            return List.of();
        }
    }

    private PromotionResponse toResponse(Promotion promotion) {
        return new PromotionResponse(
                promotion.getId(),
                promotion.getCode(),
                promotion.getName(),
                promotion.getDescription(),
                promotion.getDiscountType(),
                promotion.getDiscountValue(),
                promotion.getMaxDiscount(),
                promotion.getMinOrder(),
                promotion.getMaxUses(),
                promotion.getUsedCount(),
                promotion.getMaxUsesPerUser(),
                promotion.getValidFrom(),
                promotion.getValidUntil(),
                promotion.getStatus(),
                parseTourIds(promotion.getApplicableTourIds()),
                promotion.getCreatedAt(),
                promotion.getUpdatedAt()
        );
    }

    private User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "Current user not found"));
    }

    private String normalizeCode(String code) {
        return code == null ? null : code.trim().toUpperCase(Locale.ROOT);
    }

    private BigDecimal defaultMoney(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private int compareMoney(BigDecimal left, BigDecimal right) {
        if (left == null && right == null) {
            return 0;
        }
        if (left == null || right == null) {
            return -1;
        }
        return left.compareTo(right);
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private String nullIfBlank(String value) {
        return hasText(value) ? value : null;
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    public record ApplyPromotionResult(
            Promotion promotion,
            String code,
            BigDecimal discountAmount,
            BigDecimal finalAmount
    ) {
    }
}
