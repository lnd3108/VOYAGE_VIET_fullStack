package com.voyageviet.backend.destination.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voyageviet.backend.common.exception.BusinessException;
import com.voyageviet.backend.common.exception.ErrorCode;
import com.voyageviet.backend.common.util.SlugUtils;
import com.voyageviet.backend.destination.dto.request.*;
import com.voyageviet.backend.destination.dto.response.DestinationBatchActionItemResponse;
import com.voyageviet.backend.destination.dto.response.DestinationBatchActionResponse;
import com.voyageviet.backend.destination.dto.response.DestinationNewData;
import com.voyageviet.backend.destination.dto.response.DestinationResponse;
import com.voyageviet.backend.destination.entity.Destination;
import com.voyageviet.backend.destination.entity.DestinationStatus;
import com.voyageviet.backend.destination.repository.DestinationRepository;
import com.voyageviet.backend.media.dto.ImageUrlUpdateRequest;
import com.voyageviet.backend.tour.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DestinationService {

    private static final Integer DISPLAY_VISIBLE = 1;
    private static final Integer DISPLAY_HIDDEN = 0;

    private final DestinationRepository destinationRepository;
    private final TourRepository tourRepository;
    private final ObjectMapper objectMapper;

    public List<DestinationResponse> getActiveDestinations() {
        return destinationRepository.findByStatusAndIsDisplayOrderByNameAsc(
                        DestinationStatus.APPROVED,
                        DISPLAY_VISIBLE
                )
                .stream()
                .map(destination -> toResponse(destination, false))
                .toList();
    }

    public List<DestinationResponse> getAllDestinationsForAdmin() {
        return destinationRepository.findAll(Sort.by(Sort.Direction.ASC, "region", "name", "id"))
                .stream()
                .map(destination -> toResponse(destination, true))
                .toList();
    }

    @Transactional
    public DestinationResponse createDestination(DestinationCreateRequest request) {
        String slug = buildSlug(request.name(), request.slug());

        if (destinationRepository.existsBySlug(slug)) {
            throw new BusinessException(
                    ErrorCode.DESTINATION_ALREADY_EXISTS,
                    "Destination slug already exists"
            );
        }

        Destination destination = Destination.builder()
                .name(request.name().trim())
                .slug(slug)
                .region(trimToNull(request.region()))
                .country(trimToNull(request.country()))
                .description(trimToNull(request.description()))
                .imageUrl(trimToNull(request.imageUrl()))
                .latitude(request.latitude())
                .longitude(request.longitude())
                .status(DestinationStatus.DRAFT)
                .isDisplay(DISPLAY_HIDDEN)
                .build();
        destination.clearNewData();

        return toResponse(destinationRepository.save(destination), true);
    }

    @Transactional
    public DestinationResponse updateDestination(Long id, DestinationUpdateRequest request) {
        return patchDestination(id, new DestinationPatchRequest(
                request.name(),
                request.slug(),
                request.region(),
                request.country(),
                request.description(),
                request.imageUrl(),
                request.latitude(),
                request.longitude(),
                request.status(),
                null
        ));
    }

    @Transactional
    public DestinationResponse updateDestinationStatus(Long id, DestinationStatusUpdateRequest request) {
        Destination destination = findDestinationById(id);
        destination.setStatus(request.status());

        return toResponse(destinationRepository.save(destination), true);
    }

    @Transactional
    public DestinationResponse patchDestination(Long id, DestinationPatchRequest request) {
        Destination destination = findDestinationById(id);

        DestinationNewData currentData = toComparableData(destination);
        DestinationNewData nextData = buildNewData(destination, request);

        if (Objects.equals(currentData, nextData)) {
            throw new BusinessException(
                    ErrorCode.NO_DATA_CHANGED,
                    "No destination data changed"
            );
        }

        validateUniqueSlugChange(currentData.slug(), nextData.slug(), id);

        destination.replaceNewData(writeNewData(nextData));
        destination.markAsPending();

        return toResponse(destinationRepository.save(destination), true);
    }

    @Transactional
    public DestinationResponse submitDestination(Long id) {
        Destination destination = findDestinationById(id);

        if (!EnumSet.of(DestinationStatus.DRAFT, DestinationStatus.REJECTED, DestinationStatus.CANCEL_APPROVE)
                .contains(destination.getStatus())) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Only DRAFT, REJECTED or CANCEL_APPROVE destinations can be submitted"
            );
        }

        destination.markAsPending();

        return toResponse(destinationRepository.save(destination), true);
    }

    @Transactional
    public DestinationResponse approveDestination(Long id) {
        Destination destination = findDestinationById(id);
        requirePending(destination, "Only PENDING destinations can be approved");

        if (destination.hasNewData()) {
            DestinationNewData newData = readNewData(destination.getNewData());
            validateUniqueSlugChange(destination.getSlug(), newData.slug(), id);
            applyNewData(destination, newData);
            destination.clearNewData();
        }

        destination.markAsApproved();

        return toResponse(destinationRepository.save(destination), true);
    }

    @Transactional
    public DestinationResponse rejectDestination(Long id, String reason) {
        Destination destination = findDestinationById(id);
        requirePending(destination, "Only PENDING destinations can be rejected");

        destination.markAsRejected(trimToNull(reason));

        return toResponse(destinationRepository.save(destination), true);
    }

    @Transactional
    public DestinationResponse cancelApproveDestination(Long id) {
        Destination destination = findDestinationById(id);
        requirePending(destination, "Only PENDING destinations can be cancel-approved");

        destination.clearNewData();
        destination.markAsCancelApproved();

        return toResponse(destinationRepository.save(destination), true);
    }

    @Transactional
    public DestinationResponse updateDestinationDisplay(Long id, DestinationDisplayUpdateRequest request) {
        Destination destination = findDestinationById(id);

        if (!destination.isPublished()) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Only APPROVED destinations can be shown publicly"
            );
        }

        if (Objects.equals(request.isDisplay(), DISPLAY_VISIBLE)) {
            destination.show();
        } else {
            destination.hide();
        }

        return toResponse(destinationRepository.save(destination), true);
    }

    @Transactional
    public DestinationBatchActionResponse submitDestinations(DestinationBatchRequest request) {
        return runBatchAction(request.ids(), this::submitDestination);
    }

    @Transactional
    public DestinationBatchActionResponse approveDestinations(DestinationBatchRequest request) {
        return runBatchAction(request.ids(), this::approveDestination);
    }

    @Transactional
    public DestinationBatchActionResponse rejectDestinations(DestinationBatchRejectRequest request) {
        return runBatchAction(request.ids(), id -> rejectDestination(id, request.reason()));
    }

    @Transactional
    public DestinationBatchActionResponse cancelApproveDestinations(DestinationBatchRequest request) {
        return runBatchAction(request.ids(), this::cancelApproveDestination);
    }

    @Transactional
    public DestinationBatchActionResponse updateDestinationsDisplay(DestinationBatchDisplayRequest request) {
        DestinationDisplayUpdateRequest displayRequest = new DestinationDisplayUpdateRequest(request.isDisplay());
        return runBatchAction(request.ids(), id -> updateDestinationDisplay(id, displayRequest));
    }

    @Transactional
    public void deleteDestination(Long id) {
        Destination destination = findDestinationById(id);

        if (tourRepository.existsByDestinationId(id)) {
            throw new BusinessException(
                    ErrorCode.DESTINATION_IN_USE,
                    "Cannot delete destination because it is being used by tours"
            );
        }

        destinationRepository.delete(destination);
    }

    @Transactional
    public DestinationResponse updateDestinationImage(Long id, ImageUrlUpdateRequest request) {
        Destination destination = findDestinationById(id);
        DestinationPatchRequest patchRequest = new DestinationPatchRequest(
                destination.getName(),
                destination.getSlug(),
                destination.getRegion(),
                destination.getCountry(),
                destination.getDescription(),
                request.imageUrl().trim(),
                destination.getLatitude(),
                destination.getLongitude(),
                destination.getStatus(),
                destination.getIsDisplay()
        );

        return patchDestination(id, patchRequest);
    }

    private Destination findDestinationById(Long id) {
        return destinationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.DESTINATION_NOT_FOUND,
                        "Destination not found"
                ));
    }

    private DestinationBatchActionResponse runBatchAction(
            List<Long> rawIds,
            Function<Long, DestinationResponse> action
    ) {
        List<Long> ids = normalizeBatchIds(rawIds);
        List<DestinationBatchActionItemResponse> successItems = new ArrayList<>();
        List<DestinationBatchActionItemResponse> failedItems = new ArrayList<>();

        for (Long id : ids) {
            try {
                DestinationResponse response = action.apply(id);
                successItems.add(new DestinationBatchActionItemResponse(
                        response.id(),
                        response.name(),
                        true,
                        "Success"
                ));
            } catch (BusinessException exception) {
                failedItems.add(buildFailedBatchItem(id, exception.getMessage()));
            } catch (Exception exception) {
                failedItems.add(buildFailedBatchItem(id, "Cannot process destination"));
            }
        }

        return new DestinationBatchActionResponse(
                ids.size(),
                successItems.size(),
                failedItems.size(),
                successItems,
                failedItems
        );
    }

    private List<Long> normalizeBatchIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Destination ids must not be empty"
            );
        }

        List<Long> normalizedIds = new ArrayList<>(new LinkedHashSet<>(ids));

        if (normalizedIds.isEmpty()) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Destination ids must not be empty"
            );
        }

        return normalizedIds;
    }

    private DestinationBatchActionItemResponse buildFailedBatchItem(Long id, String message) {
        return new DestinationBatchActionItemResponse(
                id,
                id == null ? null : destinationRepository.findById(id).map(Destination::getName).orElse(null),
                false,
                message
        );
    }

    private void requirePending(Destination destination, String message) {
        if (!destination.isPending()) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, message);
        }
    }

    private void validateUniqueSlugChange(String currentSlug, String nextSlug, Long id) {
        if (!Objects.equals(currentSlug, nextSlug)
                && destinationRepository.existsBySlugAndIdNot(nextSlug, id)) {
            throw new BusinessException(
                    ErrorCode.DESTINATION_ALREADY_EXISTS,
                    "Destination slug already exists"
            );
        }
    }

    private void applyNewData(Destination destination, DestinationNewData newData) {
        destination.setName(newData.name());
        destination.setSlug(newData.slug());
        destination.setRegion(trimToNull(newData.region()));
        destination.setCountry(trimToNull(newData.country()));
        destination.setDescription(trimToNull(newData.description()));
        destination.setImageUrl(trimToNull(newData.imageUrl()));
        destination.setLatitude(newData.latitude());
        destination.setLongitude(newData.longitude());
        destination.setIsDisplay(newData.isDisplay() == null
                ? normalizeDisplayFlag(destination.getIsDisplay())
                : normalizeDisplayFlag(newData.isDisplay()));
    }

    private String buildSlug(String name, String customSlug) {
        String rawSlug = customSlug == null || customSlug.isBlank()
                ? name
                : customSlug;

        return SlugUtils.toSlug(rawSlug);
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private DestinationResponse toResponse(Destination destination, boolean includeAdminFields) {
        return new DestinationResponse(
                destination.getId(),
                destination.getName(),
                destination.getSlug(),
                destination.getRegion(),
                destination.getCountry(),
                destination.getDescription(),
                destination.getImageUrl(),
                destination.getLatitude(),
                destination.getLongitude(),
                destination.getStatus(),
                normalizeDisplayFlag(destination.getIsDisplay()),
                includeAdminFields ? destination.getNewData() : null,
                includeAdminFields ? destination.getRejectReason() : null,
                destination.getCreatedAt(),
                destination.getUpdatedAt()
        );
    }

    private DestinationNewData toComparableData(Destination destination) {
        return new DestinationNewData(
                normalizeRequiredText(destination.getName()),
                buildSlug(destination.getName(), destination.getSlug()),
                trimToNull(destination.getRegion()),
                trimToNull(destination.getCountry()),
                trimToNull(destination.getDescription()),
                trimToNull(destination.getImageUrl()),
                destination.getLatitude(),
                destination.getLongitude(),
                destination.getStatus(),
                normalizeDisplayFlag(destination.getIsDisplay())
        );
    }

    private DestinationNewData buildNewData(Destination destination, DestinationPatchRequest request) {
        String name = normalizeRequiredText(request.name());
        String slug = buildSlug(name, request.slug());

        return new DestinationNewData(
                name,
                slug,
                trimToNull(request.region()),
                trimToNull(request.country()),
                trimToNull(request.description()),
                trimToNull(request.imageUrl()),
                request.latitude(),
                request.longitude(),
                request.status() == null ? destination.getStatus() : request.status(),
                request.isDisplay() == null
                        ? normalizeDisplayFlag(destination.getIsDisplay())
                        : normalizeDisplayFlag(request.isDisplay())
        );
    }

    private String writeNewData(DestinationNewData newData) {
        try {
            return objectMapper.writeValueAsString(newData);
        } catch (JsonProcessingException exception) {
            throw new BusinessException(
                    ErrorCode.INTERNAL_ERROR,
                    "Cannot serialize destination pending data"
            );
        }
    }

    private DestinationNewData readNewData(String newData) {
        try {
            JsonNode root = objectMapper.readTree(newData);
            return new DestinationNewData(
                    textValue(root, "name"),
                    textValue(root, "slug"),
                    textValue(root, "region"),
                    textValue(root, "country"),
                    textValue(root, "description"),
                    textValue(root, "imageUrl"),
                    decimalValue(root, "latitude"),
                    decimalValue(root, "longitude"),
                    parseWorkflowStatus(textValue(root, "status")),
                    intValue(root, "isDisplay")
            );
        } catch (IOException exception) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Destination pending data is invalid"
            );
        }
    }

    private DestinationStatus parseWorkflowStatus(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        if ("ACTIVE".equals(value) || "INACTIVE".equals(value)) {
            return DestinationStatus.APPROVED;
        }

        try {
            return DestinationStatus.valueOf(value);
        } catch (IllegalArgumentException exception) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Destination pending status is invalid"
            );
        }
    }

    private String textValue(JsonNode root, String fieldName) {
        JsonNode field = root.get(fieldName);
        if (field == null || field.isNull()) {
            return null;
        }

        return field.asText();
    }

    private Integer intValue(JsonNode root, String fieldName) {
        JsonNode field = root.get(fieldName);
        if (field == null || field.isNull()) {
            return null;
        }

        return field.asInt();
    }

    private BigDecimal decimalValue(JsonNode root, String fieldName) {
        JsonNode field = root.get(fieldName);
        if (field == null || field.isNull()) {
            return null;
        }

        return field.decimalValue();
    }

    private String normalizeRequiredText(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }

        return value.trim();
    }

    private Integer normalizeDisplayFlag(Integer value) {
        return Objects.equals(value, DISPLAY_VISIBLE) ? DISPLAY_VISIBLE : DISPLAY_HIDDEN;
    }
}
