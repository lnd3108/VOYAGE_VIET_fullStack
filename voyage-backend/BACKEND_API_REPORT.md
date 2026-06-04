# Báo cáo backend VoyageViet

Ngày quét: 03/06/2026  
Thư mục: `voyage-backend`  
Nguồn quét: `src/main/java`, `src/main/resources`, các controller/entity/DTO hiện có.  
Công nghệ chính: Spring Boot 4, Java 17, Spring WebMVC, Spring Security, JWT, Spring Data JPA, Oracle, Bean Validation, Springdoc OpenAPI, Cloudinary.

## 1. Tổng Quan Đã Làm

Backend đã được tách theo module nghiệp vụ, mỗi module có controller, DTO, entity, repository và service riêng khi cần:

| Module | Trạng thái | Nội dung đã làm |
|---|---|---|
| `auth` | Đã làm | Đăng ký, đăng nhập, access token JWT, refresh token rotation, logout, quên mật khẩu, đặt lại mật khẩu, xác thực email. |
| `user` | Đã làm | Lấy/cập nhật hồ sơ cá nhân, upload avatar, admin quản lý user, cập nhật trạng thái/role, xem chi tiết user. |
| `role` | Đã làm | Lấy danh sách role hệ thống. |
| `category` | Đã làm | Public lấy danh mục active, admin CRUD danh mục, cập nhật ảnh và trạng thái. |
| `destination` | Đã làm | Public lấy điểm đến active, admin CRUD điểm đến, cập nhật ảnh và trạng thái. |
| `tour` | Đã làm | Public tìm/lọc tour, tour nổi bật, chi tiết tour, lịch khởi hành, lịch trình; admin CRUD tour, publish checklist, schedule, itinerary, gallery. |
| `booking` | Đã làm | User đặt tour theo lịch khởi hành, xem booking của mình, hủy booking; admin xem và cập nhật trạng thái booking. |
| `payment` | Đã làm | Mock payment nội bộ, tạo URL VNPay, callback UX, IPN xác nhận cuối, truy vấn trạng thái payment, admin payment list/detail, refund skeleton an toàn. |
| `promotion` | Đã làm | Admin CRUD mã giảm giá, user validate promo, tích hợp promo vào booking create, lưu usage và chống dùng quá lượt. |
| `review` | Đã làm | User tạo đánh giá, public xem đánh giá theo tour; admin kiểm duyệt/ẩn/xóa đánh giá. |
| `wishlist` | Đã làm | User xem wishlist và toggle tour yêu thích. |
| `media` | Đã làm | Admin upload ảnh lên Cloudinary, xem danh sách media, xóa media. |
| `feature` | Đã làm | Public lấy feature flags, admin bật/tắt feature flags. |
| `admin dashboard` | Đã làm | Thống kê tổng quan, thống kê theo tháng, thống kê review/top tour. |
| `audit` | Đã làm | Admin xem audit log có lọc và phân trang. |
| `common` | Đã làm | Response format, paging, global exception handler, security config, CORS, OpenAPI config, data seeder. |

Tổng số endpoint hiện có trong controller: **100 endpoint**.

## 2. Cấu Hình Và Nền Tảng

| Hạng mục | Giá trị hiện có |
|---|---|
| Server port | `8081` |
| Database | Oracle JDBC |
| Hibernate | `spring.jpa.hibernate.ddl-auto=update` |
| Authentication | JWT stateless, gửi token qua `Authorization: Bearer <token>` |
| Password | BCrypt |
| CORS | Cho phép `http://localhost:4200` |
| Swagger/OpenAPI | `/swagger-ui/**`, `/swagger-ui.html`, `/v3/api-docs/**` |
| Upload local | Tối đa `5MB`/file và `5MB`/request trong `application-local.properties` |
| Response thành công | `success`, `message`, `data`, `timestamp` |
| Response lỗi | `success=false`, `message`, `error`, `timestamp` |
| Paging chuẩn | `content`, `page`, `size`, `totalElements`, `totalPages`, `first`, `last`, `empty`, `sortBy`, `sortDir` |

## 3. Phân Quyền API

| Nhóm API | Quyền |
|---|---|
| `/api/public/**` | Public, không cần token |
| `/api/auth/**` | Public, không cần token |
| Swagger/OpenAPI | Public |
| `/api/admin/**` | Cần role `ADMIN`; `SUPER_ADMIN` kế thừa `ADMIN` qua role hierarchy |
| `/api/users/me` | Cần role `USER`; `ADMIN` và `SUPER_ADMIN` kế thừa `USER` |
| Các API còn lại | Cần đăng nhập |

Role hierarchy hiện tại:

- `SUPER_ADMIN` có quyền của `ADMIN`.
- `ADMIN` có quyền của `USER`.

## 4. Tổng Hợp Bảng Dữ Liệu

Tổng số bảng JPA chính: **19 bảng**. Các bảng kế thừa `BaseEntity` thường có thêm `CREATED_AT`, `UPDATED_AT`.

| Bảng | Entity | Mục đích | Cột/chỉ mục chính |
|---|---|---|---|
| `ROLES` | `Role` | Lưu role hệ thống | `ID`, `CODE`, `NAME`; unique `CODE` |
| `USERS` | `User` | Lưu tài khoản người dùng/admin | `EMAIL` unique, `PASSWORD_HASH`, `PHONE`, `AVATAR_URL`, `AVATAR_PUBLIC_ID`, `STATUS`, `EMAIL_VERIFIED`, `EMAIL_VERIFIED_AT`, `ROLE_ID`, `LAST_LOGIN_AT` |
| `CATEGORIES` | `Category` | Danh mục tour | `NAME`, `SLUG` unique, `DESCRIPTION`, `IMAGE_URL`, `STATUS`, `DISPLAY_ORDER` |
| `DESTINATIONS` | `Destination` | Điểm đến | `NAME`, `SLUG` unique, `REGION`, `COUNTRY`, `DESCRIPTION`, `IMAGE_URL`, `LATITUDE`, `LONGITUDE`, `STATUS` |
| `TOURS` | `Tour` | Tour du lịch | `TITLE`, `SLUG` unique, `SHORT_DESCRIPTION`, `DESCRIPTION`, `THUMBNAIL_URL`, `ORIGINAL_PRICE`, `SALE_PRICE`, `DURATION_DAYS`, `DURATION_NIGHTS`, `DEPARTURE_LOCATION`, `MAX_PARTICIPANTS`, `AVAILABLE_SEATS`, `FEATURED`, `STATUS`, `CATEGORY_ID`, `DESTINATION_ID` |
| `TOUR_SCHEDULES` | `TourSchedule` | Lịch khởi hành của tour | `TOUR_ID`, `DEPARTURE_DATE`, `RETURN_DATE`, `PRICE_ADULT`, `PRICE_CHILD`, `PRICE_INFANT`, `SINGLE_SUPPLEMENT`, `MAX_SEATS`, `BOOKED_SEATS`, `STATUS`, `NOTES`, `CREATED_BY`, `VERSION`; index theo tour/status/ngày đi |
| `TOUR_ITINERARIES` | `TourItinerary` | Lịch trình từng ngày của tour | `TOUR_ID`, `DAY_NUMBER`, `TITLE`, `DESCRIPTION`, `HOTEL_NAME`, `MEALS`, `TRANSPORT_MODES`, `PLACE_NAMES`, `ACTIVITIES`, `SORT_ORDER`; unique `(TOUR_ID, DAY_NUMBER)` |
| `TOUR_IMAGES` | `TourImage` | Gallery ảnh tour | `TOUR_ID`, `URL`, `PUBLIC_ID`, `ALT_TEXT`, `SORT_ORDER`, `IS_THUMBNAIL`, `WIDTH`, `HEIGHT`, `FILE_SIZE_BYTES`, `CREATED_AT` |
| `BOOKINGS` | `Booking` | Đơn đặt tour | `USER_ID`, `TOUR_ID`, `SCHEDULE_ID`, `BOOKING_CODE` unique, thông tin liên hệ, số lượng người lớn/trẻ em/em bé, snapshot giá, `TOTAL_AMOUNT`, `STATUS`, `PAYMENT_STATUS`, `NOTE` |
| `PAYMENTS` | `Payment` | Lưu các lần thử thanh toán booking | `BOOKING_ID`, `AMOUNT`, `METHOD`, `STATUS`, `GATEWAY_TXN_ID` unique, `GATEWAY_ORDER_ID`, `GATEWAY_RESPONSE`, `REFUND_AMOUNT`, `REFUND_REASON`, `REFUNDED_AT`, `REFUNDED_BY`, `INITIATED_AT`, `PAID_AT`; sequence `SEQ_PAYMENT` |
| `PROMOTIONS` | `Promotion` | Mã giảm giá/campaign | `CODE` unique, `NAME`, `DESCRIPTION`, `DISCOUNT_TYPE`, `DISCOUNT_VALUE`, `MAX_DISCOUNT`, `MIN_ORDER`, `MAX_USES`, `USED_COUNT`, `MAX_USES_PER_USER`, `VALID_FROM`, `VALID_UNTIL`, `STATUS`, `APPLICABLE_TOUR_IDS`, `CREATED_BY` |
| `PROMOTION_USAGES` | `PromotionUsage` | Lưu lịch sử dùng mã giảm giá | `PROMOTION_ID`, `USER_ID`, `BOOKING_ID`, `DISCOUNT_AMOUNT`, `USED_AT`; unique `(PROMOTION_ID, BOOKING_ID)` |
| `REVIEWS` | `Review` | Đánh giá tour | `USER_ID`, `TOUR_ID`, `RATING`, `COMMENT`, `STATUS`; unique user/tour theo entity |
| `WISHLISTS` | `Wishlist` | Danh sách tour yêu thích | `USER_ID`, `TOUR_ID`, `CREATED_AT`; unique `(USER_ID, TOUR_ID)` |
| `MEDIA` | `Media` | Metadata file upload Cloudinary | `URL`, `PUBLIC_ID`, `TYPE`, `MODULE`, `ORIGINAL_FILENAME`, `SIZE_BYTES`, `CONTENT_TYPE`; index theo module/type |
| `FEATURE_FLAGS` | `FeatureFlag` | Bật/tắt tính năng | `CODE` unique, `ENABLED`, `DESCRIPTION` |
| `AUDIT_LOGS` | `AuditLog` | Lưu lịch sử thao tác admin | `ACTION`, `ACTOR_ID`, `ACTOR_EMAIL`, `TARGET_TYPE`, `TARGET_ID`, `TARGET_LABEL`, `OLD_VALUE`, `NEW_VALUE`, `DESCRIPTION`; index theo action/actor/target |
| `REFRESH_TOKENS` | `RefreshToken` | Lưu refresh token đã hash | `USER_ID`, `TOKEN_HASH` unique, `ISSUED_AT`, `EXPIRES_AT`, `REVOKED_AT`, `IP_ADDRESS`, `USER_AGENT` |
| `EMAIL_TOKENS` | `EmailToken` | Token xác thực email và reset password | `USER_ID`, `TOKEN` unique, `TYPE`, `EXPIRES_AT`, `USED_AT`, `CREATED_AT` |

## 5. Enum Đang Dùng

| Enum | Giá trị |
|---|---|
| `RoleCode` | `USER`, `ADMIN`, `SUPER_ADMIN` |
| `UserStatus` | `ACTIVE`, `INACTIVE`, `BANNED` |
| `CategoryStatus` | `ACTIVE`, `INACTIVE` |
| `DestinationStatus` | `ACTIVE`, `INACTIVE` |
| `TourStatus` | `DRAFT`, `PUBLISHED`, `INACTIVE`, `SOLD_OUT` |
| `TourScheduleStatus` | `OPEN`, `CLOSED`, `FULL`, `CANCELLED` |
| `BookingStatus` | `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED` |
| `BookingPaymentStatus` | `UNPAID`, `PENDING`, `PAID`, `FAILED`, `REFUNDED` |
| `PaymentMethod` | `VNPAY`, `BANK_TRANSFER`, `MOCK` |
| `PaymentStatus` | `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED` |
| `PromotionDiscountType` | `PERCENT`, `FIXED` |
| `PromotionStatus` | `ACTIVE`, `INACTIVE`, `EXPIRED` |
| `ReviewStatus` | `ACTIVE`, `HIDDEN` |
| `MediaType` | `IMAGE`, `VIDEO` |
| `FeatureCode` | `PUBLIC_BOOKING`, `PUBLIC_REVIEW`, `PUBLIC_PAYMENT`, `CHAT_SUPPORT`, `GOOGLE_LOGIN`, `TOUR_SEARCH`, `TOUR_FILTER`, `ADMIN_DASHBOARD` |
| `EmailTokenType` | `PASSWORD_RESET`, `EMAIL_VERIFY` |
| `AuditAction` | `USER_STATUS_UPDATED`, `USER_ROLE_UPDATED`, `BOOKING_STATUS_UPDATED`, `FEATURE_FLAG_UPDATED`, `MEDIA_DELETED` |

## 6. Tổng Hợp Endpoint

### 6.1 Common / Health / Home

| Method | Endpoint | Quyền | Chức năng | Tham số/Payload |
|---|---|---|---|---|
| GET | `/api/public/ping` | Public | Kiểm tra backend public đang chạy | Không |
| GET | `/api/public/test-error` | Public | Test response lỗi business | Không |
| GET | `/api/admin/ping` | Admin | Kiểm tra API admin đang chạy | Không |
| GET | `/api/public/home` | Public | Lấy dữ liệu trang home | Không |

### 6.2 Auth

| Method | Endpoint | Quyền | Chức năng | Payload chính |
|---|---|---|---|---|
| POST | `/api/auth/register` | Public | Đăng ký tài khoản | `fullName`, `email`, `password`, `phone` |
| POST | `/api/auth/login` | Public | Đăng nhập, trả access token và refresh token | `email`, `password` |
| POST | `/api/auth/refresh` | Public | Rotate refresh token và cấp access token mới | `refreshToken` |
| POST | `/api/auth/logout` | Public | Revoke refresh token, xử lý idempotent | `refreshToken` |
| POST | `/api/auth/forgot-password` | Public | Tạo token đặt lại mật khẩu nếu email tồn tại | `email` |
| POST | `/api/auth/reset-password` | Public | Đặt lại mật khẩu bằng token | `token`, `newPassword`, `confirmPassword` |
| POST | `/api/auth/verify-email` | Public | Xác thực email bằng token | `token` |

Ghi chú nghiệp vụ:

- Refresh token lưu trong DB dưới dạng SHA-256 hash, không lưu raw token.
- Refresh token rotation: token cũ bị revoke, token mới được tạo.
- Reset password thành công revoke refresh token active của user.
- Email thực tế chưa cấu hình SMTP; service hiện tại log token ở backend log.

### 6.3 User, Role, Wishlist

