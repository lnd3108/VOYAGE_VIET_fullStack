# Báo cáo backend VoyageViet — bản sạch

Ngày tổng hợp: 2026-06-11  
Phạm vi: `voyage-backend`  
Công nghệ chính: Spring Boot 4, Java 17, Spring WebMVC, Spring Security, JWT, Spring Data JPA, Oracle, Bean Validation, Springdoc OpenAPI, Cloudinary, WebSocket STOMP.

Tài liệu này là bản đã làm sạch từ report backend cũ: sửa lỗi encoding tiếng Việt, bỏ các mục cập nhật trùng lặp, bỏ phần ghi chú lan man/TODO cũ, và chỉ giữ các chức năng đã triển khai đến trạng thái cuối cùng.

---

## 1. Tổng quan chức năng đã hoàn thành

| Nhóm | Chức năng đã làm |
|---|---|
| Auth | Đăng ký, đăng nhập, JWT access token, refresh token rotation, logout, quên mật khẩu, đặt lại mật khẩu, xác thực email. |
| User/Profile | Lấy thông tin user hiện tại, cập nhật hồ sơ, upload avatar Cloudinary, admin quản lý user, cập nhật trạng thái/role, xem chi tiết user. |
| Role/RBAC | Role `USER`, `STAFF`, `ADMIN`, `SUPER_ADMIN`; hierarchy `SUPER_ADMIN > ADMIN > STAFF > USER`; phân quyền riêng cho workflow category/destination và media theo module. |
| Category | Workflow PMH-style: nháp, gửi duyệt, duyệt, từ chối, hủy duyệt; tách `isActive` và `isDisplay`; public chỉ hiện category được duyệt, đang hoạt động và được bật hiển thị. |
| Destination | Workflow duyệt tương tự: nháp, gửi duyệt, duyệt, từ chối, hủy duyệt; public chỉ hiện destination đã duyệt và được bật hiển thị. |
| Tour Public | Tìm/lọc/phân trang tour, tour nổi bật, chi tiết tour, lịch khởi hành public, lịch trình public, review public. |
| Tour Admin | CRUD tour, publish checklist, nhân bản tour sang bản nháp, quản lý schedule, itinerary, gallery, thumbnail, attach ảnh từ Media. |
| Booking | User đặt tour theo `scheduleId`, xem booking của mình, hủy booking; admin xem danh sách/chi tiết và cập nhật trạng thái booking. |
| Payment | Mock payment, tạo URL VNPay, callback UX, IPN xác nhận cuối, truy vấn trạng thái payment, admin payment list/detail, refund skeleton. |
| Promotion | Admin CRUD mã giảm giá, user validate mã giảm giá, tích hợp promotion vào booking, lưu lịch sử dùng mã và chống dùng quá lượt. |
| Notification | Lưu thông báo in-app, unread count, mark read/read all/delete, WebSocket STOMP cơ bản, hook thông báo từ booking/payment/review. |
| Review | User tạo đánh giá tour, public xem review theo tour, admin duyệt/ẩn/xóa review. |
| Wishlist | User xem danh sách yêu thích và toggle tour yêu thích. |
| Media | Admin upload ảnh lên Cloudinary, xem danh sách media, xóa media; STAFF được giới hạn upload/list theo module được phép. |
| Feature Flag | Public lấy feature flags, admin bật/tắt feature flags, ghi audit khi toggle. |
| Admin Dashboard | Dashboard summary, monthly stats, review/top tour stats. |
| Admin Analytics | Revenue analytics, booking stats, top tours, payment stats, promotion usage stats. |
| Audit Log | Admin xem audit logs có lọc và phân trang. |
| Oracle hardening | Migration/manual SQL cho schema Oracle, constraint enum, cột workflow, cột thống kê tour và backfill dữ liệu. |
| Encoding | Chuẩn hóa UTF-8 bằng `.editorconfig`, Maven source/reporting encoding và servlet encoding. |

---

## 2. Cấu hình nền tảng

