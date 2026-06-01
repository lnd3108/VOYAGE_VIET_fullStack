package com.voyageviet.backend.destination.repository;

import com.voyageviet.backend.destination.entity.Destination;
import com.voyageviet.backend.destination.entity.DestinationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DestinationRepository extends JpaRepository<Destination, Long> {

    Optional<Destination> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    List<Destination> findByStatus(DestinationStatus status);

    List<Destination> findByStatusOrderByNameAsc(DestinationStatus status);

    long countByStatus(DestinationStatus status);
}