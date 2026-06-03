# Voyage Frontend Audit Report

Ngày quét: 2026-06-02

Phạm vi quét: `voyage-frontend/src`

## Tổng Quan

Dự án frontend đang dùng Angular standalone components, Taiga UI, Router guards và HTTP interceptor. API base URL hiện tại lấy từ `src/environments/environment.ts`:

```ts
apiUrl: 'http://localhost:8081/api'
```

Các thay đổi UI gần đây tập trung ở màn Home Hero:

- Chỉnh dropdown "Số lượng" theo thiết kế: panel trắng, 2 dòng Người lớn / Trẻ em, nút `-` và `+`.
- Dropdown "Số lượng" căn theo width của ô input bằng `tuiDropdownLimitWidth="fixed"`.
- Bỏ mũi tên xanh trong panel dropdown số lượng.
- Thêm clear value cho ô "Số lượng".
- Chỉnh ô "Ngày đi" dùng trigger custom, calendar vẫn dùng `<tui-calendar *tuiDropdown />`.
- Mặc định ô "Ngày đi" hiển thị placeholder, chỉ hiện ngày sau khi chọn.
- Thêm clear value cho ô "Ngày đi".
- Chỉnh chevron các ô search xoay mượt bằng CSS transition.
- Thêm clear value cho ô "Bạn muốn đi đâu?".
- Chỉnh dropdown calendar để tránh UI bị bó hẹp và scrollbar gây chướng mắt.

Build gần nhất đã chạy `npm run build` và pass. Còn warning budget về bundle/component style, chưa phải lỗi compile.

## File Đang Có Thay Đổi

Theo `git status --short`, các file đang thay đổi:

- `src/app/pages/public/home/components/home-hero/home-hero.html`
- `src/app/pages/public/home/components/home-hero/home-hero.scss`
- `src/app/pages/public/home/components/home-hero/home-hero.ts`

## Screens Hiện Tại

### Public Screens

| Route | Component | Ghi chú |
| --- | --- | --- |
| `/` | `Home` | Trang chủ, chứa Home Hero, floating social, tour section |
| `/tours` | `Tours` | Danh sách tour |
| `/tours/:slug` | `TourDetail` | Chi tiết tour |
| `/login` | `Login` | Đăng nhập |
| `/register` | `Register` | Đăng ký |
| `/booking-lookup` | `BookingLookup` | Tra cứu booking |
| `/booking-success` | `BookingSuccess` | Hoàn tất đặt tour |
| `/my-bookings` | `MyBookings` | Có `authGuard` |

### Admin Screens

Tất cả route admin nằm dưới `/admin` và có `adminGuard`.

| Route | Component | Ghi chú |
| --- | --- | --- |
| `/admin` | `Dashboard` | Admin dashboard |
| `/admin/categories` | `AdminCategories` | Quản lý danh mục |
| `/admin/destinations` | `AdminDestinations` | Quản lý điểm đến |
| `/admin/tours` | `AdminTours` | Quản lý tour |
| `/admin/bookings` | `AdminBookings` | Quản lý booking |
| `/admin/users` | `AdminUsers` | Quản lý người dùng |
| `/admin/reviews` | `AdminReviews` | Quản lý đánh giá |
| `/admin/media` | `AdminMedia` | Quản lý media |
| `/admin/features` | `AdminFeatures` | Quản lý tính năng |
| `/admin/audit-logs` | `AdminAuditLogs` | Nhật ký hệ thống |

Hiện nhiều màn admin đang dùng `AdminPagePlaceholder`, tức là đã có route/shell nhưng phần chức năng chi tiết chưa được triển khai.

## API Services

### `PublicApiService`

File: `src/app/core/api/public-api.service.ts`

Service được khai báo `providedIn: 'root'`, inject `HttpClient`, dùng `environment.apiUrl`.

Methods hiện có:

| Method | Endpoint | Mục đích |
| --- | --- | --- |
| `getHome()` | `GET /public/home` | Lấy dữ liệu trang chủ |
| `getTours(params)` | `GET /public/tours` | Lấy danh sách tour phân trang/lọc/sort |
| `getFeaturedTours()` | `GET /public/tours/featured` | Lấy tour nổi bật |
| `getTourBySlug(slug)` | `GET /public/tours/:slug` | Lấy chi tiết tour |
| `getTourReviews(slug)` | `GET /public/tours/:slug/reviews` | Lấy review của tour |
| `getPublicFeatures()` | `GET /public/features` | Lấy feature public |

Ghi nhận khi quét: chưa thấy `PublicApiService` được inject vào page/component hiện tại.

### `BookingApiService`

File: `src/app/core/api/booking-api.service.ts`

Service được khai báo `providedIn: 'root'`, inject `HttpClient`, dùng `environment.apiUrl`.

Methods hiện có:

| Method | Endpoint | Mục đích |
| --- | --- | --- |
| `createBooking(request)` | `POST /bookings` | Tạo booking |
| `getMyBookings()` | `GET /bookings/me` | Lấy booking của user hiện tại |
| `cancelBooking(id)` | `PATCH /bookings/:id/cancel` | Hủy booking |

Ghi nhận khi quét: chưa thấy `BookingApiService` được inject vào page/component hiện tại.

### `AuthService`

File: `src/app/core/auth/auth.service.ts`

Service được khai báo `providedIn: 'root'`, inject `HttpClient` và `Router`, dùng `environment.apiUrl`.

Methods/state hiện có:

| Method/Signal | Mục đích |
| --- | --- |
| `accessToken` | Signal token hiện tại |
| `currentUser` | Signal user hiện tại |
| `isLoggedIn` | Computed trạng thái đăng nhập |
| `currentRole` | Computed role hiện tại |
| `login(request)` | `POST /auth/login` |
| `register(request)` | `POST /auth/register` |
| `me()` | `GET /users/me` |
| `saveSession(loginResponse)` | Lưu token/user vào localStorage |
| `updateCurrentUser(user)` | Cập nhật user hiện tại |
| `logout()` | Xóa session và điều hướng `/login` |
| `hasRole(...roles)` | Check role |
| `isAdmin()` | Check `ADMIN` hoặc `SUPER_ADMIN` |

## Inject Hiện Tại

### HTTP/API Layer

- `PublicApiService` inject `HttpClient`.
- `BookingApiService` inject `HttpClient`.
- `AuthService` inject `HttpClient` và `Router`.

### Auth Guards Và Interceptor

- `authGuard` inject `AuthService`, `Router`.
- `adminGuard` inject `AuthService`, `Router`.
- `authInterceptor` inject `AuthService`, lấy `accessToken()` và gắn header `Authorization: Bearer ...`.

### Layouts

- `PublicLayout` inject `AuthService`.
- `AdminLayout` inject `AuthService`.

### Public Auth Screens

- `Login` inject `FormBuilder`, `AuthService`, `Router`.
- `Register` inject `FormBuilder`, `AuthService`, `Router`.

## Routing Và Bảo Vệ Route

- `provideHttpClient(withInterceptors([authInterceptor]))` được cấu hình trong `src/app/app.config.ts`.
- Public layout bọc các route public.
- Admin layout bọc các route admin.
- `/my-bookings` dùng `authGuard`.
- `/admin/**` dùng `adminGuard`.
- Route wildcard `**` redirect về `/`.

## Ghi Chú Kỹ Thuật

- `rg` không có trong môi trường PowerShell hiện tại, nên việc quét dùng `Get-ChildItem` và `Select-String`.
- Một số text tiếng Việt trong terminal đang hiển thị lỗi encoding, nhưng file source có nhiều chuỗi tiếng Việt đang tồn tại sẵn.
- Các service API public/booking đã có method nhưng chưa được nối vào màn hình tương ứng, nên các screen như tours, tour detail, booking lookup, my bookings có thể vẫn là placeholder hoặc chưa fetch API thật.
- Các màn admin hiện chủ yếu là route + placeholder, chưa thấy inject API quản trị riêng.

## Đề Xuất Tiếp Theo

- Nối `PublicApiService` vào `Home`, `Tours`, `TourDetail` để thay mock/static data bằng API thật.
- Nối `BookingApiService` vào flow đặt tour, `MyBookings`, và hủy booking.
- Bổ sung admin API services riêng cho categories, destinations, tours, bookings, users, reviews, media, features, audit logs.
- Chuẩn hóa encoding tiếng Việt trong source nếu vẫn còn hiện mojibake ở editor/terminal.
- Xem lại Angular style budgets vì `home-hero.scss` và `public-layout.scss` đang gần hoặc vượt warning budget.

## Cập Nhật: Trang Danh Sách Tour Và Bộ Lọc

Thời gian cập nhật: 2026-06-02 11:56:16 +07:00

### File Đã Sửa/Tạo Mới

- `src/app/pages/public/tours/tours.ts`
- `src/app/pages/public/tours/tours.html`
- `src/app/pages/public/tours/tours.scss`

### Đầu Việc Đã Làm

- Thay placeholder `/tours` bằng trang danh sách tour hoàn chỉnh.
- Dựng layout theo mẫu gồm breadcrumb, banner, chip điểm đến/khu vực, filter bar, grid tour, nút xem thêm và block mô tả cuối trang.
- Tái sử dụng `app-tour-card` để render dữ liệu tour.
- Kết nối trang `/tours` với query params trên URL.
- Khi query params thay đổi, trang tự gọi lại API bằng `switchMap` và hủy subscription bằng `takeUntilDestroyed`.
- Thêm helper chuẩn hóa response API để xử lý nhiều dạng payload.

### Chức Năng Đã Thêm/Sửa

- Trang `/tours` đọc các query params: `keyword`, `categorySlug`, `destinationSlug`, `region`, `departureLocation`, `minPrice`, `maxPrice`, `minDurationDays`, `maxDurationDays`, `people`, `sortBy`, `sortDir`, `page`, `size`.
- Title section đổi theo context:
  - Có `keyword`: `Kết quả tìm kiếm: "keyword"`.
  - `region=DOMESTIC`: `Tour Trong Nước`.
  - `region=INTERNATIONAL`: `Tour Nước Ngoài`.
  - Mặc định: `Danh sách Tour`.
- Chip hoạt động:
  - `Hạ Long`, `Đà Nẵng`, `Phú Quốc`, `Quy Nhơn`.
  - `Tour Miền Bắc`, `Tour Miền Trung`, `Tour Miền Nam`, `Tour Tây Nguyên`.
- Filter hoạt động:
  - Loại hình tour.
  - Lọc theo giá.
  - Điểm đi.
  - Điểm đến.
  - Số ngày.
  - Số người.
  - Sắp xếp: mới nhất, giá thấp đến cao, giá cao đến thấp.
- Có trạng thái loading, error và empty.
- Có nút `Xem thêm`; hiện tại nút cập nhật `page` query param và render lại danh sách theo page mới.
- Có block tĩnh `Đánh Giá Chi Tiết` với ảnh fallback `/hero/bg-home.png`.

