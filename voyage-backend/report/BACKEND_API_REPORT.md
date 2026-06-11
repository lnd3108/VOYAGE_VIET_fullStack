# BÃƒÂ¡o cÃƒÂ¡o backend VoyageViet

NgÃƒÂ y quÃƒÂ©t: 03/06/2026  
ThÃ†Â° mÃ¡Â»Â¥c: `voyage-backend`  
NguÃ¡Â»â€œn quÃƒÂ©t: `src/main/java`, `src/main/resources`, cÃƒÂ¡c controller/entity/DTO hiÃ¡Â»â€¡n cÃƒÂ³.  
CÃƒÂ´ng nghÃ¡Â»â€¡ chÃƒÂ­nh: Spring Boot 4, Java 17, Spring WebMVC, Spring Security, JWT, Spring Data JPA, Oracle, Bean Validation, Springdoc OpenAPI, Cloudinary.

## 1. TÃ¡Â»â€¢ng Quan Ã„ÂÃƒÂ£ LÃƒÂ m

Backend Ã„â€˜ÃƒÂ£ Ã„â€˜Ã†Â°Ã¡Â»Â£c tÃƒÂ¡ch theo module nghiÃ¡Â»â€¡p vÃ¡Â»Â¥, mÃ¡Â»â€”i module cÃƒÂ³ controller, DTO, entity, repository vÃƒÂ  service riÃƒÂªng khi cÃ¡ÂºÂ§n:

| Module | TrÃ¡ÂºÂ¡ng thÃƒÂ¡i | NÃ¡Â»â„¢i dung Ã„â€˜ÃƒÂ£ lÃƒÂ m |
|---|---|---|
| `auth` | Ã„ÂÃƒÂ£ lÃƒÂ m | Ã„ÂÃ„Æ’ng kÃƒÂ½, Ã„â€˜Ã„Æ’ng nhÃ¡ÂºÂ­p, access token JWT, refresh token rotation, logout, quÃƒÂªn mÃ¡ÂºÂ­t khÃ¡ÂºÂ©u, Ã„â€˜Ã¡ÂºÂ·t lÃ¡ÂºÂ¡i mÃ¡ÂºÂ­t khÃ¡ÂºÂ©u, xÃƒÂ¡c thÃ¡Â»Â±c email. |
| `user` | Ã„ÂÃƒÂ£ lÃƒÂ m | LÃ¡ÂºÂ¥y/cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t hÃ¡Â»â€œ sÃ†Â¡ cÃƒÂ¡ nhÃƒÂ¢n, upload avatar, admin quÃ¡ÂºÂ£n lÃƒÂ½ user, cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t trÃ¡ÂºÂ¡ng thÃƒÂ¡i/role, xem chi tiÃ¡ÂºÂ¿t user. |
| `role` | Ã„ÂÃƒÂ£ lÃƒÂ m | LÃ¡ÂºÂ¥y danh sÃƒÂ¡ch role hÃ¡Â»â€¡ thÃ¡Â»â€˜ng. |
| `category` | Ã„ÂÃƒÂ£ lÃƒÂ m | Public lÃ¡ÂºÂ¥y danh mÃ¡Â»Â¥c active, admin CRUD danh mÃ¡Â»Â¥c, cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t Ã¡ÂºÂ£nh vÃƒÂ  trÃ¡ÂºÂ¡ng thÃƒÂ¡i. |
| `destination` | Ã„ÂÃƒÂ£ lÃƒÂ m | Public lÃ¡ÂºÂ¥y Ã„â€˜iÃ¡Â»Æ’m Ã„â€˜Ã¡ÂºÂ¿n active, admin CRUD Ã„â€˜iÃ¡Â»Æ’m Ã„â€˜Ã¡ÂºÂ¿n, cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t Ã¡ÂºÂ£nh vÃƒÂ  trÃ¡ÂºÂ¡ng thÃƒÂ¡i. |
| `tour` | Ã„ÂÃƒÂ£ lÃƒÂ m | Public tÃƒÂ¬m/lÃ¡Â»Âc tour, tour nÃ¡Â»â€¢i bÃ¡ÂºÂ­t, chi tiÃ¡ÂºÂ¿t tour, lÃ¡Â»â€¹ch khÃ¡Â»Å¸i hÃƒÂ nh, lÃ¡Â»â€¹ch trÃƒÂ¬nh; admin CRUD tour, publish checklist, schedule, itinerary, gallery. |
| `booking` | Ã„ÂÃƒÂ£ lÃƒÂ m | User Ã„â€˜Ã¡ÂºÂ·t tour theo lÃ¡Â»â€¹ch khÃ¡Â»Å¸i hÃƒÂ nh, xem booking cÃ¡Â»Â§a mÃƒÂ¬nh, hÃ¡Â»Â§y booking; admin xem vÃƒÂ  cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t trÃ¡ÂºÂ¡ng thÃƒÂ¡i booking. |
| `payment` | Ã„ÂÃƒÂ£ lÃƒÂ m | Mock payment nÃ¡Â»â„¢i bÃ¡Â»â„¢, tÃ¡ÂºÂ¡o URL VNPay, callback UX, IPN xÃƒÂ¡c nhÃ¡ÂºÂ­n cuÃ¡Â»â€˜i, truy vÃ¡ÂºÂ¥n trÃ¡ÂºÂ¡ng thÃƒÂ¡i payment, admin payment list/detail, refund skeleton an toÃƒÂ n. |
| `promotion` | Ã„ÂÃƒÂ£ lÃƒÂ m | Admin CRUD mÃƒÂ£ giÃ¡ÂºÂ£m giÃƒÂ¡, user validate promo, tÃƒÂ­ch hÃ¡Â»Â£p promo vÃƒÂ o booking create, lÃ†Â°u usage vÃƒÂ  chÃ¡Â»â€˜ng dÃƒÂ¹ng quÃƒÂ¡ lÃ†Â°Ã¡Â»Â£t. |
| `review` | Ã„ÂÃƒÂ£ lÃƒÂ m | User tÃ¡ÂºÂ¡o Ã„â€˜ÃƒÂ¡nh giÃƒÂ¡, public xem Ã„â€˜ÃƒÂ¡nh giÃƒÂ¡ theo tour; admin kiÃ¡Â»Æ’m duyÃ¡Â»â€¡t/Ã¡ÂºÂ©n/xÃƒÂ³a Ã„â€˜ÃƒÂ¡nh giÃƒÂ¡. |
| `wishlist` | Ã„ÂÃƒÂ£ lÃƒÂ m | User xem wishlist vÃƒÂ  toggle tour yÃƒÂªu thÃƒÂ­ch. |
| `media` | Ã„ÂÃƒÂ£ lÃƒÂ m | Admin upload Ã¡ÂºÂ£nh lÃƒÂªn Cloudinary, xem danh sÃƒÂ¡ch media, xÃƒÂ³a media. |
| `feature` | Ã„ÂÃƒÂ£ lÃƒÂ m | Public lÃ¡ÂºÂ¥y feature flags, admin bÃ¡ÂºÂ­t/tÃ¡ÂºÂ¯t feature flags. |
| `admin dashboard` | Ã„ÂÃƒÂ£ lÃƒÂ m | ThÃ¡Â»â€˜ng kÃƒÂª tÃ¡Â»â€¢ng quan, thÃ¡Â»â€˜ng kÃƒÂª theo thÃƒÂ¡ng, thÃ¡Â»â€˜ng kÃƒÂª review/top tour. |
| `audit` | Ã„ÂÃƒÂ£ lÃƒÂ m | Admin xem audit log cÃƒÂ³ lÃ¡Â»Âc vÃƒÂ  phÃƒÂ¢n trang. |
| `common` | Ã„ÂÃƒÂ£ lÃƒÂ m | Response format, paging, global exception handler, security config, CORS, OpenAPI config, data seeder. |

TÃ¡Â»â€¢ng sÃ¡Â»â€˜ endpoint hiÃ¡Â»â€¡n cÃƒÂ³ trong controller: **100 endpoint**.

## 2. CÃ¡ÂºÂ¥u HÃƒÂ¬nh VÃƒÂ  NÃ¡Â»Ân TÃ¡ÂºÂ£ng

| HÃ¡ÂºÂ¡ng mÃ¡Â»Â¥c | GiÃƒÂ¡ trÃ¡Â»â€¹ hiÃ¡Â»â€¡n cÃƒÂ³ |
|---|---|
| Server port | `8081` |
| Database | Oracle JDBC |
| Hibernate | `spring.jpa.hibernate.ddl-auto=update` |
| Authentication | JWT stateless, gÃ¡Â»Â­i token qua `Authorization: Bearer <token>` |
| Password | BCrypt |
| CORS | Cho phÃƒÂ©p `http://localhost:4200` |
| Swagger/OpenAPI | `/swagger-ui/**`, `/swagger-ui.html`, `/v3/api-docs/**` |
| Upload local | TÃ¡Â»â€˜i Ã„â€˜a `5MB`/file vÃƒÂ  `5MB`/request trong `application-local.properties` |
| Response thÃƒÂ nh cÃƒÂ´ng | `success`, `message`, `data`, `timestamp` |
| Response lÃ¡Â»â€”i | `success=false`, `message`, `error`, `timestamp` |
| Paging chuÃ¡ÂºÂ©n | `content`, `page`, `size`, `totalElements`, `totalPages`, `first`, `last`, `empty`, `sortBy`, `sortDir` |

## 3. PhÃƒÂ¢n QuyÃ¡Â»Ân API

| NhÃƒÂ³m API | QuyÃ¡Â»Ân |
|---|---|
| `/api/public/**` | Public, khÃƒÂ´ng cÃ¡ÂºÂ§n token |
| `/api/auth/**` | Public, khÃƒÂ´ng cÃ¡ÂºÂ§n token |
| Swagger/OpenAPI | Public |
| `/api/admin/**` | CÃ¡ÂºÂ§n role `ADMIN`; `SUPER_ADMIN` kÃ¡ÂºÂ¿ thÃ¡Â»Â«a `ADMIN` qua role hierarchy |
| `/api/users/me` | CÃ¡ÂºÂ§n role `USER`; `ADMIN` vÃƒÂ  `SUPER_ADMIN` kÃ¡ÂºÂ¿ thÃ¡Â»Â«a `USER` |
| CÃƒÂ¡c API cÃƒÂ²n lÃ¡ÂºÂ¡i | CÃ¡ÂºÂ§n Ã„â€˜Ã„Æ’ng nhÃ¡ÂºÂ­p |

Role hierarchy hiÃ¡Â»â€¡n tÃ¡ÂºÂ¡i:

- `SUPER_ADMIN` cÃƒÂ³ quyÃ¡Â»Ân cÃ¡Â»Â§a `ADMIN`.
- `ADMIN` cÃƒÂ³ quyÃ¡Â»Ân cÃ¡Â»Â§a `USER`.

## 4. TÃ¡Â»â€¢ng HÃ¡Â»Â£p BÃ¡ÂºÂ£ng DÃ¡Â»Â¯ LiÃ¡Â»â€¡u

TÃ¡Â»â€¢ng sÃ¡Â»â€˜ bÃ¡ÂºÂ£ng JPA chÃƒÂ­nh: **19 bÃ¡ÂºÂ£ng**. CÃƒÂ¡c bÃ¡ÂºÂ£ng kÃ¡ÂºÂ¿ thÃ¡Â»Â«a `BaseEntity` thÃ†Â°Ã¡Â»Âng cÃƒÂ³ thÃƒÂªm `CREATED_AT`, `UPDATED_AT`.

| BÃ¡ÂºÂ£ng | Entity | MÃ¡Â»Â¥c Ã„â€˜ÃƒÂ­ch | CÃ¡Â»â„¢t/chÃ¡Â»â€° mÃ¡Â»Â¥c chÃƒÂ­nh |
|---|---|---|---|
| `ROLES` | `Role` | LÃ†Â°u role hÃ¡Â»â€¡ thÃ¡Â»â€˜ng | `ID`, `CODE`, `NAME`; unique `CODE` |
| `USERS` | `User` | LÃ†Â°u tÃƒÂ i khoÃ¡ÂºÂ£n ngÃ†Â°Ã¡Â»Âi dÃƒÂ¹ng/admin | `EMAIL` unique, `PASSWORD_HASH`, `PHONE`, `AVATAR_URL`, `AVATAR_PUBLIC_ID`, `STATUS`, `EMAIL_VERIFIED`, `EMAIL_VERIFIED_AT`, `ROLE_ID`, `LAST_LOGIN_AT` |
| `CATEGORIES` | `Category` | Danh mÃ¡Â»Â¥c tour | `NAME`, `SLUG` unique, `DESCRIPTION`, `IMAGE_URL`, `STATUS`, `DISPLAY_ORDER` |
| `DESTINATIONS` | `Destination` | Ã„ÂiÃ¡Â»Æ’m Ã„â€˜Ã¡ÂºÂ¿n | `NAME`, `SLUG` unique, `REGION`, `COUNTRY`, `DESCRIPTION`, `IMAGE_URL`, `LATITUDE`, `LONGITUDE`, `STATUS` |
| `TOURS` | `Tour` | Tour du lÃ¡Â»â€¹ch | `TITLE`, `SLUG` unique, `SHORT_DESCRIPTION`, `DESCRIPTION`, `THUMBNAIL_URL`, `ORIGINAL_PRICE`, `SALE_PRICE`, `DURATION_DAYS`, `DURATION_NIGHTS`, `DEPARTURE_LOCATION`, `MAX_PARTICIPANTS`, `AVAILABLE_SEATS`, `FEATURED`, `STATUS`, `CATEGORY_ID`, `DESTINATION_ID` |
| `TOUR_SCHEDULES` | `TourSchedule` | LÃ¡Â»â€¹ch khÃ¡Â»Å¸i hÃƒÂ nh cÃ¡Â»Â§a tour | `TOUR_ID`, `DEPARTURE_DATE`, `RETURN_DATE`, `PRICE_ADULT`, `PRICE_CHILD`, `PRICE_INFANT`, `SINGLE_SUPPLEMENT`, `MAX_SEATS`, `BOOKED_SEATS`, `STATUS`, `NOTES`, `CREATED_BY`, `VERSION`; index theo tour/status/ngÃƒÂ y Ã„â€˜i |
| `TOUR_ITINERARIES` | `TourItinerary` | LÃ¡Â»â€¹ch trÃƒÂ¬nh tÃ¡Â»Â«ng ngÃƒÂ y cÃ¡Â»Â§a tour | `TOUR_ID`, `DAY_NUMBER`, `TITLE`, `DESCRIPTION`, `HOTEL_NAME`, `MEALS`, `TRANSPORT_MODES`, `PLACE_NAMES`, `ACTIVITIES`, `SORT_ORDER`; unique `(TOUR_ID, DAY_NUMBER)` |
| `TOUR_IMAGES` | `TourImage` | Gallery Ã¡ÂºÂ£nh tour | `TOUR_ID`, `URL`, `PUBLIC_ID`, `ALT_TEXT`, `SORT_ORDER`, `IS_THUMBNAIL`, `WIDTH`, `HEIGHT`, `FILE_SIZE_BYTES`, `CREATED_AT` |
| `BOOKINGS` | `Booking` | Ã„ÂÃ†Â¡n Ã„â€˜Ã¡ÂºÂ·t tour | `USER_ID`, `TOUR_ID`, `SCHEDULE_ID`, `BOOKING_CODE` unique, thÃƒÂ´ng tin liÃƒÂªn hÃ¡Â»â€¡, sÃ¡Â»â€˜ lÃ†Â°Ã¡Â»Â£ng ngÃ†Â°Ã¡Â»Âi lÃ¡Â»â€ºn/trÃ¡ÂºÂ» em/em bÃƒÂ©, snapshot giÃƒÂ¡, `TOTAL_AMOUNT`, `STATUS`, `PAYMENT_STATUS`, `NOTE` |
| `PAYMENTS` | `Payment` | LÃ†Â°u cÃƒÂ¡c lÃ¡ÂºÂ§n thÃ¡Â»Â­ thanh toÃƒÂ¡n booking | `BOOKING_ID`, `AMOUNT`, `METHOD`, `STATUS`, `GATEWAY_TXN_ID` unique, `GATEWAY_ORDER_ID`, `GATEWAY_RESPONSE`, `REFUND_AMOUNT`, `REFUND_REASON`, `REFUNDED_AT`, `REFUNDED_BY`, `INITIATED_AT`, `PAID_AT`; sequence `SEQ_PAYMENT` |
| `PROMOTIONS` | `Promotion` | MÃƒÂ£ giÃ¡ÂºÂ£m giÃƒÂ¡/campaign | `CODE` unique, `NAME`, `DESCRIPTION`, `DISCOUNT_TYPE`, `DISCOUNT_VALUE`, `MAX_DISCOUNT`, `MIN_ORDER`, `MAX_USES`, `USED_COUNT`, `MAX_USES_PER_USER`, `VALID_FROM`, `VALID_UNTIL`, `STATUS`, `APPLICABLE_TOUR_IDS`, `CREATED_BY` |
| `PROMOTION_USAGES` | `PromotionUsage` | LÃ†Â°u lÃ¡Â»â€¹ch sÃ¡Â»Â­ dÃƒÂ¹ng mÃƒÂ£ giÃ¡ÂºÂ£m giÃƒÂ¡ | `PROMOTION_ID`, `USER_ID`, `BOOKING_ID`, `DISCOUNT_AMOUNT`, `USED_AT`; unique `(PROMOTION_ID, BOOKING_ID)` |
| `REVIEWS` | `Review` | Ã„ÂÃƒÂ¡nh giÃƒÂ¡ tour | `USER_ID`, `TOUR_ID`, `RATING`, `COMMENT`, `STATUS`; unique user/tour theo entity |
| `WISHLISTS` | `Wishlist` | Danh sÃƒÂ¡ch tour yÃƒÂªu thÃƒÂ­ch | `USER_ID`, `TOUR_ID`, `CREATED_AT`; unique `(USER_ID, TOUR_ID)` |
| `MEDIA` | `Media` | Metadata file upload Cloudinary | `URL`, `PUBLIC_ID`, `TYPE`, `MODULE`, `ORIGINAL_FILENAME`, `SIZE_BYTES`, `CONTENT_TYPE`; index theo module/type |
| `FEATURE_FLAGS` | `FeatureFlag` | BÃ¡ÂºÂ­t/tÃ¡ÂºÂ¯t tÃƒÂ­nh nÃ„Æ’ng | `CODE` unique, `ENABLED`, `DESCRIPTION` |
| `AUDIT_LOGS` | `AuditLog` | LÃ†Â°u lÃ¡Â»â€¹ch sÃ¡Â»Â­ thao tÃƒÂ¡c admin | `ACTION`, `ACTOR_ID`, `ACTOR_EMAIL`, `TARGET_TYPE`, `TARGET_ID`, `TARGET_LABEL`, `OLD_VALUE`, `NEW_VALUE`, `DESCRIPTION`; index theo action/actor/target |
| `REFRESH_TOKENS` | `RefreshToken` | LÃ†Â°u refresh token Ã„â€˜ÃƒÂ£ hash | `USER_ID`, `TOKEN_HASH` unique, `ISSUED_AT`, `EXPIRES_AT`, `REVOKED_AT`, `IP_ADDRESS`, `USER_AGENT` |
| `EMAIL_TOKENS` | `EmailToken` | Token xÃƒÂ¡c thÃ¡Â»Â±c email vÃƒÂ  reset password | `USER_ID`, `TOKEN` unique, `TYPE`, `EXPIRES_AT`, `USED_AT`, `CREATED_AT` |

## 5. Enum Ã„Âang DÃƒÂ¹ng

| Enum | GiÃƒÂ¡ trÃ¡Â»â€¹ |
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

## 6. TÃ¡Â»â€¢ng HÃ¡Â»Â£p Endpoint

### 6.1 Common / Health / Home

| Method | Endpoint | QuyÃ¡Â»Ân | ChÃ¡Â»Â©c nÃ„Æ’ng | Tham sÃ¡Â»â€˜/Payload |
|---|---|---|---|---|
| GET | `/api/public/ping` | Public | KiÃ¡Â»Æ’m tra backend public Ã„â€˜ang chÃ¡ÂºÂ¡y | KhÃƒÂ´ng |
| GET | `/api/public/test-error` | Public | Test response lÃ¡Â»â€”i business | KhÃƒÂ´ng |
| GET | `/api/admin/ping` | Admin | KiÃ¡Â»Æ’m tra API admin Ã„â€˜ang chÃ¡ÂºÂ¡y | KhÃƒÂ´ng |
| GET | `/api/public/home` | Public | LÃ¡ÂºÂ¥y dÃ¡Â»Â¯ liÃ¡Â»â€¡u trang home | KhÃƒÂ´ng |

### 6.2 Auth

| Method | Endpoint | QuyÃ¡Â»Ân | ChÃ¡Â»Â©c nÃ„Æ’ng | Payload chÃƒÂ­nh |
|---|---|---|---|---|
| POST | `/api/auth/register` | Public | Ã„ÂÃ„Æ’ng kÃƒÂ½ tÃƒÂ i khoÃ¡ÂºÂ£n | `fullName`, `email`, `password`, `phone` |
| POST | `/api/auth/login` | Public | Ã„ÂÃ„Æ’ng nhÃ¡ÂºÂ­p, trÃ¡ÂºÂ£ access token vÃƒÂ  refresh token | `email`, `password` |
| POST | `/api/auth/refresh` | Public | Rotate refresh token vÃƒÂ  cÃ¡ÂºÂ¥p access token mÃ¡Â»â€ºi | `refreshToken` |
| POST | `/api/auth/logout` | Public | Revoke refresh token, xÃ¡Â»Â­ lÃƒÂ½ idempotent | `refreshToken` |
| POST | `/api/auth/forgot-password` | Public | TÃ¡ÂºÂ¡o token Ã„â€˜Ã¡ÂºÂ·t lÃ¡ÂºÂ¡i mÃ¡ÂºÂ­t khÃ¡ÂºÂ©u nÃ¡ÂºÂ¿u email tÃ¡Â»â€œn tÃ¡ÂºÂ¡i | `email` |
| POST | `/api/auth/reset-password` | Public | Ã„ÂÃ¡ÂºÂ·t lÃ¡ÂºÂ¡i mÃ¡ÂºÂ­t khÃ¡ÂºÂ©u bÃ¡ÂºÂ±ng token | `token`, `newPassword`, `confirmPassword` |
| POST | `/api/auth/verify-email` | Public | XÃƒÂ¡c thÃ¡Â»Â±c email bÃ¡ÂºÂ±ng token | `token` |

Ghi chÃƒÂº nghiÃ¡Â»â€¡p vÃ¡Â»Â¥:

- Refresh token lÃ†Â°u trong DB dÃ†Â°Ã¡Â»â€ºi dÃ¡ÂºÂ¡ng SHA-256 hash, khÃƒÂ´ng lÃ†Â°u raw token.
- Refresh token rotation: token cÃ…Â© bÃ¡Â»â€¹ revoke, token mÃ¡Â»â€ºi Ã„â€˜Ã†Â°Ã¡Â»Â£c tÃ¡ÂºÂ¡o.
- Reset password thÃƒÂ nh cÃƒÂ´ng revoke refresh token active cÃ¡Â»Â§a user.
- Email thÃ¡Â»Â±c tÃ¡ÂºÂ¿ chÃ†Â°a cÃ¡ÂºÂ¥u hÃƒÂ¬nh SMTP; service hiÃ¡Â»â€¡n tÃ¡ÂºÂ¡i log token Ã¡Â»Å¸ backend log.

### 6.3 User, Role, Wishlist

| Method | Endpoint | QuyÃ¡Â»Ân | ChÃ¡Â»Â©c nÃ„Æ’ng | Tham sÃ¡Â»â€˜/Payload |
|---|---|---|---|---|
| GET | `/api/users/me` | User | LÃ¡ÂºÂ¥y thÃƒÂ´ng tin user hiÃ¡Â»â€¡n tÃ¡ÂºÂ¡i | Token JWT |
| PUT | `/api/users/me` | Authenticated | User cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t hÃ¡Â»â€œ sÃ†Â¡ | `fullName`, `phone` |
| POST | `/api/users/me/avatar` | Authenticated | Upload avatar Cloudinary | multipart `file` |
| GET | `/api/users/me/wishlist` | Authenticated | LÃ¡ÂºÂ¥y wishlist cÃƒÂ³ phÃƒÂ¢n trang | `page`, `size`, `sortBy`, `sortDir` |
| POST | `/api/users/me/wishlist/{tourId}` | Authenticated | Toggle tour yÃƒÂªu thÃƒÂ­ch | `tourId` |
| GET | `/api/public/roles` | Public | LÃ¡ÂºÂ¥y danh sÃƒÂ¡ch role | KhÃƒÂ´ng |
| GET | `/api/admin/users` | Admin | LÃ¡ÂºÂ¥y danh sÃƒÂ¡ch user cÃƒÂ³ lÃ¡Â»Âc vÃƒÂ  phÃƒÂ¢n trang | `keyword`, `status`, `page`, `size`, `sortBy`, `sortDir` |
| GET | `/api/admin/users/{id}` | Admin | Xem chi tiÃ¡ÂºÂ¿t user cho admin | `id` |
| PATCH | `/api/admin/users/{id}/status` | Admin | CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t trÃ¡ÂºÂ¡ng thÃƒÂ¡i user | `status` |
| PATCH | `/api/admin/users/{id}/role` | Admin | CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t role user | `role` |

Ghi chÃƒÂº nghiÃ¡Â»â€¡p vÃ¡Â»Â¥:

- User chÃ¡Â»â€° Ã„â€˜Ã†Â°Ã¡Â»Â£c tÃ¡Â»Â± cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t `fullName` vÃƒÂ  `phone`, khÃƒÂ´ng nhÃ¡ÂºÂ­n email/role/status tÃ¡Â»Â« request.
- Avatar chÃ¡Â»â€° cho jpg/jpeg/png/webp, tÃ¡Â»â€˜i Ã„â€˜a 5MB, upload vÃƒÂ o folder `avatars`.
- Wishlist chÃ¡Â»â€° cho tour `PUBLISHED`; gÃ¡Â»Âi toggle lÃ¡ÂºÂ§n 1 thÃƒÂªm, lÃ¡ÂºÂ§n 2 xÃƒÂ³a.
- Admin user detail trÃ¡ÂºÂ£ thÃƒÂªm `bookingCount`, `reviewCount`, `wishlistCount`, khÃƒÂ´ng trÃ¡ÂºÂ£ password/token.

### 6.4 Category

| Method | Endpoint | QuyÃ¡Â»Ân | ChÃ¡Â»Â©c nÃ„Æ’ng | Tham sÃ¡Â»â€˜/Payload |
|---|---|---|---|---|
| GET | `/api/public/categories` | Public | LÃ¡ÂºÂ¥y danh mÃ¡Â»Â¥c active | KhÃƒÂ´ng |
| GET | `/api/admin/categories` | Admin | LÃ¡ÂºÂ¥y tÃ¡ÂºÂ¥t cÃ¡ÂºÂ£ danh mÃ¡Â»Â¥c | KhÃƒÂ´ng |
| POST | `/api/admin/categories` | Admin | TÃ¡ÂºÂ¡o danh mÃ¡Â»Â¥c | `name`, `slug`, `description`, `imageUrl`, `displayOrder` |
| PUT | `/api/admin/categories/{id}` | Admin | CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t danh mÃ¡Â»Â¥c | `name`, `slug`, `description`, `imageUrl`, `status`, `displayOrder` |
| PATCH | `/api/admin/categories/{id}/status` | Admin | CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t trÃ¡ÂºÂ¡ng thÃƒÂ¡i danh mÃ¡Â»Â¥c | `status` |
| DELETE | `/api/admin/categories/{id}` | Admin | XÃƒÂ³a danh mÃ¡Â»Â¥c | `id` |
| PATCH | `/api/admin/categories/{id}/image` | Admin | CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t Ã¡ÂºÂ£nh danh mÃ¡Â»Â¥c | `imageUrl` |

### 6.5 Destination

| Method | Endpoint | QuyÃ¡Â»Ân | ChÃ¡Â»Â©c nÃ„Æ’ng | Tham sÃ¡Â»â€˜/Payload |
|---|---|---|---|---|
| GET | `/api/public/destinations` | Public | LÃ¡ÂºÂ¥y Ã„â€˜iÃ¡Â»Æ’m Ã„â€˜Ã¡ÂºÂ¿n active | KhÃƒÂ´ng |
| GET | `/api/admin/destinations` | Admin | LÃ¡ÂºÂ¥y tÃ¡ÂºÂ¥t cÃ¡ÂºÂ£ Ã„â€˜iÃ¡Â»Æ’m Ã„â€˜Ã¡ÂºÂ¿n | KhÃƒÂ´ng |
| POST | `/api/admin/destinations` | Admin | TÃ¡ÂºÂ¡o Ã„â€˜iÃ¡Â»Æ’m Ã„â€˜Ã¡ÂºÂ¿n | `name`, `slug`, `region`, `country`, `description`, `imageUrl`, `latitude`, `longitude` |
| PUT | `/api/admin/destinations/{id}` | Admin | CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t Ã„â€˜iÃ¡Â»Æ’m Ã„â€˜Ã¡ÂºÂ¿n | `name`, `slug`, `region`, `country`, `description`, `imageUrl`, `latitude`, `longitude`, `status` |
| PATCH | `/api/admin/destinations/{id}/status` | Admin | CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t trÃ¡ÂºÂ¡ng thÃƒÂ¡i Ã„â€˜iÃ¡Â»Æ’m Ã„â€˜Ã¡ÂºÂ¿n | `status` |
| DELETE | `/api/admin/destinations/{id}` | Admin | XÃƒÂ³a Ã„â€˜iÃ¡Â»Æ’m Ã„â€˜Ã¡ÂºÂ¿n | `id` |
| PATCH | `/api/admin/destinations/{id}/image` | Admin | CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t Ã¡ÂºÂ£nh Ã„â€˜iÃ¡Â»Æ’m Ã„â€˜Ã¡ÂºÂ¿n | `imageUrl` |

### 6.6 Tour Public

| Method | Endpoint | QuyÃ¡Â»Ân | ChÃ¡Â»Â©c nÃ„Æ’ng | Tham sÃ¡Â»â€˜ |
|---|---|---|---|---|
| GET | `/api/public/tours` | Public | TÃƒÂ¬m, lÃ¡Â»Âc, phÃƒÂ¢n trang tour public | `keyword`, `categorySlug`, `destinationSlug`, `region`, `departureLocation`, `minPrice`, `maxPrice`, `minDurationDays`, `maxDurationDays`, `people`, `page`, `size`, `sortBy`, `sortDir` |
| GET | `/api/public/tours/featured` | Public | LÃ¡ÂºÂ¥y tour nÃ¡Â»â€¢i bÃ¡ÂºÂ­t | KhÃƒÂ´ng |
| GET | `/api/public/tours/{slug}` | Public | LÃ¡ÂºÂ¥y chi tiÃ¡ÂºÂ¿t tour theo slug | `slug` |
| GET | `/api/public/tours/{slug}/schedules` | Public | LÃ¡ÂºÂ¥y lÃ¡Â»â€¹ch khÃ¡Â»Å¸i hÃƒÂ nh public cÃ¡Â»Â§a tour | `slug` |
| GET | `/api/public/tours/{slug}/itinerary` | Public | LÃ¡ÂºÂ¥y lÃ¡Â»â€¹ch trÃƒÂ¬nh public cÃ¡Â»Â§a tour | `slug` |

Ghi chÃƒÂº nghiÃ¡Â»â€¡p vÃ¡Â»Â¥:

- Public schedule chÃ¡Â»â€° trÃ¡ÂºÂ£ lÃ¡Â»â€¹ch `OPEN` vÃƒÂ  `departureDate >= today`.
- DTO public cÃƒÂ³ `remainingSeats`, khÃƒÂ´ng expose `bookedSeats`.

### 6.7 Tour Admin

| Method | Endpoint | QuyÃ¡Â»Ân | ChÃ¡Â»Â©c nÃ„Æ’ng | Payload/Tham sÃ¡Â»â€˜ chÃƒÂ­nh |
|---|---|---|---|---|
| GET | `/api/admin/tours` | Admin | LÃ¡ÂºÂ¥y tÃ¡ÂºÂ¥t cÃ¡ÂºÂ£ tour cho admin | KhÃƒÂ´ng |
| GET | `/api/admin/tours/{id}` | Admin | LÃ¡ÂºÂ¥y chi tiÃ¡ÂºÂ¿t tour admin, kÃƒÂ¨m count schedule/image/itinerary vÃƒÂ  publish checklist | `id` |
| POST | `/api/admin/tours` | Admin | TÃ¡ÂºÂ¡o tour | `title`, `slug`, `shortDescription`, `description`, `thumbnailUrl`, `originalPrice`, `salePrice`, `durationDays`, `durationNights`, `departureLocation`, `maxParticipants`, `availableSeats`, `featured`, `status`, `categoryId`, `destinationId` |
| PUT | `/api/admin/tours/{id}` | Admin | CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t tour | Payload nhÃ†Â° tÃ¡ÂºÂ¡o tour |
| PATCH | `/api/admin/tours/{id}/status` | Admin | CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t trÃ¡ÂºÂ¡ng thÃƒÂ¡i tour | `status` |
| DELETE | `/api/admin/tours/{id}` | Admin | XÃƒÂ³a tour | `id` |
| PATCH | `/api/admin/tours/{id}/thumbnail` | Admin | CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t thumbnail tour bÃ¡ÂºÂ±ng URL | `imageUrl` |
| GET | `/api/admin/tours/{id}/publish-checklist` | Admin | LÃ¡ÂºÂ¥y checklist trÃ†Â°Ã¡Â»â€ºc khi publish | `id` |
| POST | `/api/admin/tours/{id}/publish` | Admin | Publish tour nÃ¡ÂºÂ¿u checklist Ã„â€˜Ã¡ÂºÂ¡t | `id` |

Checklist publish tour gÃ¡Â»â€œm cÃƒÂ¡c Ã„â€˜iÃ¡Â»Âu kiÃ¡Â»â€¡n chÃƒÂ­nh: tÃƒÂªn tour, category, destination, thumbnail, gallery, itinerary, open schedule, giÃƒÂ¡ hÃ¡Â»Â£p lÃ¡Â»â€¡, sÃ¡Â»â€˜ ghÃ¡ÂºÂ¿ hÃ¡Â»Â£p lÃ¡Â»â€¡.

### 6.8 Tour Schedule Admin

| Method | Endpoint | QuyÃ¡Â»Ân | ChÃ¡Â»Â©c nÃ„Æ’ng | Payload/Tham sÃ¡Â»â€˜ chÃƒÂ­nh |
|---|---|---|---|---|
| POST | `/api/admin/tours/{id}/schedules` | Admin | TÃ¡ÂºÂ¡o lÃ¡Â»â€¹ch khÃ¡Â»Å¸i hÃƒÂ nh | `departureDate`, `returnDate`, `priceAdult`, `priceChild`, `priceInfant`, `singleSupplement`, `maxSeats`, `bookedSeats`, `status`, `notes` |
| GET | `/api/admin/tours/{id}/schedules` | Admin | LÃ¡ÂºÂ¥y danh sÃƒÂ¡ch lÃ¡Â»â€¹ch khÃ¡Â»Å¸i hÃƒÂ nh admin | `status`, `page`, `size` |
| GET | `/api/admin/tours/{tourId}/schedules/{id}` | Admin | LÃ¡ÂºÂ¥y chi tiÃ¡ÂºÂ¿t lÃ¡Â»â€¹ch khÃ¡Â»Å¸i hÃƒÂ nh | `tourId`, `id` |
| PUT | `/api/admin/tours/{tourId}/schedules/{id}` | Admin | CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t lÃ¡Â»â€¹ch khÃ¡Â»Å¸i hÃƒÂ nh | Payload nhÃ†Â° tÃ¡ÂºÂ¡o lÃ¡Â»â€¹ch |
| DELETE | `/api/admin/tours/{tourId}/schedules/{id}` | Admin | XÃƒÂ³a lÃ¡Â»â€¹ch khÃ¡Â»Å¸i hÃƒÂ nh | KhÃƒÂ´ng cho xÃƒÂ³a nÃ¡ÂºÂ¿u Ã„â€˜ÃƒÂ£ cÃƒÂ³ booking |
| PATCH | `/api/admin/tours/{tourId}/schedules/{id}/status` | Admin | CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t trÃ¡ÂºÂ¡ng thÃƒÂ¡i lÃ¡Â»â€¹ch | `status` |
| POST | `/api/admin/tours/{tourId}/schedules/{id}/duplicate` | Admin | NhÃƒÂ¢n bÃ¡ÂºÂ£n lÃ¡Â»â€¹ch khÃ¡Â»Å¸i hÃƒÂ nh | `departureDate` |

