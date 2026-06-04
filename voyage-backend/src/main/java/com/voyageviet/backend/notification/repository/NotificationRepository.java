package com.voyageviet.backend.notification.repository;

import com.voyageviet.backend.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @EntityGraph(attributePaths = "user")
    Page<Notification> findByUserId(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = "user")
    Page<Notification> findByUserIdAndIsRead(Long userId, Boolean isRead, Pageable pageable);

    long countByUserIdAndIsReadFalse(Long userId);

    @EntityGraph(attributePaths = "user")
    Optional<Notification> findByIdAndUserId(Long id, Long userId);

    @EntityGraph(attributePaths = "user")
    @Query("""
            SELECT n
            FROM Notification n
            WHERE n.id = :id
            """)
    Optional<Notification> findWithUserById(@Param("id") Long id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE Notification n
            SET n.isRead = true,
                n.readAt = :readAt
            WHERE n.user.id = :userId
              AND n.isRead = false
            """)
    int markAllReadByUserId(@Param("userId") Long userId, @Param("readAt") LocalDateTime readAt);

    void deleteByIdAndUserId(Long id, Long userId);
}