### API Đã Nối

- `PublicApiService.getTours(params)` gọi `GET /api/public/tours`.
- Params gửi vào API hiện gồm:
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
- `departureDate` từ HomeHero được đọc vào state của `/tours`, nhưng chưa gửi vào `PublicApiService.getTours()` vì `TourSearchParams` hiện chưa khai báo field này.

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/Lỗi Còn Lại

- Initial bundle vẫn vượt warning budget.
- `src/app/layouts/public-layout/public-layout.scss` vẫn vượt warning budget.
- `src/app/pages/public/home/components/home-hero/home-hero.scss` vẫn vượt warning budget.
- Không có lỗi compile sau bước này.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- `Xem thêm` hiện update `page` query param và thay danh sách bằng page mới; nếu muốn đúng hành vi "append thêm tour", cần bổ sung mode nối dữ liệu trong state.
- Filter chip dùng mapping tạm qua `keyword`/`region`; khi backend có danh mục hoặc destination slug ổn định thì nên đổi sang `categorySlug`/`destinationSlug`.
- Các dropdown filter đang dùng HTML `details` custom để tránh phát sinh import Taiga và giữ SCSS gọn; có thể thay bằng `tuiDropdown` sau nếu cần đồng bộ toàn bộ design system.
- SCSS của trang `/tours` mới khá lớn nhưng production build vẫn pass; cần theo dõi budget nếu tiếp tục mở rộng UI.

## Cập Nhật: Trang Chi Tiết Tour Public

Thời gian cập nhật: 2026-06-02 14:05:03 +07:00

### File Đã Sửa/Tạo Mới

- `src/app/core/models/tour.model.ts`
- `src/app/core/api/public-api.service.ts`
- `src/app/pages/public/tour-detail/tour-detail.ts`
- `src/app/pages/public/tour-detail/tour-detail.html`
- `src/app/pages/public/tour-detail/tour-detail.scss`
- `VOYAGE_FRONTEND_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Thay placeholder `/tours/:slug` bằng trang chi tiết tour thật, kế thừa `PublicLayout` hiện có và không thêm header/footer riêng.
- Dựng layout 2 cột theo mẫu detail: cột trái là nội dung tour, cột phải là booking card/sidebar sticky.
- Bổ sung model linh hoạt cho lịch khởi hành và lịch trình tour public.
- Bổ sung API public còn thiếu cho schedules và itinerary.
- Load dữ liệu theo `slug` route param, có loading/error state và không subscribe lồng nhau.
- Schedules, itinerary, reviews lỗi riêng không làm sập toàn trang detail.
- Thêm helper chuẩn hóa response để xử lý `ApiResponse<T>`, `ApiResponse<T[]>`, `PageResponse<T>`, `ApiResponse<PageResponse<T>>`.

### Chức Năng Đã Thêm/Sửa

- Breadcrumb: `HOME > category > title`.
- Hero ảnh chính dùng `thumbnailUrl`, fallback `/hero/bg-home.png`.
- Gallery thumbnail fallback từ `thumbnailUrl` trong lúc chưa có gallery API public.
- Section `Thông Tin Tour` render `description`/`shortDescription`, có nút mở rộng/thu gọn.
- Section `Lịch Trình Tour` render itinerary theo `dayNumber`, kèm meals/transport/placeNames nếu API có trả.
- Section `Lịch Khởi Hành` render schedules dạng list/table, click để chọn lịch.
- Section `Thông Tin Chi Tiết Giá Tour` có tab nhỏ: giá bao gồm, không bao gồm, phụ thu, huỷ đổi, lưu ý.
- Section `Sản Phẩm Tour Liên Quan` dùng lại `app-tour-card`.
- Section `Đánh Giá Sản Phẩm` có điểm trung bình, tổng đánh giá, progress 5 sao -> 1 sao và danh sách review.
- Form bình luận dựng UI disabled, chưa gọi POST review.
- Booking card có chọn lịch, counter người lớn/trẻ em/em bé, mã giảm giá UI tĩnh, tổng tiền và CTA.
- CTA `ĐẶT NGAY` yêu cầu chọn lịch nếu schedules có dữ liệu; hiện chưa điều hướng sai sang `booking-lookup` vì chưa có route checkout/detail booking rõ ràng.
- Sidebar có anchor scroll nội dung, block sản phẩm đã xem và tin mới dùng related tour fallback.

### API Đã Nối

- `PublicApiService.getTourBySlug(slug)` gọi `GET /api/public/tours/{slug}`.
- `PublicApiService.getTourReviews(slug)` gọi `GET /api/public/tours/{slug}/reviews`.
- `PublicApiService.getTourSchedules(slug)` gọi `GET /api/public/tours/{slug}/schedules`.
- `PublicApiService.getTourItinerary(slug)` gọi `GET /api/public/tours/{slug}/itinerary`.
- `PublicApiService.getTours(params)` gọi `GET /api/public/tours` để lấy tour liên quan với params ưu tiên:
  - `categorySlug`
  - `destinationSlug`
  - `page: 0`
  - `size: 4`

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/Lỗi Còn Lại

- Initial bundle vẫn vượt warning budget: budget 500.00 kB, total 759.04 kB.
- `src/app/pages/public/home/components/home-hero/home-hero.scss` vẫn vượt warning budget: 9.88 kB.
- `src/app/layouts/public-layout/public-layout.scss` vẫn vượt warning budget: 9.99 kB.
- Không có lỗi compile sau bước này.
- Không phát sinh warning budget mới từ `tour-detail.scss`.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- Public gallery API chưa có nên gallery detail đang fallback bằng `thumbnailUrl`; khi backend có gallery nên thay nguồn ảnh thật.
- Chưa có route checkout/booking detail rõ ràng, nên CTA đặt tour chỉ validate và hiển thị thông báo TODO thay vì điều hướng sai.
- Nội dung chi tiết giá tour dùng fallback từ mô tả tour và text chính sách ngắn; khi backend có trường riêng cho included/excluded/policy nên map lại đúng dữ liệu.
- Tour liên quan đang gọi theo cả `categorySlug` và `destinationSlug`; nếu backend lọc quá chặt khiến trả rỗng, có thể cần fallback thêm bằng `{ page: 0, size: 4 }`.

## Cập Nhật: Flow Booking Checkout Theo Schedule

Thời gian cập nhật: 2026-06-02 14:58:32 +07:00

### File Đã Sửa/Tạo Mới

- `src/app/app.routes.ts`
- `src/app/core/guards/auth.guard.ts`
- `src/app/core/models/booking.model.ts`
- `src/app/pages/public/auth/login/login.ts`
- `src/app/pages/public/tour-detail/tour-detail.ts`
- `src/app/pages/public/booking-checkout/booking-checkout.ts`
- `src/app/pages/public/booking-checkout/booking-checkout.html`
- `src/app/pages/public/booking-checkout/booking-checkout.scss`
- `src/app/pages/public/booking-success/booking-success.ts`
- `src/app/pages/public/booking-success/booking-success.html`
- `src/app/pages/public/booking-success/booking-success.scss`
- `VOYAGE_FRONTEND_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Thêm route public `/booking/checkout` dưới `PublicLayout`, có `authGuard`.
- Cập nhật `authGuard` để redirect `/login?returnUrl=...` khi người dùng chưa đăng nhập.
- Cập nhật login để user thường quay lại `returnUrl` sau đăng nhập; admin vẫn về `/admin`.
- Mở rộng booking model cho payload mới theo `scheduleId` và passenger counts.
- Tạo trang `BookingCheckout` standalone với Reactive Forms.
- Nối CTA `ĐẶT NGAY` trong TourDetail sang checkout bằng query params, không gọi POST booking ở TourDetail.
- Cập nhật `BookingSuccess` để hiển thị `bookingCode` hoặc `bookingId` từ query params.

