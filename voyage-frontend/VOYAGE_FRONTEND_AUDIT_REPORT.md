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