| Hạng mục | Giá trị hiện có |
|---|---|
| Server port | `8081` |
| Database | Oracle JDBC |
| ORM | Spring Data JPA / Hibernate |
| Auth | JWT stateless, header `Authorization: Bearer <token>` |
| Password | BCrypt |
| CORS local | `http://localhost:4200` |
| Swagger/OpenAPI | `/swagger-ui/**`, `/swagger-ui.html`, `/v3/api-docs/**` |
| Upload local | Tối đa `5MB`/file và `5MB`/request |
| Response success | `success`, `message`, `data`, `timestamp` |
| Response error | `success=false`, `message`, `error`, `timestamp` |
| Paging | `content`, `page`, `size`, `totalElements`, `totalPages`, `first`, `last`, `empty`, `sortBy`, `sortDir` |
| Charset | UTF-8 cho source, report, servlet request/response |

---

## 3. Phân quyền hiện tại

| Nhóm API | Quyền |
|---|---|
| `/api/public/**` | Public |
| `/api/auth/**` | Public |
| Swagger/OpenAPI | Public |
| `/api/admin/**` | Admin theo role matcher cụ thể |
| `/api/users/**` | Authenticated + role phù hợp theo hierarchy |
| `/api/notifications/**` | Authenticated |
| `/api/payments/vnpay/callback` | Public |
| `/api/payments/vnpay/ipn` | Public |
| `/ws/**` | Cho phép handshake WebSocket |

Role hierarchy:

```text
SUPER_ADMIN > ADMIN > STAFF > USER
```

Phân quyền Category cuối cùng:

| Action | STAFF | ADMIN | SUPER_ADMIN |
|---|---:|---:|---:|
| Xem danh sách admin category | Có | Có | Có |
| Tạo/sửa/gửi duyệt/cập nhật ảnh category | Có | Có | Có |
| Duyệt/từ chối/hủy duyệt/bật tắt hiển thị | Không | Có | Có |
| Batch workflow category | Không | Có | Có |
| Xóa category | Không | Không | Có |

Phân quyền Media cho STAFF:

- STAFF được `GET /api/admin/media?module=categories` và `POST /api/admin/media/upload` với `module=categories`.
- STAFF được mở quyền media tương ứng cho destination workflow khi cần quản lý destination.
- STAFF không được list toàn bộ media và không được xóa media.
- ADMIN/SUPER_ADMIN giữ toàn quyền media admin.

---

## 4. Schema và entity chính

| Bảng | Entity | Chức năng |
|---|---|---|
| `ROLES` | `Role` | Lưu role hệ thống. |
| `USERS` | `User` | Tài khoản user/admin, trạng thái, role, avatar, email verified. |
| `REFRESH_TOKENS` | `RefreshToken` | Lưu refresh token đã hash, expiry và revoke. |
| `EMAIL_TOKENS` | `EmailToken` | Token reset password và verify email. |
| `CATEGORIES` | `Category` | Danh mục tour, workflow duyệt, `isActive`, `isDisplay`, `newData`, `rejectReason`. |
| `DESTINATIONS` | `Destination` | Điểm đến, workflow duyệt, `isDisplay`, `newData`, `rejectReason`. |
| `TOURS` | `Tour` | Tour du lịch, category/destination, giá, trạng thái, thống kê, tags. |
| `TOUR_SCHEDULES` | `TourSchedule` | Lịch khởi hành, giá theo nhóm khách, số ghế, optimistic locking. |
| `TOUR_ITINERARIES` | `TourItinerary` | Lịch trình từng ngày. |
| `TOUR_IMAGES` | `TourImage` | Gallery ảnh tour, thumbnail, source `DIRECT_UPLOAD` hoặc `MEDIA`. |
| `BOOKINGS` | `Booking` | Đơn đặt tour, liên hệ, số khách, snapshot giá, trạng thái booking/payment. |
| `PAYMENTS` | `Payment` | Payment attempts, VNPay/mock, gateway response, refund skeleton. |
| `PROMOTIONS` | `Promotion` | Mã giảm giá/campaign. |
| `PROMOTION_USAGES` | `PromotionUsage` | Lịch sử dùng mã giảm giá. |
| `REVIEWS` | `Review` | Đánh giá tour. |
| `WISHLISTS` | `Wishlist` | Danh sách tour yêu thích của user. |
| `MEDIA` | `Media` | Metadata file Cloudinary. |
| `FEATURE_FLAGS` | `FeatureFlag` | Bật/tắt tính năng. |
| `NOTIFICATIONS` | `Notification` | Thông báo in-app theo user. |
| `AUDIT_LOGS` | `AuditLog` | Lịch sử thao tác admin. |