### Chức Năng Đã Thêm/Sửa

- TourDetail `ĐẶT NGAY` validate:
  - Có lịch khởi hành được chọn.
  - Có số khách hợp lệ.
  - Có `scheduleId` trước khi điều hướng checkout.
- Query params từ detail sang checkout:
  - `tourSlug`
  - `tourId`
  - `scheduleId`
  - `adultCount`
  - `childCount`
  - `infantCount`
- Checkout đọc query params, gọi lại API để xác nhận tour và lịch khởi hành.
- Checkout hiển thị error state nếu thiếu `tourSlug`/`scheduleId`.
- Checkout cảnh báo nếu `scheduleId` không còn trong danh sách schedules public.
- Form liên hệ gồm:
  - `contactName`
  - `contactEmail`
  - `contactPhone`
  - `note`
- Form tự điền từ `AuthService.currentUser()` nếu có `fullName`, `email`, `phone`.
- Summary booking hiển thị ảnh tour, tên tour, mã tour, ngày đi/ngày về, thời lượng, số khách, đơn giá và tổng tiền.
- Tổng tiền tính theo:
  - `adultCount * priceAdult`
  - `childCount * priceChild`
  - `infantCount * priceInfant`
- Nếu backend không trả `priceChild`, checkout fallback bằng `priceAdult`; nếu không trả `priceInfant`, fallback `0`.
- Submit booking thành công điều hướng `/booking-success` kèm `bookingCode`/`bookingId`.
- Booking success có nút `/my-bookings` và về trang chủ.

### API Đã Nối

- `PublicApiService.getTourBySlug(tourSlug)` gọi `GET /api/public/tours/{slug}` trong checkout.
- `PublicApiService.getTourSchedules(tourSlug)` gọi `GET /api/public/tours/{slug}/schedules` trong checkout.
- `BookingApiService.createBooking(payload)` gọi `POST /api/bookings`.
- Payload booking mới gửi:
  - `scheduleId`
  - `adultCount`
  - `childCount`
  - `infantCount`
  - `contactName`
  - `contactEmail`
  - `contactPhone`
  - `note`

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/Lỗi Còn Lại

- Initial bundle vẫn vượt warning budget: budget 500.00 kB, total 776.40 kB.
- `src/app/layouts/public-layout/public-layout.scss` vẫn vượt warning budget: 9.99 kB.
- `src/app/pages/public/home/components/home-hero/home-hero.scss` vẫn vượt warning budget: 9.88 kB.
- Không có lỗi compile sau bước này.
- Không phát sinh warning budget mới từ `booking-checkout.scss` hoặc `booking-success.scss`.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- Checkout đã gắn `authGuard`; nếu login/register flow cần UX tốt hơn, có thể bổ sung thông báo rõ khi bị chuyển sang login.
- `BookingApiService.createBooking()` giữ tên method cũ nhưng model request đã ưu tiên payload mới theo `scheduleId`; các field legacy `tourId/startDate/numberOfPeople` vẫn để optional để giảm rủi ro tương thích.
- Chưa xử lý thanh toán; booking sau submit đang dừng ở trạng thái `PENDING` theo backend.
- Checkout chưa gọi API chi tiết booking sau success; success chỉ hiển thị query params trả về từ response create booking.