Ghi chÃƒÂº nghiÃ¡Â»â€¡p vÃ¡Â»Â¥:

- Schedule tÃ¡Â»Â± chuyÃ¡Â»Æ’n `FULL` khi `bookedSeats >= maxSeats`.
- `TourSchedule` dÃƒÂ¹ng `@Version` Ã„â€˜Ã¡Â»Æ’ chÃ¡Â»â€˜ng oversell khi Ã„â€˜Ã¡ÂºÂ·t tour Ã„â€˜Ã¡Â»â€œng thÃ¡Â»Âi.

### 6.9 Tour Itinerary Admin

| Method | Endpoint | QuyÃ¡Â»Ân | ChÃ¡Â»Â©c nÃ„Æ’ng | Payload/Tham sÃ¡Â»â€˜ chÃƒÂ­nh |
|---|---|---|---|---|
| GET | `/api/admin/tours/{id}/itineraries` | Admin | LÃ¡ÂºÂ¥y lÃ¡Â»â€¹ch trÃƒÂ¬nh admin | `id` |
| PUT | `/api/admin/tours/{id}/itineraries` | Admin | LÃ†Â°u replace-all lÃ¡Â»â€¹ch trÃƒÂ¬nh | `items[]` gÃ¡Â»â€œm `id`, `dayNumber`, `title`, `description`, `hotelName`, `meals`, `transportModes`, `placeNames`, `activities`, `sortOrder` |
| POST | `/api/admin/tours/{id}/itineraries/reorder` | Admin | SÃ¡ÂºÂ¯p xÃ¡ÂºÂ¿p lÃ¡Â»â€¹ch trÃƒÂ¬nh | `items[]: id, sortOrder` |

Ghi chÃƒÂº nghiÃ¡Â»â€¡p vÃ¡Â»Â¥:

- KhÃƒÂ´ng Ã„â€˜Ã†Â°Ã¡Â»Â£c trÃƒÂ¹ng `dayNumber` trong cÃƒÂ¹ng tour.
- LÃ¡Â»â€¹ch trÃƒÂ¬nh sort theo `dayNumber ASC`, sau Ã„â€˜ÃƒÂ³ `sortOrder ASC`.

### 6.10 Tour Image Admin

| Method | Endpoint | QuyÃ¡Â»Ân | ChÃ¡Â»Â©c nÃ„Æ’ng | Payload/Tham sÃ¡Â»â€˜ chÃƒÂ­nh |
|---|---|---|---|---|
| GET | `/api/admin/tours/{id}/images` | Admin | LÃ¡ÂºÂ¥y gallery Ã¡ÂºÂ£nh tour | `id` |
| POST | `/api/admin/tours/{id}/images` | Admin | Upload Ã¡ÂºÂ£nh tour | multipart `file`, `altText` |
| DELETE | `/api/admin/tours/{tourId}/images/{imageId}` | Admin | XÃƒÂ³a Ã¡ÂºÂ£nh tour | `tourId`, `imageId`; khÃƒÂ´ng cho xÃƒÂ³a thumbnail nÃ¡ÂºÂ¿u cÃƒÂ²n Ã¡ÂºÂ£nh khÃƒÂ¡c |
| PATCH | `/api/admin/tours/{tourId}/images/{imageId}/thumbnail` | Admin | Ã„ÂÃ¡ÂºÂ·t Ã¡ÂºÂ£nh lÃƒÂ m thumbnail | `tourId`, `imageId` |
| PATCH | `/api/admin/tours/{id}/images/reorder` | Admin | SÃ¡ÂºÂ¯p xÃ¡ÂºÂ¿p Ã¡ÂºÂ£nh | `items[]: id, sortOrder` |
| PATCH | `/api/admin/tours/{tourId}/images/{imageId}/alt` | Admin | CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t alt text | `altText` |

Ghi chÃƒÂº nghiÃ¡Â»â€¡p vÃ¡Â»Â¥:

- TÃ¡Â»â€˜i Ã„â€˜a 10 Ã¡ÂºÂ£nh/tour.
- ChÃ¡Â»â€° 1 Ã¡ÂºÂ£nh thumbnail/tour.

### 6.11 Booking

| Method | Endpoint | QuyÃ¡Â»Ân | ChÃ¡Â»Â©c nÃ„Æ’ng | Payload/Tham sÃ¡Â»â€˜ chÃƒÂ­nh |
|---|---|---|---|---|
| POST | `/api/bookings` | Authenticated | TÃ¡ÂºÂ¡o booking/Ã„â€˜Ã¡ÂºÂ·t tour theo lÃ¡Â»â€¹ch khÃ¡Â»Å¸i hÃƒÂ nh | `scheduleId`, `contactName`, `contactEmail`, `contactPhone`, `adultCount`, `childCount`, `infantCount`, `note`; vÃ¡ÂºÂ«n cÃƒÂ²n field cÃ…Â© `tourId`, `startDate`, `numberOfPeople` Ã„â€˜Ã¡Â»Æ’ parse payload cÃ…Â© |
| GET | `/api/bookings/me` | Authenticated | LÃ¡ÂºÂ¥y booking cÃ¡Â»Â§a user hiÃ¡Â»â€¡n tÃ¡ÂºÂ¡i | `status`, `page`, `size`, `sortBy`, `sortDir` |
| PATCH | `/api/bookings/{id}/cancel` | Authenticated | User hÃ¡Â»Â§y booking cÃ¡Â»Â§a mÃƒÂ¬nh | `id` |
| GET | `/api/admin/bookings` | Admin | Admin lÃ¡ÂºÂ¥y danh sÃƒÂ¡ch booking | `status`, `page`, `size`, `sortBy`, `sortDir` |
| PATCH | `/api/admin/bookings/{id}/status` | Admin | Admin cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t trÃ¡ÂºÂ¡ng thÃƒÂ¡i booking | `status` |

Ghi chÃƒÂº nghiÃ¡Â»â€¡p vÃ¡Â»Â¥:

- Booking mÃ¡Â»â€ºi bÃ¡ÂºÂ¯t buÃ¡Â»â„¢c cÃƒÂ³ `scheduleId`.
- `PENDING` vÃ¡ÂºÂ«n giÃ¡Â»Â¯ chÃ¡Â»â€” Ã„â€˜Ã¡Â»Æ’ trÃƒÂ¡nh oversell.
- HÃ¡Â»Â§y booking `PENDING`/`CONFIRMED` sÃ¡ÂºÂ½ release ghÃ¡ÂºÂ¿ khÃ¡Â»Âi schedule.
- NÃ¡ÂºÂ¿u schedule Ã„â€˜ang `FULL` vÃƒÂ  Ã„â€˜Ã†Â°Ã¡Â»Â£c release ghÃ¡ÂºÂ¿, trÃ¡ÂºÂ¡ng thÃƒÂ¡i cÃƒÂ³ thÃ¡Â»Æ’ chuyÃ¡Â»Æ’n lÃ¡ÂºÂ¡i `OPEN`.
- Khi Ã„â€˜Ã¡ÂºÂ·t Ã„â€˜Ã¡Â»â€œng thÃ¡Â»Âi bÃ¡Â»â€¹ optimistic lock, hÃ¡Â»â€¡ thÃ¡Â»â€˜ng trÃ¡ÂºÂ£ lÃ¡Â»â€”i yÃƒÂªu cÃ¡ÂºÂ§u thÃ¡Â»Â­ lÃ¡ÂºÂ¡i.

### 6.12 Review

| Method | Endpoint | QuyÃ¡Â»Ân | ChÃ¡Â»Â©c nÃ„Æ’ng | Payload/Tham sÃ¡Â»â€˜ chÃƒÂ­nh |
|---|---|---|---|---|
| POST | `/api/reviews` | Authenticated | TÃ¡ÂºÂ¡o Ã„â€˜ÃƒÂ¡nh giÃƒÂ¡ tour | `tourId`, `rating`, `comment` |
| GET | `/api/public/tours/{tourSlug}/reviews` | Public | LÃ¡ÂºÂ¥y Ã„â€˜ÃƒÂ¡nh giÃƒÂ¡ public theo tour | `tourSlug` |
| GET | `/api/admin/reviews` | Admin | Admin lÃ¡ÂºÂ¥y danh sÃƒÂ¡ch review | `status`, `page`, `size`, `sortBy`, `sortDir` |
| PATCH | `/api/admin/reviews/{id}/status` | Admin | CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t trÃ¡ÂºÂ¡ng thÃƒÂ¡i review | `status` |
| DELETE | `/api/admin/reviews/{id}` | Admin | XÃƒÂ³a review | `id` |

### 6.13 Media

| Method | Endpoint | QuyÃ¡Â»Ân | ChÃ¡Â»Â©c nÃ„Æ’ng | Payload/Tham sÃ¡Â»â€˜ chÃƒÂ­nh |
|---|---|---|---|---|
| GET | `/api/admin/media` | Admin | LÃ¡ÂºÂ¥y danh sÃƒÂ¡ch media | `module`, `page`, `size`, `sortBy`, `sortDir` |
| POST | `/api/admin/media/upload` | Admin | Upload Ã¡ÂºÂ£nh lÃƒÂªn Cloudinary | multipart `file`, `module` |
| DELETE | `/api/admin/media/{id}` | Admin | XÃƒÂ³a media | `id` |

### 6.14 Feature Flag

| Method | Endpoint | QuyÃ¡Â»Ân | ChÃ¡Â»Â©c nÃ„Æ’ng | Payload/Tham sÃ¡Â»â€˜ chÃƒÂ­nh |
|---|---|---|---|---|
| GET | `/api/public/features` | Public | LÃ¡ÂºÂ¥y map feature flag public | KhÃƒÂ´ng |
| GET | `/api/admin/features` | Admin | LÃ¡ÂºÂ¥y tÃ¡ÂºÂ¥t cÃ¡ÂºÂ£ feature flags | KhÃƒÂ´ng |
| PATCH | `/api/admin/features/{code}` | Admin | BÃ¡ÂºÂ­t/tÃ¡ÂºÂ¯t feature flag | `enabled` |

### 6.15 Admin Dashboard

| Method | Endpoint | QuyÃ¡Â»Ân | ChÃ¡Â»Â©c nÃ„Æ’ng | Tham sÃ¡Â»â€˜ |
|---|---|---|---|---|
| GET | `/api/admin/dashboard/summary` | Admin | ThÃ¡Â»â€˜ng kÃƒÂª tÃ¡Â»â€¢ng quan dashboard | KhÃƒÂ´ng |
| GET | `/api/admin/dashboard/monthly` | Admin | ThÃ¡Â»â€˜ng kÃƒÂª theo thÃƒÂ¡ng | `year` |
| GET | `/api/admin/dashboard/reviews` | Admin | ThÃ¡Â»â€˜ng kÃƒÂª review/top rated tour | `limit` |

### 6.16 Audit Log

| Method | Endpoint | QuyÃ¡Â»Ân | ChÃ¡Â»Â©c nÃ„Æ’ng | Tham sÃ¡Â»â€˜ |
|---|---|---|---|---|
| GET | `/api/admin/audit-logs` | Admin | LÃ¡ÂºÂ¥y audit logs cÃƒÂ³ lÃ¡Â»Âc vÃƒÂ  phÃƒÂ¢n trang | `actorEmail`, `targetType`, `page`, `size`, `sortBy`, `sortDir` |

## 7. ThÃ¡Â»â€˜ng KÃƒÂª Endpoint Theo NhÃƒÂ³m

| NhÃƒÂ³m | SÃ¡Â»â€˜ endpoint |
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
| **TÃ¡Â»â€¢ng cÃ¡Â»â„¢ng** | **100** |

## 8. LuÃ¡Â»â€œng NghiÃ¡Â»â€¡p VÃ¡Â»Â¥ ChÃƒÂ­nh

### 8.1 Auth

- Register tÃ¡ÂºÂ¡o user mÃ¡ÂºÂ·c Ã„â€˜Ã¡Â»â€¹nh role `USER`.
- Login trÃ¡ÂºÂ£ `accessToken`, `refreshToken`, `tokenType`, `expiresIn`, `user`.
- Refresh token dÃƒÂ¹ng cÃ†Â¡ chÃ¡ÂºÂ¿ rotation vÃƒÂ  revoke token cÃ…Â©.
- Logout nhÃ¡ÂºÂ­n refresh token vÃƒÂ  revoke nÃ¡ÂºÂ¿u cÃƒÂ²n active.
- Forgot/reset password dÃƒÂ¹ng `EMAIL_TOKENS` loÃ¡ÂºÂ¡i `PASSWORD_RESET`.
- Verify email dÃƒÂ¹ng `EMAIL_TOKENS` loÃ¡ÂºÂ¡i `EMAIL_VERIFY`.

### 8.2 Tour VÃƒÂ  Publish

- Admin tÃ¡ÂºÂ¡o tour Ã¡Â»Å¸ trÃ¡ÂºÂ¡ng thÃƒÂ¡i nhÃƒÂ¡p hoÃ¡ÂºÂ·c trÃ¡ÂºÂ¡ng thÃƒÂ¡i Ã„â€˜Ã†Â°Ã¡Â»Â£c gÃ¡Â»Â­i trong request.
- Tour public chÃ¡Â»â€° nÃƒÂªn hiÃ¡Â»Æ’n thÃ¡Â»â€¹ tour phÃƒÂ¹ hÃ¡Â»Â£p trÃ¡ÂºÂ¡ng thÃƒÂ¡i public trong service.
- Publish tour cÃ¡ÂºÂ§n Ã„â€˜Ã¡ÂºÂ¡t checklist: thÃƒÂ´ng tin cÃ†Â¡ bÃ¡ÂºÂ£n, category, destination, thumbnail/gallery, itinerary, lÃ¡Â»â€¹ch `OPEN`, giÃƒÂ¡ vÃƒÂ  sÃ¡Â»â€˜ ghÃ¡ÂºÂ¿ hÃ¡Â»Â£p lÃ¡Â»â€¡.
- Schedule lÃƒÂ  nguÃ¡Â»â€œn chÃƒÂ­nh cho giÃƒÂ¡ theo ngÃ†Â°Ã¡Â»Âi lÃ¡Â»â€ºn/trÃ¡ÂºÂ» em/em bÃƒÂ© vÃƒÂ  sÃ¡Â»â€˜ ghÃ¡ÂºÂ¿ cÃƒÂ²n lÃ¡ÂºÂ¡i.

### 8.3 Booking Theo LÃ¡Â»â€¹ch KhÃ¡Â»Å¸i HÃƒÂ nh

- User chÃ¡Â»Ân `scheduleId` khi Ã„â€˜Ã¡ÂºÂ·t tour.
- HÃ¡Â»â€¡ thÃ¡Â»â€˜ng snapshot giÃƒÂ¡ tÃ¡ÂºÂ¡i thÃ¡Â»Âi Ã„â€˜iÃ¡Â»Æ’m Ã„â€˜Ã¡ÂºÂ·t Ã„â€˜Ã¡Â»Æ’ booking khÃƒÂ´ng bÃ¡Â»â€¹ Ã¡ÂºÂ£nh hÃ†Â°Ã¡Â»Å¸ng khi admin Ã„â€˜Ã¡Â»â€¢i giÃƒÂ¡ schedule sau Ã„â€˜ÃƒÂ³.
- `bookedSeats` tÃ„Æ’ng ngay khi tÃ¡ÂºÂ¡o booking `PENDING`.
- Khi booking bÃ¡Â»â€¹ hÃ¡Â»Â§y, ghÃ¡ÂºÂ¿ Ã„â€˜Ã†Â°Ã¡Â»Â£c release lÃ¡ÂºÂ¡i schedule.

### 8.4 Media, Avatar, Gallery

- Media admin upload vÃƒÂ o Cloudinary vÃƒÂ  lÃ†Â°u metadata trong `MEDIA`.
- Avatar user upload vÃƒÂ o folder `avatars`, user lÃ†Â°u `avatarUrl` vÃƒÂ  `avatarPublicId`.
- Tour gallery lÃ†Â°u riÃƒÂªng trong `TOUR_IMAGES`, cÃƒÂ³ rule tÃ¡Â»â€˜i Ã„â€˜a 10 Ã¡ÂºÂ£nh vÃƒÂ  chÃ¡Â»â€° mÃ¡Â»â„¢t thumbnail.

## 9. LÃ†Â°u ÃƒÂ KÃ¡Â»Â¹ ThuÃ¡ÂºÂ­t

- `src/main/resources/application-local.properties` Ã„â€˜ang chÃ¡Â»Â©a thÃƒÂ´ng tin database local vÃƒÂ  Cloudinary. NÃ¡ÂºÂ¿u repo dÃƒÂ¹ng chung, nÃƒÂªn chuyÃ¡Â»Æ’n secret sang biÃ¡ÂºÂ¿n mÃƒÂ´i trÃ†Â°Ã¡Â»Âng hoÃ¡ÂºÂ·c file local khÃƒÂ´ng commit.
- MÃ¡Â»â„¢t sÃ¡Â»â€˜ message tiÃ¡ÂºÂ¿ng ViÃ¡Â»â€¡t trong source Ã„â€˜ang bÃ¡Â»â€¹ lÃ¡Â»â€”i encoding khi Ã„â€˜Ã¡Â»Âc qua terminal, vÃƒÂ­ dÃ¡Â»Â¥ trong `AuthController` vÃƒÂ  `WishlistController`. BÃƒÂ¡o cÃƒÂ¡o nÃƒÂ y Ã„â€˜ÃƒÂ£ Ã„â€˜Ã†Â°Ã¡Â»Â£c viÃ¡ÂºÂ¿t lÃ¡ÂºÂ¡i bÃ¡ÂºÂ±ng tiÃ¡ÂºÂ¿ng ViÃ¡Â»â€¡t cÃƒÂ³ dÃ¡ÂºÂ¥u Ã„â€˜ÃƒÂºng Unicode, nhÃ†Â°ng source code vÃ¡ÂºÂ«n nÃƒÂªn kiÃ¡Â»Æ’m tra lÃ¡ÂºÂ¡i charset trong IDE.
- Test nghiÃ¡Â»â€¡p vÃ¡Â»Â¥ chi tiÃ¡ÂºÂ¿t chÃ†Â°a thÃ¡ÂºÂ¥y nhiÃ¡Â»Âu; hiÃ¡Â»â€¡n cÃƒÂ³ test khÃ¡Â»Å¸i Ã„â€˜Ã¡Â»â„¢ng mÃ¡ÂºÂ·c Ã„â€˜Ã¡Â»â€¹nh `VoyageBackendApplicationTests`.
- `SecurityConfig` chÃ¡Â»â€° match chÃƒÂ­nh xÃƒÂ¡c `/api/users/me` vÃ¡Â»â€ºi `hasRole("USER")`; cÃƒÂ¡c endpoint nhÃ†Â° `/api/users/me/avatar` vÃƒÂ  `/api/users/me/wishlist/**` rÃ†Â¡i vÃƒÂ o `anyRequest().authenticated()`. NÃ¡ÂºÂ¿u muÃ¡Â»â€˜n bÃ¡ÂºÂ¯t buÃ¡Â»â„¢c role `USER` cho toÃƒÂ n bÃ¡Â»â„¢ nhÃƒÂ¡nh user, nÃƒÂªn cÃƒÂ¢n nhÃ¡ÂºÂ¯c match `/api/users/**` theo role phÃƒÂ¹ hÃ¡Â»Â£p.
## 10. CÃ¡ÂºÂ­p NhÃ¡ÂºÂ­t 03/06/2026 Ã¢â‚¬â€ Phase 3: Payment/VNPay

### 10.1 MÃ¡Â»Â¥c TiÃƒÂªu Phase

TriÃ¡Â»Æ’n khai payment module cho booking, gÃ¡Â»â€œm mock payment Ã„â€˜Ã¡Â»Æ’ test nÃ¡Â»â„¢i bÃ¡Â»â„¢, tÃ¡ÂºÂ¡o URL thanh toÃƒÂ¡n VNPay, callback phÃ¡Â»Â¥c vÃ¡Â»Â¥ UX, IPN lÃƒÂ m nguÃ¡Â»â€œn xÃƒÂ¡c nhÃ¡ÂºÂ­n cuÃ¡Â»â€˜i cÃƒÂ¹ng, API xem trÃ¡ÂºÂ¡ng thÃƒÂ¡i thanh toÃƒÂ¡n booking, admin quÃ¡ÂºÂ£n lÃƒÂ½ payment vÃƒÂ  refund skeleton an toÃƒÂ n.

KhÃƒÂ´ng lÃƒÂ m promotion, notification/WebSocket, receipt/email invoice trong phase nÃƒÂ y.

### 10.2 File Ã„ÂÃƒÂ£ ThÃƒÂªm

| File | NÃ¡Â»â„¢i dung |
|---|---|
| `src/main/java/com/voyageviet/backend/booking/entity/BookingPaymentStatus.java` | Enum trÃ¡ÂºÂ¡ng thÃƒÂ¡i thanh toÃƒÂ¡n denormalized trÃƒÂªn booking. |
| `src/main/java/com/voyageviet/backend/payment/entity/Payment.java` | Entity/table `PAYMENTS`. |
| `src/main/java/com/voyageviet/backend/payment/entity/PaymentMethod.java` | Enum phÃ†Â°Ã†Â¡ng thÃ¡Â»Â©c thanh toÃƒÂ¡n. |
| `src/main/java/com/voyageviet/backend/payment/entity/PaymentStatus.java` | Enum trÃ¡ÂºÂ¡ng thÃƒÂ¡i payment attempt. |
| `src/main/java/com/voyageviet/backend/payment/config/VnpayProperties.java` | Binding config `vnpay.*`. |
| `src/main/java/com/voyageviet/backend/payment/config/PaymentProperties.java` | Binding config `payment.*`. |
| `src/main/java/com/voyageviet/backend/payment/repository/PaymentRepository.java` | Repository payment, cÃƒÂ³ Specification vÃƒÂ  lookup gateway/order. |
| `src/main/java/com/voyageviet/backend/payment/service/VnpayGatewayService.java` | TÃ¡ÂºÂ¡o URL VNPay, kÃƒÂ½ vÃƒÂ  verify HMAC-SHA512. |
| `src/main/java/com/voyageviet/backend/payment/service/PaymentService.java` | Business flow create/callback/IPN/status/admin/refund/mock. |
| `src/main/java/com/voyageviet/backend/payment/controller/PaymentController.java` | Public/auth payment endpoints. |
| `src/main/java/com/voyageviet/backend/payment/controller/AdminPaymentController.java` | Admin payment endpoints. |
| `src/main/java/com/voyageviet/backend/payment/dto/CreateVnpayPaymentRequest.java` | Request tÃ¡ÂºÂ¡o URL VNPay. |
| `src/main/java/com/voyageviet/backend/payment/dto/CreateVnpayPaymentResponse.java` | Response tÃ¡ÂºÂ¡o URL VNPay. |
| `src/main/java/com/voyageviet/backend/payment/dto/BookingPaymentResponse.java` | Response trÃ¡ÂºÂ¡ng thÃƒÂ¡i payment cÃ¡Â»Â§a booking. |
| `src/main/java/com/voyageviet/backend/payment/dto/AdminPaymentResponse.java` | Response danh sÃƒÂ¡ch payment admin. |
| `src/main/java/com/voyageviet/backend/payment/dto/PaymentDetailResponse.java` | Response chi tiÃ¡ÂºÂ¿t payment admin. |
| `src/main/java/com/voyageviet/backend/payment/dto/RefundRequest.java` | Request refund skeleton. |
| `src/main/java/com/voyageviet/backend/payment/dto/MockPaymentRequest.java` | Request hoÃƒÂ n tÃ¡ÂºÂ¥t mock payment. |

### 10.3 File Ã„ÂÃƒÂ£ SÃ¡Â»Â­a

| File | NÃ¡Â»â„¢i dung sÃ¡Â»Â­a |
|---|---|
| `src/main/java/com/voyageviet/backend/booking/entity/Booking.java` | ThÃƒÂªm `paymentStatus`, index `PAYMENT_STATUS`. |
| `src/main/java/com/voyageviet/backend/booking/repository/BookingRepository.java` | ThÃƒÂªm `findByBookingCode`. |
| `src/main/java/com/voyageviet/backend/booking/service/BookingService.java` | Set `paymentStatus=UNPAID` khi tÃ¡ÂºÂ¡o booking vÃƒÂ  map `BookingResponse.paymentStatus`. |
| `src/main/java/com/voyageviet/backend/common/config/SecurityConfig.java` | MÃ¡Â»Å¸ public cho `/api/payments/vnpay/callback` vÃƒÂ  `/api/payments/vnpay/ipn`. |
| `src/main/java/com/voyageviet/backend/common/exception/ErrorCode.java` | ThÃƒÂªm error code payment. |
| `src/main/resources/application.properties` | ThÃƒÂªm config `payment.*` vÃƒÂ  `vnpay.*` Ã„â€˜Ã¡Â»Âc tÃ¡Â»Â« env. |
| `src/main/resources/application-local.properties` | Thay VNPay secret hardcode bÃ¡ÂºÂ±ng env placeholder, thÃƒÂªm `payment.mock-enabled`. |
| `BACKEND_API_REPORT.md` | CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t Phase 3 Payment/VNPay. |

KhÃƒÂ´ng xÃƒÂ³a file nÃƒÂ o.

### 10.4 Entity/Table MÃ¡Â»â€ºi

| BÃ¡ÂºÂ£ng | Entity | Ghi chÃƒÂº |
|---|---|---|
| `PAYMENTS` | `Payment` | MÃ¡Â»â„¢t booking cÃƒÂ³ thÃ¡Â»Æ’ cÃƒÂ³ nhiÃ¡Â»Âu payment attempts. `GATEWAY_TXN_ID` unique nullable, `GATEWAY_ORDER_ID` lÃƒÂ  mÃƒÂ£ order gÃ¡Â»Â­i sang VNPay, `GATEWAY_RESPONSE` lÃ†Â°u raw callback/IPN params dÃ¡ÂºÂ¡ng JSON text. |

CÃ¡Â»â„¢t chÃƒÂ­nh cÃ¡Â»Â§a `PAYMENTS`:

- `ID`: PK, sequence `SEQ_PAYMENT`.
- `BOOKING_ID`: ManyToOne `Booking`, bÃ¡ÂºÂ¯t buÃ¡Â»â„¢c.
- `AMOUNT`: sÃ¡Â»â€˜ tiÃ¡Â»Ân thanh toÃƒÂ¡n.
- `METHOD`: `VNPAY`, `BANK_TRANSFER`, `MOCK`.
- `STATUS`: `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`.
- `GATEWAY_TXN_ID`: mÃƒÂ£ giao dÃ¡Â»â€¹ch gateway, map `vnp_TransactionNo`.
- `GATEWAY_ORDER_ID`: mÃƒÂ£ order gateway, map `vnp_TxnRef`.
- `GATEWAY_RESPONSE`: raw params dÃ¡ÂºÂ¡ng JSON text.
- `REFUND_AMOUNT`, `REFUND_REASON`, `REFUNDED_AT`, `REFUNDED_BY`: thÃƒÂ´ng tin refund skeleton.
- `INITIATED_AT`, `PAID_AT`, `CREATED_AT`, `UPDATED_AT`.

### 10.5 Enum MÃ¡Â»â€ºi

| Enum | GiÃƒÂ¡ trÃ¡Â»â€¹ |
|---|---|
| `PaymentMethod` | `VNPAY`, `BANK_TRANSFER`, `MOCK` |
| `PaymentStatus` | `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED` |
| `PromotionDiscountType` | `PERCENT`, `FIXED` |
| `PromotionStatus` | `ACTIVE`, `INACTIVE`, `EXPIRED` |
| `BookingPaymentStatus` | `UNPAID`, `PENDING`, `PAID`, `FAILED`, `REFUNDED` |

### 10.6 DTO MÃ¡Â»â€ºi

| DTO | MÃ¡Â»Â¥c Ã„â€˜ÃƒÂ­ch |
|---|---|
| `CreateVnpayPaymentRequest` | NhÃ¡ÂºÂ­n `bookingId`, `returnUrl` optional. `returnUrl` client hiÃ¡Â»â€¡n khÃƒÂ´ng dÃƒÂ¹ng Ã„â€˜Ã¡Â»Æ’ update DB, URL redirect lÃ¡ÂºÂ¥y tÃ¡Â»Â« config. |
| `CreateVnpayPaymentResponse` | TrÃ¡ÂºÂ£ `paymentUrl`, `orderId`, `amount`, `paymentId`. |
| `BookingPaymentResponse` | TrÃ¡ÂºÂ£ payment status mÃ¡Â»â€ºi nhÃ¡ÂºÂ¥t cÃ¡Â»Â§a booking. |
| `AdminPaymentResponse` | DÃ¡Â»Â¯ liÃ¡Â»â€¡u payment list cho admin. |
| `PaymentDetailResponse` | DÃ¡Â»Â¯ liÃ¡Â»â€¡u chi tiÃ¡ÂºÂ¿t payment, gÃ¡Â»â€œm `gatewayResponse`, refund info. |
| `RefundRequest` | NhÃ¡ÂºÂ­n `refundAmount`, `refundReason`. |
| `MockPaymentRequest` | NhÃ¡ÂºÂ­n `bookingId`, `success`. |

### 10.7 Repository/Service/Controller MÃ¡Â»â€ºi

| LoÃ¡ÂºÂ¡i | TÃƒÂªn | Ghi chÃƒÂº |
|---|---|---|
| Repository | `PaymentRepository` | Lookup theo `gatewayOrderId`, `gatewayTxnId`, latest payment theo booking, exists success, `JpaSpecificationExecutor`. |
| Service | `VnpayGatewayService` | TÃ¡ÂºÂ¡o payment URL, verify signature, parse amount, check success code. |
| Service | `PaymentService` | XÃ¡Â»Â­ lÃƒÂ½ business payment end-to-end. |
| Controller | `PaymentController` | VNPay create/callback/IPN, booking payment status, mock payment. |
| Controller | `AdminPaymentController` | Admin list/detail/refund. |

### 10.8 API MÃ¡Â»â€ºi

| Method | Endpoint | QuyÃ¡Â»Ân | ChÃ¡Â»Â©c nÃ„Æ’ng | Payload/query chÃƒÂ­nh |
|---|---|---|---|---|
| POST | `/api/payments/vnpay/create` | Authenticated | TÃ¡ÂºÂ¡o payment attempt vÃƒÂ  URL thanh toÃƒÂ¡n VNPay | `bookingId`, `returnUrl` optional |
| GET | `/api/payments/vnpay/callback` | Public | Callback redirect UX sau khi ngÃ†Â°Ã¡Â»Âi dÃƒÂ¹ng quay vÃ¡Â»Â tÃ¡Â»Â« VNPay | VNPay query params |
| POST | `/api/payments/vnpay/ipn` | Public | IPN xÃƒÂ¡c nhÃ¡ÂºÂ­n cuÃ¡Â»â€˜i cÃƒÂ¹ng tÃ¡Â»Â« VNPay | VNPay params |
| GET | `/api/payments/vnpay/ipn` | Public | HÃ¡Â»â€” trÃ¡Â»Â£ sandbox gÃ¡Â»Âi IPN bÃ¡ÂºÂ±ng GET | VNPay query params |
| GET | `/api/bookings/{id}/payment` | Authenticated | LÃ¡ÂºÂ¥y trÃ¡ÂºÂ¡ng thÃƒÂ¡i payment mÃ¡Â»â€ºi nhÃ¡ÂºÂ¥t cÃ¡Â»Â§a booking | `id` |
| GET | `/api/admin/payments` | Admin | Danh sÃƒÂ¡ch payment cÃƒÂ³ filter/paging | `status`, `method`, `bookingCode`, `dateFrom`, `dateTo`, `page`, `size`, `sortBy`, `sortDir` |
| GET | `/api/admin/payments/{id}` | Admin | Xem chi tiÃ¡ÂºÂ¿t payment | `id` |
| POST | `/api/admin/payments/{id}/refund` | Admin | Refund skeleton an toÃƒÂ n | `refundAmount`, `refundReason` |
| POST | `/api/payments/mock/complete` | Authenticated | HoÃƒÂ n tÃ¡ÂºÂ¥t mock payment local/dev | `bookingId`, `success` |

### 10.9 API CÃ…Â© Ã„ÂÃƒÂ£ ChÃ¡Â»â€°nh SÃ¡Â»Â­a

| API/ThÃƒÂ nh phÃ¡ÂºÂ§n | Thay Ã„â€˜Ã¡Â»â€¢i |
|---|---|
| `Booking` entity | ThÃƒÂªm `paymentStatus` mÃ¡ÂºÂ·c Ã„â€˜Ã¡Â»â€¹nh `UNPAID`. |
| `BookingResponse` | Field `paymentStatus` trÃ†Â°Ã¡Â»â€ºc Ã„â€˜ÃƒÂ¢y trÃ¡ÂºÂ£ `null`, nay trÃ¡ÂºÂ£ trÃ¡ÂºÂ¡ng thÃƒÂ¡i thÃ¡Â»Â±c tÃ¡ÂºÂ¿ dÃ¡ÂºÂ¡ng string. |
| Booking create flow | Set `paymentStatus=UNPAID` khi tÃ¡ÂºÂ¡o booking. |
| `SecurityConfig` | Public permit cho VNPay callback/IPN, khÃƒÂ´ng Ã„â€˜Ã¡Â»â€¢i rule `/api/public/**`, `/api/auth/**`, `/api/admin/**`. |
| Config VNPay local | BÃ¡Â»Â secret hardcode, chuyÃ¡Â»Æ’n sang env placeholder. |

### 10.10 Config Env CÃ¡ÂºÂ§n ThÃƒÂªm

| Key | Ghi chÃƒÂº |
|---|---|
| `PAYMENT_MOCK_ENABLED` | BÃ¡ÂºÂ­t mock payment bÃ¡ÂºÂ±ng config, default `false`; profile `local/dev` vÃ¡ÂºÂ«n Ã„â€˜Ã†Â°Ã¡Â»Â£c cho phÃƒÂ©p. |
| `VNPAY_ENABLED` | BÃ¡ÂºÂ­t VNPay create payment URL. |
| `VNPAY_TMN_CODE` | Merchant terminal code. |
| `VNPAY_HASH_SECRET` | Secret kÃƒÂ½ HMAC-SHA512, khÃƒÂ´ng log, khÃƒÂ´ng commit. |
| `VNPAY_PAY_URL` | URL cÃ¡Â»â€¢ng thanh toÃƒÂ¡n VNPay. |
| `VNPAY_RETURN_URL` | URL frontend nhÃ¡ÂºÂ­n redirect callback. |
| `VNPAY_IPN_URL` | URL backend nhÃ¡ÂºÂ­n IPN. |
| `VNPAY_API_URL` | DÃƒÂ nh cho refund/query production sau nÃƒÂ y. |
| `VNPAY_REFUND_ENABLED` | BÃ¡ÂºÂ­t refund online/skeleton production. Default `false`. |

NÃ¡ÂºÂ¿u VNPay chÃ†Â°a Ã„â€˜Ã¡Â»Â§ cÃ¡ÂºÂ¥u hÃƒÂ¬nh, API create trÃ¡ÂºÂ£ lÃ¡Â»â€”i rÃƒÂµ: `VNPay chÃ†Â°a Ã„â€˜Ã†Â°Ã¡Â»Â£c cÃ¡ÂºÂ¥u hÃƒÂ¬nh.`

### 10.11 Business Rule Ã„ÂÃƒÂ£ Implement