---

## 5. Enum chính đang dùng

| Enum | Giá trị |
|---|---|
| `RoleCode` | `USER`, `STAFF`, `ADMIN`, `SUPER_ADMIN` |
| `UserStatus` | `ACTIVE`, `INACTIVE`, `BANNED` |
| `CategoryStatus` | `DRAFT`, `PENDING`, `APPROVED`, `REJECTED`, `CANCEL_APPROVE` |
| `DestinationStatus` | `DRAFT`, `PENDING`, `APPROVED`, `REJECTED`, `CANCEL_APPROVE` |
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
| `EmailTokenType` | `PASSWORD_RESET`, `EMAIL_VERIFY` |
| `TourImageSourceType` | `DIRECT_UPLOAD`, `MEDIA` |

---

## 6. API đã triển khai theo nhóm

### 6.1 Common / Home / Health

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| GET | `/api/public/ping` | Public | Kiểm tra backend public. |
| GET | `/api/public/test-error` | Public | Test response lỗi business. |
| GET | `/api/admin/ping` | Admin | Kiểm tra API admin. |
| GET | `/api/public/home` | Public | Lấy dữ liệu trang chủ. |

### 6.2 Auth

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Đăng ký tài khoản. |
| POST | `/api/auth/login` | Public | Đăng nhập, trả access token và refresh token. |
| POST | `/api/auth/refresh` | Public | Rotate refresh token và cấp access token mới. |
| POST | `/api/auth/logout` | Public | Revoke refresh token. |
| POST | `/api/auth/forgot-password` | Public | Tạo token đặt lại mật khẩu. |
| POST | `/api/auth/reset-password` | Public | Đặt lại mật khẩu bằng token. |
| POST | `/api/auth/verify-email` | Public | Xác thực email bằng token. |

### 6.3 User / Role / Wishlist

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| GET | `/api/users/me` | Authenticated | Lấy thông tin user hiện tại. |
| PUT | `/api/users/me` | Authenticated | Cập nhật hồ sơ cá nhân. |
| POST | `/api/users/me/avatar` | Authenticated | Upload avatar. |
| GET | `/api/users/me/wishlist` | Authenticated | Lấy wishlist có phân trang. |
| POST | `/api/users/me/wishlist/{tourId}` | Authenticated | Toggle tour yêu thích. |
| GET | `/api/public/roles` | Public | Lấy danh sách role. |
| GET | `/api/admin/users` | Admin | Lấy danh sách user có lọc/phân trang. |
| GET | `/api/admin/users/{id}` | Admin | Xem chi tiết user. |
| PATCH | `/api/admin/users/{id}/status` | Admin | Cập nhật trạng thái user. |
| PATCH | `/api/admin/users/{id}/role` | Admin | Cập nhật role user. |

### 6.4 Category workflow

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| GET | `/api/public/categories` | Public | Lấy category public: `APPROVED + isActive=1 + isDisplay=1`. |
| GET | `/api/admin/categories` | STAFF+ | Lấy danh sách category admin. |
| POST | `/api/admin/categories` | STAFF+ | Tạo category nháp. |
| POST | `/api/admin/categories/submit-create` | STAFF+ | Tạo category và gửi duyệt ngay. |
| POST | `/api/admin/categories/{id}/copy` | STAFF+ | Sao chép category sang bản nháp. |
| PUT | `/api/admin/categories/{id}` | STAFF+ | Sửa category theo workflow. |
| PATCH | `/api/admin/categories/{id}` | STAFF+ | Patch category theo workflow. |
| PATCH | `/api/admin/categories/{id}/submit` | STAFF+ | Gửi duyệt category. |
| PATCH | `/api/admin/categories/{id}/approve` | ADMIN+ | Duyệt category. |
| PATCH | `/api/admin/categories/{id}/reject` | ADMIN+ | Từ chối category, bắt buộc lý do. |
| PATCH | `/api/admin/categories/{id}/cancel-approve` | ADMIN+ | Hủy duyệt category đã duyệt. |
| PATCH | `/api/admin/categories/{id}/display` | ADMIN+ | Bật/tắt hiển thị public. |
| PATCH | `/api/admin/categories/{id}/image` | STAFF+ | Cập nhật ảnh category theo workflow. |
| DELETE | `/api/admin/categories/{id}` | SUPER_ADMIN | Xóa category nếu thỏa rule. |
| PATCH | `/api/admin/categories/batch/submit` | ADMIN+ | Gửi duyệt hàng loạt. |
| PATCH | `/api/admin/categories/batch/approve` | ADMIN+ | Duyệt hàng loạt. |
| PATCH | `/api/admin/categories/batch/reject` | ADMIN+ | Từ chối hàng loạt. |
| PATCH | `/api/admin/categories/batch/cancel-approve` | ADMIN+ | Hủy duyệt hàng loạt. |
| PATCH | `/api/admin/categories/batch/display` | ADMIN+ | Bật/tắt public hàng loạt. |

