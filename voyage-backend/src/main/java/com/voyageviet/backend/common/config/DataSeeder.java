package com.voyageviet.backend.common.config;

import com.voyageviet.backend.category.entity.Category;
import com.voyageviet.backend.category.entity.CategoryStatus;
import com.voyageviet.backend.category.repository.CategoryRepository;
import com.voyageviet.backend.destination.entity.Destination;
import com.voyageviet.backend.destination.entity.DestinationStatus;
import com.voyageviet.backend.destination.repository.DestinationRepository;
import com.voyageviet.backend.role.entity.Role;
import com.voyageviet.backend.role.entity.RoleCode;
import com.voyageviet.backend.role.repository.RoleRepository;
import com.voyageviet.backend.tour.entity.Tour;
import com.voyageviet.backend.tour.entity.TourStatus;
import com.voyageviet.backend.tour.repository.TourRepository;
import com.voyageviet.backend.user.entity.User;
import com.voyageviet.backend.user.entity.UserStatus;
import com.voyageviet.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import com.voyageviet.backend.feature.entity.FeatureCode;
import com.voyageviet.backend.feature.entity.FeatureFlag;
import com.voyageviet.backend.feature.repository.FeatureFlagRepository;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final CategoryRepository categoryRepository;
    private final DestinationRepository destinationRepository;
    private final TourRepository tourRepository;

    private final FeatureFlagRepository featureFlagRepository;

    @Value("${app.seed.admin.enabled:false}")
    private boolean seedAdminEnabled;

    @Value("${app.seed.sample.enabled:false}")
    private boolean seedSampleEnabled;

    @Value("${app.seed.admin.email:admin@voyageviet.local}")
    private String adminEmail;

    @Value("${app.seed.admin.password:Admin@123456}")
    private String adminPassword;

    @Value("${app.seed.super-admin.email:superadmin@voyageviet.local}")
    private String superAdminEmail;

    @Value("${app.seed.super-admin.password:SuperAdmin@123456}")
    private String superAdminPassword;

    @Override
    public void run(String... args) {
        seedRoles();
        seedFeatureFlags();

        if (seedAdminEnabled) {
            seedAdminUsers();
        }

        if (seedSampleEnabled) {
            seedSampleData();
        }
    }

    private void seedRoles() {
        createRoleIfNotExists(
                RoleCode.USER,
                "User",
                "Người dùng thông thường có thể xem tour, đặt tour và đánh giá."
        );

        createRoleIfNotExists(
                RoleCode.STAFF,
                "Staff",
                "Nhân viên vận hành có quyền nền để xử lý nghiệp vụ nội bộ theo phân quyền chi tiết ở phase sau."
        );

        createRoleIfNotExists(
                RoleCode.ADMIN,
                "Admin",
                "Quản trị viên có thể quản lý tour, booking, media và nội dung hệ thống."
        );

        createRoleIfNotExists(
                RoleCode.SUPER_ADMIN,
                "Super Admin",
                "Quản trị viên cao nhất có toàn quyền quản lý hệ thống."
        );
    }

    private void seedAdminUsers() {
        Role adminRole = roleRepository.findByCode(RoleCode.ADMIN).orElseThrow();
        Role superAdminRole = roleRepository.findByCode(RoleCode.SUPER_ADMIN).orElseThrow();

        createUserIfNotExists(
                "VoyageViet Admin",
                adminEmail,
                adminPassword,
                adminRole
        );

        createUserIfNotExists(
                "VoyageViet Super Admin",
                superAdminEmail,
                superAdminPassword,
                superAdminRole
        );
    }

    private void seedSampleData() {
        Category bienDao = createCategoryIfNotExists(
                "Biển đảo",
                "bien-dao",
                "Các tour nghỉ dưỡng biển đảo nổi bật tại Việt Nam.",
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
                1
        );

        Category nuiRung = createCategoryIfNotExists(
                "Núi rừng",
                "nui-rung",
                "Khám phá thiên nhiên, núi rừng và văn hóa bản địa.",
                "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
                2
        );

        Category vanHoa = createCategoryIfNotExists(
                "Văn hóa",
                "van-hoa",
                "Các hành trình khám phá di sản, lịch sử và văn hóa Việt Nam.",
                "https://images.unsplash.com/photo-1528127269322-539801943592",
                3
        );

        Destination daNang = createDestinationIfNotExists(
                "Đà Nẵng",
                "da-nang",
                "Miền Trung",
                "Việt Nam",
                "Thành phố biển năng động với nhiều điểm đến nổi tiếng như Bà Nà Hills, bán đảo Sơn Trà và biển Mỹ Khê.",
                "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b"
        );

        Destination sapa = createDestinationIfNotExists(
                "Sa Pa",
                "sa-pa",
                "Tây Bắc",
                "Việt Nam",
                "Điểm đến nổi bật với ruộng bậc thang, khí hậu mát mẻ và văn hóa dân tộc đặc sắc.",
                "https://images.unsplash.com/photo-1544735716-392fe2489ffa"
        );

        Destination haLong = createDestinationIfNotExists(
                "Hạ Long",
                "ha-long",
                "Miền Bắc",
                "Việt Nam",
                "Vịnh biển nổi tiếng với hàng nghìn đảo đá vôi và cảnh quan thiên nhiên kỳ vĩ.",
                "https://images.unsplash.com/photo-1528127269322-539801943592"
        );

        createTourIfNotExists(
                "Đà Nẵng - Hội An 3 ngày 2 đêm",
                "da-nang-hoi-an-3-ngay-2-dem",
                "Khám phá Đà Nẵng, phố cổ Hội An và các điểm check-in nổi bật.",
                "Lịch trình phù hợp cho gia đình, cặp đôi và nhóm bạn muốn trải nghiệm miền Trung trong thời gian ngắn.",
                "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b",
                BigDecimal.valueOf(4500000),
                BigDecimal.valueOf(3990000),
                3,
                2,
                "Hà Nội",
                30,
                24,
                true,
                TourStatus.PUBLISHED,
                vanHoa,
                daNang
        );

        createTourIfNotExists(
                "Sa Pa săn mây 2 ngày 1 đêm",
                "sa-pa-san-may-2-ngay-1-dem",
                "Trải nghiệm khí hậu mát lạnh, săn mây và khám phá bản làng Sa Pa.",
                "Tour ngắn ngày phù hợp cho khách muốn nghỉ dưỡng cuối tuần và khám phá thiên nhiên Tây Bắc.",
                "https://images.unsplash.com/photo-1544735716-392fe2489ffa",
                BigDecimal.valueOf(3200000),
                BigDecimal.valueOf(2890000),
                2,
                1,
                "Hà Nội",
                25,
                18,
                true,
                TourStatus.PUBLISHED,
                nuiRung,
                sapa
        );

        createTourIfNotExists(
                "Du thuyền Hạ Long 2 ngày 1 đêm",
                "du-thuyen-ha-long-2-ngay-1-dem",
                "Nghỉ đêm trên du thuyền, ngắm vịnh Hạ Long và thưởng thức hải sản.",
                "Hành trình nghỉ dưỡng cao cấp trên vịnh, phù hợp cho khách muốn trải nghiệm dịch vụ du thuyền.",
                "https://images.unsplash.com/photo-1528127269322-539801943592",
                BigDecimal.valueOf(5200000),
                BigDecimal.valueOf(4690000),
                2,
                1,
                "Hà Nội",
                20,
                12,
                true,
                TourStatus.PUBLISHED,
                bienDao,
                haLong
        );
    }

    private void createRoleIfNotExists(RoleCode code, String name, String description) {
        if (roleRepository.existsByCode(code)) {
            return;
        }

        Role role = Role.builder()
                .code(code)
                .name(name)
                .description(description)
                .build();

        try {
            roleRepository.save(role);
        } catch (DataIntegrityViolationException ex) {
            log.warn(
                    "Skip seeding role {} because database constraint does not allow this enum value yet. Apply enum check constraint migration first.",
                    code
            );
        }
    }

    private void createUserIfNotExists(String fullName, String email, String rawPassword, Role role) {
        String normalizedEmail = email.trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            return;
        }

        User user = User.builder()
                .fullName(fullName)
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .role(role)
                .build();

        userRepository.save(user);
    }

    private Category createCategoryIfNotExists(
            String name,
            String slug,
            String description,
            String imageUrl,
            Integer displayOrder
    ) {
        return categoryRepository.findBySlug(slug)
                .orElseGet(() -> categoryRepository.save(Category.builder()
                        .name(name)
                        .slug(slug)
                        .description(description)
                        .imageUrl(imageUrl)
                        .status(CategoryStatus.APPROVED)
                        .isDisplay(1)
                        .displayOrder(displayOrder)
                        .build()));
    }

    private Destination createDestinationIfNotExists(
            String name,
            String slug,
            String region,
            String country,
            String description,
            String imageUrl
    ) {
        return destinationRepository.findBySlug(slug)
                .orElseGet(() -> destinationRepository.save(Destination.builder()
                        .name(name)
                        .slug(slug)
                        .region(region)
                        .country(country)
                        .description(description)
                        .imageUrl(imageUrl)
                        .status(DestinationStatus.APPROVED)
                        .isDisplay(1)
                        .build()));
    }

    private void createTourIfNotExists(
            String title,
            String slug,
            String shortDescription,
            String description,
            String thumbnailUrl,
            BigDecimal originalPrice,
            BigDecimal salePrice,
            Integer durationDays,
            Integer durationNights,
            String departureLocation,
            Integer maxParticipants,
            Integer availableSeats,
            Boolean featured,
            TourStatus status,
            Category category,
            Destination destination
    ) {
        if (tourRepository.existsBySlug(slug)) {
            return;
        }

        Tour tour = Tour.builder()
                .title(title)
                .slug(slug)
                .shortDescription(shortDescription)
                .description(description)
                .thumbnailUrl(thumbnailUrl)
                .originalPrice(originalPrice)
                .salePrice(salePrice)
                .durationDays(durationDays)
                .durationNights(durationNights)
                .departureLocation(departureLocation)
                .maxParticipants(maxParticipants)
                .availableSeats(availableSeats)
                .featured(featured)
                .isDomestic(inferDomestic(destination))
                .status(status)
                .category(category)
                .destination(destination)
                .build();

        tourRepository.save(tour);
    }

    private void seedFeatureFlags() {
        createFeatureIfNotExists(
                FeatureCode.PUBLIC_BOOKING,
                "Đặt tour",
                "Cho phép người dùng đặt tour ở giao diện public.",
                true
        );

        createFeatureIfNotExists(
                FeatureCode.PUBLIC_REVIEW,
                "Đánh giá tour",
                "Cho phép người dùng đánh giá tour sau khi sử dụng dịch vụ.",
                true
        );

        createFeatureIfNotExists(
                FeatureCode.PUBLIC_PAYMENT,
                "Thanh toán online",
                "Cho phép hiển thị và sử dụng chức năng thanh toán online.",
                false
        );

        createFeatureIfNotExists(
                FeatureCode.CHAT_SUPPORT,
                "Chat hỗ trợ",
                "Cho phép người dùng liên hệ hỗ trợ qua chat realtime.",
                false
        );

        createFeatureIfNotExists(
                FeatureCode.GOOGLE_LOGIN,
                "Đăng nhập Google",
                "Cho phép người dùng đăng nhập bằng Google OAuth2.",
                true
        );

        createFeatureIfNotExists(
                FeatureCode.TOUR_SEARCH,
                "Tìm kiếm tour",
                "Cho phép hiển thị ô tìm kiếm tour.",
                true
        );

        createFeatureIfNotExists(
                FeatureCode.TOUR_FILTER,
                "Bộ lọc tour",
                "Cho phép hiển thị bộ lọc theo danh mục, điểm đến và giá.",
                true
        );

        createFeatureIfNotExists(
                FeatureCode.ADMIN_DASHBOARD,
                "Dashboard quản trị",
                "Cho phép hiển thị dashboard thống kê trong trang admin.",
                true
        );

        createFeatureIfNotExists(FeatureCode.TOUR_VIEW, "Xem tour", "Cho phép xem module quản lý tour.", true);
        createFeatureIfNotExists(FeatureCode.TOUR_CREATE, "Tạo tour", "Cho phép tạo tour mới trong trang admin.", true);
        createFeatureIfNotExists(FeatureCode.TOUR_UPDATE, "Cập nhật tour", "Cho phép chỉnh sửa thông tin tour.", true);
        createFeatureIfNotExists(FeatureCode.TOUR_DELETE, "Xóa tour", "Cho phép xóa tour trong trang admin.", true);
        createFeatureIfNotExists(FeatureCode.TOUR_PUBLISH, "Publish tour", "Cho phép publish tour ra public.", true);
        createFeatureIfNotExists(FeatureCode.BOOKING_VIEW, "Xem booking", "Cho phép xem danh sách và chi tiết booking.", true);
        createFeatureIfNotExists(FeatureCode.BOOKING_UPDATE, "Cập nhật booking", "Cho phép cập nhật thông tin/trạng thái booking.", true);
        createFeatureIfNotExists(FeatureCode.BOOKING_CONFIRM, "Xác nhận booking", "Cho phép xác nhận booking của khách hàng.", true);
        createFeatureIfNotExists(FeatureCode.BOOKING_CANCEL, "Hủy booking", "Cho phép hủy booking trong trang quản trị.", true);
        createFeatureIfNotExists(FeatureCode.USER_MANAGE, "Quản lý user", "Cho phép quản lý người dùng và vai trò.", true);
        createFeatureIfNotExists(FeatureCode.REVIEW_MANAGE, "Quản lý đánh giá", "Cho phép kiểm duyệt, ẩn hoặc xóa đánh giá.", true);
        createFeatureIfNotExists(FeatureCode.CATEGORY_MANAGE, "Quản lý danh mục", "Cho phép quản lý danh mục tour.", true);
        createFeatureIfNotExists(FeatureCode.DESTINATION_MANAGE, "Quản lý điểm đến", "Cho phép quản lý điểm đến.", true);
        createFeatureIfNotExists(FeatureCode.MEDIA_MANAGE, "Quản lý media", "Cho phép upload và quản lý media.", true);
        createFeatureIfNotExists(FeatureCode.PROMOTION_MANAGE, "Quản lý khuyến mãi", "Cho phép quản lý mã giảm giá và campaign.", true);
        createFeatureIfNotExists(FeatureCode.PAYMENT_VIEW, "Xem thanh toán", "Cho phép xem payment list/detail.", true);
        createFeatureIfNotExists(FeatureCode.PAYMENT_REFUND, "Hoàn tiền", "Cho phép thao tác refund payment khi backend hỗ trợ.", false);
        createFeatureIfNotExists(FeatureCode.REVENUE_VIEW, "Xem doanh thu", "Cho phép xem thống kê doanh thu.", true);
        createFeatureIfNotExists(FeatureCode.ANALYTICS_VIEW, "Xem analytics", "Cho phép xem dashboard analytics nâng cao.", true);
        createFeatureIfNotExists(FeatureCode.NOTIFICATION_VIEW, "Xem thông báo", "Cho phép xem module thông báo.", true);
        createFeatureIfNotExists(FeatureCode.FEATURE_MANAGE, "Quản lý feature flags", "Cho phép bật/tắt feature flags.", true);
        createFeatureIfNotExists(FeatureCode.AUDIT_VIEW, "Xem audit log", "Cho phép xem lịch sử thao tác quản trị.", true);
        createFeatureIfNotExists(FeatureCode.SUPPORT_CHAT, "Support chat", "Chuẩn bị feature cho module support chat.", false);
        createFeatureIfNotExists(FeatureCode.BANNER_MANAGE, "Quản lý banner", "Chuẩn bị feature cho module banner.", false);
        createFeatureIfNotExists(FeatureCode.BLOG_MANAGE, "Quản lý blog", "Chuẩn bị feature cho module blog.", false);
    }

    private Boolean inferDomestic(Destination destination) {
        if (destination == null || destination.getCountry() == null) {
            return null;
        }

        String country = destination.getCountry().trim();
        return "Vietnam".equalsIgnoreCase(country)
                || "Viet Nam".equalsIgnoreCase(country)
                || "Việt Nam".equalsIgnoreCase(country);
    }

    private void createFeatureIfNotExists(
            FeatureCode code,
            String name,
            String description,
            boolean enabled
    ) {
        if (featureFlagRepository.existsByCode(code)) {
            return;
        }

        FeatureFlag featureFlag = FeatureFlag.builder()
                .code(code)
                .name(name)
                .description(description)
                .enabled(enabled)
                .build();

        try {
            featureFlagRepository.save(featureFlag);
        } catch (DataIntegrityViolationException ex) {
            log.warn(
                    "Skip seeding feature {} because database constraint does not allow this enum value yet. Apply enum check constraint migration first.",
                    code
            );
        }
    }
}
