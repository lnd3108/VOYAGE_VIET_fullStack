# Voyage Frontend Audit Report — Bản Rút Gọn Sạch Encoding

Ngày tổng hợp: 2026-06-12

Phạm vi: `voyage-frontend/src`

Mục tiêu bản này: sửa lỗi encoding tiếng Việt, bỏ các mục trùng lặp/lặp lại theo từng lần build, chỉ giữ lại các chức năng đã hoàn thiện đến thời điểm cuối cùng trong file gốc.

## 1. Tổng quan kỹ thuật đã hoàn thiện

- Frontend dùng Angular standalone components.
- UI dùng Taiga UI kết hợp SCSS custom.
- API base URL lấy từ `src/environments/environment.ts`:

```ts
apiUrl: 'http://localhost:8081/api'
```

- Đã cấu hình `provideHttpClient(withInterceptors([authInterceptor]))`.
- `authInterceptor` tự gắn header `Authorization: Bearer ...` từ `AuthService.accessToken()`.
- Public layout bọc các route public.
- Admin layout bọc các route `/admin/**`.
- `/my-bookings`, `/profile`, `/wishlist`, `/booking/checkout` dùng `authGuard`.
- `/admin/**` dùng `adminGuard`.
- Route wildcard `**` redirect về `/`.

## 2. Auth và tài khoản người dùng

### Đăng nhập / Đăng ký

- Đã có màn `/login` và `/register`.
- `AuthService.login(request)` gọi `POST /api/auth/login`.
- `AuthService.register(request)` gọi `POST /api/auth/register`.
- `AuthService.me()` gọi `GET /api/users/me`.
- Đã lưu session vào localStorage thông qua `AuthService.saveSession()`.
- `AuthService.logout()` xóa session và điều hướng về `/login`.
- Login hỗ trợ `returnUrl`; user thường quay lại trang trước đó, admin về `/admin`.

### Quên mật khẩu

- Thêm route public `/forgot-password`.
- Form email dùng Reactive Forms.
- Validate required/email.
- Gọi `AuthService.forgotPassword(email)` → `POST /api/auth/forgot-password`.
- Hiển thị thông báo trung lập để tránh lộ email có tồn tại hay không.

### Đặt lại mật khẩu

- Thêm route public `/reset-password`.
- Đọc `token` từ query params.
- Nếu thiếu token, hiển thị error card và link gửi lại yêu cầu.
- Form mật khẩu mới/xác nhận mật khẩu dùng Reactive Forms.
- Validate required, minLength 8, confirm password khớp.
- Gọi `AuthService.resetPassword(payload)` → `POST /api/auth/reset-password`.
- Thành công hiển thị message và nút đăng nhập.
- Không tự login và không lưu reset token vào localStorage.

### Xác thực email

- Thêm route public `/verify-email`.
- Đọc `token` từ query params.
- Nếu thiếu token, không gọi API và hiển thị error card.
- Nếu có token, gọi API xác thực một lần trong `ngOnInit`.
- Gọi `AuthService.verifyEmail(token)` → `POST /api/auth/verify-email`.
- Có các trạng thái loading, success, error.
- Không tự đăng nhập sau verify email.
- Không lưu verify token vào browser storage.

### Hồ sơ cá nhân

- Thêm route `/profile` dưới PublicLayout, có `authGuard`.
- Tạo `UserApiService` để tách API user/profile khỏi `AuthService`.
- Trang profile gọi API lấy thông tin user hiện tại.
- Hiển thị profile card gồm avatar, họ tên, email, role/status, email verified, ngày tạo, ngày cập nhật.
- Form cập nhật thông tin gồm `fullName`, `email` read-only, `phone`.
- Gọi `UserApiService.updateMe(payload)` → `PUT /api/users/me`.
- Upload avatar bằng multipart qua `UserApiService.uploadAvatar(file)` → `POST /api/users/me/avatar`.
- Validate avatar: `png`, `jpeg`, `jpg`, `webp`, tối đa 5MB.
- Có preview avatar bằng `URL.createObjectURL`.
- Sau khi cập nhật profile/avatar thành công, đồng bộ lại `AuthService.updateCurrentUser()`.

## 3. Trang chủ và Home Hero