| Method | Endpoint | Quyền | Chức năng | Tham số/Payload |
|---|---|---|---|---|
| GET | `/api/users/me` | User | Lấy thông tin user hiện tại | Token JWT |
| PUT | `/api/users/me` | Authenticated | User cập nhật hồ sơ | `fullName`, `phone` |
| POST | `/api/users/me/avatar` | Authenticated | Upload avatar Cloudinary | multipart `file` |
| GET | `/api/users/me/wishlist` | Authenticated | Lấy wishlist có phân trang | `page`, `size`, `sortBy`, `sortDir` |
| POST | `/api/users/me/wishlist/{tourId}` | Authenticated | Toggle tour yêu thích | `tourId` |
| GET | `/api/public/roles` | Public | Lấy danh sách role | Không |
| GET | `/api/admin/users` | Admin | Lấy danh sách user có lọc và phân trang | `keyword`, `status`, `page`, `size`, `sortBy`, `sortDir` |
| GET | `/api/admin/users/{id}` | Admin | Xem chi tiết user cho admin | `id` |
| PATCH | `/api/admin/users/{id}/status` | Admin | Cập nhật trạng thái user | `status` |
| PATCH | `/api/admin/users/{id}/role` | Admin | Cập nhật role user | `role` |

Ghi chú nghiệp vụ:

- User chỉ được tự cập nhật `fullName` và `phone`, không nhận email/role/status từ request.
- Avatar chỉ cho jpg/jpeg/png/webp, tối đa 5MB, upload vào folder `avatars`.
- Wishlist chỉ cho tour `PUBLISHED`; gọi toggle lần 1 thêm, lần 2 xóa.
- Admin user detail trả thêm `bookingCount`, `reviewCount`, `wishlistCount`, không trả password/token.

### 6.4 Category

| Method | Endpoint | Quyền | Chức năng | Tham số/Payload |
|---|---|---|---|---|
| GET | `/api/public/categories` | Public | Lấy danh mục active | Không |
| GET | `/api/admin/categories` | Admin | Lấy tất cả danh mục | Không |
| POST | `/api/admin/categories` | Admin | Tạo danh mục | `name`, `slug`, `description`, `imageUrl`, `displayOrder` |
| PUT | `/api/admin/categories/{id}` | Admin | Cập nhật danh mục | `name`, `slug`, `description`, `imageUrl`, `status`, `displayOrder` |
| PATCH | `/api/admin/categories/{id}/status` | Admin | Cập nhật trạng thái danh mục | `status` |
| DELETE | `/api/admin/categories/{id}` | Admin | Xóa danh mục | `id` |
| PATCH | `/api/admin/categories/{id}/image` | Admin | Cập nhật ảnh danh mục | `imageUrl` |

### 6.5 Destination

| Method | Endpoint | Quyền | Chức năng | Tham số/Payload |
|---|---|---|---|---|
| GET | `/api/public/destinations` | Public | Lấy điểm đến active | Không |
| GET | `/api/admin/destinations` | Admin | Lấy tất cả điểm đến | Không |
| POST | `/api/admin/destinations` | Admin | Tạo điểm đến | `name`, `slug`, `region`, `country`, `description`, `imageUrl`, `latitude`, `longitude` |
| PUT | `/api/admin/destinations/{id}` | Admin | Cập nhật điểm đến | `name`, `slug`, `region`, `country`, `description`, `imageUrl`, `latitude`, `longitude`, `status` |
| PATCH | `/api/admin/destinations/{id}/status` | Admin | Cập nhật trạng thái điểm đến | `status` |
| DELETE | `/api/admin/destinations/{id}` | Admin | Xóa điểm đến | `id` |
| PATCH | `/api/admin/destinations/{id}/image` | Admin | Cập nhật ảnh điểm đến | `imageUrl` |

### 6.6 Tour Public

| Method | Endpoint | Quyền | Chức năng | Tham số |
|---|---|---|---|---|
| GET | `/api/public/tours` | Public | Tìm, lọc, phân trang tour public | `keyword`, `categorySlug`, `destinationSlug`, `region`, `departureLocation`, `minPrice`, `maxPrice`, `minDurationDays`, `maxDurationDays`, `people`, `page`, `size`, `sortBy`, `sortDir` |
| GET | `/api/public/tours/featured` | Public | Lấy tour nổi bật | Không |
| GET | `/api/public/tours/{slug}` | Public | Lấy chi tiết tour theo slug | `slug` |
| GET | `/api/public/tours/{slug}/schedules` | Public | Lấy lịch khởi hành public của tour | `slug` |
| GET | `/api/public/tours/{slug}/itinerary` | Public | Lấy lịch trình public của tour | `slug` |

Ghi chú nghiệp vụ:

- Public schedule chỉ trả lịch `OPEN` và `departureDate >= today`.
- DTO public có `remainingSeats`, không expose `bookedSeats`.

### 6.7 Tour Admin

| Method | Endpoint | Quyền | Chức năng | Payload/Tham số chính |
|---|---|---|---|---|
| GET | `/api/admin/tours` | Admin | Lấy tất cả tour cho admin | Không |
| GET | `/api/admin/tours/{id}` | Admin | Lấy chi tiết tour admin, kèm count schedule/image/itinerary và publish checklist | `id` |
| POST | `/api/admin/tours` | Admin | Tạo tour | `title`, `slug`, `shortDescription`, `description`, `thumbnailUrl`, `originalPrice`, `salePrice`, `durationDays`, `durationNights`, `departureLocation`, `maxParticipants`, `availableSeats`, `featured`, `status`, `categoryId`, `destinationId` |
| PUT | `/api/admin/tours/{id}` | Admin | Cập nhật tour | Payload như tạo tour |
| PATCH | `/api/admin/tours/{id}/status` | Admin | Cập nhật trạng thái tour | `status` |
| DELETE | `/api/admin/tours/{id}` | Admin | Xóa tour | `id` |
| PATCH | `/api/admin/tours/{id}/thumbnail` | Admin | Cập nhật thumbnail tour bằng URL | `imageUrl` |
| GET | `/api/admin/tours/{id}/publish-checklist` | Admin | Lấy checklist trước khi publish | `id` |
| POST | `/api/admin/tours/{id}/publish` | Admin | Publish tour nếu checklist đạt | `id` |

Checklist publish tour gồm các điều kiện chính: tên tour, category, destination, thumbnail, gallery, itinerary, open schedule, giá hợp lệ, số ghế hợp lệ.

### 6.8 Tour Schedule Admin

| Method | Endpoint | Quyền | Chức năng | Payload/Tham số chính |
|---|---|---|---|---|
| POST | `/api/admin/tours/{id}/schedules` | Admin | Tạo lịch khởi hành | `departureDate`, `returnDate`, `priceAdult`, `priceChild`, `priceInfant`, `singleSupplement`, `maxSeats`, `bookedSeats`, `status`, `notes` |
| GET | `/api/admin/tours/{id}/schedules` | Admin | Lấy danh sách lịch khởi hành admin | `status`, `page`, `size` |
| GET | `/api/admin/tours/{tourId}/schedules/{id}` | Admin | Lấy chi tiết lịch khởi hành | `tourId`, `id` |
| PUT | `/api/admin/tours/{tourId}/schedules/{id}` | Admin | Cập nhật lịch khởi hành | Payload như tạo lịch |
| DELETE | `/api/admin/tours/{tourId}/schedules/{id}` | Admin | Xóa lịch khởi hành | Không cho xóa nếu đã có booking |
| PATCH | `/api/admin/tours/{tourId}/schedules/{id}/status` | Admin | Cập nhật trạng thái lịch | `status` |
| POST | `/api/admin/tours/{tourId}/schedules/{id}/duplicate` | Admin | Nhân bản lịch khởi hành | `departureDate` |

Ghi chú nghiệp vụ:

- Schedule tự chuyển `FULL` khi `bookedSeats >= maxSeats`.
- `TourSchedule` dùng `@Version` để chống oversell khi đặt tour đồng thời.

### 6.9 Tour Itinerary Admin

| Method | Endpoint | Quyền | Chức năng | Payload/Tham số chính |
|---|---|---|---|---|
| GET | `/api/admin/tours/{id}/itineraries` | Admin | Lấy lịch trình admin | `id` |
| PUT | `/api/admin/tours/{id}/itineraries` | Admin | Lưu replace-all lịch trình | `items[]` gồm `id`, `dayNumber`, `title`, `description`, `hotelName`, `meals`, `transportModes`, `placeNames`, `activities`, `sortOrder` |
| POST | `/api/admin/tours/{id}/itineraries/reorder` | Admin | Sắp xếp lịch trình | `items[]: id, sortOrder` |

Ghi chú nghiệp vụ:

- Không được trùng `dayNumber` trong cùng tour.
- Lịch trình sort theo `dayNumber ASC`, sau đó `sortOrder ASC`.

### 6.10 Tour Image Admin

| Method | Endpoint | Quyền | Chức năng | Payload/Tham số chính |
|---|---|---|---|---|
| GET | `/api/admin/tours/{id}/images` | Admin | Lấy gallery ảnh tour | `id` |
| POST | `/api/admin/tours/{id}/images` | Admin | Upload ảnh tour | multipart `file`, `altText` |
| DELETE | `/api/admin/tours/{tourId}/images/{imageId}` | Admin | Xóa ảnh tour | `tourId`, `imageId`; không cho xóa thumbnail nếu còn ảnh khác |
| PATCH | `/api/admin/tours/{tourId}/images/{imageId}/thumbnail` | Admin | Đặt ảnh làm thumbnail | `tourId`, `imageId` |
| PATCH | `/api/admin/tours/{id}/images/reorder` | Admin | Sắp xếp ảnh | `items[]: id, sortOrder` |
| PATCH | `/api/admin/tours/{tourId}/images/{imageId}/alt` | Admin | Cập nhật alt text | `altText` |

Ghi chú nghiệp vụ:

- Tối đa 10 ảnh/tour.
- Chỉ 1 ảnh thumbnail/tour.

### 6.11 Booking

| Method | Endpoint | Quyền | Chức năng | Payload/Tham số chính |
|---|---|---|---|---|
| POST | `/api/bookings` | Authenticated | Tạo booking/đặt tour theo lịch khởi hành | `scheduleId`, `contactName`, `contactEmail`, `contactPhone`, `adultCount`, `childCount`, `infantCount`, `note`; vẫn còn field cũ `tourId`, `startDate`, `numberOfPeople` để parse payload cũ |
| GET | `/api/bookings/me` | Authenticated | Lấy booking của user hiện tại | `status`, `page`, `size`, `sortBy`, `sortDir` |
| PATCH | `/api/bookings/{id}/cancel` | Authenticated | User hủy booking của mình | `id` |
| GET | `/api/admin/bookings` | Admin | Admin lấy danh sách booking | `status`, `page`, `size`, `sortBy`, `sortDir` |
| PATCH | `/api/admin/bookings/{id}/status` | Admin | Admin cập nhật trạng thái booking | `status` |

Ghi chú nghiệp vụ:

- Booking mới bắt buộc có `scheduleId`.
- `PENDING` vẫn giữ chỗ để tránh oversell.
- Hủy booking `PENDING`/`CONFIRMED` sẽ release ghế khỏi schedule.
- Nếu schedule đang `FULL` và được release ghế, trạng thái có thể chuyển lại `OPEN`.
- Khi đặt đồng thời bị optimistic lock, hệ thống trả lỗi yêu cầu thử lại.

### 6.12 Review

| Method | Endpoint | Quyền | Chức năng | Payload/Tham số chính |
|---|---|---|---|---|
| POST | `/api/reviews` | Authenticated | Tạo đánh giá tour | `tourId`, `rating`, `comment` |
| GET | `/api/public/tours/{tourSlug}/reviews` | Public | Lấy đánh giá public theo tour | `tourSlug` |
| GET | `/api/admin/reviews` | Admin | Admin lấy danh sách review | `status`, `page`, `size`, `sortBy`, `sortDir` |
| PATCH | `/api/admin/reviews/{id}/status` | Admin | Cập nhật trạng thái review | `status` |
| DELETE | `/api/admin/reviews/{id}` | Admin | Xóa review | `id` |

### 6.13 Media

| Method | Endpoint | Quyền | Chức năng | Payload/Tham số chính |
|---|---|---|---|---|
| GET | `/api/admin/media` | Admin | Lấy danh sách media | `module`, `page`, `size`, `sortBy`, `sortDir` |
| POST | `/api/admin/media/upload` | Admin | Upload ảnh lên Cloudinary | multipart `file`, `module` |
| DELETE | `/api/admin/media/{id}` | Admin | Xóa media | `id` |

### 6.14 Feature Flag

| Method | Endpoint | Quyền | Chức năng | Payload/Tham số chính |
|---|---|---|---|---|
| GET | `/api/public/features` | Public | Lấy map feature flag public | Không |
| GET | `/api/admin/features` | Admin | Lấy tất cả feature flags | Không |
| PATCH | `/api/admin/features/{code}` | Admin | Bật/tắt feature flag | `enabled` |

### 6.15 Admin Dashboard

| Method | Endpoint | Quyền | Chức năng | Tham số |
|---|---|---|---|---|
| GET | `/api/admin/dashboard/summary` | Admin | Thống kê tổng quan dashboard | Không |
| GET | `/api/admin/dashboard/monthly` | Admin | Thống kê theo tháng | `year` |
| GET | `/api/admin/dashboard/reviews` | Admin | Thống kê review/top rated tour | `limit` |

### 6.16 Audit Log

| Method | Endpoint | Quyền | Chức năng | Tham số |
|---|---|---|---|---|
| GET | `/api/admin/audit-logs` | Admin | Lấy audit logs có lọc và phân trang | `actorEmail`, `targetType`, `page`, `size`, `sortBy`, `sortDir` |

## 7. Thống Kê Endpoint Theo Nhóm

| Nhóm | Số endpoint |
|---|---:|
| Common / Home / Health | 4 |
| Auth | 7 |
| User / Role / Wishlist | 10 |
| Category | 7 |
| Destination | 7 |
| Tour public | 5 |
| Tour admin core | 9 |
| Tour schedule admin | 7 |
| Tour itinerary admin | 3 |
| Tour image admin | 6 |
| Booking | 5 |
| Payment | 9 |
| Promotion | 6 |
| Review | 5 |
| Media | 3 |
| Feature Flag | 3 |
| Admin Dashboard | 3 |
| Audit Log | 1 |
| **Tổng cộng** | **100** |

## 8. Luồng Nghiệp Vụ Chính

### 8.1 Auth

- Register tạo user mặc định role `USER`.
- Login trả `accessToken`, `refreshToken`, `tokenType`, `expiresIn`, `user`.
- Refresh token dùng cơ chế rotation và revoke token cũ.
- Logout nhận refresh token và revoke nếu còn active.
- Forgot/reset password dùng `EMAIL_TOKENS` loại `PASSWORD_RESET`.
- Verify email dùng `EMAIL_TOKENS` loại `EMAIL_VERIFY`.

### 8.2 Tour Và Publish

- Admin tạo tour ở trạng thái nháp hoặc trạng thái được gửi trong request.
- Tour public chỉ nên hiển thị tour phù hợp trạng thái public trong service.
- Publish tour cần đạt checklist: thông tin cơ bản, category, destination, thumbnail/gallery, itinerary, lịch `OPEN`, giá và số ghế hợp lệ.
- Schedule là nguồn chính cho giá theo người lớn/trẻ em/em bé và số ghế còn lại.

### 8.3 Booking Theo Lịch Khởi Hành

- User chọn `scheduleId` khi đặt tour.
- Hệ thống snapshot giá tại thời điểm đặt để booking không bị ảnh hưởng khi admin đổi giá schedule sau đó.
- `bookedSeats` tăng ngay khi tạo booking `PENDING`.
- Khi booking bị hủy, ghế được release lại schedule.

