package com.voyageviet.backend.user.repository;

import com.voyageviet.backend.role.entity.RoleCode;
import com.voyageviet.backend.user.entity.User;
import com.voyageviet.backend.user.entity.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    @EntityGraph(attributePaths = "role")
    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    long countByStatus(UserStatus status);

    @Override
    @EntityGraph(attributePaths = "role")
    Page<User> findAll(Pageable pageable);

    @EntityGraph(attributePaths = "role")
    Page<User> findByStatus(UserStatus status, Pageable pageable);

    @EntityGraph(attributePaths = "role")
    @Query("""
            SELECT u
            FROM User u
            WHERE (:status IS NULL OR u.status = :status)
              AND (
                    :keyword IS NULL
                    OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(u.phone) LIKE LOWER(CONCAT('%', :keyword, '%'))
                  )
            """)
    Page<User> searchUsersForAdmin(
            @Param("keyword") String keyword,
            @Param("status") UserStatus status,
            Pageable pageable
    );

    @EntityGraph(attributePaths = "role")
    Optional<User> findWithRoleById(Long id);

    @EntityGraph(attributePaths = "role")
    @Query("""
        SELECT u
        FROM User u
        WHERE (:status IS NULL OR u.status = :status)
          AND (:excludedRole IS NULL OR u.role.code <> :excludedRole)
          AND (
                :keyword IS NULL
                OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(u.phone) LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
        """)
    Page<User> searchUsersForAdminWithExcludedRole(
            @Param("keyword") String keyword,
            @Param("status") UserStatus status,
            @Param("excludedRole") RoleCode excludedRole,
            Pageable pageable
    );
}