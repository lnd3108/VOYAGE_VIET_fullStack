package com.voyageviet.backend.promotion.repository;

import com.voyageviet.backend.promotion.entity.Promotion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface PromotionRepository extends JpaRepository<Promotion, Long>, JpaSpecificationExecutor<Promotion> {

    Optional<Promotion> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    @Override
    Page<Promotion> findAll(Specification<Promotion> spec, Pageable pageable);
}
