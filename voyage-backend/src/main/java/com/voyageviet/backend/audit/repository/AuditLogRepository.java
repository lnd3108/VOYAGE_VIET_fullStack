package com.voyageviet.backend.audit.repository;

import com.voyageviet.backend.audit.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findByActorEmailContainingIgnoreCase(String actorEmail, Pageable pageable);

    Page<AuditLog> findByTargetTypeIgnoreCase(String targetType, Pageable pageable);
}