- KhÃƒÂ´ng tÃ¡ÂºÂ¡o payment nÃ¡ÂºÂ¿u booking Ã„â€˜ÃƒÂ£ `PAID` hoÃ¡ÂºÂ·c Ã„â€˜ÃƒÂ£ cÃƒÂ³ payment `SUCCESS`.
- KhÃƒÂ´ng thanh toÃƒÂ¡n booking `CANCELLED` hoÃ¡ÂºÂ·c `COMPLETED`.
- Booking phÃ¡ÂºÂ£i thuÃ¡Â»â„¢c user hiÃ¡Â»â€¡n tÃ¡ÂºÂ¡i khi tÃ¡ÂºÂ¡o payment/mock; admin cÃƒÂ³ thÃ¡Â»Æ’ xem payment status qua endpoint query chi tiÃ¡ÂºÂ¿t nÃ¡ÂºÂ¿u cÃƒÂ³ quyÃ¡Â»Ân admin.
- NÃ¡ÂºÂ¿u cÃƒÂ³ payment `PENDING` trong 15 phÃƒÂºt gÃ¡ÂºÂ§n nhÃ¡ÂºÂ¥t thÃƒÂ¬ reuse attempt Ã„â€˜ÃƒÂ³.
- NÃ¡ÂºÂ¿u payment `PENDING` quÃƒÂ¡ 15 phÃƒÂºt thÃƒÂ¬ mark `FAILED` vÃƒÂ  tÃ¡ÂºÂ¡o attempt mÃ¡Â»â€ºi.
- Khi tÃ¡ÂºÂ¡o payment `PENDING`, set `booking.paymentStatus = PENDING`.
- Callback VNPay chÃ¡Â»â€° redirect UX, khÃƒÂ´ng xÃƒÂ¡c nhÃ¡ÂºÂ­n thanh toÃƒÂ¡n cuÃ¡Â»â€˜i cÃƒÂ¹ng.
- IPN lÃƒÂ  nguÃ¡Â»â€œn xÃƒÂ¡c nhÃ¡ÂºÂ­n cuÃ¡Â»â€˜i cÃƒÂ¹ng Ã„â€˜Ã¡Â»Æ’ cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t DB.
- Verify chÃ¡Â»Â¯ kÃƒÂ½ callback/IPN bÃ¡ÂºÂ±ng HMAC-SHA512, sort params alphabetically, bÃ¡Â»Â `vnp_SecureHash` vÃƒÂ  `vnp_SecureHashType` trÃ†Â°Ã¡Â»â€ºc khi kÃƒÂ½.
- IPN idempotent: payment Ã„â€˜ÃƒÂ£ `SUCCESS`, `FAILED` hoÃ¡ÂºÂ·c `REFUNDED` thÃƒÂ¬ khÃƒÂ´ng update ngÃ†Â°Ã¡Â»Â£c, trÃ¡ÂºÂ£ `RspCode=00` khi Ã„â€˜ÃƒÂ£ xÃ¡Â»Â­ lÃƒÂ½/ghi nhÃ¡ÂºÂ­n trÃ†Â°Ã¡Â»â€ºc Ã„â€˜ÃƒÂ³.
- IPN success set `payment.status=SUCCESS`, `gatewayTxnId`, `paidAt`, `booking.paymentStatus=PAID`.
- IPN success chÃ¡Â»â€° Ã„â€˜Ã¡Â»â€¢i `booking.status` tÃ¡Â»Â« `PENDING` sang `CONFIRMED`; khÃƒÂ´ng tÃ¡Â»Â± Ã„â€˜Ã¡Â»â€¢i booking `COMPLETED` hoÃ¡ÂºÂ·c `CANCELLED`.
- IPN failed set `payment.status=FAILED`, `booking.paymentStatus=FAILED` nÃ¡ÂºÂ¿u booking chÃ†Â°a `PAID`.
- Refund skeleton chÃ¡Â»â€° cho payment `SUCCESS`, `refundAmount > 0` vÃƒÂ  `<= payment.amount`.
- Refund set `payment.status=REFUNDED`, lÃ†Â°u refund fields, set `booking.paymentStatus=REFUNDED`.
- Mock payment chÃ¡Â»â€° bÃ¡ÂºÂ­t nÃ¡ÂºÂ¿u `payment.mock-enabled=true` hoÃ¡ÂºÂ·c profile `local/dev`.

### 10.12 Validation/Error Message Quan TrÃ¡Â»Âng

- `Booking khÃƒÂ´ng tÃ¡Â»â€œn tÃ¡ÂºÂ¡i.`
- `BÃ¡ÂºÂ¡n khÃƒÂ´ng cÃƒÂ³ quyÃ¡Â»Ân thanh toÃƒÂ¡n booking nÃƒÂ y.`
- `Booking Ã„â€˜ÃƒÂ£ Ã„â€˜Ã†Â°Ã¡Â»Â£c thanh toÃƒÂ¡n.`
- `Booking Ã„â€˜ÃƒÂ£ bÃ¡Â»â€¹ hÃ¡Â»Â§y, khÃƒÂ´ng thÃ¡Â»Æ’ thanh toÃƒÂ¡n.`
- `SÃ¡Â»â€˜ tiÃ¡Â»Ân thanh toÃƒÂ¡n khÃƒÂ´ng hÃ¡Â»Â£p lÃ¡Â»â€¡.`
- `VNPay chÃ†Â°a Ã„â€˜Ã†Â°Ã¡Â»Â£c cÃ¡ÂºÂ¥u hÃƒÂ¬nh.`
- `ChÃ¡Â»Â¯ kÃƒÂ½ VNPay khÃƒÂ´ng hÃ¡Â»Â£p lÃ¡Â»â€¡.` dÃƒÂ¹ng Ã¡Â»Å¸ error code; IPN trÃ¡ÂºÂ£ `RspCode=97`.
- `KhÃƒÂ´ng tÃƒÂ¬m thÃ¡ÂºÂ¥y giao dÃ¡Â»â€¹ch thanh toÃƒÂ¡n.`
- `KhÃƒÂ´ng thÃ¡Â»Æ’ hoÃƒÂ n tiÃ¡Â»Ân giao dÃ¡Â»â€¹ch chÃ†Â°a thÃƒÂ nh cÃƒÂ´ng.`
- `SÃ¡Â»â€˜ tiÃ¡Â»Ân hoÃƒÂ n khÃƒÂ´ng hÃ¡Â»Â£p lÃ¡Â»â€¡.`
- `Mock payment chÃ¡Â»â€° Ã„â€˜Ã†Â°Ã¡Â»Â£c bÃ¡ÂºÂ­t Ã¡Â»Å¸ mÃƒÂ´i trÃ†Â°Ã¡Â»Âng local/dev.`

### 10.13 LuÃ¡Â»â€œng VNPay

Create payment URL:

1. User gÃ¡Â»Âi `POST /api/payments/vnpay/create` vÃ¡Â»â€ºi `bookingId`.
2. Backend kiÃ¡Â»Æ’m tra owner, booking chÃ†Â°a hÃ¡Â»Â§y/hoÃƒÂ n thÃƒÂ nh, chÃ†Â°a paid, `totalAmount > 0`.
3. Backend tÃ¡ÂºÂ¡o hoÃ¡ÂºÂ·c reuse payment `PENDING` trong 15 phÃƒÂºt.
4. Backend set `booking.paymentStatus=PENDING`.
5. `VnpayGatewayService` build params, kÃƒÂ½ HMAC-SHA512 vÃƒÂ  trÃ¡ÂºÂ£ `paymentUrl`.

Callback:

1. VNPay redirect browser vÃ¡Â»Â `/api/payments/vnpay/callback`.
2. Backend verify signature vÃƒÂ  tÃƒÂ¬m payment theo `vnp_TxnRef`.
3. Backend lÃ†Â°u raw params nÃ¡ÂºÂ¿u tÃƒÂ¬m thÃ¡ÂºÂ¥y payment.
4. Backend redirect vÃ¡Â»Â `vnpay.return-url` vÃ¡Â»â€ºi `status=success|failed|invalid|not_found` vÃƒÂ  `bookingCode` nÃ¡ÂºÂ¿u cÃƒÂ³.
5. Callback khÃƒÂ´ng xÃƒÂ¡c nhÃ¡ÂºÂ­n paid cuÃ¡Â»â€˜i cÃƒÂ¹ng.

IPN:

1. VNPay gÃ¡Â»Âi `/api/payments/vnpay/ipn` bÃ¡ÂºÂ±ng POST hoÃ¡ÂºÂ·c GET.
2. Backend verify signature.
3. Backend tÃƒÂ¬m payment theo `vnp_TxnRef`.
4. Backend kiÃ¡Â»Æ’m tra amount `vnp_Amount / 100 == payment.amount`.
5. Backend xÃ¡Â»Â­ lÃƒÂ½ idempotent theo payment status hiÃ¡Â»â€¡n tÃ¡ÂºÂ¡i.
6. NÃ¡ÂºÂ¿u success code `00/00`, backend set payment success vÃƒÂ  booking paid, booking `PENDING -> CONFIRMED`.
7. NÃ¡ÂºÂ¿u fail, backend set payment failed vÃƒÂ  booking payment failed nÃ¡ÂºÂ¿u chÃ†Â°a paid.
8. Backend trÃ¡ÂºÂ£ JSON VNPay dÃ¡ÂºÂ¡ng `{ "RspCode": "00", "Message": "Confirm Success" }` khi Ã„â€˜ÃƒÂ£ nhÃ¡ÂºÂ­n vÃƒÂ  xÃ¡Â»Â­ lÃƒÂ½ hÃ¡Â»Â£p lÃ¡Â»â€¡.

### 10.14 Checklist Test ThÃ¡Â»Â§ CÃƒÂ´ng

1. TÃ¡ÂºÂ¡o booking `PENDING` cÃƒÂ³ `totalAmount > 0`.
2. GÃ¡Â»Âi `POST /api/payments/vnpay/create` vÃƒÂ  nhÃ¡ÂºÂ­n `paymentUrl`.
3. KiÃ¡Â»Æ’m tra `booking.paymentStatus` chuyÃ¡Â»Æ’n `PENDING`.
4. GÃ¡Â»Âi lÃ¡ÂºÂ¡i create payment trong 15 phÃƒÂºt vÃƒÂ  xÃƒÂ¡c nhÃ¡ÂºÂ­n reuse attempt, khÃƒÂ´ng tÃ¡ÂºÂ¡o loÃ¡ÂºÂ¡n payment mÃ¡Â»â€ºi.
5. GiÃ¡ÂºÂ£ lÃ¡ÂºÂ­p callback sai signature vÃƒÂ  kiÃ¡Â»Æ’m tra redirect `status=invalid`.
6. GiÃ¡ÂºÂ£ lÃ¡ÂºÂ­p IPN sai signature vÃƒÂ  kiÃ¡Â»Æ’m tra `{RspCode:97}`.
7. GiÃ¡ÂºÂ£ lÃ¡ÂºÂ­p IPN order khÃƒÂ´ng tÃ¡Â»â€œn tÃ¡ÂºÂ¡i vÃƒÂ  kiÃ¡Â»Æ’m tra `{RspCode:01}`.
8. GiÃ¡ÂºÂ£ lÃ¡ÂºÂ­p IPN amount sai vÃƒÂ  kiÃ¡Â»Æ’m tra `{RspCode:04}`.
9. GiÃ¡ÂºÂ£ lÃ¡ÂºÂ­p IPN success vÃƒÂ  kiÃ¡Â»Æ’m tra payment `SUCCESS`, booking paymentStatus `PAID`, booking status `PENDING -> CONFIRMED`.
10. GÃ¡Â»Âi lÃ¡ÂºÂ¡i IPN success lÃ¡ÂºÂ§n 2 vÃƒÂ  kiÃ¡Â»Æ’m tra idempotent, khÃƒÂ´ng duplicate/update sai.
11. GiÃ¡ÂºÂ£ lÃ¡ÂºÂ­p IPN failed vÃƒÂ  kiÃ¡Â»Æ’m tra payment `FAILED`, booking paymentStatus `FAILED` nÃ¡ÂºÂ¿u chÃ†Â°a paid.
12. GÃ¡Â»Âi `GET /api/bookings/{id}/payment` vÃƒÂ  kiÃ¡Â»Æ’m tra latest payment status.
13. User A khÃƒÂ´ng xem Ã„â€˜Ã†Â°Ã¡Â»Â£c payment booking cÃ¡Â»Â§a User B.
14. Admin gÃ¡Â»Âi `GET /api/admin/payments` vÃ¡Â»â€ºi filter `status/method/bookingCode/date`.
15. Admin gÃ¡Â»Âi `GET /api/admin/payments/{id}` vÃƒÂ  thÃ¡ÂºÂ¥y `gatewayResponse`.
16. Admin refund payment `SUCCESS`: local/dev cho skeleton refund; production chÃ†Â°a bÃ¡ÂºÂ­t trÃ¡ÂºÂ£ lÃ¡Â»â€”i `Refund online chÃ†Â°a Ã„â€˜Ã†Â°Ã¡Â»Â£c cÃ¡ÂºÂ¥u hÃƒÂ¬nh.`.
17. GÃ¡Â»Âi `POST /api/payments/mock/complete` Ã¡Â»Å¸ local/dev vÃ¡Â»â€ºi `success=true` vÃƒÂ  kiÃ¡Â»Æ’m tra booking `CONFIRMED + PAID`.
18. GÃ¡Â»Âi `POST /api/payments/mock/complete` Ã¡Â»Å¸ local/dev vÃ¡Â»â€ºi `success=false` vÃƒÂ  kiÃ¡Â»Æ’m tra payment/booking payment `FAILED`.

### 10.15 KÃ¡ÂºÂ¿t QuÃ¡ÂºÂ£ Compile/Light Check

Ã„ÂÃƒÂ£ chÃ¡ÂºÂ¡y:

```bash
.\mvnw.cmd -DskipTests compile
```

KÃ¡ÂºÂ¿t quÃ¡ÂºÂ£: `BUILD SUCCESS`.

### 10.16 TODO CÃƒÂ²n LÃ¡ÂºÂ¡i

- TÃƒÂ­ch hÃ¡Â»Â£p VNPay refund API thÃ¡ÂºÂ­t cho production.
- Payment timeout scheduler Ã„â€˜Ã¡Â»Æ’ tÃ¡Â»Â± fail payment pending quÃƒÂ¡ hÃ¡ÂºÂ¡n.
- Notification/WebSocket event khi payment success/failed.
- Receipt/email invoice sau thanh toÃƒÂ¡n nÃ¡ÂºÂ¿u cÃ¡ÂºÂ§n.
- Ã„ÂÃ¡Â»â€˜i soÃƒÂ¡t giao dÃ¡Â»â€¹ch vÃƒÂ  query transaction nÃ¡ÂºÂ¿u lÃƒÂ m production.
- Event hook sau payment success/failed Ã„â€˜Ã¡Â»Æ’ module notification hoÃ¡ÂºÂ·c analytics dÃƒÂ¹ng lÃ¡ÂºÂ¡i.
## 11. CÃ¡ÂºÂ­p NhÃ¡ÂºÂ­t 03/06/2026 Ã¢â‚¬â€ Phase 4: Promotions / MÃƒÂ£ GiÃ¡ÂºÂ£m GiÃƒÂ¡

### 11.1 MÃ¡Â»Â¥c TiÃƒÂªu Phase

TriÃ¡Â»Æ’n khai module Promotions/MÃƒÂ£ giÃ¡ÂºÂ£m giÃƒÂ¡ cho VoyageViet, gÃ¡Â»â€œm admin CRUD promotion, bÃ¡ÂºÂ­t/tÃ¡ÂºÂ¯t/xÃƒÂ³a an toÃƒÂ n, user validate mÃƒÂ£ trÃ†Â°Ã¡Â»â€ºc khi Ã„â€˜Ã¡ÂºÂ·t booking, tÃƒÂ­ch hÃ¡Â»Â£p `promoCode` vÃƒÂ o booking create flow, lÃ†Â°u usage vÃƒÂ  tÃ„Æ’ng `usedCount` trong cÃƒÂ¹ng transaction vÃ¡Â»â€ºi booking.

KhÃƒÂ´ng lÃƒÂ m notification/WebSocket, khÃƒÂ´ng lÃƒÂ m lÃ¡ÂºÂ¡i Payment/VNPay, khÃƒÂ´ng lÃƒÂ m frontend vÃƒÂ  khÃƒÂ´ng hardcode mÃƒÂ£ giÃ¡ÂºÂ£m giÃƒÂ¡.

### 11.2 File Ã„ÂÃƒÂ£ ThÃƒÂªm

| File | NÃ¡Â»â„¢i dung |
|---|---|
| `src/main/java/com/voyageviet/backend/promotion/entity/Promotion.java` | Entity/table `PROMOTIONS`. |
| `src/main/java/com/voyageviet/backend/promotion/entity/PromotionUsage.java` | Entity/table `PROMOTION_USAGES`. |
| `src/main/java/com/voyageviet/backend/promotion/entity/PromotionDiscountType.java` | Enum loÃ¡ÂºÂ¡i giÃ¡ÂºÂ£m giÃƒÂ¡ `PERCENT/FIXED`. |
| `src/main/java/com/voyageviet/backend/promotion/entity/PromotionStatus.java` | Enum trÃ¡ÂºÂ¡ng thÃƒÂ¡i promotion. |
| `src/main/java/com/voyageviet/backend/promotion/repository/PromotionRepository.java` | Repository promotion, cÃƒÂ³ Specification. |
| `src/main/java/com/voyageviet/backend/promotion/repository/PromotionUsageRepository.java` | Repository promotion usage. |
| `src/main/java/com/voyageviet/backend/promotion/service/PromotionService.java` | Validate promo, tÃƒÂ­nh discount, admin CRUD, ghi usage. |
| `src/main/java/com/voyageviet/backend/promotion/controller/PromotionController.java` | User validate promo endpoint. |
| `src/main/java/com/voyageviet/backend/promotion/controller/AdminPromotionController.java` | Admin promotion endpoints. |
| `src/main/java/com/voyageviet/backend/promotion/dto/ValidatePromoRequest.java` | Request preview mÃƒÂ£ giÃ¡ÂºÂ£m giÃƒÂ¡. |
| `src/main/java/com/voyageviet/backend/promotion/dto/ValidatePromoResponse.java` | Response preview mÃƒÂ£ giÃ¡ÂºÂ£m giÃƒÂ¡. |
| `src/main/java/com/voyageviet/backend/promotion/dto/AdminPromotionCreateRequest.java` | Request tÃ¡ÂºÂ¡o promotion. |
| `src/main/java/com/voyageviet/backend/promotion/dto/AdminPromotionUpdateRequest.java` | Request cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t promotion, khÃƒÂ´ng nhÃ¡ÂºÂ­n code. |
| `src/main/java/com/voyageviet/backend/promotion/dto/PromotionStatusRequest.java` | Request bÃ¡ÂºÂ­t/tÃ¡ÂºÂ¯t promotion. |
| `src/main/java/com/voyageviet/backend/promotion/dto/PromotionResponse.java` | Response promotion admin. |

### 11.3 File Ã„ÂÃƒÂ£ SÃ¡Â»Â­a

| File | NÃ¡Â»â„¢i dung sÃ¡Â»Â­a |
|---|---|
| `src/main/java/com/voyageviet/backend/booking/entity/Booking.java` | ThÃƒÂªm `promotion`, `promoCodeSnapshot`, `originalAmount`, `discountAmount`; `totalAmount` lÃƒÂ  sÃ¡Â»â€˜ tiÃ¡Â»Ân cuÃ¡Â»â€˜i sau giÃ¡ÂºÂ£m. |
| `src/main/java/com/voyageviet/backend/booking/dto/BookingCreateRequest.java` | ThÃƒÂªm optional `promoCode`. |
| `src/main/java/com/voyageviet/backend/booking/dto/BookingResponse.java` | ThÃƒÂªm `originalAmount`, `discountAmount`, `promoCode`; giÃ¡Â»Â¯ `totalAmount` vÃƒÂ  `paymentStatus`. |
| `src/main/java/com/voyageviet/backend/booking/service/BookingService.java` | TÃƒÂ­ch hÃ¡Â»Â£p validate/apply promotion trong create booking, ghi usage sau khi booking persist. |
| `src/main/java/com/voyageviet/backend/common/exception/ErrorCode.java` | ThÃƒÂªm error code promotion. |
| `BACKEND_API_REPORT.md` | CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t Phase 4 Promotions/MÃƒÂ£ giÃ¡ÂºÂ£m giÃƒÂ¡. |

KhÃƒÂ´ng xÃƒÂ³a file nÃƒÂ o.

### 11.4 Entity/Table MÃ¡Â»â€ºi

| BÃ¡ÂºÂ£ng | Entity | Ghi chÃƒÂº |
|---|---|---|
| `PROMOTIONS` | `Promotion` | LÃ†Â°u thÃƒÂ´ng tin mÃƒÂ£ giÃ¡ÂºÂ£m giÃƒÂ¡/campaign. `CODE` luÃƒÂ´n uppercase vÃƒÂ  unique. `APPLICABLE_TOUR_IDS` lÃ†Â°u JSON array tour id; null nghÃ„Â©a lÃƒÂ  ÃƒÂ¡p dÃ¡Â»Â¥ng tÃ¡ÂºÂ¥t cÃ¡ÂºÂ£ tour. |
| `PROMOTION_USAGES` | `PromotionUsage` | LÃ†Â°u mÃ¡Â»â€”i lÃ¡ÂºÂ§n user dÃƒÂ¹ng promotion cho booking. CÃƒÂ³ unique `(PROMOTION_ID, BOOKING_ID)` Ã„â€˜Ã¡Â»Æ’ mÃ¡Â»â„¢t booking khÃƒÂ´ng ghi trÃƒÂ¹ng usage. |

### 11.5 Enum MÃ¡Â»â€ºi

| Enum | GiÃƒÂ¡ trÃ¡Â»â€¹ |
|---|---|
| `PromotionDiscountType` | `PERCENT`, `FIXED` |
| `PromotionStatus` | `ACTIVE`, `INACTIVE`, `EXPIRED` |

KhÃƒÂ´ng bÃ¡Â»â€¢ sung `AuditAction` mÃ¡Â»â€ºi trong phase nÃƒÂ y.

### 11.6 DTO MÃ¡Â»â€ºi

| DTO | MÃ¡Â»Â¥c Ã„â€˜ÃƒÂ­ch |
|---|---|
| `ValidatePromoRequest` | NhÃ¡ÂºÂ­n `code`, `bookingTotal`, `tourId` Ã„â€˜Ã¡Â»Æ’ preview promotion. |
| `ValidatePromoResponse` | TrÃ¡ÂºÂ£ `valid`, `code`, `discountAmount`, `finalAmount`, `message`. |
| `AdminPromotionCreateRequest` | TÃ¡ÂºÂ¡o promotion, cÃƒÂ³ `applicableTourIds` dÃ¡ÂºÂ¡ng list. |
| `AdminPromotionUpdateRequest` | CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t promotion, khÃƒÂ´ng cho sÃ¡Â»Â­a `code`. |
| `PromotionStatusRequest` | CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t status `ACTIVE/INACTIVE`. |
| `PromotionResponse` | Response promotion cho admin, trÃ¡ÂºÂ£ `applicableTourIds` dÃ¡ÂºÂ¡ng list. |

### 11.7 Repository/Service/Controller MÃ¡Â»â€ºi

| LoÃ¡ÂºÂ¡i | TÃƒÂªn | Ghi chÃƒÂº |
|---|---|---|
| Repository | `PromotionRepository` | `findByCode`, `existsByCode`, `existsByCodeAndIdNot`, `findAll(Specification, Pageable)`. |
| Repository | `PromotionUsageRepository` | Count usage theo promotion/user, check usage theo booking, check promotion Ã„â€˜ÃƒÂ£ dÃƒÂ¹ng. |
| Service | `PromotionService` | Validate promotion by code/status/time/minOrder/maxUses/maxUsesPerUser/applicableTourIds, tÃƒÂ­nh discount, admin CRUD, record usage. |
| Controller | `PromotionController` | User validate promo. |
| Controller | `AdminPromotionController` | Admin CRUD/status/delete promotion. |

### 11.8 API MÃ¡Â»â€ºi

| Method | Endpoint | QuyÃ¡Â»Ân | ChÃ¡Â»Â©c nÃ„Æ’ng | Payload/query chÃƒÂ­nh |
|---|---|---|---|---|
| POST | `/api/bookings/validate-promo` | Authenticated | Preview/validate mÃƒÂ£ giÃ¡ÂºÂ£m giÃƒÂ¡ trÃ†Â°Ã¡Â»â€ºc khi Ã„â€˜Ã¡ÂºÂ·t booking | `code`, `bookingTotal`, `tourId` |
| GET | `/api/admin/promotions` | Admin | Danh sÃƒÂ¡ch promotion cÃƒÂ³ filter vÃƒÂ  paging | `status`, `code`, `dateFrom`, `dateTo`, `page`, `size`, `sortBy`, `sortDir` |
| POST | `/api/admin/promotions` | Admin | TÃ¡ÂºÂ¡o promotion | `code`, `name`, `description`, `discountType`, `discountValue`, `maxDiscount`, `minOrder`, `maxUses`, `maxUsesPerUser`, `validFrom`, `validUntil`, `status`, `applicableTourIds` |
| PUT | `/api/admin/promotions/{id}` | Admin | CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t promotion, khÃƒÂ´ng sÃ¡Â»Â­a code | CÃƒÂ¡c field giÃ¡Â»â€˜ng create trÃ¡Â»Â« `code` |
| PATCH | `/api/admin/promotions/{id}/status` | Admin | BÃ¡ÂºÂ­t/tÃ¡ÂºÂ¯t promotion | `status` |
| DELETE | `/api/admin/promotions/{id}` | Admin | XÃƒÂ³a promotion an toÃƒÂ n | `id` |

### 11.9 API CÃ…Â© Ã„ÂÃƒÂ£ ChÃ¡Â»â€°nh SÃ¡Â»Â­a

| API/ThÃƒÂ nh phÃ¡ÂºÂ§n | Thay Ã„â€˜Ã¡Â»â€¢i |
|---|---|
| `POST /api/bookings` | Request nhÃ¡ÂºÂ­n thÃƒÂªm optional `promoCode`. NÃ¡ÂºÂ¿u cÃƒÂ³ promo hÃ¡Â»Â£p lÃ¡Â»â€¡, booking lÃ†Â°u promotion vÃƒÂ  amount sau giÃ¡ÂºÂ£m. |
| `Booking` entity | ThÃƒÂªm `promotion`, `promoCodeSnapshot`, `originalAmount`, `discountAmount`; `totalAmount` vÃ¡ÂºÂ«n lÃƒÂ  sÃ¡Â»â€˜ dÃƒÂ¹ng Ã„â€˜Ã¡Â»Æ’ thanh toÃƒÂ¡n. |
| `BookingResponse` | ThÃƒÂªm `originalAmount`, `discountAmount`, `promoCode`, giÃ¡Â»Â¯ cÃƒÂ¡c field cÃ…Â©. |
| Payment flow | KhÃƒÂ´ng Ã„â€˜Ã¡Â»â€¢i code payment; payment vÃ¡ÂºÂ«n lÃ¡ÂºÂ¥y `booking.totalAmount`, nÃƒÂªn amount VNPay/mock lÃƒÂ  sÃ¡Â»â€˜ cuÃ¡Â»â€˜i sau giÃ¡ÂºÂ£m. |
| Security | KhÃƒÂ´ng Ã„â€˜Ã¡Â»â€¢i SecurityConfig; `/api/bookings/validate-promo` rÃ†Â¡i vÃƒÂ o authenticated, `/api/admin/promotions/**` rÃ†Â¡i vÃƒÂ o admin. VNPay callback/IPN public rule vÃ¡ÂºÂ«n giÃ¡Â»Â¯ nguyÃƒÂªn. |

### 11.10 Business Rule Ã„ÂÃƒÂ£ Implement

- Code promotion luÃƒÂ´n normalize `trim + uppercase` trÃ†Â°Ã¡Â»â€ºc khi lÃ†Â°u/validate.
- Code unique qua `UK_PROMOTIONS_CODE` vÃƒÂ  service check `existsByCode`.
- `discountValue > 0`.
- `PERCENT` yÃƒÂªu cÃ¡ÂºÂ§u `discountValue <= 100`.
- `validUntil > validFrom`.
- `minOrder` default `0`.
- `maxUses = null` nghÃ„Â©a lÃƒÂ  khÃƒÂ´ng giÃ¡Â»â€ºi hÃ¡ÂºÂ¡n tÃ¡Â»â€¢ng lÃ†Â°Ã¡Â»Â£t dÃƒÂ¹ng.
- `maxUsesPerUser` default `1`.
- `applicableTourIds = null` hoÃ¡ÂºÂ·c list rÃ¡Â»â€”ng nghÃ„Â©a lÃƒÂ  ÃƒÂ¡p dÃ¡Â»Â¥ng tÃ¡ÂºÂ¥t cÃ¡ÂºÂ£ tour.
- Validate promo kiÃ¡Â»Æ’m tra code tÃ¡Â»â€œn tÃ¡ÂºÂ¡i, status, thÃ¡Â»Âi gian hiÃ¡Â»â€¡u lÃ¡Â»Â±c, minOrder, maxUses, maxUsesPerUser vÃƒÂ  applicable tour.
- FIXED discount: `min(discountValue, bookingTotal)`.
- PERCENT discount: `bookingTotal * discountValue / 100`, ÃƒÂ¡p dÃ¡Â»Â¥ng `maxDiscount` nÃ¡ÂºÂ¿u cÃƒÂ³.
- `finalAmount = max(bookingTotal - discountAmount, 0)`.
- Endpoint validate promo chÃ¡Â»â€° preview, khÃƒÂ´ng tÃ¡ÂºÂ¡o usage, khÃƒÂ´ng tÃ„Æ’ng `usedCount`, khÃƒÂ´ng sÃ¡Â»Â­a booking.
- Booking create khÃƒÂ´ng tin `bookingTotal` frontend; tÃ¡Â»Â± tÃƒÂ­nh `originalAmount` tÃ¡Â»Â« schedule price rÃ¡Â»â€œi validate lÃ¡ÂºÂ¡i promo.
- Booking cÃƒÂ³ promo lÃ†Â°u `promotion`, `promoCodeSnapshot`, `originalAmount`, `discountAmount`, `totalAmount = finalAmount`.
- `PromotionUsage` Ã„â€˜Ã†Â°Ã¡Â»Â£c tÃ¡ÂºÂ¡o sau khi booking persist thÃƒÂ nh cÃƒÂ´ng vÃƒÂ  cÃƒÂ¹ng transaction vÃ¡Â»â€ºi booking/schedule.
- `promotion.usedCount` chÃ¡Â»â€° tÃ„Æ’ng khi booking tÃ¡ÂºÂ¡o thÃƒÂ nh cÃƒÂ´ng.
- NÃ¡ÂºÂ¿u booking/schedule/promotion usage lÃ¡Â»â€”i thÃƒÂ¬ transaction rollback.
- KhÃƒÂ´ng xÃƒÂ³a promotion Ã„â€˜ÃƒÂ£ cÃƒÂ³ usage hoÃ¡ÂºÂ·c `usedCount > 0`; chÃ¡Â»â€° nÃƒÂªn chuyÃ¡Â»Æ’n `INACTIVE`.
- KhÃƒÂ´ng cho chÃ¡Â»â€°nh cÃƒÂ¡c field Ã¡ÂºÂ£nh hÃ†Â°Ã¡Â»Å¸ng tÃƒÂ­nh tiÃ¡Â»Ân nÃ¡ÂºÂ¿u promotion Ã„â€˜ÃƒÂ£ dÃƒÂ¹ng: `discountType`, `discountValue`, `maxDiscount`, `minOrder`, `applicableTourIds`, `validFrom`, `validUntil`.
- Admin status update chÃ¡Â»â€° cho `ACTIVE` hoÃ¡ÂºÂ·c `INACTIVE`; khÃƒÂ´ng cho set `EXPIRED` thÃ¡Â»Â§ cÃƒÂ´ng qua endpoint status.
- KhÃƒÂ´ng thÃ¡Â»Æ’ kÃƒÂ­ch hoÃ¡ÂºÂ¡t promotion Ã„â€˜ÃƒÂ£ hÃ¡ÂºÂ¿t hÃ¡ÂºÂ¡n.

### 11.11 Validation/Error Message Quan TrÃ¡Â»Âng

- `MÃƒÂ£ giÃ¡ÂºÂ£m giÃƒÂ¡ khÃƒÂ´ng tÃ¡Â»â€œn tÃ¡ÂºÂ¡i.`
- `MÃƒÂ£ giÃ¡ÂºÂ£m giÃƒÂ¡ chÃ†Â°a Ã„â€˜Ã†Â°Ã¡Â»Â£c kÃƒÂ­ch hoÃ¡ÂºÂ¡t.`
- `MÃƒÂ£ giÃ¡ÂºÂ£m giÃƒÂ¡ Ã„â€˜ÃƒÂ£ hÃ¡ÂºÂ¿t hÃ¡ÂºÂ¡n.`
- `MÃƒÂ£ giÃ¡ÂºÂ£m giÃƒÂ¡ chÃ†Â°a Ã„â€˜Ã¡ÂºÂ¿n thÃ¡Â»Âi gian sÃ¡Â»Â­ dÃ¡Â»Â¥ng.`
- `Ã„ÂÃ†Â¡n hÃƒÂ ng chÃ†Â°a Ã„â€˜Ã¡ÂºÂ¡t giÃƒÂ¡ trÃ¡Â»â€¹ tÃ¡Â»â€˜i thiÃ¡Â»Æ’u Ã„â€˜Ã¡Â»Æ’ ÃƒÂ¡p dÃ¡Â»Â¥ng mÃƒÂ£.`
- `MÃƒÂ£ giÃ¡ÂºÂ£m giÃƒÂ¡ Ã„â€˜ÃƒÂ£ hÃ¡ÂºÂ¿t lÃ†Â°Ã¡Â»Â£t sÃ¡Â»Â­ dÃ¡Â»Â¥ng.`
- `BÃ¡ÂºÂ¡n Ã„â€˜ÃƒÂ£ sÃ¡Â»Â­ dÃ¡Â»Â¥ng mÃƒÂ£ giÃ¡ÂºÂ£m giÃƒÂ¡ nÃƒÂ y quÃƒÂ¡ sÃ¡Â»â€˜ lÃ¡ÂºÂ§n cho phÃƒÂ©p.`
- `MÃƒÂ£ giÃ¡ÂºÂ£m giÃƒÂ¡ khÃƒÂ´ng ÃƒÂ¡p dÃ¡Â»Â¥ng cho tour nÃƒÂ y.`
- `GiÃƒÂ¡ trÃ¡Â»â€¹ giÃ¡ÂºÂ£m giÃƒÂ¡ khÃƒÂ´ng hÃ¡Â»Â£p lÃ¡Â»â€¡.`
- `MÃƒÂ£ giÃ¡ÂºÂ£m giÃƒÂ¡ Ã„â€˜ÃƒÂ£ Ã„â€˜Ã†Â°Ã¡Â»Â£c sÃ¡Â»Â­ dÃ¡Â»Â¥ng, khÃƒÂ´ng thÃ¡Â»Æ’ chÃ¡Â»â€°nh sÃ¡Â»Â­a cÃ¡ÂºÂ¥u hÃƒÂ¬nh giÃ¡ÂºÂ£m giÃƒÂ¡.`
- `KhÃƒÂ´ng thÃ¡Â»Æ’ xÃƒÂ³a mÃƒÂ£ giÃ¡ÂºÂ£m giÃƒÂ¡ Ã„â€˜ÃƒÂ£ Ã„â€˜Ã†Â°Ã¡Â»Â£c sÃ¡Â»Â­ dÃ¡Â»Â¥ng.`
- `KhÃƒÂ´ng thÃ¡Â»Æ’ kÃƒÂ­ch hoÃ¡ÂºÂ¡t mÃƒÂ£ giÃ¡ÂºÂ£m giÃƒÂ¡ Ã„â€˜ÃƒÂ£ hÃ¡ÂºÂ¿t hÃ¡ÂºÂ¡n.`

### 11.12 Checklist Test ThÃ¡Â»Â§ CÃƒÂ´ng