Rule cuối cùng của Category:

- Create thường tạo `DRAFT`, `isDisplay=0`, `newData=null`.
- Submit-create tạo `PENDING`, chưa public.
- Chỉ `APPROVED + isActive=1 + isDisplay=1` mới xuất hiện ở public.
- `isActive` chỉ có ý nghĩa với category đã `APPROVED`.
- Update category đã duyệt không apply trực tiếp vào dữ liệu public, mà lưu thay đổi vào `newData`.
- Approve sẽ merge `newData`, clear `newData/rejectReason`.
- Reject bắt buộc có lý do và giữ dữ liệu thay đổi để người dùng xem/sửa/gửi lại.
- Cancel approve chuyển về `CANCEL_APPROVE`, force `isDisplay=0`.
- Delete bị chặn nếu đang `PENDING/APPROVED`, đang public, còn `newData`, hoặc đã được tour sử dụng.
- Endpoint `/status` vẫn tồn tại cho compatibility nhưng bị chặn đổi workflow trực tiếp bằng business validation.

### 6.5 Destination workflow

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| GET | `/api/public/destinations` | Public | Lấy destination public: `APPROVED + isDisplay=1`. |
| GET | `/api/admin/destinations` | STAFF+ | Lấy danh sách destination admin. |
| POST | `/api/admin/destinations` | STAFF+ | Tạo destination nháp. |
| PUT | `/api/admin/destinations/{id}` | STAFF+ | Sửa destination theo workflow. |
| PATCH | `/api/admin/destinations/{id}` | STAFF+ | Patch destination theo workflow. |
| PATCH | `/api/admin/destinations/{id}/submit` | STAFF+ | Gửi duyệt destination. |
| PATCH | `/api/admin/destinations/{id}/approve` | ADMIN+ | Duyệt destination. |
| PATCH | `/api/admin/destinations/{id}/reject` | ADMIN+ | Từ chối destination. |
| PATCH | `/api/admin/destinations/{id}/cancel-approve` | ADMIN+ | Hủy duyệt destination. |
| PATCH | `/api/admin/destinations/{id}/display` | ADMIN+ | Bật/tắt hiển thị public. |
| PATCH | `/api/admin/destinations/{id}/image` | STAFF+ | Cập nhật ảnh destination theo workflow. |
| DELETE | `/api/admin/destinations/{id}` | SUPER_ADMIN | Xóa destination nếu thỏa rule. |
| PATCH | `/api/admin/destinations/batch/submit` | ADMIN+ | Gửi duyệt hàng loạt. |
| PATCH | `/api/admin/destinations/batch/approve` | ADMIN+ | Duyệt hàng loạt. |
| PATCH | `/api/admin/destinations/batch/reject` | ADMIN+ | Từ chối hàng loạt. |
| PATCH | `/api/admin/destinations/batch/cancel-approve` | ADMIN+ | Hủy duyệt hàng loạt. |
| PATCH | `/api/admin/destinations/batch/display` | ADMIN+ | Bật/tắt public hàng loạt. |

Rule cuối cùng của Destination:

- Legacy `ACTIVE` được migrate sang `APPROVED + isDisplay=1`.
- Legacy `INACTIVE` được migrate sang `APPROVED + isDisplay=0`.
- Create tạo `DRAFT + isDisplay=0`.
- Update/patch/image update lưu vào `newData` và chuyển `PENDING`, không apply ngay vào bản public.
- Public chỉ trả `APPROVED + isDisplay=1`.
- Admin dashboard count đã đổi theo destination/category workflow mới.
- STAFF được mở quyền tham chiếu `GET /api/admin/locations/provinces` để form destination hoạt động.

