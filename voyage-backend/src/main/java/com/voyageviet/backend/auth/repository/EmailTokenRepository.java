package com.voyageviet.backend.auth.repository;

import com.voyageviet.backend.auth.entity.EmailToken;
import com.voyageviet.backend.auth.entity.EmailTokenType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmailTokenRepository extends JpaRepository<EmailToken, Long> {

    @EntityGraph(attributePaths = {"user", "user.role"})
    Optional<EmailToken> findByTokenAndType(String token, EmailTokenType type);

    List<EmailToken> findByUserIdAndTypeAndUsedAtIsNull(Long userId, EmailTokenType type);

    boolean existsByToken(String token);
}
