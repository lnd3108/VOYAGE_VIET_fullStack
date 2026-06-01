package com.voyageviet.backend.destination.service;

import com.voyageviet.backend.common.exception.BusinessException;
import com.voyageviet.backend.common.exception.ErrorCode;
import com.voyageviet.backend.common.util.SlugUtils;
import com.voyageviet.backend.destination.dto.DestinationCreateRequest;
import com.voyageviet.backend.destination.dto.DestinationResponse;
import com.voyageviet.backend.destination.dto.DestinationStatusUpdateRequest;
import com.voyageviet.backend.destination.dto.DestinationUpdateRequest;
import com.voyageviet.backend.destination.entity.Destination;
import com.voyageviet.backend.destination.entity.DestinationStatus;
import com.voyageviet.backend.destination.repository.DestinationRepository;
import com.voyageviet.backend.media.dto.ImageUrlUpdateRequest;
import com.voyageviet.backend.tour.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DestinationService {

    private final DestinationRepository destinationRepository;
    private final TourRepository tourRepository;

    public List<DestinationResponse> getActiveDestinations() {
        return destinationRepository.findByStatusOrderByNameAsc(DestinationStatus.ACTIVE)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<DestinationResponse> getAllDestinationsForAdmin() {
        return destinationRepository.findAll(Sort.by(Sort.Direction.ASC, "name", "id"))
                .stream()
                .map(this::toResponse)
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
                .status(DestinationStatus.ACTIVE)
                .build();

        return toResponse(destinationRepository.save(destination));
    }

    @Transactional
    public DestinationResponse updateDestination(Long id, DestinationUpdateRequest request) {
        Destination destination = findDestinationById(id);

        String slug = buildSlug(request.name(), request.slug());

        if (destinationRepository.existsBySlugAndIdNot(slug, id)) {
            throw new BusinessException(
                    ErrorCode.DESTINATION_ALREADY_EXISTS,
                    "Destination slug already exists"
            );
        }

        destination.setName(request.name().trim());
        destination.setSlug(slug);
        destination.setRegion(trimToNull(request.region()));
        destination.setCountry(trimToNull(request.country()));
        destination.setDescription(trimToNull(request.description()));
        destination.setImageUrl(trimToNull(request.imageUrl()));
        destination.setLatitude(request.latitude());
        destination.setLongitude(request.longitude());
        destination.setStatus(request.status() == null ? destination.getStatus() : request.status());

        return toResponse(destinationRepository.save(destination));
    }

    @Transactional
    public DestinationResponse updateDestinationStatus(Long id, DestinationStatusUpdateRequest request) {
        Destination destination = findDestinationById(id);
        destination.setStatus(request.status());

        return toResponse(destinationRepository.save(destination));
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

        destination.setImageUrl(request.imageUrl().trim());

        return toResponse(destinationRepository.save(destination));
    }

    private Destination findDestinationById(Long id) {
        return destinationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.DESTINATION_NOT_FOUND,
                        "Destination not found"
                ));
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

    private DestinationResponse toResponse(Destination destination) {
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
                destination.getStatus()
        );
    }
}