### 8.4 Media, Avatar, Gallery

- Media admin upload vào Cloudinary và lưu metadata trong `MEDIA`.
- Avatar user upload vào folder `avatars`, user lưu `avatarUrl` và `avatarPublicId`.
- Tour gallery lưu riêng trong `TOUR_IMAGES`, có rule tối đa 10 ảnh và chỉ một thumbnail.

## 9. Lưu Ý Kỹ Thuật

- `src/main/resources/application-local.properties` đang chứa thông tin database local và Cloudinary. Nếu repo dùng chung, nên chuyển secret sang biến môi trường hoặc file local không commit.
- Một số message tiếng Việt trong source đang bị lỗi encoding khi đọc qua terminal, ví dụ trong `AuthController` và `WishlistController`. Báo cáo này đã được viết lại bằng tiếng Việt có dấu đúng Unicode, nhưng source code vẫn nên kiểm tra lại charset trong IDE.
- Test nghiệp vụ chi tiết chưa thấy nhiều; hiện có test khởi động mặc định `VoyageBackendApplicationTests`.
- `SecurityConfig` chỉ match chính xác `/api/users/me` với `hasRole("USER")`; các endpoint như `/api/users/me/avatar` và `/api/users/me/wishlist/**` rơi vào `anyRequest().authenticated()`. Nếu muốn bắt buộc role `USER` cho toàn bộ nhánh user, nên cân nhắc match `/api/users/**` theo role phù hợp.
## 10. Cập Nhật 03/06/2026 — Phase 3: Payment/VNPay

### 10.1 Mục Tiêu Phase

Triển khai payment module cho booking, gồm mock payment để test nội bộ, tạo URL thanh toán VNPay, callback phục vụ UX, IPN làm nguồn xác nhận cuối cùng, API xem trạng thái thanh toán booking, admin quản lý payment và refund skeleton an toàn.

Không làm promotion, notification/WebSocket, receipt/email invoice trong phase này.

### 10.2 File Đã Thêm

| File | Nội dung |
|---|---|
| `src/main/java/com/voyageviet/backend/booking/entity/BookingPaymentStatus.java` | Enum trạng thái thanh toán denormalized trên booking. |
| `src/main/java/com/voyageviet/backend/payment/entity/Payment.java` | Entity/table `PAYMENTS`. |
| `src/main/java/com/voyageviet/backend/payment/entity/PaymentMethod.java` | Enum phương thức thanh toán. |
| `src/main/java/com/voyageviet/backend/payment/entity/PaymentStatus.java` | Enum trạng thái payment attempt. |
| `src/main/java/com/voyageviet/backend/payment/config/VnpayProperties.java` | Binding config `vnpay.*`. |
| `src/main/java/com/voyageviet/backend/payment/config/PaymentProperties.java` | Binding config `payment.*`. |
| `src/main/java/com/voyageviet/backend/payment/repository/PaymentRepository.java` | Repository payment, có Specification và lookup gateway/order. |
| `src/main/java/com/voyageviet/backend/payment/service/VnpayGatewayService.java` | Tạo URL VNPay, ký và verify HMAC-SHA512. |
| `src/main/java/com/voyageviet/backend/payment/service/PaymentService.java` | Business flow create/callback/IPN/status/admin/refund/mock. |
| `src/main/java/com/voyageviet/backend/payment/controller/PaymentController.java` | Public/auth payment endpoints. |
| `src/main/java/com/voyageviet/backend/payment/controller/AdminPaymentController.java` | Admin payment endpoints. |
| `src/main/java/com/voyageviet/backend/payment/dto/CreateVnpayPaymentRequest.java` | Request tạo URL VNPay. |
| `src/main/java/com/voyageviet/backend/payment/dto/CreateVnpayPaymentResponse.java` | Response tạo URL VNPay. |
| `src/main/java/com/voyageviet/backend/payment/dto/BookingPaymentResponse.java` | Response trạng thái payment của booking. |
| `src/main/java/com/voyageviet/backend/payment/dto/AdminPaymentResponse.java` | Response danh sách payment admin. |
| `src/main/java/com/voyageviet/backend/payment/dto/PaymentDetailResponse.java` | Response chi tiết payment admin. |
| `src/main/java/com/voyageviet/backend/payment/dto/RefundRequest.java` | Request refund skeleton. |
| `src/main/java/com/voyageviet/backend/payment/dto/MockPaymentRequest.java` | Request hoàn tất mock payment. |

### 10.3 File Đã Sửa

| File | Nội dung sửa |
|---|---|
| `src/main/java/com/voyageviet/backend/booking/entity/Booking.java` | Thêm `paymentStatus`, index `PAYMENT_STATUS`. |
| `src/main/java/com/voyageviet/backend/booking/repository/BookingRepository.java` | Thêm `findByBookingCode`. |
| `src/main/java/com/voyageviet/backend/booking/service/BookingService.java` | Set `paymentStatus=UNPAID` khi tạo booking và map `BookingResponse.paymentStatus`. |
| `src/main/java/com/voyageviet/backend/common/config/SecurityConfig.java` | Mở public cho `/api/payments/vnpay/callback` và `/api/payments/vnpay/ipn`. |
| `src/main/java/com/voyageviet/backend/common/exception/ErrorCode.java` | Thêm error code payment. |
| `src/main/resources/application.properties` | Thêm config `payment.*` và `vnpay.*` đọc từ env. |
| `src/main/resources/application-local.properties` | Thay VNPay secret hardcode bằng env placeholder, thêm `payment.mock-enabled`. |
| `BACKEND_API_REPORT.md` | Cập nhật Phase 3 Payment/VNPay. |

Không xóa file nào.

### 10.4 Entity/Table Mới

| Bảng | Entity | Ghi chú |
|---|---|---|
| `PAYMENTS` | `Payment` | Một booking có thể có nhiều payment attempts. `GATEWAY_TXN_ID` unique nullable, `GATEWAY_ORDER_ID` là mã order gửi sang VNPay, `GATEWAY_RESPONSE` lưu raw callback/IPN params dạng JSON text. |

Cột chính của `PAYMENTS`:

- `ID`: PK, sequence `SEQ_PAYMENT`.
- `BOOKING_ID`: ManyToOne `Booking`, bắt buộc.
- `AMOUNT`: số tiền thanh toán.
- `METHOD`: `VNPAY`, `BANK_TRANSFER`, `MOCK`.
- `STATUS`: `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`.
- `GATEWAY_TXN_ID`: mã giao dịch gateway, map `vnp_TransactionNo`.
- `GATEWAY_ORDER_ID`: mã order gateway, map `vnp_TxnRef`.
- `GATEWAY_RESPONSE`: raw params dạng JSON text.
- `REFUND_AMOUNT`, `REFUND_REASON`, `REFUNDED_AT`, `REFUNDED_BY`: thông tin refund skeleton.
- `INITIATED_AT`, `PAID_AT`, `CREATED_AT`, `UPDATED_AT`.

### 10.5 Enum Mới

| Enum | Giá trị |
|---|---|
| `PaymentMethod` | `VNPAY`, `BANK_TRANSFER`, `MOCK` |
| `PaymentStatus` | `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED` |
| `PromotionDiscountType` | `PERCENT`, `FIXED` |
| `PromotionStatus` | `ACTIVE`, `INACTIVE`, `EXPIRED` |
| `BookingPaymentStatus` | `UNPAID`, `PENDING`, `PAID`, `FAILED`, `REFUNDED` |

### 10.6 DTO Mới

| DTO | Mục đích |
|---|---|
| `CreateVnpayPaymentRequest` | Nhận `bookingId`, `returnUrl` optional. `returnUrl` client hiện không dùng để update DB, URL redirect lấy từ config. |
| `CreateVnpayPaymentResponse` | Trả `paymentUrl`, `orderId`, `amount`, `paymentId`. |
| `BookingPaymentResponse` | Trả payment status mới nhất của booking. |
| `AdminPaymentResponse` | Dữ liệu payment list cho admin. |
| `PaymentDetailResponse` | Dữ liệu chi tiết payment, gồm `gatewayResponse`, refund info. |
| `RefundRequest` | Nhận `refundAmount`, `refundReason`. |
| `MockPaymentRequest` | Nhận `bookingId`, `success`. |

### 10.7 Repository/Service/Controller Mới

| Loại | Tên | Ghi chú |
|---|---|---|
| Repository | `PaymentRepository` | Lookup theo `gatewayOrderId`, `gatewayTxnId`, latest payment theo booking, exists success, `JpaSpecificationExecutor`. |
| Service | `VnpayGatewayService` | Tạo payment URL, verify signature, parse amount, check success code. |
| Service | `PaymentService` | Xử lý business payment end-to-end. |
| Controller | `PaymentController` | VNPay create/callback/IPN, booking payment status, mock payment. |
| Controller | `AdminPaymentController` | Admin list/detail/refund. |

### 10.8 API Mới

| Method | Endpoint | Quyền | Chức năng | Payload/query chính |
|---|---|---|---|---|
| POST | `/api/payments/vnpay/create` | Authenticated | Tạo payment attempt và URL thanh toán VNPay | `bookingId`, `returnUrl` optional |
| GET | `/api/payments/vnpay/callback` | Public | Callback redirect UX sau khi người dùng quay về từ VNPay | VNPay query params |
| POST | `/api/payments/vnpay/ipn` | Public | IPN xác nhận cuối cùng từ VNPay | VNPay params |
| GET | `/api/payments/vnpay/ipn` | Public | Hỗ trợ sandbox gọi IPN bằng GET | VNPay query params |
| GET | `/api/bookings/{id}/payment` | Authenticated | Lấy trạng thái payment mới nhất của booking | `id` |
| GET | `/api/admin/payments` | Admin | Danh sách payment có filter/paging | `status`, `method`, `bookingCode`, `dateFrom`, `dateTo`, `page`, `size`, `sortBy`, `sortDir` |
| GET | `/api/admin/payments/{id}` | Admin | Xem chi tiết payment | `id` |
| POST | `/api/admin/payments/{id}/refund` | Admin | Refund skeleton an toàn | `refundAmount`, `refundReason` |
| POST | `/api/payments/mock/complete` | Authenticated | Hoàn tất mock payment local/dev | `bookingId`, `success` |

### 10.9 API Cũ Đã Chỉnh Sửa

| API/Thành phần | Thay đổi |
|---|---|
| `Booking` entity | Thêm `paymentStatus` mặc định `UNPAID`. |
| `BookingResponse` | Field `paymentStatus` trước đây trả `null`, nay trả trạng thái thực tế dạng string. |
| Booking create flow | Set `paymentStatus=UNPAID` khi tạo booking. |
| `SecurityConfig` | Public permit cho VNPay callback/IPN, không đổi rule `/api/public/**`, `/api/auth/**`, `/api/admin/**`. |
| Config VNPay local | Bỏ secret hardcode, chuyển sang env placeholder. |

### 10.10 Config Env Cần Thêm

| Key | Ghi chú |
|---|---|
| `PAYMENT_MOCK_ENABLED` | Bật mock payment bằng config, default `false`; profile `local/dev` vẫn được cho phép. |
| `VNPAY_ENABLED` | Bật VNPay create payment URL. |
| `VNPAY_TMN_CODE` | Merchant terminal code. |
| `VNPAY_HASH_SECRET` | Secret ký HMAC-SHA512, không log, không commit. |
| `VNPAY_PAY_URL` | URL cổng thanh toán VNPay. |
| `VNPAY_RETURN_URL` | URL frontend nhận redirect callback. |
| `VNPAY_IPN_URL` | URL backend nhận IPN. |
| `VNPAY_API_URL` | Dành cho refund/query production sau này. |
| `VNPAY_REFUND_ENABLED` | Bật refund online/skeleton production. Default `false`. |

Nếu VNPay chưa đủ cấu hình, API create trả lỗi rõ: `VNPay chưa được cấu hình.`

### 10.11 Business Rule Đã Implement

- Không tạo payment nếu booking đã `PAID` hoặc đã có payment `SUCCESS`.
- Không thanh toán booking `CANCELLED` hoặc `COMPLETED`.
- Booking phải thuộc user hiện tại khi tạo payment/mock; admin có thể xem payment status qua endpoint query chi tiết nếu có quyền admin.
- Nếu có payment `PENDING` trong 15 phút gần nhất thì reuse attempt đó.
- Nếu payment `PENDING` quá 15 phút thì mark `FAILED` và tạo attempt mới.
- Khi tạo payment `PENDING`, set `booking.paymentStatus = PENDING`.
- Callback VNPay chỉ redirect UX, không xác nhận thanh toán cuối cùng.
- IPN là nguồn xác nhận cuối cùng để cập nhật DB.
- Verify chữ ký callback/IPN bằng HMAC-SHA512, sort params alphabetically, bỏ `vnp_SecureHash` và `vnp_SecureHashType` trước khi ký.
- IPN idempotent: payment đã `SUCCESS`, `FAILED` hoặc `REFUNDED` thì không update ngược, trả `RspCode=00` khi đã xử lý/ghi nhận trước đó.
- IPN success set `payment.status=SUCCESS`, `gatewayTxnId`, `paidAt`, `booking.paymentStatus=PAID`.
- IPN success chỉ đổi `booking.status` từ `PENDING` sang `CONFIRMED`; không tự đổi booking `COMPLETED` hoặc `CANCELLED`.
- IPN failed set `payment.status=FAILED`, `booking.paymentStatus=FAILED` nếu booking chưa `PAID`.
- Refund skeleton chỉ cho payment `SUCCESS`, `refundAmount > 0` và `<= payment.amount`.
- Refund set `payment.status=REFUNDED`, lưu refund fields, set `booking.paymentStatus=REFUNDED`.
- Mock payment chỉ bật nếu `payment.mock-enabled=true` hoặc profile `local/dev`.

### 10.12 Validation/Error Message Quan Trọng

- `Booking không tồn tại.`
- `Bạn không có quyền thanh toán booking này.`
- `Booking đã được thanh toán.`
- `Booking đã bị hủy, không thể thanh toán.`
- `Số tiền thanh toán không hợp lệ.`
- `VNPay chưa được cấu hình.`
- `Chữ ký VNPay không hợp lệ.` dùng ở error code; IPN trả `RspCode=97`.
- `Không tìm thấy giao dịch thanh toán.`
- `Không thể hoàn tiền giao dịch chưa thành công.`
- `Số tiền hoàn không hợp lệ.`
- `Mock payment chỉ được bật ở môi trường local/dev.`

### 10.13 Luồng VNPay

Create payment URL:

1. User gọi `POST /api/payments/vnpay/create` với `bookingId`.
2. Backend kiểm tra owner, booking chưa hủy/hoàn thành, chưa paid, `totalAmount > 0`.
3. Backend tạo hoặc reuse payment `PENDING` trong 15 phút.
4. Backend set `booking.paymentStatus=PENDING`.
5. `VnpayGatewayService` build params, ký HMAC-SHA512 và trả `paymentUrl`.

Callback:

1. VNPay redirect browser về `/api/payments/vnpay/callback`.
2. Backend verify signature và tìm payment theo `vnp_TxnRef`.
3. Backend lưu raw params nếu tìm thấy payment.
4. Backend redirect về `vnpay.return-url` với `status=success|failed|invalid|not_found` và `bookingCode` nếu có.
5. Callback không xác nhận paid cuối cùng.