### 6.6 Tour public

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| GET | `/api/public/tours` | Public | Tìm kiếm, lọc, phân trang tour public. |
| GET | `/api/public/tours/featured` | Public | Lấy tour nổi bật. |
| GET | `/api/public/tours/{slug}` | Public | Lấy chi tiết tour theo slug. |
| GET | `/api/public/tours/{slug}/schedules` | Public | Lấy lịch khởi hành public còn mở. |
| GET | `/api/public/tours/{slug}/itinerary` | Public | Lấy lịch trình public. |
| GET | `/api/public/tours/{tourSlug}/reviews` | Public | Lấy review public của tour. |

Tour public đã hỗ trợ lọc theo keyword, category, destination, region, departure location, giá, số ngày, số khách, paging và sort.

### 6.7 Tour admin

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| GET | `/api/admin/tours` | Admin | Lấy danh sách tour admin. |
| GET | `/api/admin/tours/{id}` | Admin | Lấy chi tiết tour admin. |
| POST | `/api/admin/tours` | Admin | Tạo tour. |
| PUT | `/api/admin/tours/{id}` | Admin | Cập nhật tour. |
| PATCH | `/api/admin/tours/{id}/status` | Admin | Cập nhật trạng thái tour. |
| DELETE | `/api/admin/tours/{id}` | Admin | Xóa tour. |
| PATCH | `/api/admin/tours/{id}/thumbnail` | Admin | Cập nhật thumbnail bằng URL. |
| GET | `/api/admin/tours/{id}/publish-checklist` | Admin | Lấy checklist trước khi publish. |
| POST | `/api/admin/tours/{id}/publish` | Admin | Publish tour nếu đạt checklist. |
| POST | `/api/admin/tours/{id}/duplicate` | Admin | Nhân bản tour sang bản nháp. |

Tour đã có thêm:

- `isDomestic`.
- `avgRating`.
- `totalReviews`.
- `highlightTags`.
- `minPrice`.
- Search/sort effective price ưu tiên `minPrice`, fallback `salePrice`, `originalPrice`.
- Hook recompute `minPrice` khi schedule thay đổi.
- Hook recompute rating summary khi review thay đổi.

### 6.8 Tour schedule / itinerary / image

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| POST | `/api/admin/tours/{id}/schedules` | Admin | Tạo lịch khởi hành. |
| GET | `/api/admin/tours/{id}/schedules` | Admin | Lấy lịch khởi hành admin. |
| GET | `/api/admin/tours/{tourId}/schedules/{id}` | Admin | Lấy chi tiết lịch. |
| PUT | `/api/admin/tours/{tourId}/schedules/{id}` | Admin | Cập nhật lịch. |
| DELETE | `/api/admin/tours/{tourId}/schedules/{id}` | Admin | Xóa lịch nếu chưa có booking. |
| PATCH | `/api/admin/tours/{tourId}/schedules/{id}/status` | Admin | Cập nhật trạng thái lịch. |
| POST | `/api/admin/tours/{tourId}/schedules/{id}/duplicate` | Admin | Nhân bản lịch. |
| GET | `/api/admin/tours/{id}/itineraries` | Admin | Lấy lịch trình admin. |
| PUT | `/api/admin/tours/{id}/itineraries` | Admin | Lưu replace-all lịch trình. |
| POST | `/api/admin/tours/{id}/itineraries/reorder` | Admin | Sắp xếp lịch trình. |
| GET | `/api/admin/tours/{id}/images` | Admin | Lấy gallery ảnh tour. |
| POST | `/api/admin/tours/{id}/images` | Admin | Upload ảnh tour. |
| POST | `/api/admin/tours/{id}/images/from-media` | Admin | Attach ảnh từ Admin Media vào gallery. |
| DELETE | `/api/admin/tours/{tourId}/images/{imageId}` | Admin | Xóa ảnh tour. |
| PATCH | `/api/admin/tours/{tourId}/images/{imageId}/thumbnail` | Admin | Đặt thumbnail. |
| PATCH | `/api/admin/tours/{id}/images/reorder` | Admin | Sắp xếp gallery. |
| PATCH | `/api/admin/tours/{tourId}/images/{imageId}/alt` | Admin | Cập nhật alt text. |

