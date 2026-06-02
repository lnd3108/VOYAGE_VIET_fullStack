# Bao cao backend VoyageViet

Ngay quet: 31/05/2026  
Thu muc: `voyage-backend`  
Cong nghe chinh: Spring Boot 4, Java 17, Spring WebMVC, Spring Security, JWT, Spring Data JPA, Oracle, Bean Validation, Springdoc OpenAPI, Cloudinary.

## 1. Tong quan cac phan da lam

Backend da duoc tach module theo nghiep vu, moi module co controller, DTO, entity, repository va service rieng:

- `auth`: dang ky, dang nhap, sinh JWT.
- `user`: xem thong tin nguoi dung hien tai, admin quan ly user, trang thai va role.
- `role`: danh sach role he thong.
- `category`: public xem danh muc active, admin CRUD danh muc va cap nhat anh/trang thai.
- `destination`: public xem diem den active, admin CRUD diem den va cap nhat anh/trang thai.
- `tour`: public tim/loc tour, xem tour noi bat, xem chi tiet theo slug; admin CRUD tour, trang thai, thumbnail.
- `booking`: user dat tour, xem booking cua minh, huy booking; admin xem va cap nhat trang thai booking.
- `review`: user tao danh gia, public xem danh gia theo tour; admin kiem duyet/an/xoa danh gia.
- `media`: admin upload anh len Cloudinary, xem danh sach media, xoa media.
- `feature`: public lay feature flags; admin bat/tat feature flags.
- `admin dashboard`: thong ke tong quan, thong ke theo thang, thong ke review/top tour.
- `audit`: admin xem audit log.
- `common`: response format chung, paging format chung, global exception handler, security config, OpenAPI config, data seeder.

## 2. Cau hinh va nen tang da co

- Server chay port `8081`.
- Database dung Oracle qua JDBC, Hibernate `ddl-auto=update`.
- JWT stateless authentication, token gui qua `Authorization: Bearer <token>`.
- CORS cho `http://localhost:4200`.
- Swagger/OpenAPI co tai:
  - `/swagger-ui/**`
  - `/swagger-ui.html`
  - `/v3/api-docs/**`
- Response chuan:
  - Thanh cong: `success`, `message`, `data`, `timestamp`.
  - Loi: `success=false`, `message`, `error`, `timestamp`.
- Paging chuan: `content`, `page`, `size`, `totalElements`, `totalPages`, `first`, `last`, `empty`, `sortBy`, `sortDir`.
- Xu ly loi tap trung: business error, validation error, authentication/authorization error, enum/query param sai, request body sai, upload qua dung luong, loi he thong.
- Seeder tao san role, admin/super admin, feature flags va sample data neu config bat.

## 3. Phan quyen API

- Public, khong can token:
  - `/api/public/**`
  - `/api/auth/**`
  - Swagger/OpenAPI
- Admin:
  - `/api/admin/**` yeu cau role `ADMIN`.
  - Luu y: cau hinh role hierarchy co the mo rong quyen cho `SUPER_ADMIN` neu da cau hinh tuong ung.
- User:
  - `/api/users/me` yeu cau role `USER`.
  - Cac API con lai ngoai public/admin yeu cau dang nhap.

## 4. Tong hop tat ca API da viet

Tong cong: 54 endpoint.

### 4.1 Common / Health / Home

| Method | Endpoint | Quyen | Chuc nang | Tham so/Payload |
|---|---|---|---|---|
| GET | `/api/public/ping` | Public | Kiem tra backend public dang chay | Khong |
| GET | `/api/public/test-error` | Public | Test response loi business | Khong |
| GET | `/api/admin/ping` | Admin | Kiem tra API admin dang chay | Khong |
| GET | `/api/public/home` | Public | Lay du lieu trang home | Khong |

### 4.2 Auth

| Method | Endpoint | Quyen | Chuc nang | Payload chinh |
|---|---|---|---|---|
| POST | `/api/auth/register` | Public | Dang ky tai khoan | `fullName`, `email`, `password`, `phone` |
| POST | `/api/auth/login` | Public | Dang nhap, tra JWT | `email`, `password` |

### 4.3 User va Role

