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