IPN:

1. VNPay gọi `/api/payments/vnpay/ipn` bằng POST hoặc GET.
2. Backend verify signature.
3. Backend tìm payment theo `vnp_TxnRef`.
4. Backend kiểm tra amount `vnp_Amount / 100 == payment.amount`.
5. Backend xử lý idempotent theo payment status hiện tại.
6. Nếu success code `00/00`, backend set payment success và booking paid, booking `PENDING -> CONFIRMED`.
7. Nếu fail, backend set payment failed và booking payment failed nếu chưa paid.
8. Backend trả JSON VNPay dạng `{ "RspCode": "00", "Message": "Confirm Success" }` khi đã nhận và xử lý hợp lệ.

### 10.14 Checklist Test Thủ Công

1. Tạo booking `PENDING` có `totalAmount > 0`.
2. Gọi `POST /api/payments/vnpay/create` và nhận `paymentUrl`.
3. Kiểm tra `booking.paymentStatus` chuyển `PENDING`.
4. Gọi lại create payment trong 15 phút và xác nhận reuse attempt, không tạo loạn payment mới.
5. Giả lập callback sai signature và kiểm tra redirect `status=invalid`.
6. Giả lập IPN sai signature và kiểm tra `{RspCode:97}`.
7. Giả lập IPN order không tồn tại và kiểm tra `{RspCode:01}`.
8. Giả lập IPN amount sai và kiểm tra `{RspCode:04}`.
9. Giả lập IPN success và kiểm tra payment `SUCCESS`, booking paymentStatus `PAID`, booking status `PENDING -> CONFIRMED`.
10. Gọi lại IPN success lần 2 và kiểm tra idempotent, không duplicate/update sai.
11. Giả lập IPN failed và kiểm tra payment `FAILED`, booking paymentStatus `FAILED` nếu chưa paid.
12. Gọi `GET /api/bookings/{id}/payment` và kiểm tra latest payment status.
13. User A không xem được payment booking của User B.
14. Admin gọi `GET /api/admin/payments` với filter `status/method/bookingCode/date`.
15. Admin gọi `GET /api/admin/payments/{id}` và thấy `gatewayResponse`.
16. Admin refund payment `SUCCESS`: local/dev cho skeleton refund; production chưa bật trả lỗi `Refund online chưa được cấu hình.`.
17. Gọi `POST /api/payments/mock/complete` ở local/dev với `success=true` và kiểm tra booking `CONFIRMED + PAID`.
18. Gọi `POST /api/payments/mock/complete` ở local/dev với `success=false` và kiểm tra payment/booking payment `FAILED`.

### 10.15 Kết Quả Compile/Light Check

Đã chạy:

```bash
.\mvnw.cmd -DskipTests compile
```

Kết quả: `BUILD SUCCESS`.

### 10.16 TODO Còn Lại

- Tích hợp VNPay refund API thật cho production.
- Payment timeout scheduler để tự fail payment pending quá hạn.
- Notification/WebSocket event khi payment success/failed.
- Receipt/email invoice sau thanh toán nếu cần.
- Đối soát giao dịch và query transaction nếu làm production.
- Event hook sau payment success/failed để module notification hoặc analytics dùng lại.
## 11. Cập Nhật 03/06/2026 — Phase 4: Promotions / Mã Giảm Giá

### 11.1 Mục Tiêu Phase

Triển khai module Promotions/Mã giảm giá cho VoyageViet, gồm admin CRUD promotion, bật/tắt/xóa an toàn, user validate mã trước khi đặt booking, tích hợp `promoCode` vào booking create flow, lưu usage và tăng `usedCount` trong cùng transaction với booking.

Không làm notification/WebSocket, không làm lại Payment/VNPay, không làm frontend và không hardcode mã giảm giá.

### 11.2 File Đã Thêm

| File | Nội dung |
|---|---|
| `src/main/java/com/voyageviet/backend/promotion/entity/Promotion.java` | Entity/table `PROMOTIONS`. |
| `src/main/java/com/voyageviet/backend/promotion/entity/PromotionUsage.java` | Entity/table `PROMOTION_USAGES`. |
| `src/main/java/com/voyageviet/backend/promotion/entity/PromotionDiscountType.java` | Enum loại giảm giá `PERCENT/FIXED`. |
| `src/main/java/com/voyageviet/backend/promotion/entity/PromotionStatus.java` | Enum trạng thái promotion. |
| `src/main/java/com/voyageviet/backend/promotion/repository/PromotionRepository.java` | Repository promotion, có Specification. |
| `src/main/java/com/voyageviet/backend/promotion/repository/PromotionUsageRepository.java` | Repository promotion usage. |
| `src/main/java/com/voyageviet/backend/promotion/service/PromotionService.java` | Validate promo, tính discount, admin CRUD, ghi usage. |
| `src/main/java/com/voyageviet/backend/promotion/controller/PromotionController.java` | User validate promo endpoint. |
| `src/main/java/com/voyageviet/backend/promotion/controller/AdminPromotionController.java` | Admin promotion endpoints. |
| `src/main/java/com/voyageviet/backend/promotion/dto/ValidatePromoRequest.java` | Request preview mã giảm giá. |
| `src/main/java/com/voyageviet/backend/promotion/dto/ValidatePromoResponse.java` | Response preview mã giảm giá. |
| `src/main/java/com/voyageviet/backend/promotion/dto/AdminPromotionCreateRequest.java` | Request tạo promotion. |
| `src/main/java/com/voyageviet/backend/promotion/dto/AdminPromotionUpdateRequest.java` | Request cập nhật promotion, không nhận code. |
| `src/main/java/com/voyageviet/backend/promotion/dto/PromotionStatusRequest.java` | Request bật/tắt promotion. |
| `src/main/java/com/voyageviet/backend/promotion/dto/PromotionResponse.java` | Response promotion admin. |

### 11.3 File Đã Sửa

| File | Nội dung sửa |
|---|---|
| `src/main/java/com/voyageviet/backend/booking/entity/Booking.java` | Thêm `promotion`, `promoCodeSnapshot`, `originalAmount`, `discountAmount`; `totalAmount` là số tiền cuối sau giảm. |
| `src/main/java/com/voyageviet/backend/booking/dto/BookingCreateRequest.java` | Thêm optional `promoCode`. |
| `src/main/java/com/voyageviet/backend/booking/dto/BookingResponse.java` | Thêm `originalAmount`, `discountAmount`, `promoCode`; giữ `totalAmount` và `paymentStatus`. |
| `src/main/java/com/voyageviet/backend/booking/service/BookingService.java` | Tích hợp validate/apply promotion trong create booking, ghi usage sau khi booking persist. |
| `src/main/java/com/voyageviet/backend/common/exception/ErrorCode.java` | Thêm error code promotion. |
| `BACKEND_API_REPORT.md` | Cập nhật Phase 4 Promotions/Mã giảm giá. |

Không xóa file nào.

### 11.4 Entity/Table Mới

| Bảng | Entity | Ghi chú |
|---|---|---|
| `PROMOTIONS` | `Promotion` | Lưu thông tin mã giảm giá/campaign. `CODE` luôn uppercase và unique. `APPLICABLE_TOUR_IDS` lưu JSON array tour id; null nghĩa là áp dụng tất cả tour. |
| `PROMOTION_USAGES` | `PromotionUsage` | Lưu mỗi lần user dùng promotion cho booking. Có unique `(PROMOTION_ID, BOOKING_ID)` để một booking không ghi trùng usage. |

### 11.5 Enum Mới

| Enum | Giá trị |
|---|---|
| `PromotionDiscountType` | `PERCENT`, `FIXED` |
| `PromotionStatus` | `ACTIVE`, `INACTIVE`, `EXPIRED` |

Không bổ sung `AuditAction` mới trong phase này.

### 11.6 DTO Mới

| DTO | Mục đích |
|---|---|
| `ValidatePromoRequest` | Nhận `code`, `bookingTotal`, `tourId` để preview promotion. |
| `ValidatePromoResponse` | Trả `valid`, `code`, `discountAmount`, `finalAmount`, `message`. |
| `AdminPromotionCreateRequest` | Tạo promotion, có `applicableTourIds` dạng list. |
| `AdminPromotionUpdateRequest` | Cập nhật promotion, không cho sửa `code`. |
| `PromotionStatusRequest` | Cập nhật status `ACTIVE/INACTIVE`. |
| `PromotionResponse` | Response promotion cho admin, trả `applicableTourIds` dạng list. |

### 11.7 Repository/Service/Controller Mới

| Loại | Tên | Ghi chú |
|---|---|---|
| Repository | `PromotionRepository` | `findByCode`, `existsByCode`, `existsByCodeAndIdNot`, `findAll(Specification, Pageable)`. |
| Repository | `PromotionUsageRepository` | Count usage theo promotion/user, check usage theo booking, check promotion đã dùng. |
| Service | `PromotionService` | Validate promotion by code/status/time/minOrder/maxUses/maxUsesPerUser/applicableTourIds, tính discount, admin CRUD, record usage. |
| Controller | `PromotionController` | User validate promo. |
| Controller | `AdminPromotionController` | Admin CRUD/status/delete promotion. |

### 11.8 API Mới

| Method | Endpoint | Quyền | Chức năng | Payload/query chính |
|---|---|---|---|---|
| POST | `/api/bookings/validate-promo` | Authenticated | Preview/validate mã giảm giá trước khi đặt booking | `code`, `bookingTotal`, `tourId` |
| GET | `/api/admin/promotions` | Admin | Danh sách promotion có filter và paging | `status`, `code`, `dateFrom`, `dateTo`, `page`, `size`, `sortBy`, `sortDir` |
| POST | `/api/admin/promotions` | Admin | Tạo promotion | `code`, `name`, `description`, `discountType`, `discountValue`, `maxDiscount`, `minOrder`, `maxUses`, `maxUsesPerUser`, `validFrom`, `validUntil`, `status`, `applicableTourIds` |
| PUT | `/api/admin/promotions/{id}` | Admin | Cập nhật promotion, không sửa code | Các field giống create trừ `code` |
| PATCH | `/api/admin/promotions/{id}/status` | Admin | Bật/tắt promotion | `status` |
| DELETE | `/api/admin/promotions/{id}` | Admin | Xóa promotion an toàn | `id` |

### 11.9 API Cũ Đã Chỉnh Sửa

| API/Thành phần | Thay đổi |
|---|---|
| `POST /api/bookings` | Request nhận thêm optional `promoCode`. Nếu có promo hợp lệ, booking lưu promotion và amount sau giảm. |
| `Booking` entity | Thêm `promotion`, `promoCodeSnapshot`, `originalAmount`, `discountAmount`; `totalAmount` vẫn là số dùng để thanh toán. |
| `BookingResponse` | Thêm `originalAmount`, `discountAmount`, `promoCode`, giữ các field cũ. |
| Payment flow | Không đổi code payment; payment vẫn lấy `booking.totalAmount`, nên amount VNPay/mock là số cuối sau giảm. |
| Security | Không đổi SecurityConfig; `/api/bookings/validate-promo` rơi vào authenticated, `/api/admin/promotions/**` rơi vào admin. VNPay callback/IPN public rule vẫn giữ nguyên. |

### 11.10 Business Rule Đã Implement

- Code promotion luôn normalize `trim + uppercase` trước khi lưu/validate.
- Code unique qua `UK_PROMOTIONS_CODE` và service check `existsByCode`.
- `discountValue > 0`.
- `PERCENT` yêu cầu `discountValue <= 100`.
- `validUntil > validFrom`.
- `minOrder` default `0`.
- `maxUses = null` nghĩa là không giới hạn tổng lượt dùng.
- `maxUsesPerUser` default `1`.
- `applicableTourIds = null` hoặc list rỗng nghĩa là áp dụng tất cả tour.
- Validate promo kiểm tra code tồn tại, status, thời gian hiệu lực, minOrder, maxUses, maxUsesPerUser và applicable tour.
- FIXED discount: `min(discountValue, bookingTotal)`.
- PERCENT discount: `bookingTotal * discountValue / 100`, áp dụng `maxDiscount` nếu có.
- `finalAmount = max(bookingTotal - discountAmount, 0)`.
- Endpoint validate promo chỉ preview, không tạo usage, không tăng `usedCount`, không sửa booking.
- Booking create không tin `bookingTotal` frontend; tự tính `originalAmount` từ schedule price rồi validate lại promo.
- Booking có promo lưu `promotion`, `promoCodeSnapshot`, `originalAmount`, `discountAmount`, `totalAmount = finalAmount`.
- `PromotionUsage` được tạo sau khi booking persist thành công và cùng transaction với booking/schedule.
- `promotion.usedCount` chỉ tăng khi booking tạo thành công.
- Nếu booking/schedule/promotion usage lỗi thì transaction rollback.
- Không xóa promotion đã có usage hoặc `usedCount > 0`; chỉ nên chuyển `INACTIVE`.
- Không cho chỉnh các field ảnh hưởng tính tiền nếu promotion đã dùng: `discountType`, `discountValue`, `maxDiscount`, `minOrder`, `applicableTourIds`, `validFrom`, `validUntil`.
- Admin status update chỉ cho `ACTIVE` hoặc `INACTIVE`; không cho set `EXPIRED` thủ công qua endpoint status.
- Không thể kích hoạt promotion đã hết hạn.

### 11.11 Validation/Error Message Quan Trọng

- `Mã giảm giá không tồn tại.`
- `Mã giảm giá chưa được kích hoạt.`
- `Mã giảm giá đã hết hạn.`
- `Mã giảm giá chưa đến thời gian sử dụng.`
- `Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã.`
- `Mã giảm giá đã hết lượt sử dụng.`
- `Bạn đã sử dụng mã giảm giá này quá số lần cho phép.`
- `Mã giảm giá không áp dụng cho tour này.`
- `Giá trị giảm giá không hợp lệ.`
- `Mã giảm giá đã được sử dụng, không thể chỉnh sửa cấu hình giảm giá.`
- `Không thể xóa mã giảm giá đã được sử dụng.`
- `Không thể kích hoạt mã giảm giá đã hết hạn.`

### 11.12 Checklist Test Thủ Công

1. Admin tạo promotion `FIXED` giảm 500k, `minOrder` 2 triệu.
2. Admin tạo promotion `PERCENT` 30%, `maxDiscount` 500k.
3. Tạo promotion trùng code và kiểm tra lỗi.
4. Tạo promotion `PERCENT` với `discountValue > 100` và kiểm tra lỗi.
5. Tạo promotion `validUntil <= validFrom` và kiểm tra lỗi.
6. User validate mã không tồn tại, response `valid=false`.
7. User validate mã inactive, response `valid=false`.
8. User validate mã expired, response `valid=false`.
9. User validate mã chưa tới `validFrom`, response `valid=false`.
10. User validate mã với `bookingTotal < minOrder`, response `valid=false`.
11. User validate mã không áp dụng cho tour, response `valid=false`.
12. User validate mã hợp lệ và kiểm tra `discountAmount`, `finalAmount` đúng.
13. User tạo booking có `promoCode` hợp lệ: `originalAmount`, `discountAmount`, `totalAmount`, `promoCode` đúng; `usedCount` tăng 1; `promotion_usage` được tạo.
14. User dùng lại mã vượt `maxUsesPerUser` và kiểm tra lỗi.
15. Khi promotion hết `maxUses`, validate/create booking lỗi.
16. Admin update promotion chưa dùng thành công.
17. Admin update discount của promotion đã dùng và kiểm tra lỗi.
18. Admin set status `INACTIVE`, validate không dùng được.
19. Admin delete promotion chưa dùng thành công.
20. Admin delete promotion đã dùng lỗi, chỉ cho inactive.
21. Payment create sau booking có promotion lấy amount sau giảm từ `booking.totalAmount`.
22. Compile/light check pass.

