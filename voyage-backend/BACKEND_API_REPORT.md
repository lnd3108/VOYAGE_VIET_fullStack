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