- Chỉnh dropdown “Số lượng” theo thiết kế: panel trắng, 2 dòng Người lớn / Trẻ em, nút `-` và `+`.
- Dropdown “Số lượng” căn theo width ô input bằng `tuiDropdownLimitWidth="fixed"`.
- Bỏ mũi tên xanh trong panel dropdown số lượng.
- Thêm clear value cho ô “Số lượng”.
- Chỉnh ô “Ngày đi” dùng trigger custom, calendar vẫn dùng `<tui-calendar *tuiDropdown />`.
- Mặc định ô “Ngày đi” hiển thị placeholder, chỉ hiện ngày sau khi chọn.
- Thêm clear value cho ô “Ngày đi”.
- Chỉnh chevron các ô search xoay mượt bằng CSS transition.
- Thêm clear value cho ô “Bạn muốn đi đâu?”.
- Chỉnh dropdown calendar để tránh UI bị bó hẹp và tránh scrollbar khó nhìn.

## 4. Danh sách tour public `/tours`

- Thay placeholder `/tours` bằng trang danh sách tour hoàn chỉnh.
- Dựng layout gồm breadcrumb, banner, chip điểm đến/khu vực, filter bar, grid tour, nút xem thêm và block mô tả cuối trang.
- Tái sử dụng `app-tour-card` để render dữ liệu tour.
- Kết nối query params trên URL.
- Khi query params thay đổi, trang tự gọi lại API bằng `switchMap` và hủy subscription bằng `takeUntilDestroyed`.
- Có helper chuẩn hóa response API để xử lý nhiều dạng payload.

### Query params đã hỗ trợ

- `keyword`
- `categorySlug`
- `destinationSlug`
- `region`
- `departureLocation`
- `minPrice`
- `maxPrice`
- `minDurationDays`
- `maxDurationDays`
- `people`
- `sortBy`
- `sortDir`
- `page`
- `size`

### Chức năng filter/sort

- Loại hình tour.
- Lọc theo giá.
- Điểm đi.
- Điểm đến.
- Số ngày.
- Số người.
- Sắp xếp: mới nhất, giá thấp đến cao, giá cao đến thấp.
- Chip nhanh: Hạ Long, Đà Nẵng, Phú Quốc, Quy Nhơn.
- Chip vùng: Tour Miền Bắc, Tour Miền Trung, Tour Miền Nam, Tour Tây Nguyên.
- Title section đổi theo context tìm kiếm/khu vực.
- Có loading, error và empty state.
- Nút `Xem thêm` cập nhật `page` query param và render lại danh sách.

### API đã nối

- `PublicApiService.getTours(params)` → `GET /api/public/tours`.

## 5. Chi tiết tour public `/tours/:slug`

- Thay placeholder `/tours/:slug` bằng trang chi tiết tour thật.
- Kế thừa `PublicLayout`, không thêm header/footer riêng.
- Dựng layout 2 cột: cột trái nội dung tour, cột phải booking card/sidebar sticky.
- Load dữ liệu theo `slug` route param.
- Có loading/error state.
- Schedules, itinerary, reviews lỗi riêng không làm sập toàn trang detail.
- Helper chuẩn hóa response xử lý `ApiResponse<T>`, `ApiResponse<T[]>`, `PageResponse<T>`, `ApiResponse<PageResponse<T>>`.

### Nội dung đã hiển thị

- Breadcrumb.
- Hero ảnh chính dùng `thumbnailUrl`, fallback `/hero/bg-home.png`.
- Gallery thumbnail fallback từ `thumbnailUrl`.
- Section `Thông Tin Tour` với mở rộng/thu gọn.
- Section `Lịch Trình Tour` theo `dayNumber`, meals, transport, placeNames nếu API có trả.
- Section `Lịch Khởi Hành`, cho phép chọn lịch.
- Section `Thông Tin Chi Tiết Giá Tour` với tab giá bao gồm, không bao gồm, phụ thu, hủy đổi, lưu ý.
- Section `Sản Phẩm Tour Liên Quan` dùng lại `app-tour-card`.
- Section `Đánh Giá Sản Phẩm` gồm điểm trung bình, tổng đánh giá, progress 5 sao đến 1 sao và danh sách review.
- Form bình luận dựng UI disabled, chưa gọi POST review.
- Booking card có chọn lịch, counter người lớn/trẻ em/em bé, mã giảm giá UI tĩnh, tổng tiền và CTA.
- Sidebar có anchor scroll, block sản phẩm đã xem và tin mới dùng related tour fallback.

### API đã nối

