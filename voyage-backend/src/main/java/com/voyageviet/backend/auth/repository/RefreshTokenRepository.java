package com.voyageviet.backend.auth.repository;

import com.voyageviet.backend.auth.entity.RefreshToken;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    @EntityGraph(attributePaths = {"user", "user.role"})
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    List<RefreshToken> findByUserIdAndRevokedAtIsNull(Long userId);

    boolean existsByTokenHash(String tokenHash);

    void deleteByUserId(Long userId);
}
