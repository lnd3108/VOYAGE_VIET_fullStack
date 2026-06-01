package com.voyageviet.backend.user.service;

import com.voyageviet.backend.audit.entity.AuditAction;
import com.voyageviet.backend.audit.service.AuditLogService;
import com.voyageviet.backend.booking.repository.BookingRepository;
import com.voyageviet.backend.common.exception.BusinessException;
import com.voyageviet.backend.common.exception.ErrorCode;
import com.voyageviet.backend.common.paging.PageResponse;
import com.voyageviet.backend.media.dto.MediaUploadResponse;
import com.voyageviet.backend.media.service.MediaService;
import com.voyageviet.backend.review.repository.ReviewRepository;
import com.voyageviet.backend.role.entity.Role;
import com.voyageviet.backend.role.entity.RoleCode;
import com.voyageviet.backend.role.repository.RoleRepository;
import com.voyageviet.backend.user.dto.*;
import com.voyageviet.backend.user.entity.User;
import com.voyageviet.backend.user.entity.UserStatus;
import com.voyageviet.backend.user.repository.UserRepository;
import com.voyageviet.backend.wishlist.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final long MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
    private static final Set<String> ALLOWED_AVATAR_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuditLogService auditLogService;
    private final MediaService mediaService;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final WishlistRepository wishlistRepository;

    public UserMeResponse getCurrentUser(Authentication authentication) {
        String email = authentication.getName();

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.USER_NOT_FOUND,
                        "Current user not found"
                ));

        return toMeResponse(user);
    }

    @Transactional
    public UserMeResponse updateCurrentUser(Authentication authentication, UserProfileUpdateRequest request) {
        User user = getCurrentUserEntity(authentication);
        user.setFullName(request.fullName().trim());
        user.setPhone(normalizePhone(request.phone()));
        return toMeResponse(userRepository.save(user));
    }

    @Transactional
    public AvatarUploadResponse uploadAvatar(Authentication authentication, MultipartFile file) {
        User user = getCurrentUserEntity(authentication);
        validateAvatar(file);
        MediaUploadResponse uploaded = mediaService.uploadImage(file, "avatars");

        String oldPublicId = user.getAvatarPublicId();
        user.setAvatarUrl(uploaded.secureUrl());
        user.setAvatarPublicId(uploaded.publicId());
        userRepository.save(user);

        if (oldPublicId != null && !oldPublicId.isBlank()) {
            mediaService.deleteImageByPublicId(oldPublicId);
        }

        return new AvatarUploadResponse(user.getAvatarUrl());
    }

    public AdminUserDetailResponse getUserDetailForAdmin(Long id) {
        User user = findUserWithRoleById(id);
        return new AdminUserDetailResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getAvatarUrl(),
                user.getRole().getCode(),
                user.getStatus(),
                bookingRepository.countByUserId(user.getId()),
                reviewRepository.countByUserId(user.getId()),
                wishlistRepository.countByUserId(user.getId()),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    public PageResponse<AdminUserResponse> getUsersForAdmin(
            Authentication authentication,
            String keyword,
            UserStatus status,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        User currentAdmin = getCurrentAdmin(authentication);
        Pageable pageable = buildPageable(page, size, sortBy, sortDir);

        RoleCode excludedRole = currentAdmin.getRole().getCode() == RoleCode.SUPER_ADMIN
                ? null
                : RoleCode.SUPER_ADMIN;

        Page<User> userPage = userRepository.searchUsersForAdminWithExcludedRole(
                trimToNull(keyword),
                status,
                excludedRole,
                pageable
        );

        return PageResponse.from(userPage, this::toAdminResponse);
    }

    public AdminUserResponse updateUserStatus(
            Authentication authentication,
            Long id,
            UserStatusUpdateRequest request
    ) {
        User currentAdmin = getCurrentAdmin(authentication);
        User targetUser = findUserWithRoleById(id);
        UserStatus oldStatus = targetUser.getStatus();

        validateCanUpdateUserStatus(currentAdmin, targetUser);

        targetUser.setStatus(request.status());
        auditLogService.log(
                authentication,
                AuditAction.USER_STATUS_UPDATED,
                "USER",
                targetUser.getId(),
                targetUser.getEmail(),
                oldStatus.name(),
                request.status().name(),
                "Admin updated user status"
        );

        return toAdminResponse(userRepository.save(targetUser));
    }

    public AdminUserResponse updateUserRole(
            Authentication authentication,
            Long id,
            UserRoleUpdateRequest request
    ) {
        User currentAdmin = getCurrentAdmin(authentication);
        User targetUser = findUserWithRoleById(id);
        RoleCode oldRole = targetUser.getRole().getCode();

        validateCanUpdateUserRole(currentAdmin, targetUser);

        Role role = roleRepository.findByCode(request.role())
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.ROLE_NOT_FOUND,
                        "Role not found"
                ));

        targetUser.setRole(role);
        auditLogService.log(
                authentication,
                AuditAction.USER_ROLE_UPDATED,
                "USER",
                targetUser.getId(),
                targetUser.getEmail(),
                oldRole.name(),
                request.role().name(),
                "Admin updated user role"
        );

        return toAdminResponse(userRepository.save(targetUser));
    }

    private User getCurrentAdmin(Authentication authentication) {
        String email = authentication.getName();

        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.USER_NOT_FOUND,
                        "Current admin not found"
                ));
    }

    private User getCurrentUserEntity(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.USER_NOT_FOUND,
                        "Current user not found"
                ));
    }

    private void validateCanUpdateUserStatus(User currentAdmin, User targetUser) {
        if (isSameUser(currentAdmin, targetUser)) {
            throw new BusinessException(
                    ErrorCode.USER_FORBIDDEN_ACTION,
                    "You cannot change your own account status"
            );
        }

        RoleCode currentRole = currentAdmin.getRole().getCode();
        RoleCode targetRole = targetUser.getRole().getCode();

        if (currentRole == RoleCode.SUPER_ADMIN) {
            return;
        }

        if (currentRole == RoleCode.ADMIN && targetRole == RoleCode.USER) {
            return;
        }

        throw new BusinessException(
                ErrorCode.USER_FORBIDDEN_ACTION,
                "You are not allowed to update this user's status"
        );
    }

    private void validateCanUpdateUserRole(User currentAdmin, User targetUser) {
        if (isSameUser(currentAdmin, targetUser)) {
            throw new BusinessException(
                    ErrorCode.USER_FORBIDDEN_ACTION,
                    "You cannot change your own role"
            );
        }

        RoleCode currentRole = currentAdmin.getRole().getCode();

        if (currentRole != RoleCode.SUPER_ADMIN) {
            throw new BusinessException(
                    ErrorCode.USER_FORBIDDEN_ACTION,
                    "Only super admin can update user roles"
            );
        }
    }

    private boolean isSameUser(User currentAdmin, User targetUser) {
        return currentAdmin.getId().equals(targetUser.getId());
    }

    private User findUserWithRoleById(Long id) {
        return userRepository.findWithRoleById(id)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.USER_NOT_FOUND,
                        "User not found"
                ));
    }

    private Pageable buildPageable(int page, int size, String sortBy, String sortDir) {
        if (page < 0) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Page index must be greater than or equal to 0"
            );
        }

        if (size < 1 || size > 50) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Page size must be between 1 and 50"
            );
        }

        String safeSortBy = resolveSortBy(sortBy);

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.ASC
                : "desc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.DESC
                : null;

        if (direction == null) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Sort direction must be either asc or desc"
            );
        }

        return PageRequest.of(page, size, Sort.by(direction, safeSortBy));
    }

    private String resolveSortBy(String sortBy) {
        Set<String> allowedSortFields = Set.of(
                "createdAt",
                "updatedAt",
                "id",
                "fullName",
                "email",
                "status",
                "lastLoginAt"
        );

        if (sortBy == null || sortBy.isBlank()) {
            return "createdAt";
        }

        if (!allowedSortFields.contains(sortBy)) {
            throw new BusinessException(
                    ErrorCode.INVALID_REQUEST,
                    "Invalid sort field. Allowed fields: " + String.join(", ", allowedSortFields)
            );
        }

        return sortBy;
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private String normalizePhone(String phone) {
        if (phone == null || phone.isBlank()) {
            return null;
        }
        return phone.trim();
    }

    private void validateAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.MEDIA_INVALID_FILE, "File avatar không hợp lệ.");
        }
        if (file.getSize() > MAX_AVATAR_SIZE_BYTES) {
            throw new BusinessException(ErrorCode.MEDIA_INVALID_FILE, "Dung lượng ảnh tối đa 5MB.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_AVATAR_TYPES.contains(contentType)) {
            throw new BusinessException(ErrorCode.MEDIA_INVALID_FILE, "Chỉ hỗ trợ ảnh jpg, jpeg, png, webp.");
        }
    }

    private AdminUserResponse toAdminResponse(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getAvatarUrl(),
                user.getStatus(),
                user.getEmailVerified(),
                user.getRole().getCode(),
                user.getLastLoginAt(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getAvatarUrl(),
                user.getStatus(),
                user.getEmailVerified(),
                user.getRole().getCode(),
                user.getCreatedAt()
        );
    }

    private UserMeResponse toMeResponse(User user) {
        return new UserMeResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getAvatarUrl(),
                user.getRole().getCode(),
                user.getStatus(),
                user.getEmailVerified(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