1. Admin tÃ¡ÂºÂ¡o promotion `FIXED` giÃ¡ÂºÂ£m 500k, `minOrder` 2 triÃ¡Â»â€¡u.
2. Admin tÃ¡ÂºÂ¡o promotion `PERCENT` 30%, `maxDiscount` 500k.
3. TÃ¡ÂºÂ¡o promotion trÃƒÂ¹ng code vÃƒÂ  kiÃ¡Â»Æ’m tra lÃ¡Â»â€”i.
4. TÃ¡ÂºÂ¡o promotion `PERCENT` vÃ¡Â»â€ºi `discountValue > 100` vÃƒÂ  kiÃ¡Â»Æ’m tra lÃ¡Â»â€”i.
5. TÃ¡ÂºÂ¡o promotion `validUntil <= validFrom` vÃƒÂ  kiÃ¡Â»Æ’m tra lÃ¡Â»â€”i.
6. User validate mÃƒÂ£ khÃƒÂ´ng tÃ¡Â»â€œn tÃ¡ÂºÂ¡i, response `valid=false`.
7. User validate mÃƒÂ£ inactive, response `valid=false`.
8. User validate mÃƒÂ£ expired, response `valid=false`.
9. User validate mÃƒÂ£ chÃ†Â°a tÃ¡Â»â€ºi `validFrom`, response `valid=false`.
10. User validate mÃƒÂ£ vÃ¡Â»â€ºi `bookingTotal < minOrder`, response `valid=false`.
11. User validate mÃƒÂ£ khÃƒÂ´ng ÃƒÂ¡p dÃ¡Â»Â¥ng cho tour, response `valid=false`.
12. User validate mÃƒÂ£ hÃ¡Â»Â£p lÃ¡Â»â€¡ vÃƒÂ  kiÃ¡Â»Æ’m tra `discountAmount`, `finalAmount` Ã„â€˜ÃƒÂºng.
13. User tÃ¡ÂºÂ¡o booking cÃƒÂ³ `promoCode` hÃ¡Â»Â£p lÃ¡Â»â€¡: `originalAmount`, `discountAmount`, `totalAmount`, `promoCode` Ã„â€˜ÃƒÂºng; `usedCount` tÃ„Æ’ng 1; `promotion_usage` Ã„â€˜Ã†Â°Ã¡Â»Â£c tÃ¡ÂºÂ¡o.
14. User dÃƒÂ¹ng lÃ¡ÂºÂ¡i mÃƒÂ£ vÃ†Â°Ã¡Â»Â£t `maxUsesPerUser` vÃƒÂ  kiÃ¡Â»Æ’m tra lÃ¡Â»â€”i.
15. Khi promotion hÃ¡ÂºÂ¿t `maxUses`, validate/create booking lÃ¡Â»â€”i.
16. Admin update promotion chÃ†Â°a dÃƒÂ¹ng thÃƒÂ nh cÃƒÂ´ng.
17. Admin update discount cÃ¡Â»Â§a promotion Ã„â€˜ÃƒÂ£ dÃƒÂ¹ng vÃƒÂ  kiÃ¡Â»Æ’m tra lÃ¡Â»â€”i.
18. Admin set status `INACTIVE`, validate khÃƒÂ´ng dÃƒÂ¹ng Ã„â€˜Ã†Â°Ã¡Â»Â£c.
19. Admin delete promotion chÃ†Â°a dÃƒÂ¹ng thÃƒÂ nh cÃƒÂ´ng.
20. Admin delete promotion Ã„â€˜ÃƒÂ£ dÃƒÂ¹ng lÃ¡Â»â€”i, chÃ¡Â»â€° cho inactive.
21. Payment create sau booking cÃƒÂ³ promotion lÃ¡ÂºÂ¥y amount sau giÃ¡ÂºÂ£m tÃ¡Â»Â« `booking.totalAmount`.
22. Compile/light check pass.

### 11.13 KÃ¡ÂºÂ¿t QuÃ¡ÂºÂ£ Compile/Light Check

Ã„ÂÃƒÂ£ chÃ¡ÂºÂ¡y:

```bash
.\mvnw.cmd -DskipTests compile
```

KÃ¡ÂºÂ¿t quÃ¡ÂºÂ£: `BUILD SUCCESS`.

### 11.14 TODO CÃƒÂ²n LÃ¡ÂºÂ¡i

- Promotion analytics nÃ¡ÂºÂ¿u cÃ¡ÂºÂ§n.
- Coupon campaign UI admin frontend.
- Public promo banner nÃ¡ÂºÂ¿u cÃ¡ÂºÂ§n.
- Rule Ã„â€˜iÃ¡Â»Âu chÃ¡Â»â€°nh refund/payment khi booking dÃƒÂ¹ng promotion nÃ¡ÂºÂ¿u sau nÃƒÂ y hoÃƒÂ n tiÃ¡Â»Ân.
- Audit log chi tiÃ¡ÂºÂ¿t cho promotion create/update/status/delete nÃ¡ÂºÂ¿u cÃ¡ÂºÂ§n.

## 12. CÃ¡ÂºÂ­p NhÃ¡ÂºÂ­t 04/06/2026 Ã¢â‚¬â€ Phase 5: Notifications / ThÃƒÂ´ng BÃƒÂ¡o In-App

### 12.1 MÃ¡Â»Â¥c TiÃƒÂªu Phase

TriÃ¡Â»Æ’n khai module Notifications/ThÃƒÂ´ng bÃƒÂ¡o in-app cho VoyageViet, gÃ¡Â»â€œm lÃ†Â°u notification trong DB, API user quÃ¡ÂºÂ£n lÃƒÂ½ thÃƒÂ´ng bÃƒÂ¡o, unread count, mark read/read-all/delete, cÃ¡ÂºÂ¥u hÃƒÂ¬nh WebSocket STOMP cÃ†Â¡ bÃ¡ÂºÂ£n Ã„â€˜Ã¡Â»Æ’ server push realtime vÃƒÂ  tÃƒÂ­ch hÃ¡Â»Â£p event hook nhÃ¡ÂºÂ¹ tÃ¡Â»Â« Booking/Payment/Review.

KhÃƒÂ´ng lÃƒÂ m frontend, khÃƒÂ´ng lÃƒÂ m support chat, khÃƒÂ´ng lÃƒÂ m email/push mobile/browser notification vÃƒÂ  khÃƒÂ´ng thay Ã„â€˜Ã¡Â»â€¢i flow Payment/Promotion/Booking hiÃ¡Â»â€¡n cÃƒÂ³ ngoÃƒÂ i viÃ¡Â»â€¡c gÃ¡Â»Âi hook notification an toÃƒÂ n.

### 12.2 File Ã„ÂÃƒÂ£ ThÃƒÂªm

| File | NÃ¡Â»â„¢i dung |
|---|---|
| `src/main/java/com/voyageviet/backend/notification/entity/Notification.java` | Entity/table `NOTIFICATIONS`, lÃ†Â°u thÃƒÂ´ng bÃƒÂ¡o theo user. |
| `src/main/java/com/voyageviet/backend/notification/entity/NotificationType.java` | Enum loÃ¡ÂºÂ¡i thÃƒÂ´ng bÃƒÂ¡o. |
| `src/main/java/com/voyageviet/backend/notification/dto/NotificationResponse.java` | DTO response notification cho user/API/WebSocket payload. |
| `src/main/java/com/voyageviet/backend/notification/dto/UnreadCountResponse.java` | DTO response unread count. |
| `src/main/java/com/voyageviet/backend/notification/repository/NotificationRepository.java` | Repository query notification theo user/read state, count unread, bulk mark-all-read. |
| `src/main/java/com/voyageviet/backend/notification/service/NotificationService.java` | Service notification API, tÃ¡ÂºÂ¡o notification nÃ¡Â»â„¢i bÃ¡Â»â„¢, serialize/parse JSON data, push realtime. |
| `src/main/java/com/voyageviet/backend/notification/service/NotificationEventPublisher.java` | Wrapper event hook cho Booking/Payment/Review, catch lÃ¡Â»â€”i notification Ã„â€˜Ã¡Â»Æ’ khÃƒÂ´ng rollback nghiÃ¡Â»â€¡p vÃ¡Â»Â¥ chÃƒÂ­nh. |
| `src/main/java/com/voyageviet/backend/notification/controller/NotificationController.java` | User notification APIs tÃ¡ÂºÂ¡i `/api/notifications`. |
| `src/main/java/com/voyageviet/backend/common/config/WebSocketConfig.java` | STOMP WebSocket config endpoint `/ws`, broker `/topic`, `/queue`. |

KhÃƒÂ´ng xÃƒÂ³a file nÃƒÂ o.

### 12.3 File Ã„ÂÃƒÂ£ SÃ¡Â»Â­a

| File | NÃ¡Â»â„¢i dung sÃ¡Â»Â­a |
|---|---|
| `pom.xml` | ThÃƒÂªm dependency `spring-boot-starter-websocket`. |
| `src/main/java/com/voyageviet/backend/common/config/SecurityConfig.java` | Permit `/ws/**` handshake, giÃ¡Â»Â¯ nguyÃƒÂªn rule API cÃ…Â©. |
| `src/main/java/com/voyageviet/backend/common/exception/ErrorCode.java` | ThÃƒÂªm `NOTIFICATION_NOT_FOUND`, `NOTIFICATION_FORBIDDEN`. |
| `src/main/java/com/voyageviet/backend/booking/service/BookingService.java` | TÃ¡ÂºÂ¡o notification khi booking created, user/admin cancelled, admin confirmed. |
| `src/main/java/com/voyageviet/backend/payment/service/PaymentService.java` | TÃ¡ÂºÂ¡o notification khi VNPay IPN/mock success/failed vÃƒÂ  refund skeleton thÃƒÂ nh cÃƒÂ´ng. |
| `src/main/java/com/voyageviet/backend/review/service/ReviewService.java` | TÃ¡ÂºÂ¡o notification khi admin Ã„â€˜Ã¡Â»â€¢i review sang `ACTIVE` hoÃ¡ÂºÂ·c `HIDDEN`. |
| `BACKEND_API_REPORT.md` | CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t Phase 5 Notifications/ThÃƒÂ´ng bÃƒÂ¡o in-app. |

### 12.4 Entity/Table MÃ¡Â»â€ºi

| BÃ¡ÂºÂ£ng | Entity | CÃ¡Â»â„¢t/chÃ¡Â»â€° mÃ¡Â»Â¥c chÃƒÂ­nh |
|---|---|---|
| `NOTIFICATIONS` | `Notification` | `ID`, `USER_ID`, `TYPE`, `TITLE`, `BODY`, `DATA` CLOB JSON, `IS_READ`, `READ_AT`, `CREATED_AT`, `UPDATED_AT`; index `IDX_NOTIFICATIONS_USER_READ_CREATED (USER_ID, IS_READ, CREATED_AT)`, `IDX_NOTIFICATIONS_USER_CREATED (USER_ID, CREATED_AT)`. |

Ghi chÃƒÂº Oracle/local: project Ã„â€˜ang dÃƒÂ¹ng `spring.jpa.hibernate.ddl-auto=update`, nÃƒÂªn entity JPA Ã„â€˜Ã¡Â»Â§ cho local. `IS_READ` dÃƒÂ¹ng Boolean JPA mapping, `DATA` dÃƒÂ¹ng `@Lob` text/CLOB.

### 12.5 Enum MÃ¡Â»â€ºi

| Enum | GiÃƒÂ¡ trÃ¡Â»â€¹ |
|---|---|
| `NotificationType` | `BOOKING_CREATED`, `BOOKING_CONFIRMED`, `BOOKING_CANCELLED`, `PAYMENT_SUCCESS`, `PAYMENT_FAILED`, `PAYMENT_REFUNDED`, `REVIEW_APPROVED`, `REVIEW_REJECTED`, `SYSTEM` |

Review hiÃ¡Â»â€¡n dÃƒÂ¹ng `ReviewStatus.ACTIVE/HIDDEN`, phase nÃƒÂ y map `ACTIVE -> REVIEW_APPROVED`, `HIDDEN -> REVIEW_REJECTED`.

### 12.6 DTO MÃ¡Â»â€ºi

| DTO | MÃ¡Â»Â¥c Ã„â€˜ÃƒÂ­ch |
|---|---|
| `NotificationResponse` | TrÃ¡ÂºÂ£ `id`, `type`, `title`, `body`, `data`, `read`, `readAt`, `createdAt`. `data` parse tÃ¡Â»Â« JSON string sang object nÃ¡ÂºÂ¿u hÃ¡Â»Â£p lÃ¡Â»â€¡. |
| `UnreadCountResponse` | TrÃ¡ÂºÂ£ `{ count }`. |

KhÃƒÂ´ng expose public create-notification request DTO trong phase nÃƒÂ y; notification Ã„â€˜Ã†Â°Ã¡Â»Â£c tÃ¡ÂºÂ¡o qua service nÃ¡Â»â„¢i bÃ¡Â»â„¢.

### 12.7 Repository/Service/Controller MÃ¡Â»â€ºi

| LoÃ¡ÂºÂ¡i | TÃƒÂªn | Ghi chÃƒÂº |
|---|---|---|
| Repository | `NotificationRepository` | `findByUserId`, `findByUserIdAndIsRead`, `countByUserIdAndIsReadFalse`, `findByIdAndUserId`, `markAllReadByUserId`. |
| Service | `NotificationService` | Query notification, unread count, mark read/read-all/delete, create notification, JSON helper, realtime push. |
| Service | `NotificationEventPublisher` | Hook nghiÃ¡Â»â€¡p vÃ¡Â»Â¥ booking/payment/review, catch/log lÃ¡Â»â€”i notification. |
| Controller | `NotificationController` | 5 API notification cho authenticated user. |
| Config | `WebSocketConfig` | STOMP endpoint `/ws`, broker `/topic` vÃƒÂ  `/queue`, application prefix `/app`, user prefix `/user`. |

### 12.8 API MÃ¡Â»â€ºi

| Method | Endpoint | QuyÃ¡Â»Ân | ChÃ¡Â»Â©c nÃ„Æ’ng | Payload/query chÃƒÂ­nh |
|---|---|---|---|---|
| GET | `/api/notifications` | Authenticated | LÃ¡ÂºÂ¥y danh sÃƒÂ¡ch notification cÃ¡Â»Â§a user hiÃ¡Â»â€¡n tÃ¡ÂºÂ¡i, cÃƒÂ³ filter read state vÃƒÂ  paging | `isRead=true/false/all`, `page`, `size`, `sortBy`, `sortDir`; default `createdAt desc` |
| GET | `/api/notifications/unread-count` | Authenticated | LÃ¡ÂºÂ¥y sÃ¡Â»â€˜ notification chÃ†Â°a Ã„â€˜Ã¡Â»Âc cÃ¡Â»Â§a user hiÃ¡Â»â€¡n tÃ¡ÂºÂ¡i | KhÃƒÂ´ng |
| PATCH | `/api/notifications/{id}/read` | Authenticated | Ã„ÂÃƒÂ¡nh dÃ¡ÂºÂ¥u mÃ¡Â»â„¢t notification Ã„â€˜ÃƒÂ£ Ã„â€˜Ã¡Â»Âc, idempotent nÃ¡ÂºÂ¿u Ã„â€˜ÃƒÂ£ Ã„â€˜Ã¡Â»Âc | `id` |
| POST | `/api/notifications/read-all` | Authenticated | Ã„ÂÃƒÂ¡nh dÃ¡ÂºÂ¥u toÃƒÂ n bÃ¡Â»â„¢ notification chÃ†Â°a Ã„â€˜Ã¡Â»Âc cÃ¡Â»Â§a user hiÃ¡Â»â€¡n tÃ¡ÂºÂ¡i lÃƒÂ  Ã„â€˜ÃƒÂ£ Ã„â€˜Ã¡Â»Âc bÃ¡ÂºÂ±ng bulk update | KhÃƒÂ´ng |
| DELETE | `/api/notifications/{id}` | Authenticated | XÃƒÂ³a notification thuÃ¡Â»â„¢c user hiÃ¡Â»â€¡n tÃ¡ÂºÂ¡i | `id` |

Response vÃ¡ÂºÂ«n bÃ¡Â»Âc bÃ¡ÂºÂ±ng `ApiResponse` chung: `success`, `message`, `data`, `timestamp`. Paging vÃ¡ÂºÂ«n dÃƒÂ¹ng `PageResponse` chung.

### 12.9 API/Service CÃ…Â© Ã„ÂÃƒÂ£ ChÃ¡Â»â€°nh SÃ¡Â»Â­a

| API/Service | Thay Ã„â€˜Ã¡Â»â€¢i |
|---|---|
| `BookingService.createBooking` | Sau khi booking save thÃƒÂ nh cÃƒÂ´ng, tÃ¡ÂºÂ¡o notification `BOOKING_CREATED` cho user. |
| `BookingService.cancelMyBooking` | Sau khi user hÃ¡Â»Â§y booking thÃƒÂ nh cÃƒÂ´ng, tÃ¡ÂºÂ¡o notification `BOOKING_CANCELLED`. |
| `BookingService.updateBookingStatus` | Khi admin Ã„â€˜Ã¡Â»â€¢i status sang `CONFIRMED`, tÃ¡ÂºÂ¡o `BOOKING_CONFIRMED`; khi Ã„â€˜Ã¡Â»â€¢i sang `CANCELLED`, tÃ¡ÂºÂ¡o `BOOKING_CANCELLED`. |
| `PaymentService.handleVnpayIpn` | Sau IPN final save, tÃ¡ÂºÂ¡o `PAYMENT_SUCCESS` hoÃ¡ÂºÂ·c `PAYMENT_FAILED`. Callback VNPay vÃ¡ÂºÂ«n khÃƒÂ´ng tÃ¡ÂºÂ¡o notification vÃƒÂ¬ chÃ¡Â»â€° lÃƒÂ  redirect UX. |
| `PaymentService.completeMockPayment` | Sau mock payment save, tÃ¡ÂºÂ¡o `PAYMENT_SUCCESS` hoÃ¡ÂºÂ·c `PAYMENT_FAILED`. |
| `PaymentService.refund` | Sau refund skeleton save, tÃ¡ÂºÂ¡o `PAYMENT_REFUNDED`. |
| `ReviewService.updateReviewStatus` | Khi status thay Ã„â€˜Ã¡Â»â€¢i sang `ACTIVE`, tÃ¡ÂºÂ¡o `REVIEW_APPROVED`; sang `HIDDEN`, tÃ¡ÂºÂ¡o `REVIEW_REJECTED`. |
| `SecurityConfig` | Permit `/ws/**` cho WebSocket/SockJS handshake; khÃƒÂ´ng Ã„â€˜Ã¡Â»â€¢i `/api/admin/**`, `/api/public/**`, `/api/auth/**`, VNPay callback/IPN. |

### 12.10 WebSocket Realtime

- Ã„ÂÃƒÂ£ thÃƒÂªm `spring-boot-starter-websocket`.
- Ã„ÂÃƒÂ£ thÃƒÂªm `WebSocketConfig` vÃ¡Â»â€ºi endpoint `/ws`, allowed origin `http://localhost:4200`, bÃ¡ÂºÂ­t SockJS.
- Simple broker bÃ¡ÂºÂ­t `/topic`, `/queue`.
- Application destination prefix: `/app`.
- User destination prefix: `/user`.
- Phase nÃƒÂ y chÃ†Â°a cÃƒÂ³ JWT handshake/channel interceptor cho WebSocket.
- Do HTTP JWT principal hiÃ¡Â»â€¡n lÃƒÂ  email vÃƒÂ  chÃ†Â°a cÃƒÂ³ principal mapping Ã¡Â»â€¢n Ã„â€˜Ã¡Â»â€¹nh cho STOMP, realtime push hiÃ¡Â»â€¡n dÃƒÂ¹ng fallback `convertAndSend("/topic/users/" + userId + "/notifications", payload)`.
- TODO bÃ¡ÂºÂ£o mÃ¡ÂºÂ­t: phase sau thÃƒÂªm JWT handshake/channel interceptor vÃƒÂ  chuyÃ¡Â»Æ’n sang `convertAndSendToUser(..., "/queue/notifications", payload)` vÃ¡Â»â€ºi principal mapping rÃƒÂµ rÃƒÂ ng.
- Notification DB lÃƒÂ  nguÃ¡Â»â€œn chÃƒÂ­nh; WebSocket chÃ¡Â»â€° lÃƒÂ  kÃƒÂªnh realtime phÃ¡Â»Â¥. LÃ¡Â»â€”i push Ã„â€˜Ã†Â°Ã¡Â»Â£c log warning vÃƒÂ  khÃƒÂ´ng lÃƒÂ m fail nghiÃ¡Â»â€¡p vÃ¡Â»Â¥ chÃƒÂ­nh.

### 12.11 Business Rule Ã„ÂÃƒÂ£ Implement

- User chÃ¡Â»â€° xem/sÃ¡Â»Â­a/xÃƒÂ³a notification cÃ¡Â»Â§a chÃƒÂ­nh mÃƒÂ¬nh.
- `unread-count` tÃƒÂ­nh theo user hiÃ¡Â»â€¡n tÃ¡ÂºÂ¡i.
- `GET /api/notifications` hÃ¡Â»â€” trÃ¡Â»Â£ `isRead=true`, `isRead=false`, `isRead=all` hoÃ¡ÂºÂ·c bÃ¡Â»Â trÃ¡Â»â€˜ng Ã„â€˜Ã¡Â»Æ’ lÃ¡ÂºÂ¥y tÃ¡ÂºÂ¥t cÃ¡ÂºÂ£.
- Sort mÃ¡ÂºÂ·c Ã„â€˜Ã¡Â»â€¹nh `createdAt DESC`; chÃ¡Â»â€° cho sort theo `createdAt`, `updatedAt`, `id`, `type`, `isRead`, `readAt`.
- `markAsRead` idempotent: nÃ¡ÂºÂ¿u Ã„â€˜ÃƒÂ£ Ã„â€˜Ã¡Â»Âc thÃƒÂ¬ trÃ¡ÂºÂ£ response hiÃ¡Â»â€¡n tÃ¡ÂºÂ¡i, khÃƒÂ´ng lÃ¡Â»â€”i.
- `read-all` dÃƒÂ¹ng bulk update cÃƒÂ¡c notification chÃ†Â°a Ã„â€˜Ã¡Â»Âc cÃ¡Â»Â§a user hiÃ¡Â»â€¡n tÃ¡ÂºÂ¡i vÃƒÂ  trÃ¡ÂºÂ£ sÃ¡Â»â€˜ bÃ¡ÂºÂ£n ghi Ã„â€˜ÃƒÂ£ update.
- `delete` kiÃ¡Â»Æ’m tra ownership; notification khÃƒÂ´ng tÃ¡Â»â€œn tÃ¡ÂºÂ¡i trÃ¡ÂºÂ£ 404, notification cÃ¡Â»Â§a user khÃƒÂ¡c trÃ¡ÂºÂ£ 403.
- `NotificationService.toJson(Map<String,Object>)` dÃƒÂ¹ng `ObjectMapper`, khÃƒÂ´ng nÃ¡Â»â€˜i chuÃ¡Â»â€”i JSON thÃ¡Â»Â§ cÃƒÂ´ng.
- NÃ¡ÂºÂ¿u serialize `data` lÃ¡Â»â€”i, log warning vÃƒÂ  lÃ†Â°u `data = null`, khÃƒÂ´ng fail nghiÃ¡Â»â€¡p vÃ¡Â»Â¥ chÃƒÂ­nh.
- `NotificationEventPublisher` catch `RuntimeException` khi tÃ¡ÂºÂ¡o notification tÃ¡Â»Â« Booking/Payment/Review Ã„â€˜Ã¡Â»Æ’ khÃƒÂ´ng rollback flow chÃƒÂ­nh.
- WebSocket push failure khÃƒÂ´ng lÃƒÂ m rollback transaction notification hoÃ¡ÂºÂ·c transaction nghiÃ¡Â»â€¡p vÃ¡Â»Â¥.

### 12.12 Validation/Error Message Quan TrÃ¡Â»Âng

- `ThÃƒÂ´ng bÃƒÂ¡o khÃƒÂ´ng tÃ¡Â»â€œn tÃ¡ÂºÂ¡i.`
- `BÃ¡ÂºÂ¡n khÃƒÂ´ng cÃƒÂ³ quyÃ¡Â»Ân xem thÃƒÂ´ng bÃƒÂ¡o nÃƒÂ y.`
- `Ã„ÂÃƒÂ¡nh dÃ¡ÂºÂ¥u thÃƒÂ´ng bÃƒÂ¡o Ã„â€˜ÃƒÂ£ Ã„â€˜Ã¡Â»Âc thÃƒÂ nh cÃƒÂ´ng.`
- `Ã„ÂÃƒÂ¡nh dÃ¡ÂºÂ¥u tÃ¡ÂºÂ¥t cÃ¡ÂºÂ£ thÃƒÂ´ng bÃƒÂ¡o Ã„â€˜ÃƒÂ£ Ã„â€˜Ã¡Â»Âc thÃƒÂ nh cÃƒÂ´ng.`
- `XÃƒÂ³a thÃƒÂ´ng bÃƒÂ¡o thÃƒÂ nh cÃƒÂ´ng.`
- `KhÃƒÂ´ng thÃ¡Â»Æ’ gÃ¡Â»Â­i thÃƒÂ´ng bÃƒÂ¡o realtime, Ã„â€˜ÃƒÂ£ lÃ†Â°u thÃƒÂ´ng bÃƒÂ¡o vÃƒÂ o hÃ¡Â»â€¡ thÃ¡Â»â€˜ng.` dÃƒÂ¹ng Ã¡Â»Å¸ log warning khi WebSocket push lÃ¡Â»â€”i.
- `isRead must be true, false or all`
- `Invalid sort field. Allowed fields: createdAt, updatedAt, id, type, isRead, readAt`

### 12.13 Checklist Test ThÃ¡Â»Â§ CÃƒÂ´ng

1. User tÃ¡ÂºÂ¡o booking thÃƒÂ nh cÃƒÂ´ng -> cÃƒÂ³ notification `BOOKING_CREATED` trong DB.
2. GÃ¡Â»Âi `GET /api/notifications` -> thÃ¡ÂºÂ¥y notification mÃ¡Â»â€ºi nhÃ¡ÂºÂ¥t.
3. GÃ¡Â»Âi `GET /api/notifications/unread-count` -> count tÃ„Æ’ng Ã„â€˜ÃƒÂºng.
4. GÃ¡Â»Âi `PATCH /api/notifications/{id}/read` -> notification `read=true`, `readAt` cÃƒÂ³ giÃƒÂ¡ trÃ¡Â»â€¹.
5. GÃ¡Â»Âi unread-count sau mark read -> count giÃ¡ÂºÂ£m.
6. TÃ¡ÂºÂ¡o nhiÃ¡Â»Âu notification chÃ†Â°a Ã„â€˜Ã¡Â»Âc -> `POST /api/notifications/read-all` -> tÃ¡ÂºÂ¥t cÃ¡ÂºÂ£ `read=true`.
7. `DELETE /api/notifications/{id}` -> notification biÃ¡ÂºÂ¿n mÃ¡ÂºÂ¥t khÃ¡Â»Âi list user hiÃ¡Â»â€¡n tÃ¡ÂºÂ¡i.
8. User A khÃƒÂ´ng Ã„â€˜Ã¡Â»Âc/xÃƒÂ³a Ã„â€˜Ã†Â°Ã¡Â»Â£c notification cÃ¡Â»Â§a User B.
9. Admin confirm booking -> user nhÃ¡ÂºÂ­n `BOOKING_CONFIRMED`.
10. User hoÃ¡ÂºÂ·c admin cancel booking -> user nhÃ¡ÂºÂ­n `BOOKING_CANCELLED`.
11. Mock payment success hoÃ¡ÂºÂ·c VNPay IPN success -> user nhÃ¡ÂºÂ­n `PAYMENT_SUCCESS`.
12. Payment failed -> user nhÃ¡ÂºÂ­n `PAYMENT_FAILED`.
13. Refund skeleton -> user nhÃ¡ÂºÂ­n `PAYMENT_REFUNDED`.
14. Admin Ã„â€˜Ã¡Â»â€¢i review sang `ACTIVE/HIDDEN` -> user nhÃ¡ÂºÂ­n `REVIEW_APPROVED/REVIEW_REJECTED`.
15. NÃ¡ÂºÂ¿u WebSocket Ã„â€˜Ã†Â°Ã¡Â»Â£c bÃ¡ÂºÂ­t: client subscribe `/topic/users/{userId}/notifications` vÃƒÂ  nhÃ¡ÂºÂ­n payload realtime khi tÃ¡ÂºÂ¡o notification.
16. NÃ¡ÂºÂ¿u WebSocket push lÃ¡Â»â€”i: nghiÃ¡Â»â€¡p vÃ¡Â»Â¥ booking/payment/review vÃ¡ÂºÂ«n thÃƒÂ nh cÃƒÂ´ng, DB notification vÃ¡ÂºÂ«n Ã„â€˜Ã†Â°Ã¡Â»Â£c lÃ†Â°u nÃ¡ÂºÂ¿u create notification khÃƒÂ´ng lÃ¡Â»â€”i.
17. Compile/light check pass.

### 12.14 KÃ¡ÂºÂ¿t QuÃ¡ÂºÂ£ Compile/Light Check

Ã„ÂÃƒÂ£ chÃ¡ÂºÂ¡y:

```bash
.\mvnw.cmd -DskipTests compile
```

KÃ¡ÂºÂ¿t quÃ¡ÂºÂ£: `BUILD SUCCESS` lÃƒÂºc `2026-06-04T08:56:31+07:00`.

### 12.15 TODO CÃƒÂ²n LÃ¡ÂºÂ¡i

- JWT auth cho WebSocket handshake/channel interceptor.
- ChuyÃ¡Â»Æ’n realtime push sang `convertAndSendToUser(..., "/queue/notifications", payload)` sau khi principal mapping WebSocket rÃƒÂµ rÃƒÂ ng.
- Notification frontend bell/dropdown vÃƒÂ  unread badge.
- Notification settings per user nÃ¡ÂºÂ¿u cÃ¡ÂºÂ§n.
- Email/SMS notification nÃ¡ÂºÂ¿u cÃ¡ÂºÂ§n.
- Cleanup/retention policy cho notification cÃ…Â©.
- Support chat WebSocket tÃƒÂ¡ch phase sau.

## 13. CÃ¡ÂºÂ­p NhÃ¡ÂºÂ­t 04/06/2026 Ã¢â‚¬â€ Phase 6: Booking/Admin Hardening

### 13.1 MÃ¡Â»Â¥c TiÃƒÂªu Phase

TriÃ¡Â»Æ’n khai hardening cho Booking/Admin gÃ¡Â»â€œm admin booking detail, nhÃƒÂ¢n bÃ¡ÂºÂ£n tour sang bÃ¡ÂºÂ£n nhÃƒÂ¡p, scheduler tÃ¡Â»Â± hÃ¡Â»Â§y booking PENDING quÃƒÂ¡ hÃ¡ÂºÂ¡n, fail payment pending quÃƒÂ¡ hÃ¡ÂºÂ¡n, release ghÃ¡ÂºÂ¿ schedule, sÃ¡Â»Â­a security `/api/users/**` vÃƒÂ  bÃ¡Â»â€¢ sung SMTP email thÃ¡ÂºÂ­t cho forgot/reset/verify email.

KhÃƒÂ´ng lÃƒÂ m frontend, khÃƒÂ´ng lÃƒÂ m support chat, khÃƒÂ´ng lÃƒÂ m VNPay refund thÃ¡ÂºÂ­t, khÃƒÂ´ng lÃƒÂ m WebSocket JWT handshake vÃƒÂ  khÃƒÂ´ng Ã„â€˜Ã¡Â»â€¢i response format chung.

### 13.2 File Ã„ÂÃƒÂ£ ThÃƒÂªm

| File | NÃ¡Â»â„¢i dung |
|---|---|
| `src/main/java/com/voyageviet/backend/booking/dto/AdminBookingDetailResponse.java` | DTO detail booking cho admin, gÃ¡Â»â€œm user/tour/schedule/contact/amount/promotion/payment mÃ¡Â»â€ºi nhÃ¡ÂºÂ¥t. |
| `src/main/java/com/voyageviet/backend/booking/config/BookingExpiryProperties.java` | Bind config `booking.expiry.*`. |
| `src/main/java/com/voyageviet/backend/booking/service/BookingExpiryService.java` | XÃ¡Â»Â­ lÃƒÂ½ expire tÃ¡Â»Â«ng booking trong transaction riÃƒÂªng: cancel booking, release ghÃ¡ÂºÂ¿, fail payment pending, tÃ¡ÂºÂ¡o notification. |
| `src/main/java/com/voyageviet/backend/booking/service/BookingExpiryScheduler.java` | Job scheduled scan booking PENDING quÃƒÂ¡ hÃ¡ÂºÂ¡n theo fixed rate vÃƒÂ  batch-size. |

KhÃƒÂ´ng xÃƒÂ³a file nÃƒÂ o.

### 13.3 File Ã„ÂÃƒÂ£ SÃ¡Â»Â­a

| File | NÃ¡Â»â„¢i dung sÃ¡Â»Â­a |
|---|---|
| `pom.xml` | ThÃƒÂªm `spring-boot-starter-mail`. |
| `src/main/java/com/voyageviet/backend/VoyageBackendApplication.java` | BÃ¡ÂºÂ­t `@EnableScheduling`. |
| `src/main/java/com/voyageviet/backend/booking/controller/AdminBookingController.java` | ThÃƒÂªm `GET /api/admin/bookings/{id}`. |
| `src/main/java/com/voyageviet/backend/booking/service/BookingService.java` | ThÃƒÂªm `getAdminBookingDetail`, map detail admin, inject `PaymentRepository`. |
| `src/main/java/com/voyageviet/backend/booking/repository/BookingRepository.java` | ThÃƒÂªm `findWithAdminDetailById`, `findExpiredPendingBookingIds`. |
| `src/main/java/com/voyageviet/backend/tour/controller/AdminTourController.java` | ThÃƒÂªm `POST /api/admin/tours/{id}/duplicate`. |
| `src/main/java/com/voyageviet/backend/tour/service/TourService.java` | ThÃƒÂªm duplicate tour sang DRAFT, copy itinerary/images, generate slug unique. |
| `src/main/java/com/voyageviet/backend/notification/service/NotificationEventPublisher.java` | ThÃƒÂªm `bookingExpired` notification. |
| `src/main/java/com/voyageviet/backend/common/config/SecurityConfig.java` | Ã„ÂÃ¡Â»â€¢i matcher tÃ¡Â»Â« `/api/users/me` sang `/api/users/**` yÃƒÂªu cÃ¡ÂºÂ§u role `USER`. |
| `src/main/java/com/voyageviet/backend/auth/service/LoggingEmailService.java` | Refactor Ã„â€˜Ã¡Â»Æ’ gÃ¡Â»Â­i email thÃ¡ÂºÂ­t qua `JavaMailSender` khi enabled, fallback/log link khi mail disabled hoÃ¡ÂºÂ·c local/dev. |
| `src/main/resources/application.properties` | ThÃƒÂªm config booking expiry vÃƒÂ  mail/frontend base URL. |
| `src/main/resources/application-local.properties` | ThÃƒÂªm config booking expiry vÃƒÂ  mail/frontend base URL cho local. |
| `BACKEND_API_REPORT.md` | CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t Phase 6 Booking/Admin Hardening. |

### 13.4 DTO MÃ¡Â»â€ºi

| DTO | MÃ¡Â»Â¥c Ã„â€˜ÃƒÂ­ch |
|---|---|
| `AdminBookingDetailResponse` | Response detail booking cho admin: booking status/payment status, user info, tour/category/destination, schedule, passenger counts, price snapshots, contact/note, promotion info, latest payment summary. |

KhÃƒÂ´ng tÃ¡ÂºÂ¡o `TourDuplicateRequest` trong phase nÃƒÂ y. Endpoint duplicate khÃƒÂ´ng nhÃ¡ÂºÂ­n body vÃƒÂ  dÃƒÂ¹ng default: copy itinerary/images, khÃƒÂ´ng copy schedules.

### 13.5 Repository/Service/Controller Ã„ÂÃƒÂ£ ThÃƒÂªm/SÃ¡Â»Â­a

| LoÃ¡ÂºÂ¡i | TÃƒÂªn | Ghi chÃƒÂº |
|---|---|---|
| Controller | `AdminBookingController` | ThÃƒÂªm detail endpoint. |
| Service | `BookingService` | ThÃƒÂªm `getAdminBookingDetail`. |
| Repository | `BookingRepository` | ThÃƒÂªm fetch graph cho detail vÃƒÂ  query id booking quÃƒÂ¡ hÃ¡ÂºÂ¡n. |
| Controller | `AdminTourController` | ThÃƒÂªm duplicate endpoint. |
| Service | `TourService` | ThÃƒÂªm `duplicateTour(Long sourceTourId)`. |
| Service | `BookingExpiryService` | XÃ¡Â»Â­ lÃƒÂ½ expire tÃ¡Â»Â«ng booking. |
| Scheduler | `BookingExpiryScheduler` | Scan booking quÃƒÂ¡ hÃ¡ÂºÂ¡n theo config. |
| Service | `LoggingEmailService` / `EmailService` | GÃ¡Â»Â­i SMTP thÃ¡ÂºÂ­t khi enabled, log link khi disabled/local. |
| Config | `SecurityConfig` | `/api/users/**` yÃƒÂªu cÃ¡ÂºÂ§u role `USER`. |