- `PublicApiService.getTourBySlug(slug)` → `GET /api/public/tours/{slug}`.
- `PublicApiService.getTourReviews(slug)` → `GET /api/public/tours/{slug}/reviews`.
- `PublicApiService.getTourSchedules(slug)` → `GET /api/public/tours/{slug}/schedules`.
- `PublicApiService.getTourItinerary(slug)` → `GET /api/public/tours/{slug}/itinerary`.
- `PublicApiService.getTours(params)` → `GET /api/public/tours` để lấy tour liên quan.

## 6. Booking checkout theo schedule

- Thêm route `/booking/checkout` dưới PublicLayout, có `authGuard`.
- Cập nhật `authGuard` redirect `/login?returnUrl=...` nếu user chưa đăng nhập.
- CTA `ĐẶT NGAY` trong TourDetail không POST booking trực tiếp, mà điều hướng sang checkout bằng query params.
- Tạo trang `BookingCheckout` standalone với Reactive Forms.
- Cập nhật `BookingSuccess` để hiển thị `bookingCode` hoặc `bookingId` từ query params.

### Query params từ TourDetail sang Checkout

- `tourSlug`
- `tourId`
- `scheduleId`
- `adultCount`
- `childCount`
- `infantCount`

### Chức năng checkout

- Checkout đọc query params, gọi lại API để xác nhận tour và lịch khởi hành.
- Hiển thị lỗi nếu thiếu `tourSlug` hoặc `scheduleId`.
- Cảnh báo nếu `scheduleId` không còn trong danh sách schedules public.
- Form liên hệ gồm `contactName`, `contactEmail`, `contactPhone`, `note`.
- Form tự điền từ `AuthService.currentUser()` nếu có dữ liệu.
- Summary hiển thị ảnh tour, tên tour, mã tour, ngày đi/ngày về, thời lượng, số khách, đơn giá và tổng tiền.
- Tổng tiền tính theo người lớn/trẻ em/em bé, có fallback giá nếu backend không trả đủ.
- Submit thành công điều hướng `/booking-success` kèm `bookingCode` hoặc `bookingId`.

### API đã nối

- `PublicApiService.getTourBySlug(tourSlug)`.
- `PublicApiService.getTourSchedules(tourSlug)`.
- `BookingApiService.createBooking(payload)` → `POST /api/bookings`.

### Payload booking

- `scheduleId`
- `adultCount`
- `childCount`
- `infantCount`
- `contactName`
- `contactEmail`
- `contactPhone`
- `note`

## 7. My Bookings và hủy booking

- Thay placeholder `/my-bookings` bằng trang danh sách booking thật.
- Giữ route `/my-bookings` dưới PublicLayout và `authGuard`.
- Mở rộng `BookingApiService.getMyBookings(params)` để hỗ trợ filter, paging và sort.
- Dựng UI danh sách booking, filter trạng thái, loading/error/empty state và nút xem thêm.
- Thêm thao tác hủy booking cho trạng thái `PENDING` và `CONFIRMED`.

### Query params đã hỗ trợ

- `status`
- `page`
- `size`

### Booking card hiển thị

- Ảnh tour hoặc fallback `/hero/bg-home.png`.
- `bookingCode`.
- Tên tour.
- Status chip.
- Payment status chip nếu có.
- Ngày khởi hành/ngày về.
- Số khách.
- Tổng tiền.
- Thông tin liên hệ.
- Ngày đặt.
- Nút `Xem tour`.
- Nút `Hủy booking` nếu được phép.

### API đã nối

- `BookingApiService.getMyBookings(params)` → `GET /api/bookings/me`.
- `BookingApiService.cancelBooking(id)` → `PATCH /api/bookings/{id}/cancel`.

## 8. Wishlist / yêu thích tour

### Trang Wishlist

- Thêm route `/wishlist` dưới PublicLayout, có `authGuard`.
- Tạo `WishlistApiService` riêng.
- Tạo model mềm cho wishlist để xử lý cả response dạng wishlist item và tour summary trực tiếp.
- Tạo trang `Wishlist` standalone, render grid bằng `app-tour-card`.
- Wishlist page có breadcrumb, header, loading skeleton, error state, empty state, grid tour responsive, nút `Xem thêm`.
- Item trong wishlist truyền `isWishlisted=true`.
- Click trái tim trong wishlist gọi toggle API và remove tour khỏi list hiện tại.

### TourCard wishlist

- `TourCard` có input mới:
  - `showWishlist`
  - `isWishlisted`