## Cập Nhật: Trang My Bookings Và Hủy Booking

Thời gian cập nhật: 2026-06-02 16:18:09 +07:00

### File Đã Sửa/Tạo Mới

- `src/app/core/api/booking-api.service.ts`
- `src/app/core/models/booking.model.ts`
- `src/app/pages/public/my-bookings/my-bookings.ts`
- `src/app/pages/public/my-bookings/my-bookings.html`
- `src/app/pages/public/my-bookings/my-bookings.scss`
- `VOYAGE_FRONTEND_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Thay placeholder `/my-bookings` bằng trang danh sách booking thật.
- Giữ route `/my-bookings` hiện có dưới `PublicLayout` và `authGuard`; không sửa route auth/admin.
- Mở rộng `BookingApiService.getMyBookings(params)` để hỗ trợ filter, paging và sort.
- Bổ sung `BookingListParams`, `PaymentStatus` và các field booking response mới/optional.
- Dựng UI danh sách booking, filter trạng thái, loading/error/empty state và nút xem thêm.
- Thêm thao tác hủy booking cho trạng thái `PENDING` và `CONFIRMED`.

### Chức Năng Đã Thêm/Sửa

- `/my-bookings` đọc query params:
  - `status`
  - `page`
  - `size`
- Gọi danh sách booking với sort mặc định:
  - `sortBy: createdAt`
  - `sortDir: desc`
- Filter trạng thái gồm:
  - Tất cả
  - Chờ xác nhận
  - Đã xác nhận
  - Đã hủy
  - Hoàn thành
- Khi đổi status filter, URL query params được cập nhật và page reset về `0`.
- Booking card hiển thị:
  - Ảnh tour hoặc fallback `/hero/bg-home.png`
  - `bookingCode`
  - tên tour
  - status chip
  - payment status chip nếu có
  - ngày khởi hành/ngày về
  - số khách
  - tổng tiền
  - thông tin liên hệ
  - ngày đặt
  - nút `Xem tour`
  - nút `Hủy booking` nếu được phép
- `Xem thêm` gọi page tiếp theo và append vào danh sách hiện tại.
- Hủy booking dùng `window.confirm`, gọi API cancel, rồi cập nhật item sang `CANCELLED` hoặc dùng data backend trả về.
- Có helper chuẩn hóa response để xử lý:
  - `ApiResponse<PageResponse<BookingResponse>>`
  - `PageResponse<BookingResponse>`
  - `ApiResponse<BookingResponse[]>`
  - `BookingResponse[]`

### API Đã Nối

- `BookingApiService.getMyBookings(params)` gọi `GET /api/bookings/me`.
- Query params hỗ trợ:
  - `status`
  - `page`
  - `size`
  - `sortBy`
  - `sortDir`
- `BookingApiService.cancelBooking(id)` gọi `PATCH /api/bookings/{id}/cancel`.

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/Lỗi Còn Lại

- Initial bundle vẫn vượt warning budget: budget 500.00 kB, total 792.64 kB.
- `src/app/pages/public/home/components/home-hero/home-hero.scss` vẫn vượt warning budget: 9.88 kB.
- `src/app/layouts/public-layout/public-layout.scss` vẫn vượt warning budget: 9.99 kB.
- Không có lỗi compile sau bước này.
- Không phát sinh warning budget mới từ `my-bookings.scss`.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- `Xem thêm` đã append dữ liệu page tiếp theo vào state, nhưng URL vẫn giữ page hiện tại để tránh làm reload danh sách; nếu cần deep-link đến page đã append thì cần thiết kế lại paging.
- Hủy booking đang dùng `window.confirm` để giữ implementation gọn; có thể thay bằng modal Taiga UI khi chuẩn hóa UX.
- Payment status hiện hiển thị raw value từ backend; nếu backend chuẩn hóa enum ổn định hơn thì nên map label tiếng Việt tương tự booking status.
- Trang chưa gọi API thanh toán và không xử lý payment flow trong bước này.

## Cập Nhật: Trang Hồ Sơ Cá Nhân Và Upload Avatar

Thời gian cập nhật: 2026-06-02 22:24:03 +07:00

### File Đã Sửa/Tạo Mới

- `src/app/app.routes.ts`
- `src/app/core/api/user-api.service.ts`
- `src/app/core/models/user.model.ts`
- `src/app/pages/public/profile/profile.ts`
- `src/app/pages/public/profile/profile.html`
- `src/app/pages/public/profile/profile.scss`
- `VOYAGE_FRONTEND_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Thêm route `/profile` dưới `PublicLayout`, có `authGuard`.
- Tạo `UserApiService` để tách API user/profile khỏi `AuthService`.
- Mở rộng user model cho profile update và avatar upload response.
- Tạo trang `Profile` standalone bằng Reactive Forms.
- Không sửa login/register/auth/admin/public-layout ngoài route cần thiết.
- Không thêm header/footer riêng; trang kế thừa layout public hiện có.

### Chức Năng Đã Thêm/Sửa

- `/profile` gọi API lấy thông tin user hiện tại khi vào trang.
- Hiển thị profile card gồm:
  - avatar lớn
  - họ tên
  - email
  - role/status
  - email verified chip
  - ngày tạo tài khoản
  - ngày cập nhật gần nhất