| Method | Endpoint | Quyen | Chuc nang | Tham so/Payload |
|---|---|---|---|---|
| GET | `/api/users/me` | User | Lay thong tin user hien tai | Token JWT |
| GET | `/api/public/roles` | Public | Lay danh sach role | Khong |
| GET | `/api/admin/users` | Admin | Lay danh sach user co phan trang | `keyword`, `status`, `page`, `size`, `sortBy`, `sortDir` |
| PATCH | `/api/admin/users/{id}/status` | Admin | Cap nhat trang thai user | `status` |
| PATCH | `/api/admin/users/{id}/role` | Admin | Cap nhat role user | `role` |

Gia tri enum:

- `UserStatus`: `ACTIVE`, `INACTIVE`, `BANNED`.
- `RoleCode`: `USER`, `ADMIN`, `SUPER_ADMIN`.

### 4.4 Category

| Method | Endpoint | Quyen | Chuc nang | Tham so/Payload |
|---|---|---|---|---|
| GET | `/api/public/categories` | Public | Lay danh muc active | Khong |
| GET | `/api/admin/categories` | Admin | Lay tat ca danh muc | Khong |
| POST | `/api/admin/categories` | Admin | Tao danh muc | `name`, `slug`, `description`, `imageUrl`, `displayOrder` |
| PUT | `/api/admin/categories/{id}` | Admin | Cap nhat danh muc | `name`, `slug`, `description`, `imageUrl`, `status`, `displayOrder` |
| PATCH | `/api/admin/categories/{id}/status` | Admin | Cap nhat trang thai danh muc | `status` |
| DELETE | `/api/admin/categories/{id}` | Admin | Xoa danh muc | `id` |
| PATCH | `/api/admin/categories/{id}/image` | Admin | Cap nhat anh danh muc | `imageUrl` |

Gia tri enum `CategoryStatus`: `ACTIVE`, `INACTIVE`.

### 4.5 Destination

| Method | Endpoint | Quyen | Chuc nang | Tham so/Payload |
|---|---|---|---|---|
| GET | `/api/public/destinations` | Public | Lay diem den active | Khong |
| GET | `/api/admin/destinations` | Admin | Lay tat ca diem den | Khong |
| POST | `/api/admin/destinations` | Admin | Tao diem den | `name`, `slug`, `region`, `country`, `description`, `imageUrl`, `latitude`, `longitude` |
| PUT | `/api/admin/destinations/{id}` | Admin | Cap nhat diem den | `name`, `slug`, `region`, `country`, `description`, `imageUrl`, `latitude`, `longitude`, `status` |
| PATCH | `/api/admin/destinations/{id}/status` | Admin | Cap nhat trang thai diem den | `status` |
| DELETE | `/api/admin/destinations/{id}` | Admin | Xoa diem den | `id` |
| PATCH | `/api/admin/destinations/{id}/image` | Admin | Cap nhat anh diem den | `imageUrl` |

Gia tri enum `DestinationStatus`: `ACTIVE`, `INACTIVE`.

### 4.6 Tour

| Method | Endpoint | Quyen | Chuc nang | Tham so/Payload |
|---|---|---|---|---|
| GET | `/api/public/tours` | Public | Tim, loc, phan trang tour public | `keyword`, `categorySlug`, `destinationSlug`, `region`, `departureLocation`, `minPrice`, `maxPrice`, `minDurationDays`, `maxDurationDays`, `people`, `page`, `size`, `sortBy`, `sortDir` |
| GET | `/api/public/tours/featured` | Public | Lay tour noi bat | Khong |
| GET | `/api/public/tours/{slug}` | Public | Lay chi tiet tour theo slug | `slug` |
| GET | `/api/admin/tours` | Admin | Lay tat ca tour cho admin | Khong |
| POST | `/api/admin/tours` | Admin | Tao tour | `title`, `slug`, `shortDescription`, `description`, `thumbnailUrl`, `originalPrice`, `salePrice`, `durationDays`, `durationNights`, `departureLocation`, `maxParticipants`, `availableSeats`, `featured`, `status`, `categoryId`, `destinationId` |
| PUT | `/api/admin/tours/{id}` | Admin | Cap nhat tour | Cung payload voi tao tour |
| PATCH | `/api/admin/tours/{id}/status` | Admin | Cap nhat trang thai tour | `status` |
| DELETE | `/api/admin/tours/{id}` | Admin | Xoa tour | `id` |
| PATCH | `/api/admin/tours/{id}/thumbnail` | Admin | Cap nhat thumbnail tour | `imageUrl` |

Gia tri enum `TourStatus`: `DRAFT`, `PUBLISHED`, `INACTIVE`, `SOLD_OUT`.