### 11.13 Kết Quả Compile/Light Check

Đã chạy:

```bash
.\mvnw.cmd -DskipTests compile
```

Kết quả: `BUILD SUCCESS`.

### 11.14 TODO Còn Lại

- Promotion analytics nếu cần.
- Coupon campaign UI admin frontend.
- Public promo banner nếu cần.
- Rule điều chỉnh refund/payment khi booking dùng promotion nếu sau này hoàn tiền.
- Audit log chi tiết cho promotion create/update/status/delete nếu cần.

## 12. Cập Nhật 04/06/2026 — Phase 5: Notifications / Thông Báo In-App

### 12.1 Mục Tiêu Phase

Triển khai module Notifications/Thông báo in-app cho VoyageViet, gồm lưu notification trong DB, API user quản lý thông báo, unread count, mark read/read-all/delete, cấu hình WebSocket STOMP cơ bản để server push realtime và tích hợp event hook nhẹ từ Booking/Payment/Review.

Không làm frontend, không làm support chat, không làm email/push mobile/browser notification và không thay đổi flow Payment/Promotion/Booking hiện có ngoài việc gọi hook notification an toàn.

### 12.2 File Đã Thêm

| File | Nội dung |
|---|---|
| `src/main/java/com/voyageviet/backend/notification/entity/Notification.java` | Entity/table `NOTIFICATIONS`, lưu thông báo theo user. |
| `src/main/java/com/voyageviet/backend/notification/entity/NotificationType.java` | Enum loại thông báo. |
| `src/main/java/com/voyageviet/backend/notification/dto/NotificationResponse.java` | DTO response notification cho user/API/WebSocket payload. |
| `src/main/java/com/voyageviet/backend/notification/dto/UnreadCountResponse.java` | DTO response unread count. |
| `src/main/java/com/voyageviet/backend/notification/repository/NotificationRepository.java` | Repository query notification theo user/read state, count unread, bulk mark-all-read. |
| `src/main/java/com/voyageviet/backend/notification/service/NotificationService.java` | Service notification API, tạo notification nội bộ, serialize/parse JSON data, push realtime. |
| `src/main/java/com/voyageviet/backend/notification/service/NotificationEventPublisher.java` | Wrapper event hook cho Booking/Payment/Review, catch lỗi notification để không rollback nghiệp vụ chính. |
| `src/main/java/com/voyageviet/backend/notification/controller/NotificationController.java` | User notification APIs tại `/api/notifications`. |
| `src/main/java/com/voyageviet/backend/common/config/WebSocketConfig.java` | STOMP WebSocket config endpoint `/ws`, broker `/topic`, `/queue`. |

Không xóa file nào.

### 12.3 File Đã Sửa

| File | Nội dung sửa |
|---|---|
| `pom.xml` | Thêm dependency `spring-boot-starter-websocket`. |
| `src/main/java/com/voyageviet/backend/common/config/SecurityConfig.java` | Permit `/ws/**` handshake, giữ nguyên rule API cũ. |
| `src/main/java/com/voyageviet/backend/common/exception/ErrorCode.java` | Thêm `NOTIFICATION_NOT_FOUND`, `NOTIFICATION_FORBIDDEN`. |
| `src/main/java/com/voyageviet/backend/booking/service/BookingService.java` | Tạo notification khi booking created, user/admin cancelled, admin confirmed. |
| `src/main/java/com/voyageviet/backend/payment/service/PaymentService.java` | Tạo notification khi VNPay IPN/mock success/failed và refund skeleton thành công. |
| `src/main/java/com/voyageviet/backend/review/service/ReviewService.java` | Tạo notification khi admin đổi review sang `ACTIVE` hoặc `HIDDEN`. |
| `BACKEND_API_REPORT.md` | Cập nhật Phase 5 Notifications/Thông báo in-app. |

### 12.4 Entity/Table Mới

| Bảng | Entity | Cột/chỉ mục chính |
|---|---|---|
| `NOTIFICATIONS` | `Notification` | `ID`, `USER_ID`, `TYPE`, `TITLE`, `BODY`, `DATA` CLOB JSON, `IS_READ`, `READ_AT`, `CREATED_AT`, `UPDATED_AT`; index `IDX_NOTIFICATIONS_USER_READ_CREATED (USER_ID, IS_READ, CREATED_AT)`, `IDX_NOTIFICATIONS_USER_CREATED (USER_ID, CREATED_AT)`. |

Ghi chú Oracle/local: project đang dùng `spring.jpa.hibernate.ddl-auto=update`, nên entity JPA đủ cho local. `IS_READ` dùng Boolean JPA mapping, `DATA` dùng `@Lob` text/CLOB.

### 12.5 Enum Mới

| Enum | Giá trị |
|---|---|
| `NotificationType` | `BOOKING_CREATED`, `BOOKING_CONFIRMED`, `BOOKING_CANCELLED`, `PAYMENT_SUCCESS`, `PAYMENT_FAILED`, `PAYMENT_REFUNDED`, `REVIEW_APPROVED`, `REVIEW_REJECTED`, `SYSTEM` |

Review hiện dùng `ReviewStatus.ACTIVE/HIDDEN`, phase này map `ACTIVE -> REVIEW_APPROVED`, `HIDDEN -> REVIEW_REJECTED`.

### 12.6 DTO Mới

| DTO | Mục đích |
|---|---|
| `NotificationResponse` | Trả `id`, `type`, `title`, `body`, `data`, `read`, `readAt`, `createdAt`. `data` parse từ JSON string sang object nếu hợp lệ. |
| `UnreadCountResponse` | Trả `{ count }`. |

Không expose public create-notification request DTO trong phase này; notification được tạo qua service nội bộ.

### 12.7 Repository/Service/Controller Mới

| Loại | Tên | Ghi chú |
|---|---|---|
| Repository | `NotificationRepository` | `findByUserId`, `findByUserIdAndIsRead`, `countByUserIdAndIsReadFalse`, `findByIdAndUserId`, `markAllReadByUserId`. |
| Service | `NotificationService` | Query notification, unread count, mark read/read-all/delete, create notification, JSON helper, realtime push. |
| Service | `NotificationEventPublisher` | Hook nghiệp vụ booking/payment/review, catch/log lỗi notification. |
| Controller | `NotificationController` | 5 API notification cho authenticated user. |
| Config | `WebSocketConfig` | STOMP endpoint `/ws`, broker `/topic` và `/queue`, application prefix `/app`, user prefix `/user`. |

### 12.8 API Mới

| Method | Endpoint | Quyền | Chức năng | Payload/query chính |
|---|---|---|---|---|
| GET | `/api/notifications` | Authenticated | Lấy danh sách notification của user hiện tại, có filter read state và paging | `isRead=true/false/all`, `page`, `size`, `sortBy`, `sortDir`; default `createdAt desc` |
| GET | `/api/notifications/unread-count` | Authenticated | Lấy số notification chưa đọc của user hiện tại | Không |
| PATCH | `/api/notifications/{id}/read` | Authenticated | Đánh dấu một notification đã đọc, idempotent nếu đã đọc | `id` |
| POST | `/api/notifications/read-all` | Authenticated | Đánh dấu toàn bộ notification chưa đọc của user hiện tại là đã đọc bằng bulk update | Không |
| DELETE | `/api/notifications/{id}` | Authenticated | Xóa notification thuộc user hiện tại | `id` |

Response vẫn bọc bằng `ApiResponse` chung: `success`, `message`, `data`, `timestamp`. Paging vẫn dùng `PageResponse` chung.

### 12.9 API/Service Cũ Đã Chỉnh Sửa

| API/Service | Thay đổi |
|---|---|
| `BookingService.createBooking` | Sau khi booking save thành công, tạo notification `BOOKING_CREATED` cho user. |
| `BookingService.cancelMyBooking` | Sau khi user hủy booking thành công, tạo notification `BOOKING_CANCELLED`. |
| `BookingService.updateBookingStatus` | Khi admin đổi status sang `CONFIRMED`, tạo `BOOKING_CONFIRMED`; khi đổi sang `CANCELLED`, tạo `BOOKING_CANCELLED`. |
| `PaymentService.handleVnpayIpn` | Sau IPN final save, tạo `PAYMENT_SUCCESS` hoặc `PAYMENT_FAILED`. Callback VNPay vẫn không tạo notification vì chỉ là redirect UX. |
| `PaymentService.completeMockPayment` | Sau mock payment save, tạo `PAYMENT_SUCCESS` hoặc `PAYMENT_FAILED`. |
| `PaymentService.refund` | Sau refund skeleton save, tạo `PAYMENT_REFUNDED`. |
| `ReviewService.updateReviewStatus` | Khi status thay đổi sang `ACTIVE`, tạo `REVIEW_APPROVED`; sang `HIDDEN`, tạo `REVIEW_REJECTED`. |
| `SecurityConfig` | Permit `/ws/**` cho WebSocket/SockJS handshake; không đổi `/api/admin/**`, `/api/public/**`, `/api/auth/**`, VNPay callback/IPN. |

### 12.10 WebSocket Realtime

- Đã thêm `spring-boot-starter-websocket`.
- Đã thêm `WebSocketConfig` với endpoint `/ws`, allowed origin `http://localhost:4200`, bật SockJS.
- Simple broker bật `/topic`, `/queue`.
- Application destination prefix: `/app`.
- User destination prefix: `/user`.
- Phase này chưa có JWT handshake/channel interceptor cho WebSocket.
- Do HTTP JWT principal hiện là email và chưa có principal mapping ổn định cho STOMP, realtime push hiện dùng fallback `convertAndSend("/topic/users/" + userId + "/notifications", payload)`.
- TODO bảo mật: phase sau thêm JWT handshake/channel interceptor và chuyển sang `convertAndSendToUser(..., "/queue/notifications", payload)` với principal mapping rõ ràng.
- Notification DB là nguồn chính; WebSocket chỉ là kênh realtime phụ. Lỗi push được log warning và không làm fail nghiệp vụ chính.

### 12.11 Business Rule Đã Implement

- User chỉ xem/sửa/xóa notification của chính mình.
- `unread-count` tính theo user hiện tại.
- `GET /api/notifications` hỗ trợ `isRead=true`, `isRead=false`, `isRead=all` hoặc bỏ trống để lấy tất cả.
- Sort mặc định `createdAt DESC`; chỉ cho sort theo `createdAt`, `updatedAt`, `id`, `type`, `isRead`, `readAt`.
- `markAsRead` idempotent: nếu đã đọc thì trả response hiện tại, không lỗi.
- `read-all` dùng bulk update các notification chưa đọc của user hiện tại và trả số bản ghi đã update.
- `delete` kiểm tra ownership; notification không tồn tại trả 404, notification của user khác trả 403.
- `NotificationService.toJson(Map<String,Object>)` dùng `ObjectMapper`, không nối chuỗi JSON thủ công.
- Nếu serialize `data` lỗi, log warning và lưu `data = null`, không fail nghiệp vụ chính.
- `NotificationEventPublisher` catch `RuntimeException` khi tạo notification từ Booking/Payment/Review để không rollback flow chính.
- WebSocket push failure không làm rollback transaction notification hoặc transaction nghiệp vụ.

### 12.12 Validation/Error Message Quan Trọng

- `Thông báo không tồn tại.`
- `Bạn không có quyền xem thông báo này.`
- `Đánh dấu thông báo đã đọc thành công.`
- `Đánh dấu tất cả thông báo đã đọc thành công.`
- `Xóa thông báo thành công.`
- `Không thể gửi thông báo realtime, đã lưu thông báo vào hệ thống.` dùng ở log warning khi WebSocket push lỗi.
- `isRead must be true, false or all`
- `Invalid sort field. Allowed fields: createdAt, updatedAt, id, type, isRead, readAt`

### 12.13 Checklist Test Thủ Công

1. User tạo booking thành công -> có notification `BOOKING_CREATED` trong DB.
2. Gọi `GET /api/notifications` -> thấy notification mới nhất.
3. Gọi `GET /api/notifications/unread-count` -> count tăng đúng.
4. Gọi `PATCH /api/notifications/{id}/read` -> notification `read=true`, `readAt` có giá trị.
5. Gọi unread-count sau mark read -> count giảm.
6. Tạo nhiều notification chưa đọc -> `POST /api/notifications/read-all` -> tất cả `read=true`.
7. `DELETE /api/notifications/{id}` -> notification biến mất khỏi list user hiện tại.
8. User A không đọc/xóa được notification của User B.
9. Admin confirm booking -> user nhận `BOOKING_CONFIRMED`.
10. User hoặc admin cancel booking -> user nhận `BOOKING_CANCELLED`.
11. Mock payment success hoặc VNPay IPN success -> user nhận `PAYMENT_SUCCESS`.
12. Payment failed -> user nhận `PAYMENT_FAILED`.
13. Refund skeleton -> user nhận `PAYMENT_REFUNDED`.
14. Admin đổi review sang `ACTIVE/HIDDEN` -> user nhận `REVIEW_APPROVED/REVIEW_REJECTED`.
15. Nếu WebSocket được bật: client subscribe `/topic/users/{userId}/notifications` và nhận payload realtime khi tạo notification.
16. Nếu WebSocket push lỗi: nghiệp vụ booking/payment/review vẫn thành công, DB notification vẫn được lưu nếu create notification không lỗi.
17. Compile/light check pass.

### 12.14 Kết Quả Compile/Light Check

Đã chạy:

```bash
.\mvnw.cmd -DskipTests compile
```

Kết quả: `BUILD SUCCESS` lúc `2026-06-04T08:56:31+07:00`.

### 12.15 TODO Còn Lại

- JWT auth cho WebSocket handshake/channel interceptor.
- Chuyển realtime push sang `convertAndSendToUser(..., "/queue/notifications", payload)` sau khi principal mapping WebSocket rõ ràng.
- Notification frontend bell/dropdown và unread badge.
- Notification settings per user nếu cần.
- Email/SMS notification nếu cần.
- Cleanup/retention policy cho notification cũ.
- Support chat WebSocket tách phase sau.

## 13. Cập Nhật 04/06/2026 — Phase 6: Booking/Admin Hardening

### 13.1 Mục Tiêu Phase

Triển khai hardening cho Booking/Admin gồm admin booking detail, nhân bản tour sang bản nháp, scheduler tự hủy booking PENDING quá hạn, fail payment pending quá hạn, release ghế schedule, sửa security `/api/users/**` và bổ sung SMTP email thật cho forgot/reset/verify email.

Không làm frontend, không làm support chat, không làm VNPay refund thật, không làm WebSocket JWT handshake và không đổi response format chung.

### 13.2 File Đã Thêm