### 13.6 API MÃ¡Â»â€ºi

| Method | Endpoint | QuyÃ¡Â»Ân | ChÃ¡Â»Â©c nÃ„Æ’ng | Payload/query chÃƒÂ­nh |
|---|---|---|---|---|
| GET | `/api/admin/bookings/{id}` | Admin | Admin xem detail booking Ã„â€˜Ã¡ÂºÂ§y Ã„â€˜Ã¡Â»Â§ Ã„â€˜Ã¡Â»Æ’ mÃ¡Â»Å¸ detail drawer/page | Path `id`; khÃƒÂ´ng expose password/token/raw gatewayResponse |
| POST | `/api/admin/tours/{id}/duplicate` | Admin | NhÃƒÂ¢n bÃ¡ÂºÂ£n tour hiÃ¡Â»â€¡n cÃƒÂ³ sang tour mÃ¡Â»â€ºi `DRAFT` | Path `id`; khÃƒÂ´ng body; default copy itinerary/images, khÃƒÂ´ng copy schedules |

### 13.7 Config MÃ¡Â»â€ºi

| Key | Default | Ghi chÃƒÂº |
|---|---|---|
| `booking.expiry.enabled` | `true` | BÃ¡ÂºÂ­t/tÃ¡ÂºÂ¯t scheduler tÃ¡Â»Â± hÃ¡Â»Â§y booking quÃƒÂ¡ hÃ¡ÂºÂ¡n. |
| `booking.expiry.pending-timeout-minutes` | `30` | Booking `PENDING` quÃƒÂ¡ sÃ¡Â»â€˜ phÃƒÂºt nÃƒÂ y sÃ¡ÂºÂ½ bÃ¡Â»â€¹ expire nÃ¡ÂºÂ¿u chÃ†Â°a paid. |
| `booking.expiry.fixed-rate-ms` | `60000` | Chu kÃ¡Â»Â³ scheduler. |
| `booking.expiry.batch-size` | `100` | SÃ¡Â»â€˜ booking tÃ¡Â»â€˜i Ã„â€˜a xÃ¡Â»Â­ lÃƒÂ½ mÃ¡Â»â€”i lÃ¡ÂºÂ§n scan. |
| `app.mail.enabled` | `false` | BÃ¡ÂºÂ­t gÃ¡Â»Â­i email thÃ¡ÂºÂ­t qua SMTP. |
| `app.mail.from` | `no-reply@voyageviet.local` | From address. |
| `app.frontend.base-url` | `http://localhost:4200` | Base URL Ã„â€˜Ã¡Â»Æ’ tÃ¡ÂºÂ¡o reset/verify link. |
| `spring.mail.host` | `${MAIL_HOST:}` | SMTP host. |
| `spring.mail.port` | `${MAIL_PORT:587}` | SMTP port. |
| `spring.mail.username` | `${MAIL_USERNAME:}` | SMTP username. |
| `spring.mail.password` | `${MAIL_PASSWORD:}` | SMTP password/app password. |
| `spring.mail.properties.mail.smtp.auth` | `true` | SMTP auth. |
| `spring.mail.properties.mail.smtp.starttls.enable` | `true` | STARTTLS. |

Ghi chÃƒÂº SMTP: dÃƒÂ¹ng env/provider SMTP, khÃƒÂ´ng hardcode Gmail password. VÃ¡Â»â€ºi Gmail cÃ¡ÂºÂ§n dÃƒÂ¹ng App Password.

### 13.8 API/Service CÃ…Â© Ã„ÂÃƒÂ£ ChÃ¡Â»â€°nh SÃ¡Â»Â­a

| API/Service | Thay Ã„â€˜Ã¡Â»â€¢i |
|---|---|
| `BookingService` | Admin detail mapping; scheduler expire release ghÃ¡ÂºÂ¿ qua `BookingExpiryService`. |
| `PaymentRepository` | Reuse `findFirstByBookingIdAndStatusOrderByCreatedAtDesc` Ã„â€˜Ã¡Â»Æ’ fail latest `PENDING` payment khi booking expire. |
| `TourService` | Duplicate tour sang DRAFT, title `old title (Copy)`, slug unique `old-slug-copy`, `old-slug-copy-2`, hoÃ¡ÂºÂ·c timestamp fallback. |
| `SecurityConfig` | `/api/users/**` cÃ¡ÂºÂ§n role `USER`; role hierarchy vÃ¡ÂºÂ«n cho `ADMIN/SUPER_ADMIN` kÃ¡ÂºÂ¿ thÃ¡Â»Â«a. Public/admin/auth/VNPay/ws/swagger rules giÃ¡Â»Â¯ nguyÃƒÂªn thÃ¡Â»Â© tÃ¡Â»Â± trÃ†Â°Ã¡Â»â€ºc matcher nÃƒÂ y. |
| `AuthService` / `EmailService` | Forgot password/register verify email gÃ¡Â»Âi service gÃ¡Â»Â­i email; service khÃƒÂ´ng expose token trong response vÃƒÂ  khÃƒÂ´ng lÃƒÂ m fail register/forgot khi SMTP lÃ¡Â»â€”i. |
| `NotificationEventPublisher` | ThÃƒÂªm notification `BOOKING_CANCELLED` vÃ¡Â»â€ºi title `Booking Ã„â€˜ÃƒÂ£ hÃ¡ÂºÂ¿t hÃ¡ÂºÂ¡n` cho booking expiry. |

### 13.9 Business Rule Ã„ÂÃƒÂ£ Implement

- Admin xem detail booking bÃ¡ÂºÂ¥t kÃ¡Â»Â³ qua `/api/admin/bookings/{id}`.
- Booking khÃƒÂ´ng tÃ¡Â»â€œn tÃ¡ÂºÂ¡i trÃ¡ÂºÂ£ business error `Booking khÃƒÂ´ng tÃ¡Â»â€œn tÃ¡ÂºÂ¡i.`.
- Booking detail khÃƒÂ´ng expose password/token/raw `gatewayResponse`; raw payment vÃ¡ÂºÂ«n xem qua `GET /api/admin/payments/{id}`.
- Tour duplicate luÃƒÂ´n tÃ¡ÂºÂ¡o tour mÃ¡Â»â€ºi `DRAFT`, `featured=false`.
- Tour duplicate copy category/destination reference vÃƒÂ  basic tour fields.
- Tour duplicate khÃƒÂ´ng copy booking/review/wishlist/payment/promotion usage/audit log.
- Tour duplicate khÃƒÂ´ng copy schedules mÃ¡ÂºÂ·c Ã„â€˜Ã¡Â»â€¹nh Ã„â€˜Ã¡Â»Æ’ trÃƒÂ¡nh mÃ¡Â»Å¸ bÃƒÂ¡n nhÃ¡ÂºÂ§m.
- Tour duplicate copy itinerary trong cÃƒÂ¹ng transaction.
- Tour duplicate copy image metadata. Do `TourImage.publicId` Ã„â€˜ang `nullable=false`, phase nÃƒÂ y copy cÃƒÂ¹ng `publicId`; cÃƒÂ³ rÃ¡Â»Â§i ro shared Cloudinary publicId nÃ¡ÂºÂ¿u xÃƒÂ³a Ã¡ÂºÂ£nh Ã¡Â»Å¸ tour copy.
- Booking PENDING quÃƒÂ¡ hÃ¡ÂºÂ¡n tÃ¡Â»Â± chuyÃ¡Â»Æ’n `CANCELLED` nÃ¡ÂºÂ¿u `paymentStatus` thuÃ¡Â»â„¢c `UNPAID/PENDING/FAILED` vÃƒÂ  khÃƒÂ´ng phÃ¡ÂºÂ£i `PAID`.
- Scheduler release ghÃ¡ÂºÂ¿ khÃ¡Â»Âi `TourSchedule` theo `totalPeople` hoÃ¡ÂºÂ·c `numberOfPeople` fallback.
- NÃ¡ÂºÂ¿u schedule Ã„â€˜ang `FULL` vÃƒÂ  cÃƒÂ²n chÃ¡Â»â€” sau release thÃƒÂ¬ chuyÃ¡Â»Æ’n vÃ¡Â»Â `OPEN`; khÃƒÂ´ng reopen `CLOSED/CANCELLED`.
- Latest payment `PENDING` cÃ¡Â»Â§a booking expired Ã„â€˜Ã†Â°Ã¡Â»Â£c set `FAILED`.
- Booking expired set `booking.paymentStatus=FAILED` Ã„â€˜Ã¡Â»Æ’ frontend biÃ¡ÂºÂ¿t hÃ¡ÂºÂ¿t hÃ¡ÂºÂ¡n thanh toÃƒÂ¡n.
- MÃ¡Â»â€”i booking expire xÃ¡Â»Â­ lÃƒÂ½ trong transaction riÃƒÂªng; mÃ¡Â»â„¢t lÃ¡Â»â€”i khÃƒÂ´ng dÃ¡Â»Â«ng toÃƒÂ n batch.
- Booking `CONFIRMED/COMPLETED/CANCELLED` khÃƒÂ´ng bÃ¡Â»â€¹ scheduler Ã„â€˜Ã¡Â»Â¥ng.
- Notification Ã„â€˜Ã†Â°Ã¡Â»Â£c tÃ¡ÂºÂ¡o cho booking expired nÃ¡ÂºÂ¿u Notification module hoÃ¡ÂºÂ¡t Ã„â€˜Ã¡Â»â„¢ng; lÃ¡Â»â€”i notification vÃ¡ÂºÂ«n Ã„â€˜Ã†Â°Ã¡Â»Â£c publisher catch/log.
- `/api/users/**` yÃƒÂªu cÃ¡ÂºÂ§u role `USER`; anonymous vÃ¡ÂºÂ«n 401, user hÃ¡Â»Â£p lÃ¡Â»â€¡ OK, admin kÃ¡ÂºÂ¿ thÃ¡Â»Â«a qua role hierarchy.
- NÃ¡ÂºÂ¿u `app.mail.enabled=true` vÃƒÂ  SMTP hoÃ¡ÂºÂ¡t Ã„â€˜Ã¡Â»â„¢ng, reset/verify email Ã„â€˜Ã†Â°Ã¡Â»Â£c gÃ¡Â»Â­i thÃ¡ÂºÂ­t.
- NÃ¡ÂºÂ¿u `app.mail.enabled=false`, backend log reset/verify link Ã„â€˜Ã¡Â»Æ’ test local/dev.
- NÃ¡ÂºÂ¿u SMTP lÃ¡Â»â€”i, backend log warning vÃƒÂ  khÃƒÂ´ng leak email tÃ¡Â»â€œn tÃ¡ÂºÂ¡i hay khÃƒÂ´ng qua API response.

### 13.10 Validation/Error Message Quan TrÃ¡Â»Âng

- `Booking khÃƒÂ´ng tÃ¡Â»â€œn tÃ¡ÂºÂ¡i.`
- `Tour khÃƒÂ´ng tÃ¡Â»â€œn tÃ¡ÂºÂ¡i.`
- `NhÃƒÂ¢n bÃ¡ÂºÂ£n tour thÃƒÂ nh cÃƒÂ´ng.`
- `Slug nhÃƒÂ¢n bÃ¡ÂºÂ£n bÃ¡Â»â€¹ trÃƒÂ¹ng, vui lÃƒÂ²ng thÃ¡Â»Â­ lÃ¡ÂºÂ¡i.`
- `Booking Ã„â€˜ÃƒÂ£ Ã„â€˜Ã†Â°Ã¡Â»Â£c tÃ¡Â»Â± Ã„â€˜Ã¡Â»â„¢ng hÃ¡Â»Â§y do quÃƒÂ¡ thÃ¡Â»Âi gian thanh toÃƒÂ¡n.`
- Notification expiry: title `Booking Ã„â€˜ÃƒÂ£ hÃ¡ÂºÂ¿t hÃ¡ÂºÂ¡n`, body `Booking {bookingCode} Ã„â€˜ÃƒÂ£ bÃ¡Â»â€¹ hÃ¡Â»Â§y do quÃƒÂ¡ thÃ¡Â»Âi gian thanh toÃƒÂ¡n.`
- Forgot password response vÃ¡ÂºÂ«n lÃƒÂ  message chung: `NÃ¡ÂºÂ¿u email tÃ¡Â»â€œn tÃ¡ÂºÂ¡i, hÃ¡Â»â€¡ thÃ¡Â»â€˜ng Ã„â€˜ÃƒÂ£ gÃ¡Â»Â­i hÃ†Â°Ã¡Â»â€ºng dÃ¡ÂºÂ«n Ã„â€˜Ã¡ÂºÂ·t lÃ¡ÂºÂ¡i mÃ¡ÂºÂ­t khÃ¡ÂºÂ©u.`
- SMTP warning nÃ¡Â»â„¢i bÃ¡Â»â„¢: `GÃ¡Â»Â­i email xÃƒÂ¡c thÃ¡Â»Â±c thÃ¡ÂºÂ¥t bÃ¡ÂºÂ¡i, vui lÃƒÂ²ng kiÃ¡Â»Æ’m tra cÃ¡ÂºÂ¥u hÃƒÂ¬nh SMTP.`

### 13.11 Checklist Test ThÃ¡Â»Â§ CÃƒÂ´ng

1. Admin gÃ¡Â»Âi `GET /api/admin/bookings/{id}` vÃ¡Â»â€ºi booking tÃ¡Â»â€œn tÃ¡ÂºÂ¡i -> trÃ¡ÂºÂ£ Ã„â€˜Ã¡Â»Â§ user/tour/schedule/payment/promotion/contact/amount.
2. Admin gÃ¡Â»Âi booking khÃƒÂ´ng tÃ¡Â»â€œn tÃ¡ÂºÂ¡i -> lÃ¡Â»â€”i `Booking khÃƒÂ´ng tÃ¡Â»â€œn tÃ¡ÂºÂ¡i.`.
3. User thÃ†Â°Ã¡Â»Âng gÃ¡Â»Âi endpoint admin -> 403.
4. Admin duplicate tour cÃƒÂ³ itinerary/images -> tÃ¡ÂºÂ¡o tour mÃ¡Â»â€ºi `DRAFT`.
5. Tour mÃ¡Â»â€ºi cÃƒÂ³ slug unique.
6. Tour mÃ¡Â»â€ºi khÃƒÂ´ng copy booking/review/wishlist/payment.
7. Tour mÃ¡Â»â€ºi copy itinerary Ã„â€˜ÃƒÂºng.
8. Tour mÃ¡Â»â€ºi copy image metadata; lÃ†Â°u ÃƒÂ½ rÃ¡Â»Â§i ro shared `publicId` khi xÃƒÂ³a Ã¡ÂºÂ£nh.
9. Duplicate tour khÃƒÂ´ng tÃ¡Â»â€œn tÃ¡ÂºÂ¡i -> lÃ¡Â»â€”i `Tour khÃƒÂ´ng tÃ¡Â»â€œn tÃ¡ÂºÂ¡i.`.
10. TÃ¡ÂºÂ¡o booking `PENDING` quÃƒÂ¡ hÃ¡ÂºÂ¡n -> scheduler tÃ¡Â»Â± `CANCELLED`.
11. Booking bÃ¡Â»â€¹ expired release ghÃ¡ÂºÂ¿ khÃ¡Â»Âi schedule.
12. Schedule `FULL` sau release cÃƒÂ²n chÃ¡Â»â€” -> chuyÃ¡Â»Æ’n `OPEN` nÃ¡ÂºÂ¿u khÃƒÂ´ng `CLOSED/CANCELLED`.
13. Payment `PENDING` quÃƒÂ¡ hÃ¡ÂºÂ¡n -> `FAILED`.
14. Booking `CONFIRMED/COMPLETED/CANCELLED` khÃƒÂ´ng bÃ¡Â»â€¹ scheduler Ã„â€˜Ã¡Â»Â¥ng.
15. Notification Ã„â€˜Ã†Â°Ã¡Â»Â£c tÃ¡ÂºÂ¡o cho booking expired.
16. MÃ¡Â»â„¢t booking lÃ¡Â»â€”i khÃƒÂ´ng lÃƒÂ m dÃ¡Â»Â«ng toÃƒÂ n bÃ¡Â»â„¢ batch.
17. Anonymous gÃ¡Â»Âi `/api/users/me/avatar` -> 401.
18. User gÃ¡Â»Âi `/api/users/me/avatar` -> OK.
19. User gÃ¡Â»Âi `/api/users/me/wishlist` -> OK.
20. Admin APIs vÃ¡ÂºÂ«n OK.
21. Public APIs vÃ¡ÂºÂ«n OK.
22. VNPay callback/IPN vÃ¡ÂºÂ«n public.
23. `app.mail.enabled=false` -> forgot password log reset link, API vÃ¡ÂºÂ«n trÃ¡ÂºÂ£ message chung.
24. `app.mail.enabled=true` + SMTP Ã„â€˜ÃƒÂºng -> gÃ¡Â»Â­i email reset password thÃ¡ÂºÂ­t.
25. Reset link mÃ¡Â»Å¸ frontend Ã„â€˜ÃƒÂºng `/reset-password?token=...`.
26. Verify email gÃ¡Â»Â­i link Ã„â€˜ÃƒÂºng `/verify-email?token=...`.
27. SMTP lÃ¡Â»â€”i khÃƒÂ´ng leak thÃƒÂ´ng tin email tÃ¡Â»â€œn tÃ¡ÂºÂ¡i hay khÃƒÂ´ng.
28. Compile/light check pass.

### 13.12 KÃ¡ÂºÂ¿t QuÃ¡ÂºÂ£ Compile/Light Check

Ã„ÂÃƒÂ£ chÃ¡ÂºÂ¡y:

```bash
.\mvnw.cmd -DskipTests compile
```

KÃ¡ÂºÂ¿t quÃ¡ÂºÂ£: `BUILD SUCCESS` lÃƒÂºc `2026-06-04T09:24:14+07:00`.

### 13.13 TODO CÃƒÂ²n LÃ¡ÂºÂ¡i

- Booking passengers table nÃ¡ÂºÂ¿u cÃ¡ÂºÂ§n lÃ†Â°u tÃ¡Â»Â«ng hÃƒÂ nh khÃƒÂ¡ch.
- Payment timeout/refund production nÃƒÂ¢ng cao nÃ¡ÂºÂ¿u cÃ¡ÂºÂ§n.
- Email HTML template Ã„â€˜Ã¡ÂºÂ¹p hÃ†Â¡n vÃƒÂ  i18n nÃ¡ÂºÂ¿u cÃ¡ÂºÂ§n.
- WebSocket JWT handshake/channel interceptor.
- Admin frontend booking detail drawer/page.
- Unit/integration tests cho scheduler/duplicate/security.
- XÃ¡Â»Â­ lÃƒÂ½ an toÃƒÂ n hÃ†Â¡n cho duplicate image publicId: clone Cloudinary asset hoÃ¡ÂºÂ·c Ã„â€˜ÃƒÂ¡nh dÃ¡ÂºÂ¥u shared publicId Ã„â€˜Ã¡Â»Æ’ trÃƒÂ¡nh xÃƒÂ³a Ã¡ÂºÂ£nh gÃ¡Â»â€˜c khi xÃƒÂ³a Ã¡ÂºÂ£nh tour copy.

## 14. CÃ¡ÂºÂ­p NhÃ¡ÂºÂ­t 04/06/2026 Ã¢â‚¬â€ Phase 7: Admin Analytics + Dashboard NÃƒÂ¢ng Cao

### 14.1 MÃ¡Â»Â¥c TiÃƒÂªu Phase

TriÃ¡Â»Æ’n khai nhÃƒÂ³m API admin analytics nÃƒÂ¢ng cao cho dashboard/charts: revenue theo khoÃ¡ÂºÂ£ng ngÃƒÂ y, booking stats nÃƒÂ¢ng cao, top tours theo nhiÃ¡Â»Âu metric, payment stats theo method/status vÃƒÂ  promotion usage stats. CÃƒÂ¡c API dashboard cÃ…Â© `/api/admin/dashboard/summary`, `/api/admin/dashboard/monthly`, `/api/admin/dashboard/reviews` Ã„â€˜Ã†Â°Ã¡Â»Â£c giÃ¡Â»Â¯ nguyÃƒÂªn, khÃƒÂ´ng Ã„â€˜Ã¡Â»â€¢i response.

KhÃƒÂ´ng lÃƒÂ m frontend, khÃƒÂ´ng render chart, khÃƒÂ´ng export Excel/PDF, khÃƒÂ´ng tÃ¡ÂºÂ¡o data warehouse riÃƒÂªng vÃƒÂ  khÃƒÂ´ng Ã„â€˜Ã¡Â»â€¢i enum business hiÃ¡Â»â€¡n cÃƒÂ³.

### 14.2 File Ã„ÂÃƒÂ£ ThÃƒÂªm

| File | NÃ¡Â»â„¢i dung |
|---|---|
| `src/main/java/com/voyageviet/backend/admin/controller/AdminAnalyticsController.java` | Controller mÃ¡Â»â€ºi base path `/api/admin/analytics`. |
| `src/main/java/com/voyageviet/backend/admin/service/AdminAnalyticsService.java` | Service aggregate analytics theo date range, groupBy/metric/limit. |
| `src/main/java/com/voyageviet/backend/admin/dto/RevenueAnalyticsResponse.java` | Response tÃ¡Â»â€¢ng doanh thu theo khoÃ¡ÂºÂ£ng ngÃƒÂ y. |
| `src/main/java/com/voyageviet/backend/admin/dto/RevenuePointResponse.java` | Response tÃ¡Â»Â«ng point ngÃƒÂ y/thÃƒÂ¡ng cÃ¡Â»Â§a revenue chart. |
| `src/main/java/com/voyageviet/backend/admin/dto/BookingAnalyticsResponse.java` | Response thÃ¡Â»â€˜ng kÃƒÂª booking/status/paymentStatus/conversion. |
| `src/main/java/com/voyageviet/backend/admin/dto/TopTourAnalyticsResponse.java` | Response top tours theo revenue/bookings/rating. |
| `src/main/java/com/voyageviet/backend/admin/dto/PaymentAnalyticsResponse.java` | Response thÃ¡Â»â€˜ng kÃƒÂª payment tÃ¡Â»â€¢ng quan. |
| `src/main/java/com/voyageviet/backend/admin/dto/PaymentMethodStatsResponse.java` | Response group payment theo method. |
| `src/main/java/com/voyageviet/backend/admin/dto/PromotionAnalyticsResponse.java` | Response thÃ¡Â»â€˜ng kÃƒÂª promotion usage tÃ¡Â»â€¢ng quan. |
| `src/main/java/com/voyageviet/backend/admin/dto/PromotionUsageStatsResponse.java` | Response top promotion theo usage/discount. |

KhÃƒÂ´ng xÃƒÂ³a file nÃƒÂ o.

### 14.3 File Ã„ÂÃƒÂ£ SÃ¡Â»Â­a

| File | NÃ¡Â»â„¢i dung sÃ¡Â»Â­a |
|---|---|
| `src/main/java/com/voyageviet/backend/payment/repository/PaymentRepository.java` | ThÃƒÂªm fetch payments theo createdAt vÃƒÂ  revenue payments theo `SUCCESS.paidAt`/`REFUNDED.refundedAt`. |
| `src/main/java/com/voyageviet/backend/booking/repository/BookingRepository.java` | ThÃƒÂªm fetch bookings theo createdAt vÃ¡Â»â€ºi tour/category/destination graph. |
| `src/main/java/com/voyageviet/backend/review/repository/ReviewRepository.java` | ThÃƒÂªm fetch active reviews theo createdAt vÃƒÂ  fetch active reviews cÃƒÂ³ tour graph. |
| `src/main/java/com/voyageviet/backend/promotion/repository/PromotionUsageRepository.java` | ThÃƒÂªm fetch promotion usages theo `usedAt` vÃ¡Â»â€ºi promotion graph. |
| `BACKEND_API_REPORT.md` | CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t Phase 7 Admin Analytics + Dashboard nÃƒÂ¢ng cao. |

KhÃƒÂ´ng chÃ¡Â»â€°nh `DashboardController`/`AdminDashboardService`; API dashboard cÃ…Â© Ã„â€˜Ã†Â°Ã¡Â»Â£c giÃ¡Â»Â¯ nguyÃƒÂªn.

### 14.4 DTO MÃ¡Â»â€ºi

| DTO | MÃ¡Â»Â¥c Ã„â€˜ÃƒÂ­ch |
|---|---|
| `RevenueAnalyticsResponse` | TrÃ¡ÂºÂ£ `dateFrom`, `dateTo`, `groupBy`, tÃ¡Â»â€¢ng revenue/refund/net revenue vÃƒÂ  danh sÃƒÂ¡ch points. |
| `RevenuePointResponse` | TrÃ¡ÂºÂ£ `label`, `revenue`, `paidBookings`, `refundAmount`, `netRevenue`. |
| `BookingAnalyticsResponse` | TrÃ¡ÂºÂ£ tÃ¡Â»â€¢ng booking, count theo `BookingStatus`, count theo `BookingPaymentStatus`, conversion/cancel rate. |
| `TopTourAnalyticsResponse` | TrÃ¡ÂºÂ£ thÃƒÂ´ng tin tour + booking count + paid count + revenue + averageRating + reviewCount. |
| `PaymentAnalyticsResponse` | TrÃ¡ÂºÂ£ count theo payment status, amount success/refund vÃƒÂ  group by method. |
| `PaymentMethodStatsResponse` | TrÃ¡ÂºÂ£ `method`, `attempts`, `successCount`, `successAmount`. |
| `PromotionAnalyticsResponse` | TrÃ¡ÂºÂ£ tÃ¡Â»â€¢ng usage, tÃ¡Â»â€¢ng discount vÃƒÂ  top promotions. |
| `PromotionUsageStatsResponse` | TrÃ¡ÂºÂ£ `promotionId`, `code`, `name`, `usedCount`, `discountAmount`. |

### 14.5 Repository/Service/Controller MÃ¡Â»â€ºi HoÃ¡ÂºÂ·c Ã„ÂÃƒÂ£ SÃ¡Â»Â­a

| LoÃ¡ÂºÂ¡i | TÃƒÂªn | Ghi chÃƒÂº |
|---|---|---|
| Controller | `AdminAnalyticsController` | 5 endpoint analytics mÃ¡Â»â€ºi dÃ†Â°Ã¡Â»â€ºi `/api/admin/analytics`. |
| Service | `AdminAnalyticsService` | Normalize date range, validate `groupBy/metric/limit`, aggregate analytics bÃ¡ÂºÂ±ng Java. |
| Repository | `PaymentRepository` | Fetch payment analytics vÃƒÂ  revenue payments. |
| Repository | `BookingRepository` | Fetch booking analytics theo `createdAt`. |
| Repository | `ReviewRepository` | Fetch ACTIVE review analytics theo `createdAt`. |
| Repository | `PromotionUsageRepository` | Fetch promotion usage analytics theo `usedAt`. |

### 14.6 API MÃ¡Â»â€ºi

| Method | Endpoint | QuyÃ¡Â»Ân | ChÃ¡Â»Â©c nÃ„Æ’ng | Payload/query chÃƒÂ­nh |
|---|---|---|---|---|
| GET | `/api/admin/analytics/revenue` | Admin | ThÃ¡Â»â€˜ng kÃƒÂª gross/refund/net revenue theo ngÃƒÂ y hoÃ¡ÂºÂ·c thÃƒÂ¡ng | `dateFrom`, `dateTo`, `groupBy=DAY/MONTH`; default 30 ngÃƒÂ y, `DAY` |
| GET | `/api/admin/analytics/bookings` | Admin | ThÃ¡Â»â€˜ng kÃƒÂª booking status/paymentStatus vÃƒÂ  conversion/cancel rate | `dateFrom`, `dateTo`; default 30 ngÃƒÂ y |
| GET | `/api/admin/analytics/top-tours` | Admin | Top tours theo `REVENUE`, `BOOKINGS`, hoÃ¡ÂºÂ·c `RATING` | `dateFrom`, `dateTo`, `metric`, `limit`; default `REVENUE`, `10`, max `50` |
| GET | `/api/admin/analytics/payments` | Admin | ThÃ¡Â»â€˜ng kÃƒÂª payment attempts theo status vÃƒÂ  method | `dateFrom`, `dateTo`; default 30 ngÃƒÂ y |
| GET | `/api/admin/analytics/promotions` | Admin | ThÃ¡Â»â€˜ng kÃƒÂª promotion usage vÃƒÂ  top promotion theo discount/usage | `dateFrom`, `dateTo`, `limit`; default `10`, max `50` |

### 14.7 Query Logic ChÃƒÂ­nh

- KhÃƒÂ´ng thÃƒÂªm native query mÃ¡Â»â€ºi trong phase nÃƒÂ y.
- Revenue analytics fetch payment `SUCCESS` theo `paidAt` vÃƒÂ  payment `REFUNDED` theo `refundedAt` hoÃ¡ÂºÂ·c `createdAt` fallback, sau Ã„â€˜ÃƒÂ³ group DAY/MONTH bÃ¡ÂºÂ±ng Java.
- Payment analytics fetch payment theo `createdAt` trong khoÃ¡ÂºÂ£ng ngÃƒÂ y rÃ¡Â»â€œi aggregate count/amount/method bÃ¡ÂºÂ±ng Java.
- Booking analytics fetch booking theo `createdAt` rÃ¡Â»â€œi aggregate status/paymentStatus bÃ¡ÂºÂ±ng Java.
- Top tours `REVENUE` dÃƒÂ¹ng payment success amount theo `payment.paidAt`; `BOOKINGS` dÃƒÂ¹ng booking count theo `booking.createdAt`; `RATING` dÃƒÂ¹ng active review theo `review.createdAt`.
- Promotion analytics fetch `PromotionUsage` theo `usedAt`, aggregate total usage/discount vÃƒÂ  top promotions bÃ¡ÂºÂ±ng Java.

LÃƒÂ½ do khÃƒÂ´ng dÃƒÂ¹ng native Oracle `TRUNC/TO_CHAR`: date range mÃ¡ÂºÂ·c Ã„â€˜Ã¡Â»â€¹nh nhÃ¡Â»Â, dÃ¡Â»Â¯ liÃ¡Â»â€¡u dashboard hiÃ¡Â»â€¡n chÃ†Â°a yÃƒÂªu cÃ¡ÂºÂ§u data warehouse/cache, aggregate bÃ¡ÂºÂ±ng Java giÃ¡Â»Â¯ code dÃ¡Â»â€¦ Ã„â€˜Ã¡Â»Âc vÃƒÂ  trÃƒÂ¡nh SQL native phÃ¡Â»Â©c tÃ¡ÂºÂ¡p. Native query cÃ…Â© cÃ¡Â»Â§a dashboard monthly vÃ¡ÂºÂ«n giÃ¡Â»Â¯ nguyÃƒÂªn, khÃƒÂ´ng thay Ã„â€˜Ã¡Â»â€¢i.

### 14.8 Business Rule Ã„ÂÃƒÂ£ Implement

- Date range mÃ¡ÂºÂ·c Ã„â€˜Ã¡Â»â€¹nh: nÃ¡ÂºÂ¿u thiÃ¡ÂºÂ¿u cÃ¡ÂºÂ£ `dateFrom/dateTo`, dÃƒÂ¹ng hÃƒÂ´m nay vÃƒÂ  29 ngÃƒÂ y trÃ†Â°Ã¡Â»â€ºc Ã„â€˜ÃƒÂ³.
- NÃ¡ÂºÂ¿u thiÃ¡ÂºÂ¿u `dateFrom`, lÃ¡ÂºÂ¥y `dateTo - 29 ngÃƒÂ y`.
- NÃ¡ÂºÂ¿u thiÃ¡ÂºÂ¿u `dateTo`, dÃƒÂ¹ng hÃƒÂ´m nay.
- `dateTo < dateFrom` trÃ¡ÂºÂ£ lÃ¡Â»â€”i `KhoÃ¡ÂºÂ£ng ngÃƒÂ y khÃƒÂ´ng hÃ¡Â»Â£p lÃ¡Â»â€¡.`.
- Revenue gross chÃ¡Â»â€° tÃƒÂ­nh `PaymentStatus.SUCCESS`.
- Refund tÃƒÂ­nh `PaymentStatus.REFUNDED` vÃƒÂ  `refundAmount` nÃ¡ÂºÂ¿u cÃƒÂ³.
- Net revenue = gross revenue - refunded amount.
- KhÃƒÂ´ng tÃƒÂ­nh payment `PENDING/FAILED` vÃƒÂ o revenue.
- Revenue points trÃ¡ÂºÂ£ Ã„â€˜Ã¡Â»Â§ bucket theo ngÃƒÂ y/thÃƒÂ¡ng trong date range, kÃ¡Â»Æ’ cÃ¡ÂºÂ£ bucket 0.
- Booking stats theo `Booking.status` vÃƒÂ  `Booking.paymentStatus` trong khoÃ¡ÂºÂ£ng `booking.createdAt`.
- `conversionRate = paidBookings / totalBookings * 100`, `cancelRate = cancelledBookings / totalBookings * 100`, khÃƒÂ´ng chia lÃ¡Â»â€”i khi total = 0.
- Top tours `REVENUE` sort theo revenue desc; `BOOKINGS` sort theo booking count desc; `RATING` sort theo average rating desc, tie-break review count.
- Review analytics chÃ¡Â»â€° tÃƒÂ­nh `ReviewStatus.ACTIVE`.
- Payment stats `successAmount` chÃ¡Â»â€° tÃƒÂ­nh status `SUCCESS`; `refundedAmount` tÃƒÂ­nh status `REFUNDED` + `refundAmount`.
- Promotion stats dÃ¡Â»Â±a trÃƒÂªn `promotion_usages`, count usage vÃƒÂ  sum `discountAmount`.
- `limit` phÃ¡ÂºÂ£i tÃ¡Â»Â« 1 Ã„â€˜Ã¡ÂºÂ¿n 50.
- CÃƒÂ¡c endpoint mÃ¡Â»â€ºi thuÃ¡Â»â„¢c `/api/admin/**`, nÃƒÂªn vÃ¡ÂºÂ«n yÃƒÂªu cÃ¡ÂºÂ§u role `ADMIN` qua `SecurityConfig` hiÃ¡Â»â€¡n cÃƒÂ³.

### 14.9 Validation/Error Message Quan TrÃ¡Â»Âng

- `KhoÃ¡ÂºÂ£ng ngÃƒÂ y khÃƒÂ´ng hÃ¡Â»Â£p lÃ¡Â»â€¡.`
- `groupBy chÃ¡Â»â€° hÃ¡Â»â€” trÃ¡Â»Â£ DAY hoÃ¡ÂºÂ·c MONTH.`
- `metric chÃ¡Â»â€° hÃ¡Â»â€” trÃ¡Â»Â£ REVENUE, BOOKINGS hoÃ¡ÂºÂ·c RATING.`
- `limit tÃ¡Â»â€˜i Ã„â€˜a lÃƒÂ  50.`
- `limit must be greater than or equal to 1.`

CÃƒÂ¡c message response thÃƒÂ nh cÃƒÂ´ng:

- `Get revenue analytics successfully`
- `Get booking analytics successfully`
- `Get top tour analytics successfully`
- `Get payment analytics successfully`
- `Get promotion analytics successfully`

### 14.10 Checklist Test ThÃ¡Â»Â§ CÃƒÂ´ng