Rule chính:

- Schedule dùng `@Version` để chống oversell.
- Schedule tự chuyển `FULL` khi booked seats đạt max seats.
- Public schedule chỉ trả lịch `OPEN` và `departureDate >= today`.
- Itinerary không được trùng `dayNumber` trong cùng tour.
- Gallery tối đa 10 ảnh/tour, chỉ một thumbnail.
- Ảnh attach từ Media không xóa asset Cloudinary gốc khi xóa khỏi tour gallery.

### 6.9 Booking

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| POST | `/api/bookings` | Authenticated | Tạo booking theo `scheduleId`. |
| GET | `/api/bookings/me` | Authenticated | Lấy booking của user hiện tại. |
| PATCH | `/api/bookings/{id}/cancel` | Authenticated | User hủy booking của mình. |
| GET | `/api/admin/bookings` | Admin | Admin lấy danh sách booking. |
| GET | `/api/admin/bookings/{id}` | Admin | Admin xem chi tiết booking. |
| PATCH | `/api/admin/bookings/{id}/status` | Admin | Admin cập nhật trạng thái booking. |

Rule booking:

- Booking mới bắt buộc có `scheduleId`.
- Hệ thống snapshot giá tại thời điểm đặt.
- Booking `PENDING` vẫn giữ chỗ để tránh oversell.
- Khi hủy booking, ghế được release lại schedule.
- Nếu schedule đang `FULL` và có ghế được release, trạng thái có thể chuyển lại `OPEN`.
- Có scheduler tự hủy booking `PENDING` quá hạn, release ghế và fail payment pending quá hạn.

### 6.10 Payment

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| POST | `/api/payments/vnpay/create` | Authenticated | Tạo payment attempt và URL VNPay. |
| GET | `/api/payments/vnpay/callback` | Public | Callback redirect UX sau thanh toán. |
| POST | `/api/payments/vnpay/ipn` | Public | IPN xác nhận cuối từ VNPay. |
| GET | `/api/payments/bookings/{bookingId}` | Authenticated | Lấy trạng thái payment của booking. |
| POST | `/api/payments/mock` | Authenticated | Hoàn tất mock payment nếu `payment.mock-enabled=true`. |
| GET | `/api/admin/payments` | Admin | Admin list payment. |
| GET | `/api/admin/payments/{id}` | Admin | Admin xem chi tiết payment. |
| POST | `/api/admin/payments/{id}/refund` | Admin | Refund skeleton an toàn. |

Rule payment:

- IPN là nguồn xác nhận cuối.
- Không cho tạo payment nếu booking không hợp lệ hoặc đã thanh toán thành công.
- Payment success cập nhật `BookingPaymentStatus=PAID`.
- Payment failed cập nhật trạng thái payment tương ứng.
- Refund skeleton lưu thông tin refund, chưa gọi cổng refund thật.

### 6.11 Promotion

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| POST | `/api/admin/promotions` | Admin | Tạo mã giảm giá. |
| GET | `/api/admin/promotions` | Admin | Lấy danh sách promotion. |
| GET | `/api/admin/promotions/{id}` | Admin | Xem chi tiết promotion. |
| PUT | `/api/admin/promotions/{id}` | Admin | Cập nhật promotion. |
| DELETE | `/api/admin/promotions/{id}` | Admin | Xóa promotion nếu hợp lệ. |
| POST | `/api/promotions/validate` | Authenticated | User validate mã giảm giá. |

Rule promotion:

- Hỗ trợ giảm theo phần trăm hoặc số tiền cố định.
- Có min order, max discount, max uses, max uses per user.
- Lưu `PromotionUsage` khi booking sử dụng mã.
- Chặn dùng quá lượt và chặn mã hết hạn/không active.