| File | Nội dung |
|---|---|
| `src/main/java/com/voyageviet/backend/booking/dto/AdminBookingDetailResponse.java` | DTO detail booking cho admin, gồm user/tour/schedule/contact/amount/promotion/payment mới nhất. |
| `src/main/java/com/voyageviet/backend/booking/config/BookingExpiryProperties.java` | Bind config `booking.expiry.*`. |
| `src/main/java/com/voyageviet/backend/booking/service/BookingExpiryService.java` | Xử lý expire từng booking trong transaction riêng: cancel booking, release ghế, fail payment pending, tạo notification. |
| `src/main/java/com/voyageviet/backend/booking/service/BookingExpiryScheduler.java` | Job scheduled scan booking PENDING quá hạn theo fixed rate và batch-size. |

Không xóa file nào.

### 13.3 File Đã Sửa

| File | Nội dung sửa |
|---|---|
| `pom.xml` | Thêm `spring-boot-starter-mail`. |
| `src/main/java/com/voyageviet/backend/VoyageBackendApplication.java` | Bật `@EnableScheduling`. |
| `src/main/java/com/voyageviet/backend/booking/controller/AdminBookingController.java` | Thêm `GET /api/admin/bookings/{id}`. |
| `src/main/java/com/voyageviet/backend/booking/service/BookingService.java` | Thêm `getAdminBookingDetail`, map detail admin, inject `PaymentRepository`. |
| `src/main/java/com/voyageviet/backend/booking/repository/BookingRepository.java` | Thêm `findWithAdminDetailById`, `findExpiredPendingBookingIds`. |
| `src/main/java/com/voyageviet/backend/tour/controller/AdminTourController.java` | Thêm `POST /api/admin/tours/{id}/duplicate`. |
| `src/main/java/com/voyageviet/backend/tour/service/TourService.java` | Thêm duplicate tour sang DRAFT, copy itinerary/images, generate slug unique. |
| `src/main/java/com/voyageviet/backend/notification/service/NotificationEventPublisher.java` | Thêm `bookingExpired` notification. |
| `src/main/java/com/voyageviet/backend/common/config/SecurityConfig.java` | Đổi matcher từ `/api/users/me` sang `/api/users/**` yêu cầu role `USER`. |
| `src/main/java/com/voyageviet/backend/auth/service/LoggingEmailService.java` | Refactor để gửi email thật qua `JavaMailSender` khi enabled, fallback/log link khi mail disabled hoặc local/dev. |
| `src/main/resources/application.properties` | Thêm config booking expiry và mail/frontend base URL. |
| `src/main/resources/application-local.properties` | Thêm config booking expiry và mail/frontend base URL cho local. |
| `BACKEND_API_REPORT.md` | Cập nhật Phase 6 Booking/Admin Hardening. |

### 13.4 DTO Mới

| DTO | Mục đích |
|---|---|
| `AdminBookingDetailResponse` | Response detail booking cho admin: booking status/payment status, user info, tour/category/destination, schedule, passenger counts, price snapshots, contact/note, promotion info, latest payment summary. |

Không tạo `TourDuplicateRequest` trong phase này. Endpoint duplicate không nhận body và dùng default: copy itinerary/images, không copy schedules.

### 13.5 Repository/Service/Controller Đã Thêm/Sửa

| Loại | Tên | Ghi chú |
|---|---|---|
| Controller | `AdminBookingController` | Thêm detail endpoint. |
| Service | `BookingService` | Thêm `getAdminBookingDetail`. |
| Repository | `BookingRepository` | Thêm fetch graph cho detail và query id booking quá hạn. |
| Controller | `AdminTourController` | Thêm duplicate endpoint. |
| Service | `TourService` | Thêm `duplicateTour(Long sourceTourId)`. |
| Service | `BookingExpiryService` | Xử lý expire từng booking. |
| Scheduler | `BookingExpiryScheduler` | Scan booking quá hạn theo config. |
| Service | `LoggingEmailService` / `EmailService` | Gửi SMTP thật khi enabled, log link khi disabled/local. |
| Config | `SecurityConfig` | `/api/users/**` yêu cầu role `USER`. |

### 13.6 API Mới

| Method | Endpoint | Quyền | Chức năng | Payload/query chính |
|---|---|---|---|---|
| GET | `/api/admin/bookings/{id}` | Admin | Admin xem detail booking đầy đủ để mở detail drawer/page | Path `id`; không expose password/token/raw gatewayResponse |
| POST | `/api/admin/tours/{id}/duplicate` | Admin | Nhân bản tour hiện có sang tour mới `DRAFT` | Path `id`; không body; default copy itinerary/images, không copy schedules |

### 13.7 Config Mới

| Key | Default | Ghi chú |
|---|---|---|
| `booking.expiry.enabled` | `true` | Bật/tắt scheduler tự hủy booking quá hạn. |
| `booking.expiry.pending-timeout-minutes` | `30` | Booking `PENDING` quá số phút này sẽ bị expire nếu chưa paid. |
| `booking.expiry.fixed-rate-ms` | `60000` | Chu kỳ scheduler. |
| `booking.expiry.batch-size` | `100` | Số booking tối đa xử lý mỗi lần scan. |
| `app.mail.enabled` | `false` | Bật gửi email thật qua SMTP. |
| `app.mail.from` | `no-reply@voyageviet.local` | From address. |
| `app.frontend.base-url` | `http://localhost:4200` | Base URL để tạo reset/verify link. |
| `spring.mail.host` | `${MAIL_HOST:}` | SMTP host. |
| `spring.mail.port` | `${MAIL_PORT:587}` | SMTP port. |
| `spring.mail.username` | `${MAIL_USERNAME:}` | SMTP username. |
| `spring.mail.password` | `${MAIL_PASSWORD:}` | SMTP password/app password. |
| `spring.mail.properties.mail.smtp.auth` | `true` | SMTP auth. |
| `spring.mail.properties.mail.smtp.starttls.enable` | `true` | STARTTLS. |

Ghi chú SMTP: dùng env/provider SMTP, không hardcode Gmail password. Với Gmail cần dùng App Password.

### 13.8 API/Service Cũ Đã Chỉnh Sửa

| API/Service | Thay đổi |
|---|---|
| `BookingService` | Admin detail mapping; scheduler expire release ghế qua `BookingExpiryService`. |
| `PaymentRepository` | Reuse `findFirstByBookingIdAndStatusOrderByCreatedAtDesc` để fail latest `PENDING` payment khi booking expire. |
| `TourService` | Duplicate tour sang DRAFT, title `old title (Copy)`, slug unique `old-slug-copy`, `old-slug-copy-2`, hoặc timestamp fallback. |
| `SecurityConfig` | `/api/users/**` cần role `USER`; role hierarchy vẫn cho `ADMIN/SUPER_ADMIN` kế thừa. Public/admin/auth/VNPay/ws/swagger rules giữ nguyên thứ tự trước matcher này. |
| `AuthService` / `EmailService` | Forgot password/register verify email gọi service gửi email; service không expose token trong response và không làm fail register/forgot khi SMTP lỗi. |
| `NotificationEventPublisher` | Thêm notification `BOOKING_CANCELLED` với title `Booking đã hết hạn` cho booking expiry. |

### 13.9 Business Rule Đã Implement

- Admin xem detail booking bất kỳ qua `/api/admin/bookings/{id}`.
- Booking không tồn tại trả business error `Booking không tồn tại.`.
- Booking detail không expose password/token/raw `gatewayResponse`; raw payment vẫn xem qua `GET /api/admin/payments/{id}`.
- Tour duplicate luôn tạo tour mới `DRAFT`, `featured=false`.
- Tour duplicate copy category/destination reference và basic tour fields.
- Tour duplicate không copy booking/review/wishlist/payment/promotion usage/audit log.
- Tour duplicate không copy schedules mặc định để tránh mở bán nhầm.
- Tour duplicate copy itinerary trong cùng transaction.
- Tour duplicate copy image metadata. Do `TourImage.publicId` đang `nullable=false`, phase này copy cùng `publicId`; có rủi ro shared Cloudinary publicId nếu xóa ảnh ở tour copy.
- Booking PENDING quá hạn tự chuyển `CANCELLED` nếu `paymentStatus` thuộc `UNPAID/PENDING/FAILED` và không phải `PAID`.
- Scheduler release ghế khỏi `TourSchedule` theo `totalPeople` hoặc `numberOfPeople` fallback.
- Nếu schedule đang `FULL` và còn chỗ sau release thì chuyển về `OPEN`; không reopen `CLOSED/CANCELLED`.
- Latest payment `PENDING` của booking expired được set `FAILED`.
- Booking expired set `booking.paymentStatus=FAILED` để frontend biết hết hạn thanh toán.
- Mỗi booking expire xử lý trong transaction riêng; một lỗi không dừng toàn batch.
- Booking `CONFIRMED/COMPLETED/CANCELLED` không bị scheduler đụng.
- Notification được tạo cho booking expired nếu Notification module hoạt động; lỗi notification vẫn được publisher catch/log.
- `/api/users/**` yêu cầu role `USER`; anonymous vẫn 401, user hợp lệ OK, admin kế thừa qua role hierarchy.
- Nếu `app.mail.enabled=true` và SMTP hoạt động, reset/verify email được gửi thật.
- Nếu `app.mail.enabled=false`, backend log reset/verify link để test local/dev.
- Nếu SMTP lỗi, backend log warning và không leak email tồn tại hay không qua API response.

### 13.10 Validation/Error Message Quan Trọng

- `Booking không tồn tại.`
- `Tour không tồn tại.`
- `Nhân bản tour thành công.`
- `Slug nhân bản bị trùng, vui lòng thử lại.`
- `Booking đã được tự động hủy do quá thời gian thanh toán.`
- Notification expiry: title `Booking đã hết hạn`, body `Booking {bookingCode} đã bị hủy do quá thời gian thanh toán.`
- Forgot password response vẫn là message chung: `Nếu email tồn tại, hệ thống đã gửi hướng dẫn đặt lại mật khẩu.`
- SMTP warning nội bộ: `Gửi email xác thực thất bại, vui lòng kiểm tra cấu hình SMTP.`

### 13.11 Checklist Test Thủ Công

1. Admin gọi `GET /api/admin/bookings/{id}` với booking tồn tại -> trả đủ user/tour/schedule/payment/promotion/contact/amount.
2. Admin gọi booking không tồn tại -> lỗi `Booking không tồn tại.`.
3. User thường gọi endpoint admin -> 403.
4. Admin duplicate tour có itinerary/images -> tạo tour mới `DRAFT`.
5. Tour mới có slug unique.
6. Tour mới không copy booking/review/wishlist/payment.
7. Tour mới copy itinerary đúng.
8. Tour mới copy image metadata; lưu ý rủi ro shared `publicId` khi xóa ảnh.
9. Duplicate tour không tồn tại -> lỗi `Tour không tồn tại.`.
10. Tạo booking `PENDING` quá hạn -> scheduler tự `CANCELLED`.
11. Booking bị expired release ghế khỏi schedule.
12. Schedule `FULL` sau release còn chỗ -> chuyển `OPEN` nếu không `CLOSED/CANCELLED`.
13. Payment `PENDING` quá hạn -> `FAILED`.
14. Booking `CONFIRMED/COMPLETED/CANCELLED` không bị scheduler đụng.
15. Notification được tạo cho booking expired.
16. Một booking lỗi không làm dừng toàn bộ batch.
17. Anonymous gọi `/api/users/me/avatar` -> 401.
18. User gọi `/api/users/me/avatar` -> OK.
19. User gọi `/api/users/me/wishlist` -> OK.
20. Admin APIs vẫn OK.
21. Public APIs vẫn OK.
22. VNPay callback/IPN vẫn public.
23. `app.mail.enabled=false` -> forgot password log reset link, API vẫn trả message chung.
24. `app.mail.enabled=true` + SMTP đúng -> gửi email reset password thật.
25. Reset link mở frontend đúng `/reset-password?token=...`.
26. Verify email gửi link đúng `/verify-email?token=...`.
27. SMTP lỗi không leak thông tin email tồn tại hay không.
28. Compile/light check pass.

### 13.12 Kết Quả Compile/Light Check

Đã chạy:

```bash
.\mvnw.cmd -DskipTests compile
```

Kết quả: `BUILD SUCCESS` lúc `2026-06-04T09:24:14+07:00`.

### 13.13 TODO Còn Lại

- Booking passengers table nếu cần lưu từng hành khách.
- Payment timeout/refund production nâng cao nếu cần.
- Email HTML template đẹp hơn và i18n nếu cần.
- WebSocket JWT handshake/channel interceptor.
- Admin frontend booking detail drawer/page.
- Unit/integration tests cho scheduler/duplicate/security.
- Xử lý an toàn hơn cho duplicate image publicId: clone Cloudinary asset hoặc đánh dấu shared publicId để tránh xóa ảnh gốc khi xóa ảnh tour copy.

## 14. Cập Nhật 04/06/2026 — Phase 7: Admin Analytics + Dashboard Nâng Cao

### 14.1 Mục Tiêu Phase

Triển khai nhóm API admin analytics nâng cao cho dashboard/charts: revenue theo khoảng ngày, booking stats nâng cao, top tours theo nhiều metric, payment stats theo method/status và promotion usage stats. Các API dashboard cũ `/api/admin/dashboard/summary`, `/api/admin/dashboard/monthly`, `/api/admin/dashboard/reviews` được giữ nguyên, không đổi response.

Không làm frontend, không render chart, không export Excel/PDF, không tạo data warehouse riêng và không đổi enum business hiện có.

### 14.2 File Đã Thêm

| File | Nội dung |
|---|---|
| `src/main/java/com/voyageviet/backend/admin/controller/AdminAnalyticsController.java` | Controller mới base path `/api/admin/analytics`. |
| `src/main/java/com/voyageviet/backend/admin/service/AdminAnalyticsService.java` | Service aggregate analytics theo date range, groupBy/metric/limit. |
| `src/main/java/com/voyageviet/backend/admin/dto/RevenueAnalyticsResponse.java` | Response tổng doanh thu theo khoảng ngày. |
| `src/main/java/com/voyageviet/backend/admin/dto/RevenuePointResponse.java` | Response từng point ngày/tháng của revenue chart. |
| `src/main/java/com/voyageviet/backend/admin/dto/BookingAnalyticsResponse.java` | Response thống kê booking/status/paymentStatus/conversion. |
| `src/main/java/com/voyageviet/backend/admin/dto/TopTourAnalyticsResponse.java` | Response top tours theo revenue/bookings/rating. |
| `src/main/java/com/voyageviet/backend/admin/dto/PaymentAnalyticsResponse.java` | Response thống kê payment tổng quan. |
| `src/main/java/com/voyageviet/backend/admin/dto/PaymentMethodStatsResponse.java` | Response group payment theo method. |
| `src/main/java/com/voyageviet/backend/admin/dto/PromotionAnalyticsResponse.java` | Response thống kê promotion usage tổng quan. |
| `src/main/java/com/voyageviet/backend/admin/dto/PromotionUsageStatsResponse.java` | Response top promotion theo usage/discount. |

Không xóa file nào.

### 14.3 File Đã Sửa

