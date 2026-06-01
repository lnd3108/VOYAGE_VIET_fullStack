package com.voyageviet.backend.feature.service;

import com.voyageviet.backend.common.exception.BusinessException;
import com.voyageviet.backend.common.exception.ErrorCode;
import com.voyageviet.backend.feature.entity.FeatureCode;
import com.voyageviet.backend.feature.repository.FeatureFlagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FeatureGuardService {

    private final FeatureFlagRepository featureFlagRepository;

    public void requireEnabled(FeatureCode code, String disabledMessage) {
        boolean enabled = featureFlagRepository.findByCode(code)
                .map(feature -> Boolean.TRUE.equals(feature.getEnabled()))
                .orElse(true);

        if (!enabled) {
            throw new BusinessException(
                    ErrorCode.FEATURE_DISABLED,
                    disabledMessage
            );
        }
    }
}