### 6.12 Notification

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| GET | `/api/notifications` | Authenticated | Lấy notification của user có phân trang/lọc read state. |
| GET | `/api/notifications/unread-count` | Authenticated | Lấy số thông báo chưa đọc. |
| PATCH | `/api/notifications/{id}/read` | Authenticated | Mark một notification đã đọc. |
| PATCH | `/api/notifications/read-all` | Authenticated | Mark tất cả đã đọc. |
| DELETE | `/api/notifications/{id}` | Authenticated | Xóa notification của user. |
| WebSocket | `/ws` | Handshake | STOMP endpoint cho realtime notification. |

Notification hook đã nối vào:

- Booking created/cancelled/confirmed/expired.
- Payment VNPay/mock success/failed/refund skeleton.
- Review active/hidden.

### 6.13 Review

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| POST | `/api/reviews` | Authenticated | Tạo đánh giá tour. |
| GET | `/api/public/tours/{tourSlug}/reviews` | Public | Lấy review public theo tour. |
| GET | `/api/admin/reviews` | Admin | Admin lấy danh sách review. |
| PATCH | `/api/admin/reviews/{id}/status` | Admin | Cập nhật trạng thái review. |
| DELETE | `/api/admin/reviews/{id}` | Admin | Xóa review. |

### 6.14 Media

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| GET | `/api/admin/media` | Admin / STAFF giới hạn | Lấy danh sách media theo quyền. |
| POST | `/api/admin/media/upload` | Admin / STAFF giới hạn | Upload ảnh Cloudinary. |
| DELETE | `/api/admin/media/{id}` | Admin | Xóa media. |

### 6.15 Feature Flag

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| GET | `/api/public/features` | Public | Lấy map feature flag public. |
| GET | `/api/admin/features` | Admin | Lấy tất cả feature flags. |
| PATCH | `/api/admin/features/{code}` | Admin | Bật/tắt feature flag. |

### 6.16 Admin Dashboard / Analytics / Audit

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| GET | `/api/admin/dashboard/summary` | Admin | Thống kê tổng quan dashboard. |
| GET | `/api/admin/dashboard/monthly` | Admin | Thống kê theo tháng. |
| GET | `/api/admin/dashboard/reviews` | Admin | Thống kê review/top rated tour. |
| GET | `/api/admin/analytics/revenue` | Admin | Revenue analytics theo khoảng ngày. |
| GET | `/api/admin/analytics/bookings` | Admin | Booking analytics nâng cao. |
| GET | `/api/admin/analytics/top-tours` | Admin | Top tours theo revenue/bookings/rating. |
| GET | `/api/admin/analytics/payments` | Admin | Payment analytics theo method/status. |
| GET | `/api/admin/analytics/promotions` | Admin | Promotion usage analytics. |
| GET | `/api/admin/audit-logs` | Admin | Lấy audit logs có lọc/phân trang. |

---

## 7. Luồng nghiệp vụ chính đã hoàn thành

### 7.1 Auth

- Register tạo user mặc định role `USER`.
- Login trả access token, refresh token, token type, expires in và user.
- Refresh token dùng rotation: token cũ bị revoke, token mới được tạo.
- Logout revoke refresh token.
- Forgot/reset password dùng `EMAIL_TOKENS` type `PASSWORD_RESET`.
- Verify email dùng `EMAIL_TOKENS` type `EMAIL_VERIFY`.
- Email service có thể gửi mail thật qua `JavaMailSender` khi enabled, fallback log link ở local/dev.

### 7.2 Category PMH-style

- Tạo mới thường: `DRAFT`.
- Tạo mới và gửi duyệt: `PENDING`.
- Sửa `DRAFT`: cập nhật trực tiếp.
- Sửa `APPROVED`: lưu vào `newData`, chờ duyệt.
- Submit: chuyển `DRAFT/REJECTED/CANCEL_APPROVE` sang `PENDING`.
- Approve: merge `newData`, clear `newData/rejectReason`, chuyển `APPROVED`.
- Reject: chuyển `REJECTED`, bắt buộc có `rejectReason`, giữ `newData`.
- Cancel approve: chuyển `CANCEL_APPROVE`, force `isDisplay=0`.
- Public chỉ trả `APPROVED + isActive=1 + isDisplay=1`.

### 7.3 Destination workflow