- `TourCard` có output mới:
  - `wishlistToggle`
- Nếu click heart khi chưa đăng nhập, điều hướng `/login?returnUrl=currentUrl`.

### Wishlist trong Tour Detail

- Sau khi load tour, nếu user đã đăng nhập, TourDetail gọi wishlist page đầu để xác định `isWishlisted`.
- Click `Yêu thích`:
  - chưa đăng nhập: redirect login kèm returnUrl
  - đã đăng nhập: gọi toggle API và cập nhật UI
- Wishlist API lỗi không làm sập trang detail.

### Wishlist trong Home và Tours

- Home page gọi wishlist nếu user đã đăng nhập.
- Home truyền `wishlistedTourIds` xuống các section: ưu đãi nổi bật, tour trong nước, tour nước ngoài.
- Tours page load wishlist state độc lập khi user đã đăng nhập.
- Home/Tours click tim khi đã đăng nhập gọi toggle API và cập nhật `Set` local theo hướng optimistic rollback nếu lỗi.
- Nếu user chưa đăng nhập, click tim điều hướng `/login?returnUrl=currentUrl`.
- Wishlist API lỗi không làm trắng Home/Tours và không ảnh hưởng API danh sách tour.

### API đã nối

- `WishlistApiService.getMyWishlist(params)` → `GET /api/users/me/wishlist`.
- `WishlistApiService.toggleWishlist(tourId)` → `POST /api/users/me/wishlist/{tourId}`.

## 9. API services đã có

### PublicApiService

- `getHome()` → `GET /public/home`.
- `getTours(params)` → `GET /public/tours`.
- `getFeaturedTours()` → `GET /public/tours/featured`.
- `getTourBySlug(slug)` → `GET /public/tours/:slug`.
- `getTourReviews(slug)` → `GET /public/tours/:slug/reviews`.
- `getPublicFeatures()` → `GET /public/features`.
- `getTourSchedules(slug)` → `GET /public/tours/:slug/schedules`.
- `getTourItinerary(slug)` → `GET /public/tours/:slug/itinerary`.

### BookingApiService

- `createBooking(request)` → `POST /bookings`.
- `getMyBookings(params)` → `GET /bookings/me`.
- `cancelBooking(id)` → `PATCH /bookings/:id/cancel`.

### UserApiService

- `getMe()` → `GET /api/users/me`.
- `updateMe(payload)` → `PUT /api/users/me`.
- `uploadAvatar(file)` → `POST /api/users/me/avatar`.

### WishlistApiService

- `getMyWishlist(params)` → `GET /api/users/me/wishlist`.
- `toggleWishlist(tourId)` → `POST /api/users/me/wishlist/{tourId}`.

### AuthService

- `login(request)` → `POST /auth/login`.
- `register(request)` → `POST /auth/register`.
- `me()` → `GET /users/me`.
- `forgotPassword(email)` → `POST /auth/forgot-password`.
- `resetPassword(payload)` → `POST /auth/reset-password`.
- `verifyEmail(token)` → `POST /auth/verify-email`.
- `saveSession(loginResponse)`.
- `updateCurrentUser(user)`.
- `logout()`.
- `hasRole(...roles)`.
- `isAdmin()`.

## 10. Encoding và báo cáo

- Đã chuẩn hóa các file report/source được xử lý về UTF-8 không BOM.
- `index.html` đã có `meta charset="utf-8"`.
- Đã sửa nhóm text tiếng Việt bị mojibake trong public profile và các report.
- Đã không thay đổi nghiệp vụ, route, API hoặc layout lớn trong bước sửa encoding.

## 11. Trạng thái build cuối cùng trong file gốc

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.
- Không có lỗi compile ở các bước đã ghi nhận.
- Còn warning budget mềm về initial bundle và một số file SCSS vượt warning budget 8 kB.

## 12. Ghi chú còn lại

- Một số chức năng có UI nhưng còn chờ backend/API chi tiết hơn:
  - Public gallery API cho tour detail.
  - Review submit API ở TourDetail.
  - Checkout chưa xử lý thanh toán online.
  - Booking success chưa gọi API chi tiết booking.
  - Wishlist check theo tourId riêng nếu wishlist vượt 100 item.
- Nếu dữ liệu trong database đã bị mojibake thì cần script xử lý DB riêng; sửa source/report không tự sửa dữ liệu đã lưu trong DB.