1. CÃƒÂ³ payment `SUCCESS` trong khoÃ¡ÂºÂ£ng -> `totalRevenue` vÃƒÂ  point revenue tÃ„Æ’ng Ã„â€˜ÃƒÂºng.
2. Payment `FAILED/PENDING` khÃƒÂ´ng tÃƒÂ­nh revenue.
3. Payment `REFUNDED` cÃƒÂ³ `refundAmount` -> `totalRefundedAmount` vÃƒÂ  `netRevenue` Ã„â€˜ÃƒÂºng.
4. `groupBy=DAY` trÃ¡ÂºÂ£ points theo ngÃƒÂ y.
5. `groupBy=MONTH` trÃ¡ÂºÂ£ points theo thÃƒÂ¡ng.
6. `dateTo < dateFrom` -> lÃ¡Â»â€”i `KhoÃ¡ÂºÂ£ng ngÃƒÂ y khÃƒÂ´ng hÃ¡Â»Â£p lÃ¡Â»â€¡.`.
7. TÃ¡ÂºÂ¡o booking nhiÃ¡Â»Âu status khÃƒÂ¡c nhau -> booking status count Ã„â€˜ÃƒÂºng.
8. `paid/unpaid/failed/refunded` theo `Booking.paymentStatus` Ã„â€˜ÃƒÂºng.
9. `conversionRate` vÃƒÂ  `cancelRate` Ã„â€˜ÃƒÂºng khi `totalBookings > 0`.
10. `totalBookings = 0` khÃƒÂ´ng chia lÃ¡Â»â€”i, rate = `0.0`.
11. `metric=REVENUE` sort top tours Ã„â€˜ÃƒÂºng theo revenue.
12. `metric=BOOKINGS` sort Ã„â€˜ÃƒÂºng theo booking count.
13. `metric=RATING` sort Ã„â€˜ÃƒÂºng theo average rating vÃƒÂ  review count tie-break.
14. `limit > 50` -> lÃ¡Â»â€”i `limit tÃ¡Â»â€˜i Ã„â€˜a lÃƒÂ  50.`.
15. Payment stats count theo status Ã„â€˜ÃƒÂºng.
16. `byMethod` group `VNPAY/MOCK/BANK_TRANSFER` Ã„â€˜ÃƒÂºng nÃ¡ÂºÂ¿u cÃƒÂ³ dÃ¡Â»Â¯ liÃ¡Â»â€¡u.
17. `successAmount` chÃ¡Â»â€° tÃƒÂ­nh `SUCCESS`.
18. Promotion usage count Ã„â€˜ÃƒÂºng.
19. `totalDiscountAmount` Ã„â€˜ÃƒÂºng.
20. `topPromotions` sort theo discount desc, tie-break used count desc.
21. User thÃ†Â°Ã¡Â»Âng gÃ¡Â»Âi `/api/admin/analytics/revenue` -> 403.
22. Admin gÃ¡Â»Âi cÃƒÂ¡c endpoint analytics -> 200.
23. CÃƒÂ¡c API dashboard cÃ…Â© `/api/admin/dashboard/summary`, `/monthly`, `/reviews` vÃ¡ÂºÂ«n chÃ¡ÂºÂ¡y.
24. Compile/light check pass.

### 14.11 KÃ¡ÂºÂ¿t QuÃ¡ÂºÂ£ Compile/Light Check

Ã„ÂÃƒÂ£ chÃ¡ÂºÂ¡y:

```bash
.\mvnw.cmd -DskipTests compile
```

KÃ¡ÂºÂ¿t quÃ¡ÂºÂ£: `BUILD SUCCESS` lÃƒÂºc `2026-06-04T09:42:12+07:00`.

### 14.12 TODO CÃƒÂ²n LÃ¡ÂºÂ¡i

- Frontend admin dashboard charts.
- Export CSV/Excel/PDF nÃ¡ÂºÂ¿u cÃ¡ÂºÂ§n.
- Cache analytics nÃ¡ÂºÂ¿u dÃ¡Â»Â¯ liÃ¡Â»â€¡u lÃ¡Â»â€ºn.
- Revenue by category/destination nÃ¡ÂºÂ¿u cÃ¡ÂºÂ§n.
- Profit/cost/tax nÃ¡ÂºÂ¿u mÃ¡Â»Å¸ rÃ¡Â»â„¢ng production.
- Unit/integration tests cho analytics date range, sorting, security.
- NÃ¡ÂºÂ¿u dÃ¡Â»Â¯ liÃ¡Â»â€¡u lÃ¡Â»â€ºn, cÃƒÂ¢n nhÃ¡ÂºÂ¯c native query/projection hoÃ¡ÂºÂ·c materialized view cho revenue points thay vÃƒÂ¬ aggregate Java.



### 14.13 Ghi ChÃƒÂº BÃ¡Â»â€¢ Sung Phase 7

- Controller analytics bÃ¡Â»Âc lÃ¡Â»â€”i runtime khÃƒÂ´ng mong muÃ¡Â»â€˜n thÃƒÂ nh `BusinessException(ErrorCode.INTERNAL_ERROR, ...)` Ã„â€˜Ã¡Â»Æ’ giÃ¡Â»Â¯ response format chung.
- Error message nÃ¡Â»â„¢i bÃ¡Â»â„¢ tÃ†Â°Ã†Â¡ng Ã¡Â»Â©ng: `KhÃƒÂ´ng thÃ¡Â»Æ’ lÃ¡ÂºÂ¥y thÃ¡Â»â€˜ng kÃƒÂª doanh thu.`, `KhÃƒÂ´ng thÃ¡Â»Æ’ lÃ¡ÂºÂ¥y thÃ¡Â»â€˜ng kÃƒÂª booking.`, `KhÃƒÂ´ng thÃ¡Â»Æ’ lÃ¡ÂºÂ¥y thÃ¡Â»â€˜ng kÃƒÂª tour.`, `KhÃƒÂ´ng thÃ¡Â»Æ’ lÃ¡ÂºÂ¥y thÃ¡Â»â€˜ng kÃƒÂª payment.`, `KhÃƒÂ´ng thÃ¡Â»Æ’ lÃ¡ÂºÂ¥y thÃ¡Â»â€˜ng kÃƒÂª promotion.`
- LÃ¡ÂºÂ§n compile/light check cuÃ¡Â»â€˜i cÃƒÂ¹ng Ã„â€˜ÃƒÂ£ chÃ¡ÂºÂ¡y `./mvnw.cmd -DskipTests compile` vÃƒÂ  Ã„â€˜Ã¡ÂºÂ¡t `BUILD SUCCESS` lÃƒÂºc `2026-06-04T09:42:12+07:00`.

## 15. CÃ¡ÂºÂ­p NhÃ¡ÂºÂ­t 04/06/2026 Ã¢â‚¬â€ Fix Encoding TiÃ¡ÂºÂ¿ng ViÃ¡Â»â€¡t

### 15.1 MÃ¡Â»Â¥c TiÃƒÂªu

- SÃ¡Â»Â­a lÃ¡Â»â€”i mojibake tiÃ¡ÂºÂ¿ng ViÃ¡Â»â€¡t trong `BACKEND_API_REPORT.md`.
- KiÃ¡Â»Æ’m tra source code Java/properties/yml/yaml/md/xml cÃƒÂ³ khÃ¡ÂºÂ£ nÃ„Æ’ng chÃ¡Â»Â©a message tiÃ¡ÂºÂ¿ng ViÃ¡Â»â€¡t bÃ¡Â»â€¹ lÃ¡Â»â€”i mÃƒÂ£ hÃƒÂ³a.
- ChuÃ¡ÂºÂ©n hÃƒÂ³a file text vÃ¡Â»Â UTF-8 vÃƒÂ  bÃ¡Â»â€¢ sung cÃ¡ÂºÂ¥u hÃƒÂ¬nh Ã„â€˜Ã¡Â»Æ’ hÃ¡ÂºÂ¡n chÃ¡ÂºÂ¿ tÃƒÂ¡i phÃƒÂ¡t.
- KhÃƒÂ´ng sÃ¡Â»Â­a logic backend, khÃƒÂ´ng Ã„â€˜Ã¡Â»â€¢i API, khÃƒÂ´ng Ã„â€˜Ã¡Â»â€¢i business rule.

### 15.2 File Ã„ÂÃƒÂ£ SÃ¡Â»Â­a

| File | NÃ¡Â»â„¢i dung |
|---|---|
| `BACKEND_API_REPORT.md` | SÃ¡Â»Â­a toÃƒÂ n bÃ¡Â»â„¢ Ã„â€˜oÃ¡ÂºÂ¡n mojibake tiÃ¡ÂºÂ¿ng ViÃ¡Â»â€¡t trong report, Ã„â€˜Ã¡ÂºÂ·c biÃ¡Â»â€¡t cÃƒÂ¡c phase gÃ¡ÂºÂ§n cuÃ¡Â»â€˜i; thÃƒÂªm section ghi nhÃ¡ÂºÂ­n task fix encoding. |
| `.editorconfig` | ThÃƒÂªm cÃ¡ÂºÂ¥u hÃƒÂ¬nh charset UTF-8, LF, final newline vÃƒÂ  rule riÃƒÂªng cho Markdown/properties. |
| `pom.xml` | ThÃƒÂªm `project.build.sourceEncoding=UTF-8` vÃƒÂ  `project.reporting.outputEncoding=UTF-8`. |
| `src/main/resources/application.properties` | ThÃƒÂªm cÃ¡ÂºÂ¥u hÃƒÂ¬nh `server.servlet.encoding.*` Ã„â€˜Ã¡Â»Æ’ force UTF-8 cho servlet response/request encoding. |

KhÃƒÂ´ng sÃ¡Â»Â­a logic Java, khÃƒÂ´ng Ã„â€˜Ã¡Â»â€¢i endpoint, DTO, entity, enum hoÃ¡ÂºÂ·c business rule.

### 15.3 CÃ¡ÂºÂ¥u HÃƒÂ¬nh Ã„ÂÃƒÂ£ ThÃƒÂªm/SÃ¡Â»Â­a

- `.editorconfig`: `charset = utf-8` cho toÃƒÂ n repo, `[*.properties] charset = utf-8`.
- `pom.xml`: `project.build.sourceEncoding` vÃƒÂ  `project.reporting.outputEncoding` Ã„â€˜Ã¡Â»Âu lÃƒÂ  `UTF-8`.
- `application.properties`: `server.servlet.encoding.charset=UTF-8`, `server.servlet.encoding.enabled=true`, `server.servlet.encoding.force=true`.

### 15.4 Pattern LÃ¡Â»â€”i Ã„ÂÃƒÂ£ XÃ¡Â»Â­ LÃƒÂ½

- U+00C3 LATIN CAPITAL LETTER A WITH TILDE
- U+00C2 LATIN CAPITAL LETTER A WITH CIRCUMFLEX
- Sequence U+00E1 U+00BA
- Sequence U+00E1 U+00BB
- U+00C4 LATIN CAPITAL LETTER A WITH DIAERESIS
- U+00C6 LATIN CAPITAL LETTER AE
- U+00C5 LATIN CAPITAL LETTER A WITH RING ABOVE
- Sequence U+00E2 U+20AC

### 15.5 KÃ¡ÂºÂ¿t QuÃ¡ÂºÂ£ KiÃ¡Â»Æ’m Tra

- Ã„ÂÃƒÂ£ scan cÃƒÂ¡c file `*.java`, `*.properties`, `*.yml`, `*.yaml`, `*.md`, `*.xml` ngoÃƒÂ i `target/.git`.
- KÃ¡ÂºÂ¿t quÃ¡ÂºÂ£ scan mojibake sau khi sÃ¡Â»Â­a: `hits 0` vÃ¡Â»â€ºi bÃ¡Â»â„¢ pattern mÃ¡Â»Å¸ rÃ¡Â»â„¢ng, khi bÃ¡Â»Â qua riÃƒÂªng mÃ¡Â»Â¥c 15.4 Ã„â€˜ang cÃ¡Â»â€˜ ÃƒÂ½ liÃ¡Â»â€¡t kÃƒÂª pattern lÃ¡Â»â€”i Ã„â€˜ÃƒÂ£ xÃ¡Â»Â­ lÃƒÂ½.
- CÃƒÂ¡c message tiÃ¡ÂºÂ¿ng ViÃ¡Â»â€¡t trong source hiÃ¡Â»â€¡n hiÃ¡Â»Æ’n thÃ¡Â»â€¹ Ã„â€˜ÃƒÂºng; khÃƒÂ´ng phÃƒÂ¡t hiÃ¡Â»â€¡n source Java/properties cÃ¡ÂºÂ§n sÃ¡Â»Â­a nÃ¡Â»â„¢i dung mojibake.
- Compile/light check: `BUILD SUCCESS` lÃƒÂºc `2026-06-04T09:54:59+07:00` vÃ¡Â»â€ºi lÃ¡Â»â€¡nh `.\mvnw.cmd -DskipTests compile`.

### 15.6 TODO CÃƒÂ²n LÃ¡ÂºÂ¡i

- KiÃ¡Â»Æ’m tra IDE luÃƒÂ´n lÃ†Â°u file bÃ¡ÂºÂ±ng UTF-8.
- TrÃƒÂ¡nh copy text tÃ¡Â»Â« terminal/console Ã„â€˜ang sai code page vÃƒÂ o report.
- NÃ¡ÂºÂ¿u terminal PowerShell vÃ¡ÂºÂ«n hiÃ¡Â»Æ’n thÃ¡Â»â€¹ mojibake, kiÃ¡Â»Æ’m tra output encoding/code page trÃ†Â°Ã¡Â»â€ºc khi kÃ¡ÂºÂ¿t luÃ¡ÂºÂ­n file bÃ¡Â»â€¹ lÃ¡Â»â€”i.

## 16. CÃ¡ÂºÂ­p NhÃ¡ÂºÂ­t 04/06/2026 Ã¢â‚¬â€ Phase 8: Ã„ÂÃ¡Â»â€œng BÃ¡Â»â„¢ Enum/Model + Feature Flags MÃ¡Â»Å¸ RÃ¡Â»â„¢ng

### 16.1 MÃ¡Â»Â¥c TiÃƒÂªu Phase

Ã„ÂÃ¡Â»â€œng bÃ¡Â»â„¢ nÃ¡Â»Ân enum/model theo PRD/Admin Supplement theo hÃ†Â°Ã¡Â»â€ºng backward-compatible: bÃ¡Â»â€¢ sung role `STAFF`, mÃ¡Â»Å¸ rÃ¡Â»â„¢ng `FeatureCode`, mÃ¡Â»Å¸ rÃ¡Â»â„¢ng `AuditAction`, thÃƒÂªm cÃƒÂ¡c field tÃ¡Â»â€¢ng hÃ¡Â»Â£p cho `Tour`, trÃ¡ÂºÂ£ field mÃ¡Â»â€ºi trong public/admin tour response, thÃƒÂªm service hook cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t `minPrice`, `avgRating`, `totalReviews`.

KhÃƒÂ´ng Ã„â€˜Ã¡Â»â€¢i breaking `TourStatus`/`BookingStatus`, khÃƒÂ´ng migrate status DB, khÃƒÂ´ng Ã„â€˜Ã¡Â»â€¢i URL API, khÃƒÂ´ng Ã„â€˜Ã¡Â»â€¢i flow Payment/Booking/Promotion/Notification.

### 16.2 File Ã„ÂÃƒÂ£ ThÃƒÂªm

| File | NÃ¡Â»â„¢i dung |
|---|---|
| `src/main/java/com/voyageviet/backend/tour/service/TourStatsService.java` | Service tÃƒÂ­nh lÃ¡ÂºÂ¡i `Tour.minPrice` tÃ¡Â»Â« schedule OPEN future vÃƒÂ  `avgRating/totalReviews` tÃ¡Â»Â« review ACTIVE. |

KhÃƒÂ´ng xÃƒÂ³a file nÃƒÂ o.

### 16.3 File Ã„ÂÃƒÂ£ SÃ¡Â»Â­a

| File | NÃ¡Â»â„¢i dung sÃ¡Â»Â­a |
|---|---|
| `src/main/java/com/voyageviet/backend/role/entity/RoleCode.java` | ThÃƒÂªm `STAFF`. |
| `src/main/java/com/voyageviet/backend/common/config/RoleHierarchyConfig.java` | Ã„ÂÃ¡Â»â€¢i hierarchy thÃƒÂ nh `SUPER_ADMIN > ADMIN > STAFF > USER`. |
| `src/main/java/com/voyageviet/backend/feature/entity/FeatureCode.java` | ThÃƒÂªm cÃƒÂ¡c feature code admin/module mÃ¡Â»â€ºi, giÃ¡Â»Â¯ nguyÃƒÂªn code cÃ…Â©. |
| `src/main/java/com/voyageviet/backend/audit/entity/AuditAction.java` | ThÃƒÂªm cÃƒÂ¡c audit action mÃ¡Â»â€ºi cho tour/booking/payment/promotion/review/media/feature. |
| `src/main/java/com/voyageviet/backend/feature/service/FeatureFlagService.java` | Toggle feature ghi audit bÃ¡ÂºÂ±ng `FEATURE_TOGGLE`; vÃ¡ÂºÂ«n giÃ¡Â»Â¯ enum cÃ…Â© `FEATURE_FLAG_UPDATED`. |
| `src/main/java/com/voyageviet/backend/tour/entity/Tour.java` | ThÃƒÂªm `isDomestic`, `avgRating`, `totalReviews`, `highlightTags`, `minPrice`. |
| `src/main/java/com/voyageviet/backend/tour/dto/TourCardResponse.java` | TrÃ¡ÂºÂ£ thÃƒÂªm cÃƒÂ¡c field summary/model mÃ¡Â»â€ºi. |
| `src/main/java/com/voyageviet/backend/tour/dto/TourDetailResponse.java` | TrÃ¡ÂºÂ£ thÃƒÂªm cÃƒÂ¡c field summary/model mÃ¡Â»â€ºi. |
| `src/main/java/com/voyageviet/backend/tour/dto/TourCreateRequest.java` | NhÃ¡ÂºÂ­n optional `isDomestic`, `highlightTags`; khÃƒÂ´ng nhÃ¡ÂºÂ­n `avgRating/totalReviews/minPrice`. |
| `src/main/java/com/voyageviet/backend/tour/dto/TourUpdateRequest.java` | NhÃ¡ÂºÂ­n optional `isDomestic`, `highlightTags`; khÃƒÂ´ng nhÃ¡ÂºÂ­n `avgRating/totalReviews/minPrice`. |
| `src/main/java/com/voyageviet/backend/tour/repository/TourScheduleRepository.java` | ThÃƒÂªm query lÃ¡ÂºÂ¥y min `priceAdult` theo tour, status `OPEN`, `departureDate >= today`. |
| `src/main/java/com/voyageviet/backend/tour/repository/specification/TourSpecification.java` | Public search/sort `effectivePrice` Ã†Â°u tiÃƒÂªn `minPrice`, fallback `salePrice`, `originalPrice`. |
| `src/main/java/com/voyageviet/backend/tour/service/TourService.java` | Map field mÃ¡Â»â€ºi, serialize/parse `highlightTags`, infer `isDomestic` tÃ¡Â»Â« destination country, giÃ¡Â»Â¯ compatibility `averageRating/reviewCount`. |
| `src/main/java/com/voyageviet/backend/tour/service/TourScheduleService.java` | Hook recompute `minPrice` khi create/update/delete/status/duplicate schedule. |
| `src/main/java/com/voyageviet/backend/review/service/ReviewService.java` | Hook recompute rating summary khi create/update status/delete review. |
| `src/main/java/com/voyageviet/backend/common/config/DataSeeder.java` | Seed role `STAFF`, seed feature code mÃ¡Â»â€ºi, sample tour infer `isDomestic`. |
| `BACKEND_API_REPORT.md` | CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t Phase 8. |

### 16.4 Enum Ã„ÂÃƒÂ£ BÃ¡Â»â€¢ Sung

`RoleCode`:

- GiÃ¡Â»Â¯: `USER`, `ADMIN`, `SUPER_ADMIN`.
- ThÃƒÂªm: `STAFF`.

`FeatureCode`:

- GiÃ¡Â»Â¯ code cÃ…Â©: `PUBLIC_BOOKING`, `PUBLIC_REVIEW`, `PUBLIC_PAYMENT`, `CHAT_SUPPORT`, `GOOGLE_LOGIN`, `TOUR_SEARCH`, `TOUR_FILTER`, `ADMIN_DASHBOARD`.
- ThÃƒÂªm: `TOUR_VIEW`, `TOUR_CREATE`, `TOUR_UPDATE`, `TOUR_DELETE`, `TOUR_PUBLISH`, `BOOKING_VIEW`, `BOOKING_UPDATE`, `BOOKING_CONFIRM`, `BOOKING_CANCEL`, `USER_MANAGE`, `REVIEW_MANAGE`, `CATEGORY_MANAGE`, `DESTINATION_MANAGE`, `MEDIA_MANAGE`, `PROMOTION_MANAGE`, `PAYMENT_VIEW`, `PAYMENT_REFUND`, `REVENUE_VIEW`, `ANALYTICS_VIEW`, `NOTIFICATION_VIEW`, `FEATURE_MANAGE`, `AUDIT_VIEW`, `SUPPORT_CHAT`, `BANNER_MANAGE`, `BLOG_MANAGE`.

`AuditAction`:

- GiÃ¡Â»Â¯ action cÃ…Â©: `USER_STATUS_UPDATED`, `USER_ROLE_UPDATED`, `BOOKING_STATUS_UPDATED`, `FEATURE_FLAG_UPDATED`, `MEDIA_DELETED`.
- ThÃƒÂªm: `FEATURE_TOGGLE`, `TOUR_CREATED`, `TOUR_UPDATED`, `TOUR_PUBLISHED`, `TOUR_ARCHIVED`, `TOUR_DUPLICATED`, `TOUR_DELETED`, `BOOKING_CREATED`, `BOOKING_CONFIRMED`, `BOOKING_CANCELLED`, `BOOKING_COMPLETED`, `PAYMENT_REFUNDED`, `PROMOTION_CREATED`, `PROMOTION_UPDATED`, `PROMOTION_STATUS_UPDATED`, `PROMOTION_DELETED`, `REVIEW_APPROVED`, `REVIEW_REJECTED`, `MEDIA_UPLOADED`.

KhÃƒÂ´ng bÃ¡Â»â€¢ sung hoÃ¡ÂºÂ·c Ã„â€˜Ã¡Â»â€¢i `TourStatus`/`BookingStatus` trong phase nÃƒÂ y.

### 16.5 Entity/Table Field MÃ¡Â»â€ºi

Table `TOURS` qua JPA `ddl-auto=update`:

- `IS_DOMESTIC`: Boolean, `true` tour trong nÃ†Â°Ã¡Â»â€ºc, `false` tour quÃ¡Â»â€˜c tÃ¡ÂºÂ¿, nullable Ã„â€˜Ã¡Â»Æ’ tÃ†Â°Ã†Â¡ng thÃƒÂ­ch dÃ¡Â»Â¯ liÃ¡Â»â€¡u cÃ…Â©.
- `AVG_RATING`: `BigDecimal(3,1)`, default entity `0`.
- `TOTAL_REVIEWS`: Integer, default entity `0`.
- `HIGHLIGHT_TAGS`: CLOB/string JSON array, vÃƒÂ­ dÃ¡Â»Â¥ `["HOT","SALE","FAMILY"]`.
- `MIN_PRICE`: `BigDecimal(15,2)`, nullable; lÃ¡ÂºÂ¥y tÃ¡Â»Â« schedule OPEN future.

### 16.6 DTO/Request/Response Ã„ÂÃƒÂ£ SÃ¡Â»Â­a

- `TourCardResponse`: thÃƒÂªm `minPrice`, `isDomestic`, `avgRating`, `totalReviews`, `highlightTags`; giÃ¡Â»Â¯ `averageRating/reviewCount` Ã„â€˜Ã¡Â»Æ’ frontend cÃ…Â© khÃƒÂ´ng vÃ¡Â»Â¡.
- `TourDetailResponse`: thÃƒÂªm `minPrice`, `isDomestic`, `avgRating`, `totalReviews`, `highlightTags`; giÃ¡Â»Â¯ `averageRating/reviewCount`.
- `TourCreateRequest`: thÃƒÂªm optional `isDomestic`, `highlightTags`; khÃƒÂ´ng cho client set `avgRating/totalReviews/minPrice`.
- `TourUpdateRequest`: thÃƒÂªm optional `isDomestic`, `highlightTags`; nÃ¡ÂºÂ¿u khÃƒÂ´ng gÃ¡Â»Â­i `isDomestic` thÃƒÂ¬ giÃ¡Â»Â¯ giÃƒÂ¡ trÃ¡Â»â€¹ admin Ã„â€˜ÃƒÂ£ set trÃ†Â°Ã¡Â»â€ºc Ã„â€˜ÃƒÂ³, chÃ¡Â»â€° infer khi Ã„â€˜ang null.

### 16.7 Seeder Ã„ÂÃƒÂ£ SÃ¡Â»Â­a

- `DataSeeder.seedRoles()` seed thÃƒÂªm role `STAFF` idempotent.
- `DataSeeder.seedFeatureFlags()` seed tÃ¡ÂºÂ¥t cÃ¡ÂºÂ£ feature code mÃ¡Â»â€ºi idempotent, khÃƒÂ´ng duplicate feature cÃ…Â©.
- Sample tour set `isDomestic` theo `destination.country`.
- KhÃƒÂ´ng xÃƒÂ³a role/feature cÃ…Â© vÃƒÂ  khÃƒÂ´ng tÃ¡Â»Â± Ã„â€˜Ã¡Â»â€¢i role user hiÃ¡Â»â€¡n cÃƒÂ³.

### 16.8 Service/Repository Ã„ÂÃƒÂ£ SÃ¡Â»Â­a

- `TourStatsService.recomputeMinPrice(tourId)`: tÃƒÂ­nh min `priceAdult` tÃ¡Â»Â« `TourSchedule` cÃƒÂ³ `status=OPEN` vÃƒÂ  `departureDate >= today`; nÃ¡ÂºÂ¿u khÃƒÂ´ng cÃƒÂ³ schedule phÃƒÂ¹ hÃ¡Â»Â£p thÃƒÂ¬ `minPrice=null`.
- `TourStatsService.recomputeRatingSummary(tourId)`: tÃƒÂ­nh `avgRating/totalReviews` tÃ¡Â»Â« `ReviewStatus.ACTIVE`, khÃƒÂ´ng tÃƒÂ­nh `HIDDEN`.
- `TourScheduleService`: gÃ¡Â»Âi recompute min price sau create/update/delete/status/duplicate schedule.
- `ReviewService`: gÃ¡Â»Âi recompute rating summary sau create review, Ã„â€˜Ã¡Â»â€¢i status review, delete review.
- `TourService`: map field mÃ¡Â»â€ºi, parse JSON `highlightTags` vÃ¡Â»Â `List<String>`, serialize request list thÃƒÂ nh JSON string, infer `isDomestic` tÃ¡Â»Â« country `Vietnam`, `Viet Nam`, `ViÃ¡Â»â€¡t Nam`.
- `TourSpecification`: `effectivePrice` public search/sort dÃƒÂ¹ng `COALESCE(minPrice, salePrice, originalPrice)`.

### 16.9 API CÃ…Â© BÃ¡Â»â€¹ Ã¡ÂºÂ¢nh HÃ†Â°Ã¡Â»Å¸ng

KhÃƒÂ´ng Ã„â€˜Ã¡Â»â€¢i endpoint hoÃ¡ÂºÂ·c HTTP method. Response cÃƒÂ³ thÃƒÂªm field mÃ¡Â»â€ºi:

- Public tour list/detail.
- Admin tour list/detail/create/update/duplicate response.
- Admin features list/update vÃ¡ÂºÂ«n dÃƒÂ¹ng endpoint cÃ…Â©; cÃƒÂ³ thÃƒÂªm feature code mÃ¡Â»â€ºi trong dÃ¡Â»Â¯ liÃ¡Â»â€¡u seed.

### 16.10 Business Rule Ã„ÂÃƒÂ£ Implement

- `STAFF` lÃƒÂ  role nÃ¡Â»Ân, chÃ†Â°a Ã„â€˜Ã†Â°Ã¡Â»Â£c cÃ¡ÂºÂ¥p quyÃ¡Â»Ân `/api/admin/**` mÃ¡ÂºÂ·c Ã„â€˜Ã¡Â»â€¹nh.
- Role hierarchy mÃ¡Â»â€ºi: `SUPER_ADMIN > ADMIN > STAFF > USER`.
- Feature code cÃ…Â© Ã„â€˜Ã†Â°Ã¡Â»Â£c giÃ¡Â»Â¯ nguyÃƒÂªn Ã„â€˜Ã¡Â»Æ’ trÃƒÂ¡nh vÃ¡Â»Â¡ frontend.
- Audit action cÃ…Â© Ã„â€˜Ã†Â°Ã¡Â»Â£c giÃ¡Â»Â¯ nguyÃƒÂªn; feature toggle mÃ¡Â»â€ºi ghi `FEATURE_TOGGLE`.
- `minPrice` chÃ¡Â»â€° tÃƒÂ­nh tÃ¡Â»Â« schedule `OPEN`, future/today, lÃ¡ÂºÂ¥y min `priceAdult`.
- NÃ¡ÂºÂ¿u khÃƒÂ´ng cÃƒÂ³ schedule OPEN future thÃƒÂ¬ `minPrice=null`, khÃƒÂ´ng fallback DB field sang `salePrice` Ã„â€˜Ã¡Â»Æ’ phÃƒÂ¢n biÃ¡Â»â€¡t chÃ†Â°a cÃƒÂ³ lÃ¡Â»â€¹ch bÃƒÂ¡n; response vÃ¡ÂºÂ«n cÃƒÂ²n `salePrice/originalPrice`.
- Public search effective price fallback `minPrice -> salePrice -> originalPrice`.
- `avgRating/totalReviews` chÃ¡Â»â€° tÃƒÂ­nh review `ACTIVE`.
- Review `HIDDEN` khÃƒÂ´ng tÃƒÂ­nh vÃƒÂ o summary.
- `highlightTags` lÃ†Â°u JSON string, response trÃ¡ÂºÂ£ `List<String>`.
- `isDomestic` dÃƒÂ¹ng giÃƒÂ¡ trÃ¡Â»â€¹ request nÃ¡ÂºÂ¿u cÃƒÂ³; nÃ¡ÂºÂ¿u khÃƒÂ´ng cÃƒÂ³ thÃƒÂ¬ infer tÃ¡Â»Â« `destination.country`; update khÃƒÂ´ng override giÃƒÂ¡ trÃ¡Â»â€¹ admin Ã„â€˜ÃƒÂ£ set thÃ¡Â»Â§ cÃƒÂ´ng nÃ¡ÂºÂ¿u request khÃƒÂ´ng gÃ¡Â»Â­i.
- GiÃ¡Â»Â¯ backward compatibility `TourStatus.PUBLISHED/INACTIVE/SOLD_OUT/DRAFT` vÃƒÂ  `BookingStatus` hiÃ¡Â»â€¡n tÃ¡ÂºÂ¡i.

### 16.11 Validation/Error Message Quan TrÃ¡Â»Âng

- `Tour khÃƒÂ´ng tÃ¡Â»â€œn tÃ¡ÂºÂ¡i.`
- `Highlight tags khÃƒÂ´ng hÃ¡Â»Â£p lÃ¡Â»â€¡.`
- `KhÃƒÂ´ng thÃ¡Â»Æ’ tÃƒÂ­nh giÃƒÂ¡ thÃ¡ÂºÂ¥p nhÃ¡ÂºÂ¥t cÃ¡Â»Â§a tour.`
- `KhÃƒÂ´ng thÃ¡Â»Æ’ tÃƒÂ­nh Ã„â€˜iÃ¡Â»Æ’m Ã„â€˜ÃƒÂ¡nh giÃƒÂ¡ cÃ¡Â»Â§a tour.`
- `Role not found` vÃ¡ÂºÂ«n dÃƒÂ¹ng cho role khÃƒÂ´ng tÃ¡Â»â€œn tÃ¡ÂºÂ¡i trong API user role hiÃ¡Â»â€¡n tÃ¡ÂºÂ¡i.
- `Feature flag not found` vÃ¡ÂºÂ«n dÃƒÂ¹ng cho feature code khÃƒÂ´ng tÃ¡Â»â€œn tÃ¡ÂºÂ¡i trong API feature hiÃ¡Â»â€¡n tÃ¡ÂºÂ¡i.

### 16.12 Checklist Test ThÃ¡Â»Â§ CÃƒÂ´ng

1. Seeder chÃ¡ÂºÂ¡y khÃƒÂ´ng duplicate role/feature.
2. Role `STAFF` Ã„â€˜Ã†Â°Ã¡Â»Â£c tÃ¡ÂºÂ¡o nÃ¡ÂºÂ¿u chÃ†Â°a cÃƒÂ³.
3. Feature codes mÃ¡Â»â€ºi Ã„â€˜Ã†Â°Ã¡Â»Â£c tÃ¡ÂºÂ¡o nÃ¡ÂºÂ¿u chÃ†Â°a cÃƒÂ³.
4. KhÃƒÂ´ng cÃƒÂ²n mojibake trong description seed mÃ¡Â»â€ºi.
5. `SUPER_ADMIN` vÃ¡ÂºÂ«n cÃƒÂ³ quyÃ¡Â»Ân `ADMIN`.
6. `ADMIN` kÃ¡ÂºÂ¿ thÃ¡Â»Â«a `STAFF` vÃƒÂ  `USER`.
7. `STAFF` tÃ¡Â»â€œn tÃ¡ÂºÂ¡i nhÃ†Â°ng chÃ†Â°a vÃƒÂ o Ã„â€˜Ã†Â°Ã¡Â»Â£c full `/api/admin/**`.
8. `GET /api/admin/features` thÃ¡ÂºÂ¥y feature code mÃ¡Â»â€ºi.
9. `PATCH /api/admin/features/{code}` vÃ¡ÂºÂ«n bÃ¡ÂºÂ­t/tÃ¡ÂºÂ¯t Ã„â€˜Ã†Â°Ã¡Â»Â£c.
10. Public feature cÃ…Â© vÃ¡ÂºÂ«n hoÃ¡ÂºÂ¡t Ã„â€˜Ã¡Â»â„¢ng.
11. TÃ¡ÂºÂ¡o/cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t tour cÃƒÂ³ `isDomestic/highlightTags` -> response trÃ¡ÂºÂ£ Ã„â€˜ÃƒÂºng.
12. Tour response public/admin cÃƒÂ³ `avgRating/totalReviews/minPrice`.
13. TÃ¡ÂºÂ¡o schedule OPEN future -> `tour.minPrice` cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t Ã„â€˜ÃƒÂºng.
14. Ã„ÂÃ¡Â»â€¢i schedule CLOSED hoÃ¡ÂºÂ·c xÃƒÂ³a schedule min price -> `tour.minPrice` recompute Ã„â€˜ÃƒÂºng.
15. Review ACTIVE -> `avgRating/totalReviews` tÃ„Æ’ng Ã„â€˜ÃƒÂºng.
16. Review HIDDEN -> `avgRating/totalReviews` khÃƒÂ´ng tÃƒÂ­nh review Ã„â€˜ÃƒÂ³.
17. Delete review -> `avgRating/totalReviews` recompute Ã„â€˜ÃƒÂºng.
18. `originalPrice/salePrice` vÃ¡ÂºÂ«n cÃƒÂ²n trong response.
19. Public tour list/detail cÃ…Â© vÃ¡ÂºÂ«n chÃ¡ÂºÂ¡y.
20. Admin tour CRUD cÃ…Â© vÃ¡ÂºÂ«n chÃ¡ÂºÂ¡y.
21. Payment/Booking/Promotion/Notification khÃƒÂ´ng bÃ¡Â»â€¹ Ã¡ÂºÂ£nh hÃ†Â°Ã¡Â»Å¸ng.
22. Compile/light check pass.

### 16.13 KÃ¡ÂºÂ¿t QuÃ¡ÂºÂ£ Compile/Light Check

Ã„ÂÃƒÂ£ chÃ¡ÂºÂ¡y:

```bash
.\mvnw.cmd -DskipTests compile
```

KÃ¡ÂºÂ¿t quÃ¡ÂºÂ£: `BUILD SUCCESS` lÃƒÂºc `2026-06-04T10:05:46+07:00`.

Scan mojibake sau khi sÃ¡Â»Â­a source/report: `hits 0` vÃ¡Â»â€ºi bÃ¡Â»â„¢ pattern mÃ¡Â»Å¸ rÃ¡Â»â„¢ng, bÃ¡Â»Â qua riÃƒÂªng mÃ¡Â»Â¥c 15.4 Ã„â€˜ang cÃ¡Â»â€˜ ÃƒÂ½ liÃ¡Â»â€¡t kÃƒÂª pattern lÃ¡Â»â€”i.

### 16.14 TODO CÃƒÂ²n LÃ¡ÂºÂ¡i

