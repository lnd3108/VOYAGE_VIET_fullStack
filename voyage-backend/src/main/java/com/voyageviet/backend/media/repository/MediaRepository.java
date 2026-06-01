package com.voyageviet.backend.media.repository;

import com.voyageviet.backend.media.entity.Media;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MediaRepository extends JpaRepository<Media, Long> {

    Optional<Media> findByPublicId(String publicId);

    Page<Media> findByFolderContainingIgnoreCase(String folder, Pageable pageable);
}