- Form cập nhật thông tin gồm:
  - `fullName`: required, minLength 2
  - `email`: read-only/disabled
  - `phone`: optional, validate đơn giản nếu có nhập
- Submit form gọi update profile với payload `fullName`, `phone`.
- Upload avatar:
  - accept `image/png,image/jpeg,image/jpg,image/webp`
  - validate file type frontend
  - validate tối đa 5MB
  - hiển thị preview bằng `URL.createObjectURL`
  - gọi API multipart upload
- Sau update profile/avatar thành công, cập nhật lại `AuthService.updateCurrentUser()` để đồng bộ localStorage/current user.
- Có quick links:
  - `/my-bookings`
  - `/tours`
  - `/`
- Có loading, success và error state.

### API Đã Nối

- `UserApiService.getMe()` gọi `GET /api/users/me`.
- `UserApiService.updateMe(payload)` gọi `PUT /api/users/me`.
- `UserApiService.uploadAvatar(file)` gọi `POST /api/users/me/avatar` bằng `FormData`.
- Payload update profile:
  - `fullName`
  - `phone`
- Payload upload avatar:
  - multipart field `file`

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/Lỗi Còn Lại

- Initial bundle vẫn vượt warning budget: budget 500.00 kB, total 807.97 kB.
- `src/app/layouts/public-layout/public-layout.scss` vẫn vượt warning budget: 9.99 kB.
- `src/app/pages/public/home/components/home-hero/home-hero.scss` vẫn vượt warning budget: 9.88 kB.
- Không có lỗi compile sau bước này.
- Không phát sinh warning budget mới từ `profile.scss`.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- Header public chưa được thêm link profile để tránh làm phình `public-layout.scss`, file này đang vượt warning budget.
- Avatar upload response được xử lý linh hoạt cho cả trường hợp backend trả user trực tiếp hoặc trả `avatarUrl/avatarPublicId`.
- Chưa làm đổi mật khẩu và wishlist trong bước này.
- Preview avatar dùng object URL; nếu mở rộng upload nhiều lần/liên tục, có thể bổ sung revoke URL để tối ưu bộ nhớ.

## Cập Nhật: Wishlist/Yêu Thích Tour

Thời gian cập nhật: 2026-06-02 23:07:53 +07:00

### File Đã Sửa/Tạo Mới

- `src/app/app.routes.ts`
- `src/app/core/api/wishlist-api.service.ts`
- `src/app/core/models/wishlist.model.ts`
- `src/app/pages/public/wishlist/wishlist.ts`
- `src/app/pages/public/wishlist/wishlist.html`
- `src/app/pages/public/wishlist/wishlist.scss`
- `src/app/pages/public/home/components/tour-card/tour-card.ts`
- `src/app/pages/public/home/components/tour-card/tour-card.html`
- `src/app/pages/public/home/components/tour-card/tour-card.scss`
- `src/app/pages/public/tour-detail/tour-detail.ts`
- `src/app/pages/public/tour-detail/tour-detail.html`
- `src/app/pages/public/tour-detail/tour-detail.scss`
- `VOYAGE_FRONTEND_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Thêm route `/wishlist` dưới `PublicLayout`, có `authGuard`.
- Tạo `WishlistApiService` riêng cho nghiệp vụ yêu thích tour.
- Tạo model mềm cho wishlist để xử lý cả response dạng wishlist item và tour summary trực tiếp.
- Tạo trang `Wishlist` standalone, render grid bằng `app-tour-card`.
- Cập nhật `TourCard` với nút trái tim optional, không gọi API mặc định.
- Cập nhật `TourDetail` với nút `Yêu thích` và trạng thái wishlist.
- Không sửa profile/my-bookings/checkout ngoài phạm vi wishlist.

### Chức Năng Đã Thêm/Sửa

- `/wishlist` gọi API danh sách yêu thích khi vào trang.
- Wishlist page có:
  - breadcrumb
  - header
  - loading skeleton
  - error state
  - empty state
  - grid tour responsive
  - nút `Xem thêm`
- Wishlist page map response về `TourCardResponse` để tái sử dụng `app-tour-card`.
- Item trong wishlist truyền `isWishlisted=true`.
- Click trái tim trong wishlist gọi toggle API và remove tour khỏi list hiện tại.
- `TourCard` có input mới:
  - `showWishlist`
  - `isWishlisted`
- `TourCard` có output mới:
  - `wishlistToggle`
- Nếu click heart trên TourCard khi chưa đăng nhập, điều hướng `/login?returnUrl=currentUrl`.
- `TourDetail` sau khi load tour sẽ gọi wishlist page đầu nếu user đã đăng nhập để xác định trạng thái `isWishlisted`.
- Click `Yêu thích` trong TourDetail:
  - chưa đăng nhập: redirect login kèm returnUrl
  - đã đăng nhập: gọi toggle API và cập nhật UI
- Wishlist API lỗi trong TourDetail không làm sập trang detail.

### API Đã Nối

- `WishlistApiService.getMyWishlist(params)` gọi `GET /api/users/me/wishlist`.
- Query params hỗ trợ:
  - `page`
  - `size`
  - `sortBy`
  - `sortDir`
- `WishlistApiService.toggleWishlist(tourId)` gọi `POST /api/users/me/wishlist/{tourId}`.

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/Lỗi Còn Lại

- Initial bundle vẫn vượt warning budget: budget 500.00 kB, total 822.25 kB.
- `src/app/layouts/public-layout/public-layout.scss` vẫn vượt warning budget: 9.99 kB.
- `src/app/pages/public/home/components/home-hero/home-hero.scss` vẫn vượt warning budget: 9.88 kB.
- Không có lỗi compile sau bước này.
- Không phát sinh warning budget mới từ `wishlist.scss`, `tour-card.scss` hoặc `tour-detail.scss`.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- TourCard chỉ emit `wishlistToggle` và redirect login nếu chưa đăng nhập; các page muốn toggle thật phải tự bind handler.
- Home/Tours hiện có thể hiển thị heart và redirect login khi chưa đăng nhập, nhưng chưa tự gọi toggle API nếu đã đăng nhập vì các page đó chưa bind handler.
- TourDetail kiểm tra trạng thái wishlist bằng `getMyWishlist({ page: 0, size: 100 })`; nếu wishlist lớn hơn 100 item, cần API check theo tourId hoặc tăng chiến lược paging.
- Backend toggle trả dạng linh hoạt nên UI hiện flip trạng thái local sau khi request thành công.

## Cập Nhật: Toggle Wishlist Trên Home Và Trang Tours

Thời gian cập nhật: 2026-06-03 08:47:58 +07:00

### File Đã Sửa/Tạo Mới

- `src/app/pages/public/home/home.ts`
- `src/app/pages/public/home/home.html`
- `src/app/pages/public/home/components/home-tour-section/home-tour-section.ts`
- `src/app/pages/public/home/components/home-tour-section/home-tour-section.html`
- `src/app/pages/public/tours/tours.ts`
- `src/app/pages/public/tours/tours.html`
- `VOYAGE_FRONTEND_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Bổ sung truyền trạng thái wishlist qua `HomeTourSection`.
- Nối API wishlist thật vào Home page.
- Nối API wishlist thật vào trang `/tours`.
- Giữ nguyên layout Home/Tours và không sửa PublicLayout/header/footer.
- Không sửa TourDetail, Wishlist page hoặc TourCard ngoài các thay đổi đã có từ task trước.