- ThiÃ¡ÂºÂ¿t kÃ¡ÂºÂ¿ bÃ¡ÂºÂ£ng `role_feature_permissions`.
- PhÃƒÂ¢n quyÃ¡Â»Ân chi tiÃ¡ÂºÂ¿t cho `STAFF`.
- Migration `TourStatus ACTIVE/ARCHIVED` nÃ¡ÂºÂ¿u frontend/PRD thÃ¡ÂºÂ­t sÃ¡Â»Â± cÃ¡ÂºÂ§n, kÃƒÂ¨m backward compatibility.
- `BookingStatus IN_PROGRESS` nÃ¡ÂºÂ¿u admin flow cÃ¡ÂºÂ§n.
- Feature flags v2 fields: `disabledReason`, `visibleInAdmin`, `visibleInPublic`, `sortOrder`, `parentKey`.
- Audit logging chi tiÃ¡ÂºÂ¿t cho tÃ¡ÂºÂ¥t cÃ¡ÂºÂ£ action mÃ¡Â»â€ºi.
- Cache tour stats nÃ¡ÂºÂ¿u dÃ¡Â»Â¯ liÃ¡Â»â€¡u lÃ¡Â»â€ºn.
- Job/backfill recompute `minPrice`, `avgRating`, `totalReviews`, `isDomestic` cho dÃ¡Â»Â¯ liÃ¡Â»â€¡u tour cÃ…Â© trong production.

### 16.15 Hotfix Sau Startup Test

Sau khi chÃ¡ÂºÂ¡y app vÃ¡Â»â€ºi Oracle DB hiÃ¡Â»â€¡n cÃƒÂ³, insert role `STAFF` bÃ¡Â»â€¹ lÃ¡Â»â€”i:

- `ORA-02290: check constraint (...) violated`
- NguyÃƒÂªn nhÃƒÂ¢n: Oracle check constraint cÃ…Â© trÃƒÂªn cÃ¡Â»â„¢t enum `ROLES.CODE` vÃ¡ÂºÂ«n chÃ¡Â»â€° cho phÃƒÂ©p cÃƒÂ¡c role cÃ…Â©, trong khi `ddl-auto=update` khÃƒÂ´ng tÃ¡Â»Â± nÃ¡Â»â€ºi enum check constraint.

Ã„ÂiÃ¡Â»Âu chÃ¡Â»â€°nh Ã„â€˜ÃƒÂ£ lÃƒÂ m:

- `DataSeeder.createRoleIfNotExists(...)` catch `DataIntegrityViolationException`, log warning vÃƒÂ  skip role mÃ¡Â»â€ºi nÃ¡ÂºÂ¿u DB constraint chÃ†Â°a cho phÃƒÂ©p.
- `DataSeeder.createFeatureIfNotExists(...)` cÃ…Â©ng catch `DataIntegrityViolationException` Ã„â€˜Ã¡Â»Æ’ trÃƒÂ¡nh lÃ¡Â»â€”i tÃ†Â°Ã†Â¡ng tÃ¡Â»Â± vÃ¡Â»â€ºi cÃƒÂ¡c `FeatureCode` mÃ¡Â»â€ºi.
- App khÃƒÂ´ng fail startup chÃ¡Â»â€° vÃƒÂ¬ schema enum check constraint chÃ†Â°a migrate.
- Sau khi migrate DB constraint cho `ROLES.CODE` vÃƒÂ  `FEATURE_FLAGS.FEATURE_CODE`, seeder vÃ¡ÂºÂ«n idempotent vÃƒÂ  sÃ¡ÂºÂ½ tÃ¡Â»Â± thÃƒÂªm cÃƒÂ¡c role/feature cÃƒÂ²n thiÃ¡ÂºÂ¿u Ã¡Â»Å¸ lÃ¡ÂºÂ§n chÃ¡ÂºÂ¡y sau.

Compile sau hotfix:

```bash
.\mvnw.cmd -DskipTests compile
```

KÃ¡ÂºÂ¿t quÃ¡ÂºÂ£: `BUILD SUCCESS` lÃƒÂºc `2026-06-04T10:14:11+07:00`.

TODO migration Oracle:

- NÃ¡Â»â€ºi check constraint `ROLES.CODE` Ã„â€˜Ã¡Â»Æ’ cho phÃƒÂ©p `STAFF`.
- NÃ¡Â»â€ºi check constraint `FEATURE_FLAGS.FEATURE_CODE` Ã„â€˜Ã¡Â»Æ’ cho phÃƒÂ©p cÃƒÂ¡c feature code Phase 8.
- NÃƒÂªn Ã„â€˜Ã¡ÂºÂ·t tÃƒÂªn constraint rÃƒÂµ rÃƒÂ ng thay vÃƒÂ¬ Ã„â€˜Ã¡Â»Æ’ Oracle tÃ¡ÂºÂ¡o `SYS_C...` Ã„â€˜Ã¡Â»Æ’ dÃ¡Â»â€¦ maintain.

### 16.16 Hotfix Schema TOURS Phase 8

Sau khi app chÃ¡ÂºÂ¡y vÃƒÂ  gÃ¡Â»Âi admin tour list, Oracle bÃƒÂ¡o lÃ¡Â»â€”i:

- `ORA-00904: "T1_0"."TOTAL_REVIEWS": invalid identifier`
- NguyÃƒÂªn nhÃƒÂ¢n: entity `Tour` Ã„â€˜ÃƒÂ£ thÃƒÂªm cÃƒÂ¡c field Phase 8 nhÃ†Â°ng bÃ¡ÂºÂ£ng `TOURS` hiÃ¡Â»â€¡n cÃƒÂ³ trong Oracle chÃ†Â°a Ã„â€˜Ã†Â°Ã¡Â»Â£c bÃ¡Â»â€¢ sung Ã„â€˜Ã¡Â»Â§ cÃ¡Â»â„¢t; `ddl-auto=update` khÃƒÂ´ng Ã„â€˜Ã¡ÂºÂ£m bÃ¡ÂºÂ£o tÃ¡Â»Â± migrate schema hiÃ¡Â»â€¡n hÃ¡Â»Â¯u.

Ã„ÂiÃ¡Â»Âu chÃ¡Â»â€°nh Ã„â€˜ÃƒÂ£ lÃƒÂ m:

- ThÃƒÂªm `Phase8SchemaMigration` chÃ¡ÂºÂ¡y bÃ¡ÂºÂ±ng `CommandLineRunner` vÃ¡Â»â€ºi `@Order(Ordered.HIGHEST_PRECEDENCE)`.
- Runner kiÃ¡Â»Æ’m tra `USER_TAB_COLUMNS` vÃƒÂ  chÃ¡Â»â€° `ALTER TABLE TOURS ADD ...` khi cÃ¡Â»â„¢t cÃƒÂ²n thiÃ¡ÂºÂ¿u.
- CÃƒÂ¡c cÃ¡Â»â„¢t Ã„â€˜Ã†Â°Ã¡Â»Â£c Ã„â€˜Ã¡ÂºÂ£m bÃ¡ÂºÂ£o tÃ¡Â»â€œn tÃ¡ÂºÂ¡i:
  - `IS_DOMESTIC NUMBER(1)`
  - `AVG_RATING NUMBER(3,1) DEFAULT 0`
  - `TOTAL_REVIEWS NUMBER(10) DEFAULT 0 NOT NULL`
  - `HIGHLIGHT_TAGS CLOB`
  - `MIN_PRICE NUMBER(15,2)`
- Runner idempotent, restart nhiÃ¡Â»Âu lÃ¡ÂºÂ§n khÃƒÂ´ng add trÃƒÂ¹ng cÃ¡Â»â„¢t.

Compile sau hotfix:

```bash
.\mvnw.cmd -DskipTests compile
```

KÃ¡ÂºÂ¿t quÃ¡ÂºÂ£: `BUILD SUCCESS` lÃƒÂºc `2026-06-04T10:22:44+07:00`.

TODO production:

- Thay runner tÃ¡ÂºÂ¡m bÃ¡ÂºÂ±ng migration tool chÃƒÂ­nh thÃ¡Â»Â©c nÃ¡ÂºÂ¿u dÃ¡Â»Â± ÃƒÂ¡n Ã„â€˜Ã†Â°a Flyway/Liquibase vÃƒÂ o production.
- Backfill `MIN_PRICE`, `AVG_RATING`, `TOTAL_REVIEWS`, `IS_DOMESTIC` cho dÃ¡Â»Â¯ liÃ¡Â»â€¡u tour cÃ…Â© sau khi cÃ¡Â»â„¢t Ã„â€˜ÃƒÂ£ tÃ¡Â»â€œn tÃ¡ÂºÂ¡i.

## CÃ¡ÂºÂ­p NhÃ¡ÂºÂ­t 04/06/2026 Ã¢â‚¬â€ Phase 9A: Oracle Schema Hardening vÃƒÂ  Admin Tour Contract

### MÃ¡Â»Â¥c tiÃƒÂªu phase

- LÃƒÂ m cÃ¡Â»Â©ng schema Oracle cho enum/check constraint Phase 8/9 Ã„â€˜Ã¡Â»Æ’ backend khÃƒÂ´ng phÃ¡Â»Â¥ thuÃ¡Â»â„¢c mÃƒÂ¹ quÃƒÂ¡ng vÃƒÂ o `ddl-auto=update`.
- Ã„ÂÃ¡ÂºÂ£m bÃ¡ÂºÂ£o role `STAFF`, `FeatureCode` mÃ¡Â»â€ºi, `AuditAction` mÃ¡Â»â€ºi vÃƒÂ  cÃƒÂ¡c field thÃ¡Â»â€˜ng kÃƒÂª tour khÃƒÂ´ng lÃƒÂ m lÃ¡Â»â€”i startup hoÃ¡ÂºÂ·c lÃ¡Â»â€”i runtime vÃ¡Â»â€ºi Oracle DB thÃ¡ÂºÂ­t.
- ChuÃ¡ÂºÂ©n hÃƒÂ³a contract Admin Tour Gallery Ã„â€˜Ã¡Â»Æ’ attach Ã¡ÂºÂ£nh tÃ¡Â»Â« Admin Media bÃ¡ÂºÂ±ng `mediaId`, khÃƒÂ´ng upload lÃ¡ÂºÂ¡i Cloudinary vÃƒÂ  khÃƒÂ´ng xÃƒÂ³a asset gÃ¡Â»â€˜c khi xÃƒÂ³a Ã¡ÂºÂ£nh gallery attach tÃ¡Â»Â« Media.

### File backend Ã„â€˜ÃƒÂ£ thÃƒÂªm/sÃ¡Â»Â­a

- `src/main/resources/db/manual/oracle/V20260604_01_schema_hardening.sql`: migration SQL manual Oracle idempotent cho enum/check constraint, cÃ¡Â»â„¢t tour stats, cÃ¡Â»â„¢t nguÃ¡Â»â€œn Ã¡ÂºÂ£nh gallery vÃƒÂ  backfill stats.
- `src/main/java/com/voyageviet/backend/tour/entity/TourImageSourceType.java`: enum `DIRECT_UPLOAD`, `MEDIA`.
- `src/main/java/com/voyageviet/backend/tour/entity/TourImage.java`: thÃƒÂªm `SOURCE_TYPE`, `MEDIA_ID`.
- `src/main/java/com/voyageviet/backend/tour/dto/TourImageFromMediaRequest.java`: hÃ¡Â»â€” trÃ¡Â»Â£ cÃ¡ÂºÂ£ `thumbnail` vÃƒÂ  `isThumbnail` Ã„â€˜Ã¡Â»Æ’ backward-compatible.
- `src/main/java/com/voyageviet/backend/tour/dto/TourImageResponse.java`: trÃ¡ÂºÂ£ thÃƒÂªm `sourceType`, `mediaId`.
- `src/main/java/com/voyageviet/backend/tour/service/TourImageService.java`: attach tÃ¡Â»Â« Media set `sourceType=MEDIA`, `mediaId`; delete Ã¡ÂºÂ£nh Media chÃ¡Â»â€° xÃƒÂ³a record `TOUR_IMAGES`, khÃƒÂ´ng gÃ¡Â»Âi xÃƒÂ³a Cloudinary.
- `src/main/java/com/voyageviet/backend/tour/service/TourService.java`: duplicate tour copy thÃƒÂªm `sourceType/mediaId`.
- `src/main/java/com/voyageviet/backend/tour/service/TourStatsService.java`: thÃƒÂªm `recomputeAllTourStats()` Ã„â€˜Ã¡Â»Æ’ backfill `minPrice`, `avgRating`, `totalReviews`, `isDomestic` khi cÃ¡ÂºÂ§n chÃ¡ÂºÂ¡y thÃ¡Â»Â§ cÃƒÂ´ng/service job.
- `src/main/java/com/voyageviet/backend/common/config/Phase8SchemaMigration.java`: runner tÃ¡ÂºÂ¡m cÃ…Â©ng Ã„â€˜Ã¡ÂºÂ£m bÃ¡ÂºÂ£o thÃƒÂªm `TOUR_IMAGES.SOURCE_TYPE` vÃƒÂ  `TOUR_IMAGES.MEDIA_ID` khi app chÃ¡ÂºÂ¡y local chÃ†Â°a apply SQL manual.

### Migration SQL Ã„â€˜ÃƒÂ£ tÃ¡ÂºÂ¡o

- File: `src/main/resources/db/manual/oracle/V20260604_01_schema_hardening.sql`.
- Add cÃ¡Â»â„¢t `TOURS.IS_DOMESTIC`, `AVG_RATING`, `TOTAL_REVIEWS`, `HIGHLIGHT_TAGS`, `MIN_PRICE` nÃ¡ÂºÂ¿u thiÃ¡ÂºÂ¿u.
- Add cÃ¡Â»â„¢t `TOUR_IMAGES.SOURCE_TYPE`, `MEDIA_ID` nÃ¡ÂºÂ¿u thiÃ¡ÂºÂ¿u.
- Drop/recreate check constraint Ã¡Â»â€¢n Ã„â€˜Ã¡Â»â€¹nh:
  - `CK_ROLES_CODE` cho `USER`, `STAFF`, `ADMIN`, `SUPER_ADMIN`.
  - `CK_FEATURE_FLAGS_CODE` cho toÃƒÂ n bÃ¡Â»â„¢ `FeatureCode` hiÃ¡Â»â€¡n tÃ¡ÂºÂ¡i.
  - `CK_AUDIT_LOGS_ACTION` cho toÃƒÂ n bÃ¡Â»â„¢ `AuditAction` hiÃ¡Â»â€¡n tÃ¡ÂºÂ¡i.
  - `CK_TOUR_IMAGES_SOURCE_TYPE` cho `DIRECT_UPLOAD`, `MEDIA`.
- Backfill:
  - `TOUR_IMAGES.SOURCE_TYPE/MEDIA_ID` dÃ¡Â»Â±a theo `MEDIA.PUBLIC_ID`.
  - `TOURS.MIN_PRICE` tÃ¡Â»Â« schedule `OPEN` vÃƒÂ  `DEPARTURE_DATE >= TRUNC(SYSDATE)`.
  - `TOURS.AVG_RATING/TOTAL_REVIEWS` tÃ¡Â»Â« review `ACTIVE`.
  - `TOURS.IS_DOMESTIC` tÃ¡Â»Â« `DESTINATIONS.COUNTRY` (`Vietnam`, `Viet Nam`, `ViÃ¡Â»â€¡t Nam`).

### Constraint/enum/schema Ã„â€˜ÃƒÂ£ xÃ¡Â»Â­ lÃƒÂ½

- `RoleCode.STAFF`: cÃƒÂ³ trong Java enum, seeder idempotent, migration mÃ¡Â»Å¸ check constraint `ROLES.CODE`.
- `FeatureCode` mÃ¡Â»â€ºi: migration mÃ¡Â»Å¸ check constraint `FEATURE_FLAGS.FEATURE_CODE` theo toÃƒÂ n bÃ¡Â»â„¢ enum hiÃ¡Â»â€¡n tÃ¡ÂºÂ¡i.
- `AuditAction` mÃ¡Â»â€ºi: migration mÃ¡Â»Å¸ check constraint `AUDIT_LOGS.ACTION` theo toÃƒÂ n bÃ¡Â»â„¢ enum hiÃ¡Â»â€¡n tÃ¡ÂºÂ¡i.
- Tour stats fields: migration Ã„â€˜Ã¡ÂºÂ£m bÃ¡ÂºÂ£o `IS_DOMESTIC`, `AVG_RATING`, `TOTAL_REVIEWS`, `HIGHLIGHT_TAGS`, `MIN_PRICE` cÃƒÂ³ type Oracle Ã„â€˜Ã¡Â»Â xuÃ¡ÂºÂ¥t.
- Gallery source fields: thÃƒÂªm `TOUR_IMAGES.SOURCE_TYPE`, `TOUR_IMAGES.MEDIA_ID` Ã„â€˜Ã¡Â»Æ’ phÃƒÂ¢n biÃ¡Â»â€¡t Ã¡ÂºÂ£nh upload riÃƒÂªng vÃƒÂ  Ã¡ÂºÂ£nh dÃƒÂ¹ng lÃ¡ÂºÂ¡i tÃ¡Â»Â« Media library.

### Seeder/backfill

- `DataSeeder` hiÃ¡Â»â€¡n vÃ¡ÂºÂ«n seed role `STAFF` vÃƒÂ  feature code mÃ¡Â»â€ºi idempotent; nÃ¡ÂºÂ¿u DB chÃ†Â°a migrate constraint thÃƒÂ¬ catch `DataIntegrityViolationException` Ã„â€˜Ã¡Â»Æ’ khÃƒÂ´ng lÃƒÂ m app fail startup.
- Backfill SQL Ã„â€˜ÃƒÂ£ cÃƒÂ³ trong migration manual.
- `TourStatsService.recomputeAllTourStats()` cÃƒÂ³ thÃ¡Â»Æ’ dÃƒÂ¹ng cho job/manual service backfill trong mÃƒÂ´i trÃ†Â°Ã¡Â»Âng local/production nhÃ¡Â»Â.

### API mÃ¡Â»â€ºi/sÃ¡Â»Â­a

- GiÃ¡Â»Â¯ endpoint hiÃ¡Â»â€¡n cÃƒÂ³: `POST /api/admin/tours/{id}/images/from-media`.
- Request khuyÃ¡ÂºÂ¿n nghÃ¡Â»â€¹:

```json
{
  "mediaId": 1,
  "altText": "Anh tour",
  "sortOrder": 0,
  "thumbnail": false
}
```

- Backend vÃ¡ÂºÂ«n nhÃ¡ÂºÂ­n alias cÃ…Â© `isThumbnail` Ã„â€˜Ã¡Â»Æ’ khÃƒÂ´ng lÃƒÂ m vÃ¡Â»Â¡ frontend/build cÃ…Â©.
- Response `TourImageResponse` trÃ¡ÂºÂ£ thÃƒÂªm `sourceType`, `mediaId`; khÃƒÂ´ng Ã„â€˜Ã¡Â»â€¢i response wrapper `ApiResponse`.
- KhÃƒÂ´ng thÃƒÂªm endpoint `from-url` trong phase nÃƒÂ y vÃƒÂ¬ flow Ã†Â°u tiÃƒÂªn `from-media` Ã„â€˜ÃƒÂ£ hoÃ¡ÂºÂ¡t Ã„â€˜Ã¡Â»â„¢ng.

### Business rule

- Attach Ã¡ÂºÂ£nh tÃ¡Â»Â« Media khÃƒÂ´ng upload lÃ¡ÂºÂ¡i Cloudinary.
- Ã¡ÂºÂ¢nh Ã„â€˜Ã¡ÂºÂ§u tiÃƒÂªn cÃ¡Â»Â§a tour tÃ¡Â»Â± trÃ¡Â»Å¸ thÃƒÂ nh thumbnail.
- NÃ¡ÂºÂ¿u `thumbnail=true` hoÃ¡ÂºÂ·c `isThumbnail=true`, backend unset thumbnail cÃ…Â© vÃƒÂ  set thumbnail mÃ¡Â»â€ºi.
- VÃ¡ÂºÂ«n giÃ¡Â»â€ºi hÃ¡ÂºÂ¡n tÃ¡Â»â€˜i Ã„â€˜a 10 Ã¡ÂºÂ£nh/tour.
- XÃƒÂ³a `TourImage` cÃƒÂ³ `sourceType=MEDIA` chÃ¡Â»â€° xÃƒÂ³a record gallery, khÃƒÂ´ng xÃƒÂ³a Cloudinary asset vÃƒÂ  khÃƒÂ´ng xÃƒÂ³a record `MEDIA`.
- XÃƒÂ³a `TourImage` upload trÃ¡Â»Â±c tiÃ¡ÂºÂ¿p chÃ¡Â»â€° gÃ¡Â»Âi xÃƒÂ³a Cloudinary nÃ¡ÂºÂ¿u `PUBLIC_ID` khÃƒÂ´ng cÃƒÂ²n trong Media library.
- `minPrice` chÃ¡Â»â€° tÃƒÂ­nh tÃ¡Â»Â« schedule `OPEN` future/today; public schedules chÃ¡Â»â€° trÃ¡ÂºÂ£ `OPEN` future.
- `avgRating/totalReviews` chÃ¡Â»â€° tÃƒÂ­nh review `ACTIVE`.

### KÃ¡ÂºÂ¿t quÃ¡ÂºÂ£ backend compile/startup/API thÃ¡ÂºÂ­t

- `./mvnw.cmd -DskipTests compile`: `BUILD SUCCESS` lÃƒÂºc 2026-06-06 10:29 +07.
- Port `8081` Ã„â€˜ÃƒÂ£ cÃƒÂ³ Java process chÃ¡ÂºÂ¡y tÃ¡Â»Â« trÃ†Â°Ã¡Â»â€ºc task, nÃƒÂªn khÃƒÂ´ng restart process nÃƒÂ y Ã„â€˜Ã¡Â»Æ’ trÃƒÂ¡nh dÃ¡Â»Â«ng server khÃƒÂ´ng do task tÃ¡ÂºÂ¡o.
- Backend thÃ¡ÂºÂ­t Ã„â€˜ang chÃ¡ÂºÂ¡y trÃ¡ÂºÂ£ `GET /api/public/ping` thÃƒÂ nh cÃƒÂ´ng.
- Login ADMIN thÃ¡ÂºÂ­t thÃƒÂ nh cÃƒÂ´ng vÃ¡Â»â€ºi `admin@voyageviet.local`.
- API E2E thÃ¡ÂºÂ­t Ã„â€˜ÃƒÂ£ tÃ¡ÂºÂ¡o tour test `id=41`, slug `phase-9-e2e-admin-tour-20260606103234`:
  - publish checklist trÃ†Â°Ã¡Â»â€ºc gallery/itinerary/schedule: `canPublish=false`.
  - attach Media `id=32` vÃƒÂ o gallery qua `POST /api/admin/tours/{id}/images/from-media`: thÃƒÂ nh cÃƒÂ´ng.
  - lÃ†Â°u itinerary 2 ngÃƒÂ y: thÃƒÂ nh cÃƒÂ´ng.
  - tÃ¡ÂºÂ¡o schedule `OPEN` future: thÃƒÂ nh cÃƒÂ´ng.
  - publish checklist sau khi Ã„â€˜Ã¡Â»Â§ dÃ¡Â»Â¯ liÃ¡Â»â€¡u: `canPublish=true`.
  - publish tour: thÃƒÂ nh cÃƒÂ´ng.
  - `GET /api/public/tours/{slug}`: trÃ¡ÂºÂ£ tour `PUBLISHED`.
  - `GET /api/public/tours/{slug}/schedules`: trÃ¡ÂºÂ£ 1 schedule khi `OPEN`, trÃ¡ÂºÂ£ 0 khi Ã„â€˜Ã¡Â»â€¢i `CLOSED`, trÃ¡ÂºÂ£ lÃ¡ÂºÂ¡i 1 khi reopen.
  - `GET /api/public/tours/{slug}/itinerary`: trÃ¡ÂºÂ£ 2 ngÃƒÂ y.
  - XÃƒÂ³a Ã¡ÂºÂ£nh gallery attach tÃ¡Â»Â« Media khÃƒÂ´ng xÃƒÂ³a Media library; `GET /api/admin/media` vÃ¡ÂºÂ«n thÃ¡ÂºÂ¥y media `id=32`.

### TODO cÃƒÂ²n lÃ¡ÂºÂ¡i

- Apply `V20260604_01_schema_hardening.sql` trÃ¡Â»Â±c tiÃ¡ÂºÂ¿p trÃƒÂªn Oracle DB thÃ¡ÂºÂ­t trÃ†Â°Ã¡Â»â€ºc production deploy.
- Restart backend Ã„â€˜Ã¡Â»Æ’ load code mÃ¡Â»â€ºi `sourceType/mediaId`; E2E API Ã¡Â»Å¸ trÃƒÂªn chÃ¡ÂºÂ¡y trÃƒÂªn process backend cÃƒÂ³ sÃ¡ÂºÂµn tÃ¡Â»Â« trÃ†Â°Ã¡Â»â€ºc task nÃƒÂªn chÃ¡Â»â€° xÃƒÂ¡c nhÃ¡ÂºÂ­n contract cÃ…Â© Ã„â€˜ang hoÃ¡ÂºÂ¡t Ã„â€˜Ã¡Â»â„¢ng, cÃƒÂ²n code mÃ¡Â»â€ºi Ã„â€˜ÃƒÂ£ xÃƒÂ¡c nhÃ¡ÂºÂ­n bÃ¡ÂºÂ±ng compile.
- ThiÃ¡ÂºÂ¿t kÃ¡ÂºÂ¿ permission chi tiÃ¡ÂºÂ¿t cho `STAFF`/feature permissions.
- WebSocket JWT handshake vÃ¡ÂºÂ«n chÃ†Â°a lÃƒÂ m.
- Admin Booking Detail frontend vÃ¡ÂºÂ«n chÃ†Â°a lÃƒÂ m.
- NÃ¡ÂºÂ¿u dÃ¡Â»Â¯ liÃ¡Â»â€¡u lÃ¡Â»â€ºn, chuyÃ¡Â»Æ’n `recomputeAllTourStats()` sang job/batch cÃƒÂ³ phÃƒÂ¢n trang.



## Cap nhat 08/06/2026 - Category Workflow Status va IS_DISPLAY

### Thoi gian cap nhat

- 2026-06-08 18:18 +07.

### File backend da sua/them

- `src/main/java/com/voyageviet/backend/category/entity/Category.java`
- `src/main/java/com/voyageviet/backend/category/entity/CategoryStatus.java`
- `src/main/java/com/voyageviet/backend/category/repository/CategoryRepository.java`
- `src/main/java/com/voyageviet/backend/category/service/CategoryService.java`
- `src/main/java/com/voyageviet/backend/category/controller/AdminCategoryController.java`
- `src/main/java/com/voyageviet/backend/category/controller/CategoryController.java` checked; endpoint unchanged, service logic now filters APPROVED + IS_DISPLAY = 1
- `src/main/java/com/voyageviet/backend/category/dto/CategoryCreateRequest.java`
- `src/main/java/com/voyageviet/backend/category/dto/CategoryUpdateRequest.java`
- `src/main/java/com/voyageviet/backend/category/dto/CategoryPatchRequest.java`
- `src/main/java/com/voyageviet/backend/category/dto/CategoryStatusUpdateRequest.java`
- `src/main/java/com/voyageviet/backend/category/dto/CategoryResponse.java`
- `src/main/java/com/voyageviet/backend/category/dto/CategoryNewData.java`
- `src/main/java/com/voyageviet/backend/category/dto/CategoryDisplayUpdateRequest.java`
- `src/main/java/com/voyageviet/backend/category/dto/CategoryRejectRequest.java`
- `src/main/java/com/voyageviet/backend/admin/service/AdminDashboardService.java` only updated Category count from ACTIVE to APPROVED + IS_DISPLAY = 1.
- `src/main/java/com/voyageviet/backend/common/config/DataSeeder.java` only updated sample categories to seed APPROVED + IS_DISPLAY = 1.

### Migration DB da them

- `src/main/resources/db/manual/oracle/V20260608_01_category_workflow_status_is_display.sql`.
- Migration them `CATEGORIES.IS_DISPLAY NUMBER(1) DEFAULT 1 NOT NULL` neu thieu.
- Migration them `CATEGORIES.REJECT_REASON VARCHAR2(500)` neu thieu.
- Du lieu cu duoc convert: `ACTIVE -> APPROVED + IS_DISPLAY = 1`, `INACTIVE -> APPROVED + IS_DISPLAY = 0`.
- Recreate check constraint `CK_CATEGORIES_STATUS` voi `DRAFT`, `PENDING`, `APPROVED`, `REJECTED`, `CANCEL_APPROVE`.
- Recreate check constraint `CK_CATEGORIES_IS_DISPLAY` voi `0`, `1`.
- `NEW_DATA` va `DISPLAY_ORDER` duoc giu nguyen.

### Chuc nang da thay doi

- `CategoryStatus` doi tu display status `ACTIVE/INACTIVE` sang workflow status `DRAFT/PENDING/APPROVED/REJECTED/CANCEL_APPROVE`.
- `Category` them `isDisplay`, `rejectReason`, domain methods `markAsDraft`, `markAsPending`, `markAsApproved`, `markAsRejected`, `markAsCancelApproved`, `show`, `hide`, `replaceNewData`, `clearNewData`, `hasNewData`, `isPending`, `isPublished`, `isPublicVisible`.
- Public category query chi lay `status = APPROVED` va `isDisplay = 1`, sort theo `displayOrder ASC`.
- Create category moi luu data that voi `status = DRAFT`, `isDisplay = 0`, `newData = null`.
- `PATCH /api/admin/categories/{id}` khong apply truc tiep data that; chi ghi JSON vao `NEW_DATA` va set `status = PENDING`.
- Approve category chi cho `PENDING`; neu co `NEW_DATA` thi parse/apply vao data that, clear `NEW_DATA`, set `APPROVED`.
- Reject category chi cho `PENDING`; set `REJECTED`, giu `NEW_DATA`, khong apply data that, luu `rejectReason` neu co.
- Cancel approve chi cho `PENDING`; clear `NEW_DATA`, set `CANCEL_APPROVE`, khong apply data that.
- Show/hide public khong dung `STATUS`; dung `IS_DISPLAY` va chi cho show/hide category da `APPROVED`.
- `NEW_DATA` cu co `status` legacy `ACTIVE/INACTIVE` duoc service doc bang JsonNode va map tam sang workflow de tranh loi parse enum khi approve.

### API da them/sua

- `PATCH /api/admin/categories/{id}/submit`
- `PATCH /api/admin/categories/{id}/approve`
- `PATCH /api/admin/categories/{id}/reject` voi body optional `{ "reason": "..." }`
- `PATCH /api/admin/categories/{id}/cancel-approve`
- `PATCH /api/admin/categories/{id}/display` voi body `{ "isDisplay": 0|1 }`
- `PATCH /api/admin/categories/{id}/status` van ton tai nhung chi con y nghia workflow status, khong dung de bat/tat public display.
- `GET /api/public/categories` giu endpoint cu nhung khong tra `newData`, chi tra category public visible.

### Ket qua build/test

- Da apply local Oracle migration `V20260608_01_category_workflow_status_is_display.sql` vao schema `VOYAGE` luc 2026-06-08 18:27 +07. Ket qua: them `IS_DISPLAY`, `REJECT_REASON`, convert 5 category cu sang `APPROVED` voi `IS_DISPLAY` phu hop.\n- Da chay `./mvnw.cmd test`: `BUILD SUCCESS`, tests run 1, failures 0, errors 0 luc 2026-06-08 18:27 +07.
- Da chay `./mvnw.cmd clean package -DskipTests`: `BUILD SUCCESS` luc 2026-06-08 18:20 +07.

### Warning/loi con lai

- Can apply `V20260608_01_category_workflow_status_is_display.sql` tren Oracle local/prod truoc khi chay app/test voi schema validation.
- Chua chay API thu cong vi DB local chua co column `IS_DISPLAY`.
- Frontend admin hien co neu con goi `/status` de bat/tat category thi can chuyen sang `/display`.

### Ghi chu ky thuat/rui ro

- Frontend admin can cap nhat enum status theo workflow moi.
- Frontend public khong can biet `newData`.
- Du lieu cu `ACTIVE/INACTIVE` da co migration sang `APPROVED + IS_DISPLAY`.
- Neu ton tai `NEW_DATA` cu co payload status `ACTIVE/INACTIVE`, backend da co mapping doc legacy de khong fail khi approve.




## Cap nhat 09/06/2026 - Category Batch Workflow API

### Thoi gian cap nhat

- 2026-06-09 12:24:52 +07.

### File backend da sua/them

- `src/main/java/com/voyageviet/backend/category/controller/AdminCategoryController.java`
- `src/main/java/com/voyageviet/backend/category/service/CategoryService.java`
- `src/main/java/com/voyageviet/backend/category/dto/CategoryBatchRequest.java`
- `src/main/java/com/voyageviet/backend/category/dto/CategoryBatchRejectRequest.java`
- `src/main/java/com/voyageviet/backend/category/dto/CategoryBatchDisplayRequest.java`
- `src/main/java/com/voyageviet/backend/category/dto/CategoryBatchActionResponse.java`
- `src/main/java/com/voyageviet/backend/category/dto/CategoryBatchActionItemResponse.java`

### DTO da them

- `CategoryBatchRequest`: `List<Long> ids`.
- `CategoryBatchRejectRequest`: `List<Long> ids`, `String reason`.
- `CategoryBatchDisplayRequest`: `List<Long> ids`, `Integer isDisplay`.
- `CategoryBatchActionResponse`: `total`, `successCount`, `failedCount`, `successItems`, `failedItems`.
- `CategoryBatchActionItemResponse`: `id`, `name`, `success`, `message`.

### API batch da them

- `PATCH /api/admin/categories/batch/submit`
- `PATCH /api/admin/categories/batch/approve`
- `PATCH /api/admin/categories/batch/reject`
- `PATCH /api/admin/categories/batch/cancel-approve`
- `PATCH /api/admin/categories/batch/display`

### Logic backend

- Giu nguyen single API hien co va tai su dung logic single action de tranh lech rule nghiep vu.
- Batch submit chi xu ly category `DRAFT`, `REJECTED`, `CANCEL_APPROVE`.
- Batch approve chi xu ly category `PENDING`; neu co `NEW_DATA` thi apply theo logic single approve va clear `NEW_DATA`.
- Batch reject chi xu ly category `PENDING`, giu `NEW_DATA` va luu `rejectReason` neu co.
- Batch cancel approve chi xu ly category `PENDING`, clear `NEW_DATA` va set `CANCEL_APPROVE`.
- Batch display chi xu ly category `APPROVED`, dung `isDisplay = 0|1`, khong dung `/status`.
- Moi id duoc xu ly doc lap trong try/catch; item loi duoc ghi vao `failedItems`, khong lam dung toan bo batch.
- Id trung duoc loai bo bang `LinkedHashSet` de giu thu tu dau vao.

### Ket qua build/test backend

- `./mvnw.cmd clean test`: `BUILD SUCCESS`, tests run 1, failures 0, errors 0.
- `./mvnw.cmd clean package -DskipTests`: `BUILD SUCCESS`.

### Warning/loi con lai

- Khi chay test local, `DataSeeder` van log warning ORA-02290 cho role/feature enum constraint chua apply migration hardening moi; test khong fail.
- Co warning Java/Lombok/Mockito hien huu ve deprecated Unsafe/dynamic agent.
- Chua test API batch thu cong bang HTTP trong phien nay.

### Ghi chu ky thuat/rui ro

- Single API van giu nguyen de frontend action tung dong tiep tuc hoat dong.
- Batch API validate workflow rule o backend, khong phu thuoc vao frontend filter.
- Neu mot item fail, cac item khac van tra ket qua trong cung response.
- Neu can toi uu transaction tuyet doi tung item rieng biet hon, co the tach sang service item-level voi propagation rieng trong giai doan sau.
## Cap nhat 2026-06-09 12:39:35 +07:00 - Category Workflow E2E Test buoc 10

### File da sua trong buoc 10
- src/main/java/com/voyageviet/backend/category/dto/CategoryResponse.java
- BACKEND_API_REPORT.md

### Test DB migration
- Da ket noi Oracle local jdbc:oracle:thin:@//localhost:1521/ORCL21PDB1, schema VOYAGE.
- Xac nhan bang CATEGORIES co du cot: STATUS, IS_DISPLAY, NEW_DATA, REJECT_REASON, DISPLAY_ORDER.
- Constraint CK_CATEGORIES_STATUS hien cho phep: DRAFT, PENDING, APPROVED, REJECTED, CANCEL_APPROVE.
- Constraint CK_CATEGORIES_IS_DISPLAY hien cho phep: 0, 1.
- Truy van STATUS IN ('ACTIVE','INACTIVE') tra ve 0, du lieu legacy da migrate het.
- Trang thai hien tai sau E2E co nhieu category test moi duoc tao them de kiem thu workflow.