### 4.7 Booking

| Method | Endpoint | Quyen | Chuc nang | Tham so/Payload |
|---|---|---|---|---|
| POST | `/api/bookings` | Authenticated | Tao booking/dat tour | `tourId`, `contactName`, `contactEmail`, `contactPhone`, `startDate`, `numberOfPeople`, `note` |
| GET | `/api/bookings/me` | Authenticated | Lay booking cua user hien tai | `status`, `page`, `size`, `sortBy`, `sortDir` |
| PATCH | `/api/bookings/{id}/cancel` | Authenticated | User huy booking cua minh | `id` |
| GET | `/api/admin/bookings` | Admin | Admin lay danh sach booking | `status`, `page`, `size`, `sortBy`, `sortDir` |
| PATCH | `/api/admin/bookings/{id}/status` | Admin | Admin cap nhat trang thai booking | `status` |

Gia tri enum `BookingStatus`: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`.

### 4.8 Review

| Method | Endpoint | Quyen | Chuc nang | Tham so/Payload |
|---|---|---|---|---|
| POST | `/api/reviews` | Authenticated | Tao danh gia tour | `tourId`, `rating`, `comment` |
| GET | `/api/public/tours/{tourSlug}/reviews` | Public | Lay danh gia public theo tour | `tourSlug` |
| GET | `/api/admin/reviews` | Admin | Admin lay danh sach review | `status`, `page`, `size`, `sortBy`, `sortDir` |
| PATCH | `/api/admin/reviews/{id}/status` | Admin | Cap nhat trang thai review | `status` |
| DELETE | `/api/admin/reviews/{id}` | Admin | Xoa review | `id` |

Gia tri enum `ReviewStatus`: `ACTIVE`, `HIDDEN`.

### 4.9 Media

| Method | Endpoint | Quyen | Chuc nang | Tham so/Payload |
|---|---|---|---|---|
| GET | `/api/admin/media` | Admin | Lay danh sach media | `module`, `page`, `size`, `sortBy`, `sortDir` |
| POST | `/api/admin/media/upload` | Admin | Upload anh len Cloudinary | multipart `file`, `module` |
| DELETE | `/api/admin/media/{id}` | Admin | Xoa media | `id` |

Gioi han upload trong config local: toi da 5MB/file va 5MB/request.

### 4.10 Feature Flag

| Method | Endpoint | Quyen | Chuc nang | Tham so/Payload |
|---|---|---|---|---|
| GET | `/api/public/features` | Public | Lay map feature flag public | Khong |
| GET | `/api/admin/features` | Admin | Lay tat ca feature flags | Khong |
| PATCH | `/api/admin/features/{code}` | Admin | Bat/tat feature flag | `enabled` |

Gia tri enum `FeatureCode`: `PUBLIC_BOOKING`, `PUBLIC_REVIEW`, `PUBLIC_PAYMENT`, `CHAT_SUPPORT`, `GOOGLE_LOGIN`, `TOUR_SEARCH`, `TOUR_FILTER`, `ADMIN_DASHBOARD`.

### 4.11 Admin Dashboard

| Method | Endpoint | Quyen | Chuc nang | Tham so |
|---|---|---|---|---|
| GET | `/api/admin/dashboard/summary` | Admin | Thong ke tong quan dashboard | Khong |
| GET | `/api/admin/dashboard/monthly` | Admin | Thong ke theo thang | `year` |
| GET | `/api/admin/dashboard/reviews` | Admin | Thong ke review/top rated tour | `limit` |

### 4.12 Audit Log

| Method | Endpoint | Quyen | Chuc nang | Tham so |
|---|---|---|---|---|
| GET | `/api/admin/audit-logs` | Admin | Lay audit logs co loc va phan trang | `actorEmail`, `targetType`, `page`, `size`, `sortBy`, `sortDir` |

## 5. Trang thai hoan thien theo module

| Module | Trang thai | Ghi chu |
|---|---|---|
| Auth/JWT | Da co API co ban | Register, login, JWT filter/security |
| User/Role | Da co API user va admin | Co quan ly status/role |
| Category | Da co CRUD admin + public list | Co slug, image, display order |
| Destination | Da co CRUD admin + public list | Co region/country/toa do |
| Tour | Da co public search/filter/detail + admin CRUD | Co featured, price, duration, seats, category/destination |
| Booking | Da co flow dat tour va admin xu ly | Co trang thai booking |
| Review | Da co tao, public list, admin moderation | Co an/xoa review |
| Media | Da co upload/list/delete | Tich hop Cloudinary |
| Feature Flag | Da co public/admin API | Ho tro bat/tat tinh nang |
| Dashboard | Da co thong ke admin | Tong quan, theo thang, review |
| Audit Log | Da co API xem log | Co loc actor/target |
| Common | Da co response/paging/exception/security/OpenAPI | Nen tang kha day du |

## 6. Luu y ky thuat

- File `src/main/resources/application-local.properties` dang co thong tin Cloudinary va database local. Neu day la repo dung chung, nen chuyen cac secret sang bien moi truong.
- `DataSeeder.java` co noi dung tieng Viet bi loi encoding khi doc tu terminal. Nen kiem tra lai charset file trong IDE neu du lieu seed hien thi sai.
- Chua thay test nghiep vu chi tiet, moi co test khoi dong mac dinh `VoyageBackendApplicationTests`.

## 7. Cap nhat API va code moi sau cac phase mo rong

Ngay cap nhat: 02/06/2026

Phan nay tong hop cac thay doi backend da bo sung sau bao cao ban dau, tap trung vao code/module thay doi va cac dau API moi.

### 7.1 Tour Core Phase 1

Code/entity/repository/service moi:

- Entity: `TourSchedule`, `TourScheduleStatus`, `TourItinerary`, `TourImage`.
- Repository: `TourScheduleRepository`, `TourItineraryRepository`, `TourImageRepository`.
- Service: `TourScheduleService`, `TourItineraryService`, `TourImageService`, `TourPublishService`.
- Controller: `AdminTourScheduleController`, `PublicTourScheduleController`, `AdminTourItineraryController`, `PublicTourItineraryController`, `AdminTourImageController`.
- DTO: schedule request/response, itinerary request/response, image request/response, publish checklist, `AdminTourDetailResponse`, `PublicTourScheduleResponse`.

Bang/entity moi:

- `TOUR_SCHEDULES`: lich khoi hanh, gia theo nguoi lon/tre em/em be, so cho, status `OPEN/CLOSED/FULL/CANCELLED`, `@Version`.
- `TOUR_ITINERARIES`: lich trinh theo ngay, replace-all strategy.
- `TOUR_IMAGES`: gallery anh tour, thumbnail, Cloudinary public id.

API moi:

| Method | Endpoint | Quyen | Chuc nang | Payload/Tham so chinh |
|---|---|---|---|---|
| GET | `/api/admin/tours/{id}` | Admin | Lay chi tiet tour admin, kem count schedule/image/itinerary va publish checklist | `id` |
| POST | `/api/admin/tours/{id}/schedules` | Admin | Tao lich khoi hanh | `departureDate`, `returnDate`, `priceAdult`, `priceChild`, `priceInfant`, `singleSupplement`, `maxSeats`, `bookedSeats`, `status`, `notes` |
| GET | `/api/admin/tours/{id}/schedules` | Admin | Lay danh sach lich khoi hanh admin | `status`, `page`, `size` |
| GET | `/api/admin/tours/{tourId}/schedules/{id}` | Admin | Lay chi tiet lich khoi hanh | `tourId`, `id` |
| PUT | `/api/admin/tours/{tourId}/schedules/{id}` | Admin | Cap nhat lich khoi hanh | Payload nhu tao lich |
| DELETE | `/api/admin/tours/{tourId}/schedules/{id}` | Admin | Xoa lich khoi hanh | Khong cho xoa neu da co booking |
| PATCH | `/api/admin/tours/{tourId}/schedules/{id}/status` | Admin | Cap nhat status lich | `status` |
| POST | `/api/admin/tours/{tourId}/schedules/{id}/duplicate` | Admin | Nhan ban lich khoi hanh | `departureDate` |
| GET | `/api/public/tours/{slug}/schedules` | Public | Lay lich khoi hanh public OPEN/future | `slug` |
| GET | `/api/admin/tours/{id}/publish-checklist` | Admin | Lay checklist publish tour | `id` |
| POST | `/api/admin/tours/{id}/publish` | Admin | Publish tour neu checklist dat | `id` |
| GET | `/api/admin/tours/{id}/itineraries` | Admin | Lay lich trinh admin | `id` |
| PUT | `/api/admin/tours/{id}/itineraries` | Admin | Luu replace-all lich trinh | `items[]` |
| POST | `/api/admin/tours/{id}/itineraries/reorder` | Admin | Sap xep lich trinh | `items[]: id, sortOrder` |
| GET | `/api/public/tours/{slug}/itinerary` | Public | Lay lich trinh public | `slug` |
| GET | `/api/admin/tours/{id}/images` | Admin | Lay gallery anh tour | `id` |
| POST | `/api/admin/tours/{id}/images` | Admin | Upload anh tour | multipart `file`, `altText` |
| DELETE | `/api/admin/tours/{tourId}/images/{imageId}` | Admin | Xoa anh tour | Khong cho xoa thumbnail neu con anh khac |
| PATCH | `/api/admin/tours/{tourId}/images/{imageId}/thumbnail` | Admin | Set thumbnail | `tourId`, `imageId` |
| PATCH | `/api/admin/tours/{id}/images/reorder` | Admin | Sap xep anh | `items[]: id, sortOrder` |
| PATCH | `/api/admin/tours/{tourId}/images/{imageId}/alt` | Admin | Cap nhat alt text | `altText` |

Logic nghiep vu chinh:

- Public schedules chi tra `OPEN` va `departureDate >= today`, co `remainingSeats`, khong expose `bookedSeats` trong DTO public.
- Schedule tu chuyen `FULL` khi `bookedSeats >= maxSeats`.
- Itinerary khong duoc trung `dayNumber`, sort theo `dayNumber ASC, sortOrder ASC`.
- Gallery toi da 10 anh/tour, chi 1 thumbnail/tour.
- Publish tour yeu cau du 9 checklist: ten tour, category, destination, thumbnail, gallery, itinerary, open schedule, valid price, max seats.

### 7.2 Booking theo lich khoi hanh

Code/entity/repository/service thay doi:

- `Booking` bo sung relation `schedule: TourSchedule`, `bookingCode`, `adultCount`, `childCount`, `infantCount`, `totalPeople`, snapshot gia.
- `BookingCreateRequest` bo sung `scheduleId`, `adultCount`, `childCount`, `infantCount`; giu field cu `tourId/startDate/numberOfPeople` de parse payload cu nhung booking moi bat buoc chon schedule.
- `BookingResponse` bo sung `bookingCode`, `thumbnailUrl`, `scheduleId`, `departureDate`, `returnDate`, passenger counts, price snapshots, `paymentStatus`.
- `BookingRepository` bo sung method theo `scheduleId`, `bookingCode`, `countByUserId`.
- `TourScheduleService` hoan thien rule khong cho update/delete schedule da co booking.

API giu nguyen URL:

| Method | Endpoint | Quyen | Thay doi |
|---|---|---|---|
| POST | `/api/bookings` | Authenticated | Payload moi dung `scheduleId`, `adultCount`, `childCount`, `infantCount`; tao booking PENDING va giu cho tren schedule |
| GET | `/api/bookings/me` | Authenticated | Response co them thong tin schedule va bookingCode |
| PATCH | `/api/bookings/{id}/cancel` | Authenticated | Huy PENDING/CONFIRMED va release ghe schedule |
| GET | `/api/admin/bookings` | Admin | Response co them thong tin schedule/snapshot |
| PATCH | `/api/admin/bookings/{id}/status` | Admin | PENDING->CONFIRMED khong cong ghe lai; CANCELLED release ghe; COMPLETED khong cho huy |

Logic nghiep vu chinh:

- Booking moi bat buoc co `scheduleId`, neu thieu tra loi: `Vui long chon lich khoi hanh.`
- PENDING van giu cho de tranh oversell.
- Khi cancel PENDING/CONFIRMED thi tru lai `schedule.bookedSeats`, neu schedule dang FULL va con cho thi set ve OPEN.
- Dung `@Version` tren `TourSchedule`; khi dat dong thoi va bi optimistic lock thi tra loi `Co nguoi vua dat lich nay, vui long thu lai.`

### 7.3 Auth mo rong: refresh token, logout, forgot/reset password, verify email

Code/entity/repository/service moi va thay doi:

- Entity: `RefreshToken`, `EmailToken`, `EmailTokenType`.
- Repository: `RefreshTokenRepository`, `EmailTokenRepository`.
- DTO: `RefreshTokenRequest`, `LogoutRequest`, `ForgotPasswordRequest`, `ResetPasswordRequest`, `VerifyEmailRequest`.
- Service: `EmailService`, `LoggingEmailService`.
- `AuthService` bo sung refresh rotation, logout idempotent, forgot/reset password, verify email.
- `JwtService` bo sung `getAccessTokenExpirationSeconds`.
- `LoginResponse` bo sung `refreshToken`, `expiresIn`.

Bang/entity moi:

- `REFRESH_TOKENS`: luu SHA-256 `tokenHash`, khong luu raw refresh token.
- `EMAIL_TOKENS`: token cho `PASSWORD_RESET` va `EMAIL_VERIFY`.

API moi:

| Method | Endpoint | Quyen | Chuc nang | Payload chinh |
|---|---|---|---|---|
| POST | `/api/auth/refresh` | Public | Rotate refresh token, cap access token moi | `refreshToken` |
| POST | `/api/auth/logout` | Public | Revoke refresh token, idempotent | `refreshToken` |
| POST | `/api/auth/forgot-password` | Public | Tao password reset token neu email ton tai, khong leak email | `email` |
| POST | `/api/auth/reset-password` | Public | Doi mat khau bang token reset | `token`, `newPassword`, `confirmPassword` |
| POST | `/api/auth/verify-email` | Public | Xac thuc email bang token | `token` |

API thay doi response:

| Method | Endpoint | Thay doi |
|---|---|---|
| POST | `/api/auth/login` | Response co `accessToken`, `refreshToken`, `tokenType`, `expiresIn`, `user` |

Logic nghiep vu chinh:

- Raw refresh token chi tra cho frontend dung 1 lan; DB chi luu hash SHA-256.
- Refresh token het han sau 7 ngay.
- Refresh token rotation: token cu bi `revokedAt`, token moi duoc tao.
- Reset password thanh cong se revoke tat ca refresh token dang active cua user.
- Chua co SMTP that; `LoggingEmailService` log token o backend log, khong tra token trong response.

### 7.4 User profile, avatar, wishlist, admin user detail

Code/entity/repository/service moi va thay doi:

- `User` bo sung `avatarPublicId`, `emailVerifiedAt`.
- DTO: `UserProfileUpdateRequest`, `UserMeResponse`, `AvatarUploadResponse`, `AdminUserDetailResponse`.
- Entity: `Wishlist`.
- Repository: `WishlistRepository`.
- Service/Controller: `WishlistService`, `WishlistController`.
- `UserService`, `UserController`, `AdminUserController` bo sung profile/avatar/admin detail.
- `ReviewRepository` bo sung `countByUserId`.

Bang/entity moi:

- `WISHLISTS`: unique `(USER_ID, TOUR_ID)`.

API moi:

| Method | Endpoint | Quyen | Chuc nang | Payload/Tham so |
|---|---|---|---|---|
| PUT | `/api/users/me` | Authenticated | User cap nhat profile | `fullName`, `phone` |
| POST | `/api/users/me/avatar` | Authenticated | User upload avatar Cloudinary | multipart `file` |
| GET | `/api/users/me/wishlist` | Authenticated | Lay wishlist co paging | `page`, `size`, `sortBy`, `sortDir` |
| POST | `/api/users/me/wishlist/{tourId}` | Authenticated | Toggle wishlist tour | `tourId` |
| GET | `/api/admin/users/{id}` | Admin | Xem chi tiet user admin | `id` |

API thay doi response:

| Method | Endpoint | Thay doi |
|---|---|---|
| GET | `/api/users/me` | Response moi `UserMeResponse`, co `updatedAt`, `emailVerified` |

Logic nghiep vu chinh:

- User chi duoc tu cap nhat `fullName` va `phone`; khong nhan email/role/status.
- Avatar chi cho jpg/jpeg/png/webp, toi da 5MB, upload vao folder `avatars`; neu co avatar cu thi xoa bang `avatarPublicId`.
- Wishlist chi cho tour `PUBLISHED`; toggle lan 1 them, lan 2 xoa.
- Admin user detail tra `bookingCount`, `reviewCount`, `wishlistCount`, khong tra password/hash/token.

### 7.5 Tong quan endpoint moi sau cap nhat

So endpoint moi bo sung sau bao cao 31/05/2026: 31 endpoint.

Nhom them nhieu nhat:

- Tour Core: 21 endpoint.
- Auth mo rong: 5 endpoint.
- User/Profile/Wishlist/Admin detail: 5 endpoint.
- Booking: khong them URL moi, nhung thay doi payload/response va logic giu cho theo schedule.
- Admin tour detail: 1 endpoint nam trong nhom Tour Core.