### Chức Năng Đã Thêm/Sửa

- `HomeTourSection` có input mới:
  - `wishlistedTourIds`
  - `showWishlist`
- `HomeTourSection` có output mới:
  - `wishlistToggle`
- `HomeTourSection` truyền xuống `app-tour-card`:
  - `[showWishlist]`
  - `[isWishlisted]`
  - `(wishlistToggle)`
- Home page sau khi load tour sẽ gọi wishlist nếu user đã đăng nhập.
- Home page truyền `wishlistedTourIds` xuống các section:
  - Ưu đãi nổi bật
  - Tour trong nước
  - Tour nước ngoài
- Home page click tim khi đã đăng nhập sẽ gọi toggle API và cập nhật `Set` local theo hướng optimistic rollback nếu lỗi.
- Tours page load wishlist state độc lập khi user đã đăng nhập.
- Tours grid truyền trạng thái yêu thích xuống từng `app-tour-card`.
- Tours page click tim khi đã đăng nhập sẽ gọi toggle API và cập nhật `Set` local theo hướng optimistic rollback nếu lỗi.
- Nếu user chưa đăng nhập, click tim điều hướng `/login?returnUrl=currentUrl`.
- Wishlist API lỗi không làm trắng Home/Tours và không ảnh hưởng API danh sách tour.

### API Đã Nối

- `WishlistApiService.getMyWishlist({ page: 0, size: 100, sortBy: 'createdAt', sortDir: 'desc' })` trên Home.
- `WishlistApiService.getMyWishlist({ page: 0, size: 100, sortBy: 'createdAt', sortDir: 'desc' })` trên Tours.
- `WishlistApiService.toggleWishlist(tourId)` khi click tim trên Home/Tours.

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/Lỗi Còn Lại

- Initial bundle vẫn vượt warning budget: budget 500.00 kB, total 826.86 kB.
- `src/app/layouts/public-layout/public-layout.scss` vẫn vượt warning budget: 9.99 kB.
- `src/app/pages/public/home/components/home-hero/home-hero.scss` vẫn vượt warning budget: 9.88 kB.
- Không có lỗi compile sau bước này.
- Không phát sinh warning budget mới vì không thêm SCSS mới trong bước này.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- Home/Tours đang check trạng thái wishlist bằng page đầu `size: 100`; nếu wishlist vượt 100 item, cần API check theo tourId hoặc paging đầy đủ.
- Toggle dùng optimistic update và rollback khi API lỗi, không gọi lại danh sách tour sau mỗi lần toggle.
- `wishlistUpdatingTourId` hiện chặn toggle đồng thời để tránh double request nhanh; chưa hiển thị loading riêng trên từng icon vì TourCard chưa có input loading.

## Cập Nhật: UI Quên Mật Khẩu Và Đặt Lại Mật Khẩu

Thời gian cập nhật: 2026-06-03 09:48:40 +07:00

### File Đã Sửa/Tạo Mới