### Test backend single API
- Da test bang HTTP tren backend chay tu source hien tai tai http://localhost:18081/api.
- Login admin thanh cong voi seed admin local.
- POST /api/admin/categories: category moi tao co status = DRAFT, isDisplay = 0, newData = null.
- PATCH /api/admin/categories/{id}/submit: chuyen DRAFT/REJECTED sang PENDING.
- PATCH /api/admin/categories/{id}/reject: chuyen sang REJECTED, luu rejectReason.
- Submit lai category REJECTED: chuyen lai PENDING.
- PATCH /api/admin/categories/{id}/approve: chuyen PENDING sang APPROVED, clear newData neu co.
- PATCH /api/admin/categories/{id}/display: set isDisplay = 1 va isDisplay = 0 thanh cong khi category APPROVED.
- Patch category da approve tao newData, set PENDING, khong apply truc tiep data that.
- PATCH /api/admin/categories/{id}/cancel-approve: set CANCEL_APPROVE, clear newData, giu data that.
- Display category CANCEL_APPROVE bi reject dung rule.

### Test backend batch API
- Da test cac endpoint batch bang HTTP voi danh sach hop le/khong hop le/id khong ton tai.
- PATCH /api/admin/categories/batch/submit: response mau success=2, failed=2, total=4; id trung duoc loai bo.
- PATCH /api/admin/categories/batch/approve: response mau success=2, failed=1.
- PATCH /api/admin/categories/batch/reject: response mau success=2, failed=1, co gui reason.
- PATCH /api/admin/categories/batch/cancel-approve: response mau success=2, failed=1.
- PATCH /api/admin/categories/batch/display show: response mau success=2, failed=2.
- PATCH /api/admin/categories/batch/display hide: response mau success=2, failed=1.
- Xac nhan mot item fail khong lam fail toan bo batch; response co total, successCount, failedCount, successItems, failedItems.

### Test public category API
- GET /api/public/categories chi tra category APPROVED + isDisplay = 1.
- Category DRAFT, PENDING, REJECTED, CANCEL_APPROVE, va APPROVED + isDisplay = 0 khong xuat hien trong response public.
- Phat hien response public van co field newData va rejectReason gia tri null; da fix bang JsonInclude NON_NULL tren hai record component nay trong CategoryResponse.
- Sau fix, HTTP E2E xac nhan public response khong con expose newData/rejectReason khi null.

### Ket qua build/test backend
- ./mvnw.cmd clean test: pass, tests run 1, failures 0, errors 0.
- ./mvnw.cmd clean package -DskipTests: pass.

### Warning/loi con lai
- Backend test van log warning ORA-02290 tu DataSeeder cho role/feature enum constraint chua apply migration hardening moi; test khong fail va khong lien quan Category workflow.
- Con warning hien huu Java/Lombok/Mockito ve deprecated Unsafe/dynamic agent.
- Backend phu test E2E tren port 18081 da duoc dung lai sau khi test.

### Ghi chu ky thuat/rui ro
- Single API va batch API deu giu workflow rule o backend.
- Batch endpoint da test voi item hop le, item sai status va id khong ton tai.
- Public API da test chi tra approved + displayed.
- Cac category test E2E co slug tien to e2e-category-* duoc tao trong DB local de xac minh workflow that.

## Cap nhat 2026-06-09 13:25:00 +07:00 - Category Workflow RBAC buoc 11

### File da sua
- src/main/java/com/voyageviet/backend/common/config/SecurityConfig.java
- BACKEND_API_REPORT.md

### Role matrix da ap dung
- STAFF: duoc xem danh muc, tao danh muc, cap nhat danh muc, submit workflow va cap nhat anh category qua endpoint category image.
- ADMIN: co quyen STAFF, them approve, reject, cancel approve, display show/hide va batch workflow actions.
- SUPER_ADMIN: co quyen ADMIN va duoc delete category.
- Batch workflow endpoints duoc gioi han cho ADMIN/SUPER_ADMIN, bao gom ca batch submit de tranh STAFF thuc hien batch tren nhieu dong.

### Backend endpoint da enforce quyen
- GET /api/admin/categories: STAFF/ADMIN/SUPER_ADMIN.
- POST /api/admin/categories: STAFF/ADMIN/SUPER_ADMIN.
- PUT/PATCH /api/admin/categories/{id}: STAFF/ADMIN/SUPER_ADMIN.
- PATCH /api/admin/categories/{id}/submit: STAFF/ADMIN/SUPER_ADMIN.
- PATCH /api/admin/categories/{id}/image: STAFF/ADMIN/SUPER_ADMIN.
- PATCH /api/admin/categories/{id}/approve: ADMIN/SUPER_ADMIN.
- PATCH /api/admin/categories/{id}/reject: ADMIN/SUPER_ADMIN.
- PATCH /api/admin/categories/{id}/cancel-approve: ADMIN/SUPER_ADMIN.
- PATCH /api/admin/categories/{id}/display: ADMIN/SUPER_ADMIN.
- DELETE /api/admin/categories/{id}: SUPER_ADMIN.
- PATCH /api/admin/categories/batch/submit: ADMIN/SUPER_ADMIN.
- PATCH /api/admin/categories/batch/approve: ADMIN/SUPER_ADMIN.
- PATCH /api/admin/categories/batch/reject: ADMIN/SUPER_ADMIN.
- PATCH /api/admin/categories/batch/cancel-approve: ADMIN/SUPER_ADMIN.
- PATCH /api/admin/categories/batch/display: ADMIN/SUPER_ADMIN.
- Public category API khong bi anh huong.

### Ket qua test STAFF
- Tao user test STAFF bang API admin local, dang nhap lay token STAFF.
- GET /api/admin/categories: 200.
- POST /api/admin/categories: 200.
- PATCH /api/admin/categories/{id}: 200.
- PATCH /api/admin/categories/{id}/submit: 200.
- Approve/reject/cancel approve/display/delete/batch submit/batch approve/batch reject/batch display: deu tra 403.

### Ket qua test ADMIN
- ADMIN approve category PENDING: 200.
- ADMIN display show/hide category APPROVED: 200.
- ADMIN batch submit va batch reject: 200.
- ADMIN delete category: 403 theo rule buoc 11 chi SUPER_ADMIN duoc xoa.

### Ket qua test SUPER_ADMIN
- SUPER_ADMIN delete category test: 200.
- SUPER_ADMIN co toan quyen Category theo matcher hien tai.

### Ket qua build/test backend
- Da apply manual migration hardening V20260604_01_schema_hardening.sql tren Oracle local de schema role/feature chap nhan STAFF trong seed/test local.
- ./mvnw.cmd clean test: BUILD SUCCESS, tests run 1, failures 0, errors 0.
- ./mvnw.cmd clean package -DskipTests: BUILD SUCCESS.

### Warning/loi con lai
- Con warning hien huu OracleDialect/open-in-view/SpringDoc va Java/Lombok/Mockito deprecated Unsafe/dynamic agent.
- Cac user/category test RBAC local co tien to staff-rbac-* va rbac-category-* duoc tao trong DB local de xac minh quyen that.

### Ghi chu ky thuat/rui ro
- Dang dung role-based security vi framework permission code chi tiet chua duoc ap dung cho Category trong buoc nay.
- Backend la lop chan quyen chinh, frontend chi an action de cai thien UX.
- Neu sau nay bo sung permission code CATEGORY_* thi co the thay matcher role-based bang permission-based ma khong doi workflow.
- Khong dung /status cho display, single API va batch API Category van giu nguyen.

## Cap nhat 2026-06-09 17:13:27 +07:00 - Category Media limited access cho STAFF buoc 12

### File da sua
- src/main/java/com/voyageviet/backend/common/config/SecurityConfig.java
- src/main/java/com/voyageviet/backend/media/controller/AdminMediaController.java
- src/main/java/com/voyageviet/backend/media/service/MediaService.java
- src/main/java/com/voyageviet/backend/media/repository/MediaRepository.java
- BACKEND_API_REPORT.md

### Rule quyen Media cho STAFF
- STAFF chi duoc GET /api/admin/media khi query module=categories.
- STAFF chi duoc POST /api/admin/media/upload khi multipart field module=categories.
- STAFF khong duoc list all media, khong duoc list module tours/banners/avatars/destinations/general.
- STAFF khong duoc DELETE /api/admin/media/{id}.
- ADMIN/SUPER_ADMIN giu quyen Media admin hien co: list all/list module, upload cac module va delete theo matcher admin.

### Backend da enforce quyen
- SecurityConfig mo rieng GET /api/admin/media va POST /api/admin/media/upload cho STAFF/ADMIN/SUPER_ADMIN truoc matcher /api/admin/**.
- AdminMediaController kiem tra role hien tai; neu la STAFF-only thi bat buoc module categories.
- MediaService them getMediaListByModule de list dung folder module categories theo exact folder, tranh filter contains qua rong.
- MediaRepository them findByFolderIgnoreCase.
- Backend van la lop chan quyen chinh; frontend an nut chi phuc vu UX.

### Ket qua test STAFF
- GET /api/admin/media?module=categories: 200.
- GET /api/admin/media khong truyen module: 403.
- GET /api/admin/media?module=tours: 403.
- GET /api/admin/media?module=banners: 403.
- DELETE /api/admin/media/999999999: 403.
- POST /api/admin/media/upload module=categories bang PNG 1x1: 200.
- POST /api/admin/media/upload module=tours bang PNG 1x1: 403.
- POST /api/admin/categories voi imageUrl: 200, category moi status DRAFT.
- PATCH /api/admin/categories/{id}/image voi token STAFF: 200.

### Ket qua test ADMIN
- GET /api/admin/media khong truyen module: 200.
- POST /api/admin/media/upload module=general bang PNG 1x1: 200.
- ADMIN van duoc dung Admin Media day du theo matcher hien co.

### Ket qua test SUPER_ADMIN
- GET /api/admin/media khong truyen module: 200.
- SUPER_ADMIN giu quyen admin media day du theo role hierarchy/matcher hien tai.

### Ket qua build/test backend
- ./mvnw.cmd clean test: BUILD SUCCESS, tests run 1, failures 0, errors 0.
- ./mvnw.cmd clean package -DskipTests: BUILD SUCCESS.

### Warning/loi con lai
- Con warning hien huu OracleDialect/open-in-view/SpringDoc va Java/Lombok/Mockito deprecated Unsafe/dynamic agent.
- Cac user/category/media test local co tien to staff-media-* va staff-media-category-* duoc tao trong DB/Cloudinary de xac minh quyen that.

### Ghi chu ky thuat/rui ro
- STAFF chi duoc dung Media trong pham vi category.
- Admin Media full page van chi danh cho ADMIN/SUPER_ADMIN tren frontend guard/sidebar.
- Khong mo trang Admin Media cho STAFF va khong cho STAFF delete media.
- Khong doi Category workflow, IS_DISPLAY, payload Category, public API, single API hay batch API.

## Cap nhat 2026-06-09 21:50:30 +07:00 - Encoding tieng Viet buoc 13

### File da sua
- .editorconfig
- src/main/java/com/voyageviet/backend/tour/service/TourStatsService.java
- BACKEND_API_REPORT.md
- voyage-frontend/VOYAGE_ADMIN_AUDIT_REPORT.md
- voyage-frontend/VOYAGE_FRONTEND_AUDIT_REPORT.md
- voyage-frontend/src/app/pages/admin/categories/categories.ts
- voyage-frontend/src/app/pages/admin/categories/categories.html
- voyage-frontend/src/app/pages/public/profile/profile.ts

### Pham vi da scan
- Toan repo, bo qua .git/node_modules/dist/target/.angular/.idea.
- Backend src/main Java/resources, SQL/manual migration va report markdown.
- Frontend src/app, admin/public pages, layouts, shared/core va audit reports.

### Nhom loi encoding da sua
- Chuoi tieng Viet bi sai ma trong UI frontend, audit/report va mot message backend.
- Backend TourStatsService: sua chuoi so sanh ten quoc gia Viet Nam bi sai encoding.
- Report backend: khong con liet ke ky tu loi truc tiep gay scan false positive; doi sang mo ta code point.

### Nguyen nhan nghi ngo
- Noi dung cu co kha nang bi copy/ghi tu terminal Windows hoac editor khong thong nhat encoding.
- Da bo sung .editorconfig de khoa UTF-8/LF.
- pom.xml va application.properties da co cau hinh UTF-8 cho backend response/source encoding.

### Ket qua build/test
- ./mvnw.cmd clean test: BUILD SUCCESS, tests run 1, failures 0, errors 0.
- ./mvnw.cmd clean package -DskipTests: BUILD SUCCESS.
- Frontend build development va production: pass.

### Warning/loi con lai
- Con warning hien huu OracleDialect/open-in-view/SpringDoc va Java/Lombok/Mockito deprecated Unsafe/dynamic agent.
- Broad scan con false positive do tieng Viet dung co dau nhu Chau Au hoac chu hoa co dau; exact mojibake scan tra ve 0 hit.

### Ghi chu ky thuat/rui ro
- Tat ca file sua trong buoc nay da ghi UTF-8 khong BOM, co newline cuoi file.
- Khong doi API, workflow, payload, database schema hay role permission.
- Neu DB co du lieu mojibake that, can tao script kiem tra/sua rieng theo bang/field sau.

## CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t: Destination Workflow Admin

ThÃ¡Â»Âi gian cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t: 2026-06-09 22:33 +07:00

### File Ã„â€˜ÃƒÂ£ sÃ¡Â»Â­a/tÃ¡ÂºÂ¡o mÃ¡Â»â€ºi
- src/main/java/com/voyageviet/backend/destination/entity/Destination.java
- src/main/java/com/voyageviet/backend/destination/entity/DestinationStatus.java
- src/main/java/com/voyageviet/backend/destination/repository/DestinationRepository.java
- src/main/java/com/voyageviet/backend/destination/service/DestinationService.java
- src/main/java/com/voyageviet/backend/destination/controller/AdminDestinationController.java
- src/main/java/com/voyageviet/backend/destination/dto/*Destination*workflow/batch/review DTO
- src/main/java/com/voyageviet/backend/common/config/SecurityConfig.java
- src/main/java/com/voyageviet/backend/media/controller/AdminMediaController.java
- src/main/java/com/voyageviet/backend/admin/service/AdminDashboardService.java
- src/main/java/com/voyageviet/backend/common/config/DataSeeder.java
- src/main/resources/db/manual/oracle/V20260609_02_destination_workflow_status_is_display.sql

### NÃ¡Â»â„¢i dung Ã„â€˜ÃƒÂ£ lÃƒÂ m
- ChuyÃ¡Â»Æ’n DestinationStatus tÃ¡Â»Â« ACTIVE/INACTIVE sang workflow: DRAFT, PENDING, APPROVED, REJECTED, CANCEL_APPROVE.
- ThÃƒÂªm IS_DISPLAY, NEW_DATA, REJECT_REASON cho Destination entity vÃƒÂ  migration Oracle.
- Public destinations chÃ¡Â»â€° trÃ¡ÂºÂ£ APPROVED + IS_DISPLAY = 1.
- Create destination tÃ¡ÂºÂ¡o DRAFT + IS_DISPLAY = 0.
- Update/patch/image update lÃ†Â°u thay Ã„â€˜Ã¡Â»â€¢i vÃƒÂ o NEW_DATA vÃƒÂ  chuyÃ¡Â»Æ’n PENDING, khÃƒÂ´ng apply dÃ¡Â»Â¯ liÃ¡Â»â€¡u thÃ¡ÂºÂ­t cho Ã„â€˜Ã¡ÂºÂ¿n khi approve.
- Approve apply NEW_DATA nÃ¡ÂºÂ¿u cÃƒÂ³, clear NEW_DATA/rejectReason, chuyÃ¡Â»Æ’n APPROVED.
- Reject giÃ¡Â»Â¯ NEW_DATA, lÃ†Â°u rejectReason, chuyÃ¡Â»Æ’n REJECTED.
- Cancel approve clear NEW_DATA, chuyÃ¡Â»Æ’n CANCEL_APPROVE, khÃƒÂ´ng apply dÃ¡Â»Â¯ liÃ¡Â»â€¡u thÃ¡ÂºÂ­t.
- Display endpoint chÃ¡Â»â€° bÃ¡ÂºÂ­t/tÃ¡ÂºÂ¯t IS_DISPLAY cho destination APPROVED.
- ThÃƒÂªm single workflow API: submit/approve/reject/cancel-approve/display.
- ThÃƒÂªm batch workflow API xÃ¡Â»Â­ lÃƒÂ½ tÃ¡Â»Â«ng item Ã„â€˜Ã¡Â»â„¢c lÃ¡ÂºÂ­p vÃƒÂ  trÃ¡ÂºÂ£ success/failed items.
- RBAC: STAFF Ã„â€˜Ã†Â°Ã¡Â»Â£c list/create/update/submit/image; ADMIN Ã„â€˜Ã†Â°Ã¡Â»Â£c approve/reject/cancel/display/batch; SUPER_ADMIN Ã„â€˜Ã†Â°Ã¡Â»Â£c delete.
- Media STAFF Ã„â€˜Ã†Â°Ã¡Â»Â£c giÃ¡Â»â€ºi hÃ¡ÂºÂ¡n Ã„â€˜ÃƒÂºng module categories hoÃ¡ÂºÂ·c destinations, khÃƒÂ´ng mÃ¡Â»Å¸ toÃƒÂ n bÃ¡Â»â„¢ Media.
- Admin dashboard count destination public-visible Ã„â€˜Ã¡Â»â€¢i sang APPROVED + IS_DISPLAY = 1.

### KÃ¡ÂºÂ¿t quÃ¡ÂºÂ£ test
- ./mvnw.cmd clean package -DskipTests: PASS.
- ./mvnw.cmd clean test: FAIL do Oracle local chÃ†Â°a chÃ¡ÂºÂ¡y migration mÃ¡Â»â€ºi, Hibernate validate bÃƒÂ¡o thiÃ¡ÂºÂ¿u cÃ¡Â»â„¢t DESTINATIONS.IS_DISPLAY.

### Ghi chÃƒÂº kÃ¡Â»Â¹ thuÃ¡ÂºÂ­t/rÃ¡Â»Â§i ro
- CÃ¡ÂºÂ§n chÃ¡ÂºÂ¡y migration V20260609_02_destination_workflow_status_is_display.sql trÃƒÂªn Oracle trÃ†Â°Ã¡Â»â€ºc khi chÃ¡ÂºÂ¡y app/test vÃ¡Â»â€ºi enum mÃ¡Â»â€ºi.
- KhÃƒÂ´ng Ã„â€˜Ã¡Â»â€¢i public route destination, chÃ¡Â»â€° Ã„â€˜Ã¡Â»â€¢i logic filter.
- KhÃƒÂ´ng Ã„â€˜Ã¡Â»â€¢i payload Tour.

## Cap nhat 2026-06-10 09:05:00 +07:00 - Buoc 15: Destination Workflow Backend E2E

### Thoi gian cap nhat
- 2026-06-10 09:05:00 +07.

### File backend da kiem tra/sua
- `src/main/java/com/voyageviet/backend/destination/entity/Destination.java`
- `src/main/java/com/voyageviet/backend/destination/entity/DestinationStatus.java`
- `src/main/java/com/voyageviet/backend/destination/repository/DestinationRepository.java`
- `src/main/java/com/voyageviet/backend/destination/service/DestinationService.java`
- `src/main/java/com/voyageviet/backend/destination/controller/AdminDestinationController.java`
- `src/main/java/com/voyageviet/backend/destination/controller/DestinationController.java`
- `src/main/java/com/voyageviet/backend/destination/dto/*Workflow/Batch*`
- `src/main/java/com/voyageviet/backend/common/config/SecurityConfig.java`
- `src/main/java/com/voyageviet/backend/media/controller/AdminMediaController.java`
- `src/main/java/com/voyageviet/backend/media/service/MediaService.java`
- `src/main/java/com/voyageviet/backend/media/repository/MediaRepository.java`
- `src/main/resources/db/manual/oracle/V20260609_02_destination_workflow_status_is_display.sql`
- `BACKEND_API_REPORT.md`

### Migration Oracle
- Da tao/kiem tra migration `V20260609_02_destination_workflow_status_is_display.sql`.
- Migration idempotent them `IS_DISPLAY`, `NEW_DATA`, `REJECT_REASON` neu chua co.
- Legacy mapping: `ACTIVE -> APPROVED + IS_DISPLAY=1`, `INACTIVE -> APPROVED + IS_DISPLAY=0`.
- Recreate constraint `CK_DESTINATIONS_STATUS` voi `DRAFT/PENDING/APPROVED/REJECTED/CANCEL_APPROVE`.
- Recreate constraint `CK_DESTINATIONS_IS_DISPLAY` voi `IS_DISPLAY IN (0, 1)`.
- Dieu chinh file migration va Oracle local de `IS_DISPLAY DEFAULT 1 NOT NULL` dung yeu cau migration; backend create van set ro `isDisplay=0` nen khong phu thuoc default DB.

### Entity/DTO/API da xac nhan
- `DestinationStatus` dung workflow: `DRAFT`, `PENDING`, `APPROVED`, `REJECTED`, `CANCEL_APPROVE`.
- `Destination` co `isDisplay`, `newData`, `rejectReason` va domain methods workflow/display/public visibility.
- `DestinationResponse` co `JsonInclude.NON_NULL` cho `newData/rejectReason`.
- Co DTO `DestinationNewData`, reject/display request va batch request/response.
- Single workflow API co: submit, approve, reject, cancel-approve, display.
- Batch workflow API co: batch submit, approve, reject, cancel-approve, display.

### Service workflow da hoan thien
- Create luu data that voi `DRAFT`, `isDisplay=0`, `newData=null`, `rejectReason=null`.
- Update/patch/image update luu payload vao `NEW_DATA`, set `PENDING`, khong apply data that.
- Submit chi cho `DRAFT`, `REJECTED`, `CANCEL_APPROVE`.
- Approve chi cho `PENDING`, apply `NEW_DATA` neu co, clear `NEW_DATA/rejectReason`, set `APPROVED`.
- Reject chi cho `PENDING`, giu `NEW_DATA`, luu `rejectReason`, set `REJECTED`.
- Cancel approve chi cho `PENDING`, clear `NEW_DATA`, set `CANCEL_APPROVE`, khong apply data that.
- Display chi cho `APPROVED`, set `isDisplay=0|1`, khong dung status de an/hien public.
- Parse legacy `NEW_DATA` status `ACTIVE/INACTIVE` an toan thanh `APPROVED`.

### Public destination filtering
- `GET /api/public/destinations` chi tra `APPROVED + isDisplay=1`.
- Public response khong serialize `newData/rejectReason` khi null.
- Dashboard count destination public da dung `APPROVED + isDisplay=1`.

### RBAC va Media
- STAFF: GET list, POST create, PUT/PATCH update, PATCH submit, PATCH image destination.
- ADMIN: them approve/reject/cancel-approve/display va batch workflow; delete bi 403.
- SUPER_ADMIN: toan quyen va delete destination.
- STAFF Media chi duoc list/upload module `categories` hoac `destinations`; khong duoc list all, module khac hoac delete media.

### Test DB migration
- Da apply lai migration tren Oracle local schema `VOYAGE` luc 2026-06-10.
- Bang `DESTINATIONS` co `STATUS`, `IS_DISPLAY`, `NEW_DATA`, `REJECT_REASON`.
- `IS_DISPLAY` la `NUMBER`, `DEFAULT 1`, `NOT NULL`.
- `NEW_DATA` la `CLOB`; `REJECT_REASON` la `VARCHAR2`.
- Constraint `CK_DESTINATIONS_STATUS`: `DRAFT/PENDING/APPROVED/REJECTED/CANCEL_APPROVE`.
- Constraint `CK_DESTINATIONS_IS_DISPLAY`: `IS_DISPLAY IN (0, 1)`.
- Query `STATUS IN ('ACTIVE','INACTIVE')` tra ve 0.

### Test backend HTTP E2E
- Chay backend that tu source tren `http://localhost:18081/api`.
- Single flow pass: create DRAFT/isDisplay 0, submit PENDING, reject co reason, submit lai, approve, display show/hide, patch approved tao `newData` va khong apply data that, cancel approve clear `newData` va giu data that.
- Display tren destination `CANCEL_APPROVE` tra 400 dung rule chi APPROVED moi display.
- Batch flow pass voi item hop le/khong hop le/id khong ton tai/id trung:
  - submit: `3/1` vi `CANCEL_APPROVE` la trang thai hop le de submit.
  - approve: `2/1`.
  - reject: `2/1`.
  - cancel approve: `2/1`.
  - display show: `2/2`.
  - display hide: `2/1`.
- Mot item fail khong lam fail toan bo batch; response co `total`, `successCount`, `failedCount`, `successItems`, `failedItems`.
- Public API E2E pass: chi tra `APPROVED + isDisplay=1`, khong co `newData/rejectReason` null trong item public.
- RBAC E2E pass:
  - STAFF list/create/submit pass.
  - STAFF approve/reject/cancel/display/delete/batch tra 403.
  - ADMIN workflow/display/batch pass, delete tra 403.
  - SUPER_ADMIN delete destination test pass.

### Ket qua build/test backend
- `./mvnw.cmd clean package -DskipTests`: BUILD SUCCESS.
- `./mvnw.cmd clean test`: BUILD SUCCESS, tests run 1, failures 0, errors 0.

### Warning/loi con lai
- Con warning hien huu: OracleDialect explicit, open-in-view, SpringDoc default endpoint, Java/Lombok Unsafe deprecated, Mockito dynamic agent.
- Backend E2E tao du lieu test local voi tien to `e2e-destination-*` va user `staff-destination-*` trong Oracle local.

### Ghi chu ky thuat/rui ro
- Endpoint `/api/admin/destinations/{id}/status` van ton tai de tuong thich legacy/workflow status noi bo, khong dung de bat/tat public display.
- Backend la lop enforce workflow/RBAC chinh; frontend chi an/hien action de cai thien UX.
- Khong sua workflow Categories, khong doi API/payload Tour, khong doi public route.
## Cap nhat 2026-06-10 09:26:50 +07:00 - Buoc 16: Browser QA RBAC integration

### Thoi gian cap nhat
- 2026-06-10 09:26:50 +07.

### Pham vi backend test/fix
- Kiem tra backend that `http://localhost:8081/api` trong browser QA admin workflow.
- Fix nho RBAC cho du lieu tham chieu Destination Form.

### File backend da sua
- `src/main/java/com/voyageviet/backend/common/config/SecurityConfig.java`
- `BACKEND_API_REPORT.md`

### Noi dung sua
- Them matcher read-only: `GET /api/admin/locations/provinces` cho `STAFF`, `ADMIN`, `SUPER_ADMIN`.
- Ly do: STAFF duoc quan ly Destination theo workflow buoc 15, nhung Destination Form can load danh sach tinh/thanh qua endpoint admin locations; neu khong mo endpoint nay, browser QA cua STAFF bi 403 va console error.

### Ket qua HTTP RBAC
- STAFF `GET /api/admin/locations/provinces`: 200.
- STAFF `GET /api/admin/media`: 403.
- STAFF `GET /api/admin/media?module=categories`: 200.
- STAFF `GET /api/admin/media?module=destinations`: 200.
- Khong mo rong Media all/module khac cho STAFF.

### Ket qua build/test backend
- `./mvnw.cmd clean package -DskipTests`: BUILD SUCCESS.
- `./mvnw.cmd clean test`: BUILD SUCCESS, tests run 1, failures 0, errors 0.

### Warning/loi con lai
- Warning hien huu: OracleDialect explicit, open-in-view, SpringDoc endpoint enabled, Lombok Unsafe deprecated, Mockito dynamic agent.

### Ghi chu ky thuat/rui ro
- Khong doi workflow Category/Destination, khong doi API Tour, khong doi DB schema.
- Backend van la lop chan quyen chinh; frontend chi an/hien action de cai thien UX.

## Cap nhat 2026-06-10 15:20:00 +07:00 - Category Workflow PMH-style + isActive/isDisplay

### 1. Muc tieu phase
- Dieu chinh Category workflow theo huong PMH GroupCategory: status chi phuc vu duyet, tach trang thai hoat dong `isActive` va trang thai hien thi public `isDisplay`.
- Giu API cu trong pham vi co the; endpoint `/status` van ton tai nhung bi chan doi workflow truc tiep bang business validation.
- Public Category chi tra ve ban ghi `APPROVED + isActive=1 + isDisplay=1`.

### 2. File da them
- `src/main/resources/db/manual/oracle/V20260610_01_category_is_active_pmh_workflow.sql`

### 3. File da sua
- `src/main/java/com/voyageviet/backend/category/entity/Category.java`
- `src/main/java/com/voyageviet/backend/category/repository/CategoryRepository.java`
- `src/main/java/com/voyageviet/backend/category/service/CategoryService.java`
- `src/main/java/com/voyageviet/backend/category/controller/AdminCategoryController.java`
- `src/main/java/com/voyageviet/backend/category/dto/request/CategoryCreateRequest.java`
- `src/main/java/com/voyageviet/backend/category/dto/request/CategoryUpdateRequest.java`
- `src/main/java/com/voyageviet/backend/category/dto/request/CategoryPatchRequest.java`
- `src/main/java/com/voyageviet/backend/category/dto/response/CategoryNewData.java`
- `src/main/java/com/voyageviet/backend/category/dto/response/CategoryResponse.java`
- `src/main/java/com/voyageviet/backend/common/config/SecurityConfig.java`
- `src/main/java/com/voyageviet/backend/admin/service/AdminDashboardService.java`
- `BACKEND_API_REPORT.md`

### 4. File da xoa
- Khong xoa file nao.

### 5. Migration/schema
- Them migration idempotent `V20260610_01_category_is_active_pmh_workflow.sql`.
- Them cot `CATEGORIES.IS_ACTIVE NUMBER(1) DEFAULT 1 NOT NULL` neu chua co.
- Dam bao ton tai `IS_DISPLAY`, `NEW_DATA`, `REJECT_REASON` cho schema Category workflow.
- Recreate constraint:
  - `CK_CATEGORIES_STATUS`: `DRAFT`, `PENDING`, `APPROVED`, `REJECTED`, `CANCEL_APPROVE`.
  - `CK_CATEGORIES_IS_DISPLAY`: `IS_DISPLAY IN (0, 1)`.
  - `CK_CATEGORIES_IS_ACTIVE`: `IS_ACTIVE IN (0, 1)`.
- Mapping/cleanup du lieu legacy: `IS_ACTIVE` null -> `1`; category inactive hoac khong `APPROVED` bi ep `IS_DISPLAY=0`.
- Da apply migration nay tren Oracle local schema `VOYAGE` de Hibernate validate/test pass.

### 6. Entity/DTO/Enum thay doi
- `Category` them `isActive`, method `activate/deactivate`, va `isPublicVisible()` yeu cau `APPROVED + isActive=1 + isDisplay=1`.
- `CategoryCreateRequest`, `CategoryUpdateRequest`, `CategoryPatchRequest` them optional `isActive`.
- `CategoryUpdateRequest` va `CategoryPatchRequest` khong con nhan `status`; client khong duoc doi workflow status qua update payload.
- `CategoryResponse` them `isActive`.
- `CategoryNewData` them `isActive` de preview/apply pending data.
- `CategoryStatus` khong doi enum, van gom `DRAFT`, `PENDING`, `APPROVED`, `REJECTED`, `CANCEL_APPROVE`.

### 7. API endpoint moi
- `POST /api/admin/categories/submit-create`: tao category moi voi `status=PENDING`, `isDisplay=0`, `isActive` theo request hoac default `1`.
- `POST /api/admin/categories/{id}/copy`: sao chep category thanh ban ghi moi `DRAFT`, `isDisplay=0`, `newData=null`, `rejectReason=null`.

### 8. API endpoint cu da chinh/deprecated
- `POST /api/admin/categories`: tao `DRAFT`, `isDisplay=0`, `isActive` theo request hoac default `1`; khong tu public.
- `PUT /api/admin/categories/{id}` va `PATCH /api/admin/categories/{id}`: khong cho doi status truc tiep; xu ly theo workflow status hien tai.
- `PATCH /api/admin/categories/{id}/status`: giu endpoint de tuong thich route cu nhung backend tra loi nghiep vu, yeu cau dung endpoint workflow `submit/approve/reject/cancel-approve`.
- `PATCH /api/admin/categories/{id}/display` va batch display: chi cho `APPROVED + isActive=1`.

### 9. Business rule da implement
- Create: tao `DRAFT`, `newData=null`, `rejectReason=null`, `isDisplay=0`, `isActive` default `1`; neu `isActive=0` thi van ep `isDisplay=0`.
- Submit-create: tao `PENDING`, `isDisplay=0`, `isActive` default `1`, khong public.
- Update:
  - `DRAFT`: sua truc tiep vao ban ghi chinh, clear `newData`.
  - `PENDING`: chan update.
  - `APPROVED`: chan update truc tiep.
  - `REJECTED` va `CANCEL_APPROVE`: luu thay doi vao `newData`, khong apply vao ban ghi chinh; submit sau do moi chuyen `PENDING`.
  - `isActive=0` luon ep `isDisplay=0`; `isActive=1` khong tu bat public.
- Submit: chi cho `DRAFT`, `REJECTED`, `CANCEL_APPROVE`; validate current data hoac preview `newData` truoc khi chuyen `PENDING`.
- Approve: chi cho `PENDING`; apply `newData` neu co, clear `newData/rejectReason`, set `APPROVED`; khong tu bat `isDisplay`; neu `isActive=0` thi ep `isDisplay=0`.
- Reject: chi cho `PENDING`; bat buoc reason khong blank; set `REJECTED`, luu `rejectReason`, an public. He thong giu `newData` khi reject de frontend co the mo modal so sanh old/new va submit lai sau khi chinh.
- Cancel approve: chi cho `APPROVED`; set `CANCEL_APPROVE`, clear `newData/rejectReason`, ep `isDisplay=0` de khong con public.
- Delete: chi cho `DRAFT`, `REJECTED`, `CANCEL_APPROVE`; chan neu `PENDING/APPROVED`, dang `isDisplay=1`, co `newData`, hoac dang duoc Tour su dung.
- Copy/duplicate: cho copy moi trang thai; ban ghi moi `DRAFT`, `isDisplay=0`, copy mo ta/anh/displayOrder/isActive, clear `newData/rejectReason`. Do Oracle xem chuoi rong la null va cot `NAME` dang `NOT NULL`, backend luu `name=" "` de bieu dien ten can nhap lai; slug tam co format `copy-{sourceId}-{timestamp}`.
- Display: chi cho `APPROVED + isActive=1`; neu `isActive=0` backend ep hide va tra loi business error khi yeu cau show.
- Public filter: `GET /api/public/categories` chi tra `APPROVED + isActive=1 + isDisplay=1`; `newData/rejectReason` khong expose khi null.

### 10. RBAC/SecurityConfig thay doi
- Them matcher `POST /api/admin/categories/submit-create` cho `STAFF`, `ADMIN`, `SUPER_ADMIN`.
- Them matcher `POST /api/admin/categories/*/copy` cho `STAFF`, `ADMIN`, `SUPER_ADMIN`.
- Giu rule cu: batch workflow/display cho `ADMIN/SUPER_ADMIN`, delete cho `SUPER_ADMIN`.

### 11. Checklist test da chay va ket qua
- Da chay context/schema validation qua `./mvnw.cmd clean test`: pass.
- Da chay compile sau khi sua service: pass.
- Manual checklist nghiep vu chua chay HTTP E2E day du trong turn nay; cac rule da enforce tai service va duoc cover boi Spring context test toi thieu.

### 12. Ket qua build/test
- `./mvnw.cmd clean test`: BUILD SUCCESS, tests run 1, failures 0, errors 0.
- `./mvnw.cmd clean package -DskipTests`: BUILD SUCCESS.

### 13. Warning/loi con lai
- Warning hien huu khi test: OracleDialect explicit, JDBC fetch size thap, open-in-view, SpringDoc endpoint enabled, Lombok Unsafe deprecated, Mockito dynamic agent.
- Git canh bao line ending LF se duoc thay CRLF khi Git touch file tren Windows; khong anh huong compile.

### 14. Ghi chu ky thuat/rui ro con lai
- PMH source file `ImplGroupCategoryService.java` va `GroupCategoryController.java` khong tim thay trong `D:\HHTL\Voyage_Viet`, nen implementation dua tren yeu cau nghiep vu va style Category/Destination hien co.
- Endpoint `/status` bi chan de tranh client doi workflow tuy y, nhung chua xoa de khong pha route cu.
- Copy category dung blank placeholder `name=" "` vi Oracle khong luu duoc empty string vao cot `NAME NOT NULL`; frontend nen bat user nhap lai name/slug truoc khi submit.
