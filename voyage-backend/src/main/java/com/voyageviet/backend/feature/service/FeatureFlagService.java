package com.voyageviet.backend.feature.service;

import com.voyageviet.backend.audit.entity.AuditAction;
import com.voyageviet.backend.audit.service.AuditLogService;
import com.voyageviet.backend.common.exception.BusinessException;
import com.voyageviet.backend.common.exception.ErrorCode;
import com.voyageviet.backend.feature.dto.FeatureFlagResponse;
import com.voyageviet.backend.feature.dto.FeatureFlagUpdateRequest;
import com.voyageviet.backend.feature.entity.FeatureCode;
import com.voyageviet.backend.feature.entity.FeatureFlag;
import com.voyageviet.backend.feature.repository.FeatureFlagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FeatureFlagService {

    private final FeatureFlagRepository featureFlagRepository;
    private final AuditLogService auditLogService;

    public List<FeatureFlagResponse> getAllFeaturesForAdmin() {
        return featureFlagRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public Map<FeatureCode, Boolean> getPublicFeatureMap() {
        return featureFlagRepository.findAll()
                .stream()
                .collect(Collectors.toMap(
                        FeatureFlag::getCode,
                        FeatureFlag::getEnabled
                ));
    }

    @Transactional
    public FeatureFlagResponse updateFeatureStatus(
            Authentication authentication,
            FeatureCode code,
            FeatureFlagUpdateRequest request
    ) {
        FeatureFlag featureFlag = featureFlagRepository.findByCode(code)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.FEATURE_FLAG_NOT_FOUND,
                        "Feature flag not found"
                ));
        Boolean oldEnabled = featureFlag.getEnabled();

        featureFlag.setEnabled(request.enabled());

        auditLogService.log(
                authentication,
                AuditAction.FEATURE_TOGGLE,
                "FEATURE_FLAG",
                featureFlag.getId(),
                featureFlag.getCode().name(),
                String.valueOf(oldEnabled),
                String.valueOf(request.enabled()),
                "Admin updated feature flag"
        );

        return toResponse(featureFlagRepository.save(featureFlag));
    }

    private FeatureFlagResponse toResponse(FeatureFlag featureFlag) {
        return new FeatureFlagResponse(
                featureFlag.getId(),
                featureFlag.getCode(),
                featureFlag.getName(),
                featureFlag.getDescription(),
                featureFlag.getEnabled()
        );
    }
}
