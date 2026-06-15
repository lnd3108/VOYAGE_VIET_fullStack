package com.voyageviet.backend.destination.repository;

import com.voyageviet.backend.destination.entity.Destination;
import com.voyageviet.backend.destination.entity.DestinationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface DestinationRepository extends JpaRepository<Destination, Long>, JpaSpecificationExecutor<Destination> {

    Optional<Destination> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    boolean existsByNameIgnoreCase(String name);

    List<Destination> findByStatus(DestinationStatus status);

    List<Destination> findByStatusOrderByNameAsc(DestinationStatus status);

    List<Destination> findByStatusAndIsDisplayOrderByNameAsc(DestinationStatus status, Integer isDisplay);

    long countByStatus(DestinationStatus status);

    long countByStatusAndIsDisplay(DestinationStatus status, Integer isDisplay);
}
