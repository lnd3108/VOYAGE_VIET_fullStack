package com.voyageviet.backend.feature.repository;

import com.voyageviet.backend.feature.entity.FeatureCode;
import com.voyageviet.backend.feature.entity.FeatureFlag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FeatureFlagRepository extends JpaRepository<FeatureFlag, Long> {

    Optional<FeatureFlag> findByCode(FeatureCode code);

    boolean existsByCode(FeatureCode code);
}