- Destination đã chuyển từ `ACTIVE/INACTIVE` sang workflow duyệt.
- Public chỉ trả `APPROVED + isDisplay=1`.
- Update/patch/image update tạo `newData` và chờ approve.
- Batch workflow đã có đủ submit/approve/reject/cancel/display.
- Browser QA/RBAC đã mở quyền endpoint tỉnh/thành cho STAFF để form destination hoạt động.

### 7.4 Tour publish

- Tour public chỉ hiển thị tour phù hợp trạng thái public.
- Publish tour yêu cầu đủ thông tin cơ bản, category, destination, thumbnail/gallery, itinerary, schedule `OPEN`, giá và ghế hợp lệ.
- Schedule là nguồn chính cho giá theo người lớn/trẻ em/em bé và số ghế còn lại.
- Tour duplicate tạo bản nháp, copy itinerary/images, không copy schedules.

### 7.5 Booking theo lịch khởi hành

- User chọn `scheduleId` khi đặt tour.
- Giá được snapshot vào booking tại thời điểm đặt.
- `bookedSeats` tăng khi tạo booking `PENDING`.
- Hủy booking sẽ release ghế.
- Scheduler tự hủy booking quá hạn, fail payment pending quá hạn và tạo notification.

### 7.6 Payment/VNPay

- Tạo payment attempt trước khi điều hướng VNPay.
- Callback phục vụ UX sau khi người dùng quay về.
- IPN xác nhận cuối và cập nhật payment/booking.
- Mock payment phục vụ test nội bộ khi bật cấu hình.
- Admin payment detail/list/refund skeleton đã có.

### 7.7 Promotion

- Mã giảm giá validate trước khi áp dụng.
- Booking create có thể dùng promotion.
- Usage được lưu để chống vượt số lượt dùng toàn cục và theo user.

### 7.8 Notification realtime

- Notification được lưu DB và có unread count.
- WebSocket STOMP push notification realtime.
- Notification lỗi không rollback nghiệp vụ chính vì hook có catch an toàn.

---

## 8. Migration/schema đã có

| Migration/manual SQL | Nội dung |
|---|---|
| `V20260604_01_schema_hardening.sql` | Làm cứng Oracle schema cho role, feature, audit action, tour stats, gallery source và backfill stats. |
| `V20260609_02_destination_workflow_status_is_display.sql` | Thêm workflow cho Destination, migrate legacy `ACTIVE/INACTIVE`, thêm `IS_DISPLAY`, `NEW_DATA`, `REJECT_REASON`, constraint Oracle. |
| `V20260610_01_category_is_active_pmh_workflow.sql` | Thêm `IS_ACTIVE`, hardening category workflow, constraint `STATUS/IS_DISPLAY/IS_ACTIVE`, đảm bảo public rule mới. |

---

## 9. Kết quả kiểm tra/build gần nhất đã ghi nhận

| Hạng mục | Kết quả |
|---|---|
| Backend package | `./mvnw.cmd clean package -DskipTests`: BUILD SUCCESS |
| Backend test | `./mvnw.cmd clean test`: BUILD SUCCESS |
| Category workflow E2E | Đã test create, submit, reject, approve, display, patch approved tạo `newData`, public filter, delete rule. |
| Category batch workflow | Đã test batch submit/approve/reject/cancel/display. |
| Category RBAC | Đã test STAFF/ADMIN/SUPER_ADMIN theo matrix quyền. |
| Category Media STAFF | Đã test STAFF chỉ truy cập media module được phép. |
| Destination workflow E2E | Đã test DB migration, workflow API, public filter, RBAC, media module và build. |
| Browser QA RBAC integration | Đã mở `GET /api/admin/locations/provinces` cho STAFF, xác nhận media all vẫn bị chặn. |
| Encoding | Đã cấu hình UTF-8 và sửa report/source liên quan. |

---

## 10. Ghi chú hiện trạng

- Backend đã có đầy đủ foundation cho public booking/tour, admin category/destination workflow, tour management, booking/payment/promotion/review/media/feature/notification/audit/analytics.
- Category reorder endpoint riêng chưa được ghi nhận trong report backend cuối cùng, nên frontend không nên dùng `PUT /api/admin/categories/{id}` để reorder.
- Một số module admin có API backend đã sẵn sàng nhưng frontend có thể chưa nối đủ UI.
- Tài liệu này không giữ các mục TODO cũ, chỉ ghi lại phần đã triển khai.