| File | Nội dung sửa |
|---|---|
| `src/main/java/com/voyageviet/backend/payment/repository/PaymentRepository.java` | Thêm fetch payments theo createdAt và revenue payments theo `SUCCESS.paidAt`/`REFUNDED.refundedAt`. |
| `src/main/java/com/voyageviet/backend/booking/repository/BookingRepository.java` | Thêm fetch bookings theo createdAt với tour/category/destination graph. |
| `src/main/java/com/voyageviet/backend/review/repository/ReviewRepository.java` | Thêm fetch active reviews theo createdAt và fetch active reviews có tour graph. |
| `src/main/java/com/voyageviet/backend/promotion/repository/PromotionUsageRepository.java` | Thêm fetch promotion usages theo `usedAt` với promotion graph. |
| `BACKEND_API_REPORT.md` | Cập nhật Phase 7 Admin Analytics + Dashboard nâng cao. |

Không chỉnh `DashboardController`/`AdminDashboardService`; API dashboard cũ được giữ nguyên.

### 14.4 DTO Mới

| DTO | Mục đích |
|---|---|
| `RevenueAnalyticsResponse` | Trả `dateFrom`, `dateTo`, `groupBy`, tổng revenue/refund/net revenue và danh sách points. |
| `RevenuePointResponse` | Trả `label`, `revenue`, `paidBookings`, `refundAmount`, `netRevenue`. |
| `BookingAnalyticsResponse` | Trả tổng booking, count theo `BookingStatus`, count theo `BookingPaymentStatus`, conversion/cancel rate. |
| `TopTourAnalyticsResponse` | Trả thông tin tour + booking count + paid count + revenue + averageRating + reviewCount. |
| `PaymentAnalyticsResponse` | Trả count theo payment status, amount success/refund và group by method. |
| `PaymentMethodStatsResponse` | Trả `method`, `attempts`, `successCount`, `successAmount`. |
| `PromotionAnalyticsResponse` | Trả tổng usage, tổng discount và top promotions. |
| `PromotionUsageStatsResponse` | Trả `promotionId`, `code`, `name`, `usedCount`, `discountAmount`. |

### 14.5 Repository/Service/Controller Mới Hoặc Đã Sửa

| Loại | Tên | Ghi chú |
|---|---|---|
| Controller | `AdminAnalyticsController` | 5 endpoint analytics mới dưới `/api/admin/analytics`. |
| Service | `AdminAnalyticsService` | Normalize date range, validate `groupBy/metric/limit`, aggregate analytics bằng Java. |
| Repository | `PaymentRepository` | Fetch payment analytics và revenue payments. |
| Repository | `BookingRepository` | Fetch booking analytics theo `createdAt`. |
| Repository | `ReviewRepository` | Fetch ACTIVE review analytics theo `createdAt`. |
| Repository | `PromotionUsageRepository` | Fetch promotion usage analytics theo `usedAt`. |

### 14.6 API Mới

| Method | Endpoint | Quyền | Chức năng | Payload/query chính |
|---|---|---|---|---|
| GET | `/api/admin/analytics/revenue` | Admin | Thống kê gross/refund/net revenue theo ngày hoặc tháng | `dateFrom`, `dateTo`, `groupBy=DAY/MONTH`; default 30 ngày, `DAY` |
| GET | `/api/admin/analytics/bookings` | Admin | Thống kê booking status/paymentStatus và conversion/cancel rate | `dateFrom`, `dateTo`; default 30 ngày |
| GET | `/api/admin/analytics/top-tours` | Admin | Top tours theo `REVENUE`, `BOOKINGS`, hoặc `RATING` | `dateFrom`, `dateTo`, `metric`, `limit`; default `REVENUE`, `10`, max `50` |
| GET | `/api/admin/analytics/payments` | Admin | Thống kê payment attempts theo status và method | `dateFrom`, `dateTo`; default 30 ngày |
| GET | `/api/admin/analytics/promotions` | Admin | Thống kê promotion usage và top promotion theo discount/usage | `dateFrom`, `dateTo`, `limit`; default `10`, max `50` |

### 14.7 Query Logic Chính

- Không thêm native query mới trong phase này.
- Revenue analytics fetch payment `SUCCESS` theo `paidAt` và payment `REFUNDED` theo `refundedAt` hoặc `createdAt` fallback, sau đó group DAY/MONTH bằng Java.
- Payment analytics fetch payment theo `createdAt` trong khoảng ngày rồi aggregate count/amount/method bằng Java.
- Booking analytics fetch booking theo `createdAt` rồi aggregate status/paymentStatus bằng Java.
- Top tours `REVENUE` dùng payment success amount theo `payment.paidAt`; `BOOKINGS` dùng booking count theo `booking.createdAt`; `RATING` dùng active review theo `review.createdAt`.
- Promotion analytics fetch `PromotionUsage` theo `usedAt`, aggregate total usage/discount và top promotions bằng Java.

Lý do không dùng native Oracle `TRUNC/TO_CHAR`: date range mặc định nhỏ, dữ liệu dashboard hiện chưa yêu cầu data warehouse/cache, aggregate bằng Java giữ code dễ đọc và tránh SQL native phức tạp. Native query cũ của dashboard monthly vẫn giữ nguyên, không thay đổi.

### 14.8 Business Rule Đã Implement

- Date range mặc định: nếu thiếu cả `dateFrom/dateTo`, dùng hôm nay và 29 ngày trước đó.
- Nếu thiếu `dateFrom`, lấy `dateTo - 29 ngày`.
- Nếu thiếu `dateTo`, dùng hôm nay.
- `dateTo < dateFrom` trả lỗi `Khoảng ngày không hợp lệ.`.
- Revenue gross chỉ tính `PaymentStatus.SUCCESS`.
- Refund tính `PaymentStatus.REFUNDED` và `refundAmount` nếu có.
- Net revenue = gross revenue - refunded amount.
- Không tính payment `PENDING/FAILED` vào revenue.
- Revenue points trả đủ bucket theo ngày/tháng trong date range, kể cả bucket 0.
- Booking stats theo `Booking.status` và `Booking.paymentStatus` trong khoảng `booking.createdAt`.
- `conversionRate = paidBookings / totalBookings * 100`, `cancelRate = cancelledBookings / totalBookings * 100`, không chia lỗi khi total = 0.
- Top tours `REVENUE` sort theo revenue desc; `BOOKINGS` sort theo booking count desc; `RATING` sort theo average rating desc, tie-break review count.
- Review analytics chỉ tính `ReviewStatus.ACTIVE`.
- Payment stats `successAmount` chỉ tính status `SUCCESS`; `refundedAmount` tính status `REFUNDED` + `refundAmount`.
- Promotion stats dựa trên `promotion_usages`, count usage và sum `discountAmount`.
- `limit` phải từ 1 đến 50.
- Các endpoint mới thuộc `/api/admin/**`, nên vẫn yêu cầu role `ADMIN` qua `SecurityConfig` hiện có.

### 14.9 Validation/Error Message Quan Trọng

- `Khoảng ngày không hợp lệ.`
- `groupBy chỉ hỗ trợ DAY hoặc MONTH.`
- `metric chỉ hỗ trợ REVENUE, BOOKINGS hoặc RATING.`
- `limit tối đa là 50.`
- `limit must be greater than or equal to 1.`

Các message response thành công:

- `Get revenue analytics successfully`
- `Get booking analytics successfully`
- `Get top tour analytics successfully`
- `Get payment analytics successfully`
- `Get promotion analytics successfully`

### 14.10 Checklist Test Thủ Công

1. Có payment `SUCCESS` trong khoảng -> `totalRevenue` và point revenue tăng đúng.
2. Payment `FAILED/PENDING` không tính revenue.
3. Payment `REFUNDED` có `refundAmount` -> `totalRefundedAmount` và `netRevenue` đúng.
4. `groupBy=DAY` trả points theo ngày.
5. `groupBy=MONTH` trả points theo tháng.
6. `dateTo < dateFrom` -> lỗi `Khoảng ngày không hợp lệ.`.
7. Tạo booking nhiều status khác nhau -> booking status count đúng.
8. `paid/unpaid/failed/refunded` theo `Booking.paymentStatus` đúng.
9. `conversionRate` và `cancelRate` đúng khi `totalBookings > 0`.
10. `totalBookings = 0` không chia lỗi, rate = `0.0`.
11. `metric=REVENUE` sort top tours đúng theo revenue.
12. `metric=BOOKINGS` sort đúng theo booking count.
13. `metric=RATING` sort đúng theo average rating và review count tie-break.
14. `limit > 50` -> lỗi `limit tối đa là 50.`.
15. Payment stats count theo status đúng.
16. `byMethod` group `VNPAY/MOCK/BANK_TRANSFER` đúng nếu có dữ liệu.
17. `successAmount` chỉ tính `SUCCESS`.
18. Promotion usage count đúng.
19. `totalDiscountAmount` đúng.
20. `topPromotions` sort theo discount desc, tie-break used count desc.
21. User thường gọi `/api/admin/analytics/revenue` -> 403.
22. Admin gọi các endpoint analytics -> 200.
23. Các API dashboard cũ `/api/admin/dashboard/summary`, `/monthly`, `/reviews` vẫn chạy.
24. Compile/light check pass.

### 14.11 Kết Quả Compile/Light Check

Đã chạy:

```bash
.\mvnw.cmd -DskipTests compile
```

Kết quả: `BUILD SUCCESS` lúc `2026-06-04T09:42:12+07:00`.

### 14.12 TODO Còn Lại

- Frontend admin dashboard charts.
- Export CSV/Excel/PDF nếu cần.
- Cache analytics nếu dữ liệu lớn.
- Revenue by category/destination nếu cần.
- Profit/cost/tax nếu mở rộng production.
- Unit/integration tests cho analytics date range, sorting, security.
- Nếu dữ liệu lớn, cân nhắc native query/projection hoặc materialized view cho revenue points thay vì aggregate Java.



### 14.13 Ghi Chú Bổ Sung Phase 7

- Controller analytics bọc lỗi runtime không mong muốn thành `BusinessException(ErrorCode.INTERNAL_ERROR, ...)` để giữ response format chung.
- Error message nội bộ tương ứng: `Không thể lấy thống kê doanh thu.`, `Không thể lấy thống kê booking.`, `Không thể lấy thống kê tour.`, `Không thể lấy thống kê payment.`, `Không thể lấy thống kê promotion.`
- Lần compile/light check cuối cùng đã chạy `./mvnw.cmd -DskipTests compile` và đạt `BUILD SUCCESS` lúc `2026-06-04T09:42:12+07:00`.

## 15. Cập Nhật 04/06/2026 — Fix Encoding Tiếng Việt

### 15.1 Mục Tiêu

- Sửa lỗi mojibake tiếng Việt trong `BACKEND_API_REPORT.md`.
- Kiểm tra source code Java/properties/yml/yaml/md/xml có khả năng chứa message tiếng Việt bị lỗi mã hóa.
- Chuẩn hóa file text về UTF-8 và bổ sung cấu hình để hạn chế tái phát.
- Không sửa logic backend, không đổi API, không đổi business rule.

### 15.2 File Đã Sửa

| File | Nội dung |
|---|---|
| `BACKEND_API_REPORT.md` | Sửa toàn bộ đoạn mojibake tiếng Việt trong report, đặc biệt các phase gần cuối; thêm section ghi nhận task fix encoding. |
| `.editorconfig` | Thêm cấu hình charset UTF-8, LF, final newline và rule riêng cho Markdown/properties. |
| `pom.xml` | Thêm `project.build.sourceEncoding=UTF-8` và `project.reporting.outputEncoding=UTF-8`. |
| `src/main/resources/application.properties` | Thêm cấu hình `server.servlet.encoding.*` để force UTF-8 cho servlet response/request encoding. |

Không sửa logic Java, không đổi endpoint, DTO, entity, enum hoặc business rule.

### 15.3 Cấu Hình Đã Thêm/Sửa

- `.editorconfig`: `charset = utf-8` cho toàn repo, `[*.properties] charset = utf-8`.
- `pom.xml`: `project.build.sourceEncoding` và `project.reporting.outputEncoding` đều là `UTF-8`.
- `application.properties`: `server.servlet.encoding.charset=UTF-8`, `server.servlet.encoding.enabled=true`, `server.servlet.encoding.force=true`.

### 15.4 Pattern Lỗi Đã Xử Lý

- `Ã`
- `Â`
- `áº`
- `á»`
- `Ä`
- `Æ`
- `Å`
- `â€`

### 15.5 Kết Quả Kiểm Tra

- Đã scan các file `*.java`, `*.properties`, `*.yml`, `*.yaml`, `*.md`, `*.xml` ngoài `target/.git`.
- Kết quả scan mojibake sau khi sửa: `hits 0` với bộ pattern mở rộng, khi bỏ qua riêng mục 15.4 đang cố ý liệt kê pattern lỗi đã xử lý.
- Các message tiếng Việt trong source hiện hiển thị đúng; không phát hiện source Java/properties cần sửa nội dung mojibake.
- Compile/light check: `BUILD SUCCESS` lúc `2026-06-04T09:54:59+07:00` với lệnh `.\mvnw.cmd -DskipTests compile`.

### 15.6 TODO Còn Lại

- Kiểm tra IDE luôn lưu file bằng UTF-8.
- Tránh copy text từ terminal/console đang sai code page vào report.
- Nếu terminal PowerShell vẫn hiển thị mojibake, kiểm tra output encoding/code page trước khi kết luận file bị lỗi.

## 16. Cập Nhật 04/06/2026 — Phase 8: Đồng Bộ Enum/Model + Feature Flags Mở Rộng

### 16.1 Mục Tiêu Phase

Đồng bộ nền enum/model theo PRD/Admin Supplement theo hướng backward-compatible: bổ sung role `STAFF`, mở rộng `FeatureCode`, mở rộng `AuditAction`, thêm các field tổng hợp cho `Tour`, trả field mới trong public/admin tour response, thêm service hook cập nhật `minPrice`, `avgRating`, `totalReviews`.

Không đổi breaking `TourStatus`/`BookingStatus`, không migrate status DB, không đổi URL API, không đổi flow Payment/Booking/Promotion/Notification.

### 16.2 File Đã Thêm

| File | Nội dung |
|---|---|
| `src/main/java/com/voyageviet/backend/tour/service/TourStatsService.java` | Service tính lại `Tour.minPrice` từ schedule OPEN future và `avgRating/totalReviews` từ review ACTIVE. |

Không xóa file nào.

### 16.3 File Đã Sửa