- `src/app/app.routes.ts`
- `src/app/core/auth/auth.service.ts`
- `src/app/core/models/auth.model.ts`
- `src/app/pages/public/auth/login/login.html`
- `src/app/pages/public/auth/forgot-password/forgot-password.ts`
- `src/app/pages/public/auth/forgot-password/forgot-password.html`
- `src/app/pages/public/auth/forgot-password/forgot-password.scss`
- `src/app/pages/public/auth/reset-password/reset-password.ts`
- `src/app/pages/public/auth/reset-password/reset-password.html`
- `src/app/pages/public/auth/reset-password/reset-password.scss`
- `VOYAGE_FRONTEND_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Thêm route public `/forgot-password` dưới PublicLayout, không authGuard.
- Thêm route public `/reset-password` dưới PublicLayout, không authGuard.
- Tạo component standalone cho Forgot Password để tránh lỗi component có `imports` nhưng không standalone.
- Tạo component standalone cho Reset Password để tránh lỗi component có `imports` nhưng không standalone.
- Thêm link `Quên mật khẩu?` vào trang login, giữ nguyên logic `returnUrl`.
- Không sửa register, profile, wishlist, my-bookings, checkout, tours, tour-detail, admin routes hoặc PublicLayout.

### Chức Năng Đã Thêm/Sửa

- `/forgot-password`:
  - Form email dùng Reactive Forms.
  - Validate required/email.
  - Submit gọi API quên mật khẩu.
  - Hiển thị message trung lập: nếu email tồn tại trong hệ thống thì hướng dẫn đặt lại mật khẩu đã được gửi.
  - Không tự điều hướng sang reset-password và không yêu cầu backend trả token.
- `/reset-password`:
  - Đọc `token` từ query params.
  - Nếu thiếu token, hiển thị error card và link gửi lại yêu cầu.
  - Form mật khẩu mới/xác nhận mật khẩu dùng Reactive Forms.
  - Validate required, minLength 8 theo rule register hiện tại, và confirm password phải khớp.
  - Submit gọi API reset password.
  - Thành công hiển thị message và nút đăng nhập, không tự login và không lưu reset token vào localStorage.
- UI dùng card trắng, border `#E8E8E8`, theme teal/green, không dùng màu xanh cũ `#004FA8`.

### API Đã Nối

- `AuthService.forgotPassword(email)` gọi `POST /api/auth/forgot-password`.
- Payload:
  - `email`
- `AuthService.resetPassword(payload)` gọi `POST /api/auth/reset-password`.
- Payload:
  - `token`
  - `newPassword`
  - `confirmPassword`

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/Lỗi Còn Lại

- Initial bundle vẫn vượt warning budget: budget 500.00 kB, total 841.15 kB.
- `src/app/layouts/public-layout/public-layout.scss` vẫn vượt warning budget: 9.99 kB.
- `src/app/pages/public/home/components/home-hero/home-hero.scss` vẫn vượt warning budget: 9.88 kB.
- Không có lỗi compile sau bước này.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- Backend hiện chưa có SMTP thật nên Forgot Password chỉ hiển thị hướng dẫn kiểm tra email; token reset có thể đang được backend log ở server.
- Reset Password không tự đăng nhập sau khi đổi mật khẩu để tránh lưu nhầm token reset như access token.
- Hai component auth mới đặt explicit `standalone: true` vì các lỗi trước đó liên quan component có `imports` nhưng chưa được nhận diện standalone.

## Cập Nhật: UI Xác Thực Email

Thời gian cập nhật: 2026-06-03 10:04:23 +07:00

### File Đã Sửa/Tạo Mới

- `src/app/app.routes.ts`
- `src/app/core/auth/auth.service.ts`
- `src/app/core/models/auth.model.ts`
- `src/app/pages/public/auth/verify-email/verify-email.ts`
- `src/app/pages/public/auth/verify-email/verify-email.html`
- `src/app/pages/public/auth/verify-email/verify-email.scss`
- `VOYAGE_FRONTEND_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Thêm route public `/verify-email` dưới PublicLayout, không authGuard.
- Tạo component standalone `VerifyEmail`.
- Bổ sung model request xác thực email.
- Bổ sung method API trong `AuthService`.
- Không sửa login/register flow, forgot/reset password, profile, tours, booking, wishlist, admin routes hoặc PublicLayout.

### Chức Năng Đã Thêm/Sửa

- `/verify-email` đọc `token` từ query params.
- Nếu thiếu token, không gọi API và hiển thị error card.
- Nếu có token, component gọi verify email một lần trong `ngOnInit`.
- Hiển thị đầy đủ trạng thái:
  - loading: đang xác thực email
  - success: xác thực email thành công
  - error: link không hợp lệ/hết hạn hoặc lỗi backend
- Có nút điều hướng:
  - Đăng nhập / Đăng nhập ngay
  - Về trang chủ
- Không tự đăng nhập sau verify email.
- Không lưu verify token vào localStorage.
- UI dùng card trắng, border `#E8E8E8`, theme teal/green, không dùng màu xanh cũ `#004FA8`.

### API Đã Nối

- `AuthService.verifyEmail(token)` gọi `POST /api/auth/verify-email`.
- Payload:
  - `token`

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/Lỗi Còn Lại

- Initial bundle vẫn vượt warning budget: budget 500.00 kB, total 846.81 kB.
- `src/app/layouts/public-layout/public-layout.scss` vẫn vượt warning budget: 9.99 kB.
- `src/app/pages/public/home/components/home-hero/home-hero.scss` vẫn vượt warning budget: 9.88 kB.
- Không có lỗi compile sau bước này.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- Verify token chỉ được đọc từ query params và gửi một lần sang backend; không lưu vào browser storage.
- Backend email verify token đến từ email hoặc log server, frontend không có flow gửi lại verify email trong bước này vì chưa có API resend.
- Nếu user đang đăng nhập sẵn, trang verify vẫn không tự refresh `currentUser`; profile sẽ phản ánh `emailVerified` khi gọi lại `/users/me`.