| File | Nội dung sửa |
|---|---|
| `src/main/java/com/voyageviet/backend/role/entity/RoleCode.java` | Thêm `STAFF`. |
| `src/main/java/com/voyageviet/backend/common/config/RoleHierarchyConfig.java` | Đổi hierarchy thành `SUPER_ADMIN > ADMIN > STAFF > USER`. |
| `src/main/java/com/voyageviet/backend/feature/entity/FeatureCode.java` | Thêm các feature code admin/module mới, giữ nguyên code cũ. |
| `src/main/java/com/voyageviet/backend/audit/entity/AuditAction.java` | Thêm các audit action mới cho tour/booking/payment/promotion/review/media/feature. |
| `src/main/java/com/voyageviet/backend/feature/service/FeatureFlagService.java` | Toggle feature ghi audit bằng `FEATURE_TOGGLE`; vẫn giữ enum cũ `FEATURE_FLAG_UPDATED`. |
| `src/main/java/com/voyageviet/backend/tour/entity/Tour.java` | Thêm `isDomestic`, `avgRating`, `totalReviews`, `highlightTags`, `minPrice`. |
| `src/main/java/com/voyageviet/backend/tour/dto/TourCardResponse.java` | Trả thêm các field summary/model mới. |
| `src/main/java/com/voyageviet/backend/tour/dto/TourDetailResponse.java` | Trả thêm các field summary/model mới. |
| `src/main/java/com/voyageviet/backend/tour/dto/TourCreateRequest.java` | Nhận optional `isDomestic`, `highlightTags`; không nhận `avgRating/totalReviews/minPrice`. |
| `src/main/java/com/voyageviet/backend/tour/dto/TourUpdateRequest.java` | Nhận optional `isDomestic`, `highlightTags`; không nhận `avgRating/totalReviews/minPrice`. |
| `src/main/java/com/voyageviet/backend/tour/repository/TourScheduleRepository.java` | Thêm query lấy min `priceAdult` theo tour, status `OPEN`, `departureDate >= today`. |
| `src/main/java/com/voyageviet/backend/tour/repository/specification/TourSpecification.java` | Public search/sort `effectivePrice` ưu tiên `minPrice`, fallback `salePrice`, `originalPrice`. |
| `src/main/java/com/voyageviet/backend/tour/service/TourService.java` | Map field mới, serialize/parse `highlightTags`, infer `isDomestic` từ destination country, giữ compatibility `averageRating/reviewCount`. |
| `src/main/java/com/voyageviet/backend/tour/service/TourScheduleService.java` | Hook recompute `minPrice` khi create/update/delete/status/duplicate schedule. |
| `src/main/java/com/voyageviet/backend/review/service/ReviewService.java` | Hook recompute rating summary khi create/update status/delete review. |
| `src/main/java/com/voyageviet/backend/common/config/DataSeeder.java` | Seed role `STAFF`, seed feature code mới, sample tour infer `isDomestic`. |
| `BACKEND_API_REPORT.md` | Cập nhật Phase 8. |

### 16.4 Enum Đã Bổ Sung

`RoleCode`:

- Giữ: `USER`, `ADMIN`, `SUPER_ADMIN`.
- Thêm: `STAFF`.

`FeatureCode`:

- Giữ code cũ: `PUBLIC_BOOKING`, `PUBLIC_REVIEW`, `PUBLIC_PAYMENT`, `CHAT_SUPPORT`, `GOOGLE_LOGIN`, `TOUR_SEARCH`, `TOUR_FILTER`, `ADMIN_DASHBOARD`.
- Thêm: `TOUR_VIEW`, `TOUR_CREATE`, `TOUR_UPDATE`, `TOUR_DELETE`, `TOUR_PUBLISH`, `BOOKING_VIEW`, `BOOKING_UPDATE`, `BOOKING_CONFIRM`, `BOOKING_CANCEL`, `USER_MANAGE`, `REVIEW_MANAGE`, `CATEGORY_MANAGE`, `DESTINATION_MANAGE`, `MEDIA_MANAGE`, `PROMOTION_MANAGE`, `PAYMENT_VIEW`, `PAYMENT_REFUND`, `REVENUE_VIEW`, `ANALYTICS_VIEW`, `NOTIFICATION_VIEW`, `FEATURE_MANAGE`, `AUDIT_VIEW`, `SUPPORT_CHAT`, `BANNER_MANAGE`, `BLOG_MANAGE`.

`AuditAction`:

- Giữ action cũ: `USER_STATUS_UPDATED`, `USER_ROLE_UPDATED`, `BOOKING_STATUS_UPDATED`, `FEATURE_FLAG_UPDATED`, `MEDIA_DELETED`.
- Thêm: `FEATURE_TOGGLE`, `TOUR_CREATED`, `TOUR_UPDATED`, `TOUR_PUBLISHED`, `TOUR_ARCHIVED`, `TOUR_DUPLICATED`, `TOUR_DELETED`, `BOOKING_CREATED`, `BOOKING_CONFIRMED`, `BOOKING_CANCELLED`, `BOOKING_COMPLETED`, `PAYMENT_REFUNDED`, `PROMOTION_CREATED`, `PROMOTION_UPDATED`, `PROMOTION_STATUS_UPDATED`, `PROMOTION_DELETED`, `REVIEW_APPROVED`, `REVIEW_REJECTED`, `MEDIA_UPLOADED`.

Không bổ sung hoặc đổi `TourStatus`/`BookingStatus` trong phase này.

### 16.5 Entity/Table Field Mới

Table `TOURS` qua JPA `ddl-auto=update`:

- `IS_DOMESTIC`: Boolean, `true` tour trong nước, `false` tour quốc tế, nullable để tương thích dữ liệu cũ.
- `AVG_RATING`: `BigDecimal(3,1)`, default entity `0`.
- `TOTAL_REVIEWS`: Integer, default entity `0`.
- `HIGHLIGHT_TAGS`: CLOB/string JSON array, ví dụ `["HOT","SALE","FAMILY"]`.
- `MIN_PRICE`: `BigDecimal(15,2)`, nullable; lấy từ schedule OPEN future.

### 16.6 DTO/Request/Response Đã Sửa

- `TourCardResponse`: thêm `minPrice`, `isDomestic`, `avgRating`, `totalReviews`, `highlightTags`; giữ `averageRating/reviewCount` để frontend cũ không vỡ.
- `TourDetailResponse`: thêm `minPrice`, `isDomestic`, `avgRating`, `totalReviews`, `highlightTags`; giữ `averageRating/reviewCount`.
- `TourCreateRequest`: thêm optional `isDomestic`, `highlightTags`; không cho client set `avgRating/totalReviews/minPrice`.
- `TourUpdateRequest`: thêm optional `isDomestic`, `highlightTags`; nếu không gửi `isDomestic` thì giữ giá trị admin đã set trước đó, chỉ infer khi đang null.

### 16.7 Seeder Đã Sửa

- `DataSeeder.seedRoles()` seed thêm role `STAFF` idempotent.
- `DataSeeder.seedFeatureFlags()` seed tất cả feature code mới idempotent, không duplicate feature cũ.
- Sample tour set `isDomestic` theo `destination.country`.
- Không xóa role/feature cũ và không tự đổi role user hiện có.

### 16.8 Service/Repository Đã Sửa

- `TourStatsService.recomputeMinPrice(tourId)`: tính min `priceAdult` từ `TourSchedule` có `status=OPEN` và `departureDate >= today`; nếu không có schedule phù hợp thì `minPrice=null`.
- `TourStatsService.recomputeRatingSummary(tourId)`: tính `avgRating/totalReviews` từ `ReviewStatus.ACTIVE`, không tính `HIDDEN`.
- `TourScheduleService`: gọi recompute min price sau create/update/delete/status/duplicate schedule.
- `ReviewService`: gọi recompute rating summary sau create review, đổi status review, delete review.
- `TourService`: map field mới, parse JSON `highlightTags` về `List<String>`, serialize request list thành JSON string, infer `isDomestic` từ country `Vietnam`, `Viet Nam`, `Việt Nam`.
- `TourSpecification`: `effectivePrice` public search/sort dùng `COALESCE(minPrice, salePrice, originalPrice)`.

### 16.9 API Cũ Bị Ảnh Hưởng

Không đổi endpoint hoặc HTTP method. Response có thêm field mới:

- Public tour list/detail.
- Admin tour list/detail/create/update/duplicate response.
- Admin features list/update vẫn dùng endpoint cũ; có thêm feature code mới trong dữ liệu seed.

### 16.10 Business Rule Đã Implement

- `STAFF` là role nền, chưa được cấp quyền `/api/admin/**` mặc định.
- Role hierarchy mới: `SUPER_ADMIN > ADMIN > STAFF > USER`.
- Feature code cũ được giữ nguyên để tránh vỡ frontend.
- Audit action cũ được giữ nguyên; feature toggle mới ghi `FEATURE_TOGGLE`.
- `minPrice` chỉ tính từ schedule `OPEN`, future/today, lấy min `priceAdult`.
- Nếu không có schedule OPEN future thì `minPrice=null`, không fallback DB field sang `salePrice` để phân biệt chưa có lịch bán; response vẫn còn `salePrice/originalPrice`.
- Public search effective price fallback `minPrice -> salePrice -> originalPrice`.
- `avgRating/totalReviews` chỉ tính review `ACTIVE`.
- Review `HIDDEN` không tính vào summary.
- `highlightTags` lưu JSON string, response trả `List<String>`.
- `isDomestic` dùng giá trị request nếu có; nếu không có thì infer từ `destination.country`; update không override giá trị admin đã set thủ công nếu request không gửi.
- Giữ backward compatibility `TourStatus.PUBLISHED/INACTIVE/SOLD_OUT/DRAFT` và `BookingStatus` hiện tại.

### 16.11 Validation/Error Message Quan Trọng

- `Tour không tồn tại.`
- `Highlight tags không hợp lệ.`
- `Không thể tính giá thấp nhất của tour.`
- `Không thể tính điểm đánh giá của tour.`
- `Role not found` vẫn dùng cho role không tồn tại trong API user role hiện tại.
- `Feature flag not found` vẫn dùng cho feature code không tồn tại trong API feature hiện tại.

### 16.12 Checklist Test Thủ Công

1. Seeder chạy không duplicate role/feature.
2. Role `STAFF` được tạo nếu chưa có.
3. Feature codes mới được tạo nếu chưa có.
4. Không còn mojibake trong description seed mới.
5. `SUPER_ADMIN` vẫn có quyền `ADMIN`.
6. `ADMIN` kế thừa `STAFF` và `USER`.
7. `STAFF` tồn tại nhưng chưa vào được full `/api/admin/**`.
8. `GET /api/admin/features` thấy feature code mới.
9. `PATCH /api/admin/features/{code}` vẫn bật/tắt được.
10. Public feature cũ vẫn hoạt động.
11. Tạo/cập nhật tour có `isDomestic/highlightTags` -> response trả đúng.
12. Tour response public/admin có `avgRating/totalReviews/minPrice`.
13. Tạo schedule OPEN future -> `tour.minPrice` cập nhật đúng.
14. Đổi schedule CLOSED hoặc xóa schedule min price -> `tour.minPrice` recompute đúng.
15. Review ACTIVE -> `avgRating/totalReviews` tăng đúng.
16. Review HIDDEN -> `avgRating/totalReviews` không tính review đó.
17. Delete review -> `avgRating/totalReviews` recompute đúng.
18. `originalPrice/salePrice` vẫn còn trong response.
19. Public tour list/detail cũ vẫn chạy.
20. Admin tour CRUD cũ vẫn chạy.
21. Payment/Booking/Promotion/Notification không bị ảnh hưởng.
22. Compile/light check pass.

### 16.13 Kết Quả Compile/Light Check

Đã chạy:

```bash
.\mvnw.cmd -DskipTests compile
```

Kết quả: `BUILD SUCCESS` lúc `2026-06-04T10:05:46+07:00`.

Scan mojibake sau khi sửa source/report: `hits 0` với bộ pattern mở rộng, bỏ qua riêng mục 15.4 đang cố ý liệt kê pattern lỗi.

### 16.14 TODO Còn Lại

- Thiết kế bảng `role_feature_permissions`.
- Phân quyền chi tiết cho `STAFF`.
- Migration `TourStatus ACTIVE/ARCHIVED` nếu frontend/PRD thật sự cần, kèm backward compatibility.
- `BookingStatus IN_PROGRESS` nếu admin flow cần.
- Feature flags v2 fields: `disabledReason`, `visibleInAdmin`, `visibleInPublic`, `sortOrder`, `parentKey`.
- Audit logging chi tiết cho tất cả action mới.
- Cache tour stats nếu dữ liệu lớn.
- Job/backfill recompute `minPrice`, `avgRating`, `totalReviews`, `isDomestic` cho dữ liệu tour cũ trong production.

### 16.15 Hotfix Sau Startup Test

Sau khi chạy app với Oracle DB hiện có, insert role `STAFF` bị lỗi:

- `ORA-02290: check constraint (...) violated`
- Nguyên nhân: Oracle check constraint cũ trên cột enum `ROLES.CODE` vẫn chỉ cho phép các role cũ, trong khi `ddl-auto=update` không tự nới enum check constraint.

Điều chỉnh đã làm:

- `DataSeeder.createRoleIfNotExists(...)` catch `DataIntegrityViolationException`, log warning và skip role mới nếu DB constraint chưa cho phép.
- `DataSeeder.createFeatureIfNotExists(...)` cũng catch `DataIntegrityViolationException` để tránh lỗi tương tự với các `FeatureCode` mới.
- App không fail startup chỉ vì schema enum check constraint chưa migrate.
- Sau khi migrate DB constraint cho `ROLES.CODE` và `FEATURE_FLAGS.FEATURE_CODE`, seeder vẫn idempotent và sẽ tự thêm các role/feature còn thiếu ở lần chạy sau.

Compile sau hotfix:

```bash
.\mvnw.cmd -DskipTests compile
```

Kết quả: `BUILD SUCCESS` lúc `2026-06-04T10:14:11+07:00`.

TODO migration Oracle:

- Nới check constraint `ROLES.CODE` để cho phép `STAFF`.
- Nới check constraint `FEATURE_FLAGS.FEATURE_CODE` để cho phép các feature code Phase 8.
- Nên đặt tên constraint rõ ràng thay vì để Oracle tạo `SYS_C...` để dễ maintain.

### 16.16 Hotfix Schema TOURS Phase 8

Sau khi app chạy và gọi admin tour list, Oracle báo lỗi:

- `ORA-00904: "T1_0"."TOTAL_REVIEWS": invalid identifier`
- Nguyên nhân: entity `Tour` đã thêm các field Phase 8 nhưng bảng `TOURS` hiện có trong Oracle chưa được bổ sung đủ cột; `ddl-auto=update` không đảm bảo tự migrate schema hiện hữu.

Điều chỉnh đã làm:

- Thêm `Phase8SchemaMigration` chạy bằng `CommandLineRunner` với `@Order(Ordered.HIGHEST_PRECEDENCE)`.
- Runner kiểm tra `USER_TAB_COLUMNS` và chỉ `ALTER TABLE TOURS ADD ...` khi cột còn thiếu.
- Các cột được đảm bảo tồn tại:
  - `IS_DOMESTIC NUMBER(1)`
  - `AVG_RATING NUMBER(3,1) DEFAULT 0`
  - `TOTAL_REVIEWS NUMBER(10) DEFAULT 0 NOT NULL`
  - `HIGHLIGHT_TAGS CLOB`
  - `MIN_PRICE NUMBER(15,2)`
- Runner idempotent, restart nhiều lần không add trùng cột.

Compile sau hotfix:

```bash
.\mvnw.cmd -DskipTests compile
```

Kết quả: `BUILD SUCCESS` lúc `2026-06-04T10:22:44+07:00`.

TODO production:

- Thay runner tạm bằng migration tool chính thức nếu dự án đưa Flyway/Liquibase vào production.
- Backfill `MIN_PRICE`, `AVG_RATING`, `TOTAL_REVIEWS`, `IS_DOMESTIC` cho dữ liệu tour cũ sau khi cột đã tồn tại.
