## Cập Nhật: Admin Media Upload Cloudinary

Thời gian cập nhật: 2026-06-03 11:20:15 +07:00

### File Đã Sửa/Tạo Mới

- `src/app/pages/admin/media/media.ts`
- `src/app/pages/admin/media/media.html`
- `src/app/pages/admin/media/media.scss`
- `src/app/core/api/admin-media-api.service.ts`
- `src/app/core/models/media.model.ts`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Đọc `VOYAGE_FRONTEND_AUDIT_REPORT.md`, `VOYAGE_ADMIN_AUDIT_REPORT.md`, `BACKEND_API_REPORT.md` và `VoyageViet_Gap_Analysis_Report.docx` để xác định phạm vi admin mới nhất.
- Xác nhận các màn public đã hoàn thành và không sửa Home/Tours/TourDetail/Booking/Wishlist/Profile/Auth/PublicLayout.
- Xác nhận `/admin/media` đã nằm dưới `AdminLayout`, được bảo vệ bởi `adminGuard` ở route parent `/admin`, và nav AdminLayout đã có link Media.
- Thay placeholder của `AdminMedia` bằng màn quản lý media thật.
- Tạo service và model riêng cho admin media, không tạo folder features mới.

### Chức Năng Đã Thêm/Sửa

- Load danh sách media khi vào `/admin/media` với `page=0`, `size=12`, `sortBy=createdAt`, `sortDir=desc`.
- Filter module: `ALL`, `tours`, `categories`, `destinations`, `avatars`, `banners`, `general`.
- Upload ảnh qua input `image/png,image/jpeg,image/jpg,image/webp`, validate định dạng và giới hạn 5MB ở frontend.
- Preview ảnh bằng object URL trước khi upload, có cleanup URL khi thay file/hủy component.
- Upload module mặc định `general`, không gửi `ALL` lên backend.
- Grid media responsive 4/3/2/1 cột, có skeleton, empty state, error state và nút retry.
- Media card hiển thị ảnh, filename/publicId, module, content type/type, dung lượng, ngày tạo, URL rút gọn.
- Copy URL bằng Clipboard API, có fallback textarea/select nếu clipboard fail.
- Mở ảnh Cloudinary ở tab mới.
- Xóa media sau `window.confirm`, không xóa nếu item thiếu `id`, có trạng thái `deletingId`.
- Fallback ảnh lỗi về `/hero/bg-home.png` để tránh vỡ layout.

### API Đã Nối

- `GET /api/admin/media` qua `AdminMediaApiService.getMedia(params)`.
- `POST /api/admin/media/upload` qua `AdminMediaApiService.uploadMedia(file, module)` với `FormData` gồm `file` và `module`.
- `DELETE /api/admin/media/{id}` qua `AdminMediaApiService.deleteMedia(id)`.
- Service dùng `environment.apiUrl`; không set Authorization header thủ công vì `authInterceptor` đã gửi `Authorization: Bearer <token>`.
- Component có helper response linh hoạt cho `ApiResponse<PageResponse<AdminMediaItem>>`, `PageResponse<AdminMediaItem>`, `ApiResponse<AdminMediaItem[]>`, `AdminMediaItem[]`.

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/Lỗi Còn Lại

- Initial bundle vẫn vượt warning budget: budget 500.00 kB, total 870.95 kB.
- `src/app/pages/public/home/components/home-hero/home-hero.scss` vẫn vượt warning budget: 9.88 kB.
- `src/app/layouts/public-layout/public-layout.scss` vẫn vượt warning budget: 9.99 kB.
- Không có lỗi TypeScript/template.
- Không phát sinh warning budget mới từ `src/app/pages/admin/media/media.scss`.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- Frontend chỉ gọi backend media API; không gọi Cloudinary trực tiếp và không lưu base64.
- Backend response media đang được parse linh hoạt vì format có thể là `ApiResponse`, `PageResponse` hoặc array trực tiếp.
- Nếu backend delete Cloudinary asset đã được dùng trong category/destination/tour, URL đã dán ở nội dung khác có thể bị lỗi ảnh; UI đã cảnh báo trước khi xóa.
- Chưa test thủ công upload/delete thật vì cần backend chạy, Cloudinary configured và tài khoản ADMIN.

### Checklist Test Thủ Công Đề Xuất

1. Đăng nhập bằng tài khoản ADMIN.
2. Vào `/admin/media`.
3. Upload ảnh JPG/PNG/WEBP module `tours`.
4. Kiểm tra ảnh xuất hiện trong grid.
5. Copy URL và mở URL ảnh ở tab mới.
6. Lọc module `tours`.
7. Xóa ảnh vừa upload.
8. Thử upload file sai định dạng và file lớn hơn 5MB để kiểm tra validate.

## Cập Nhật: Fix AdminLayout Sidebar Và Media URL

Thời gian cập nhật: 2026-06-03 11:36:03 +07:00

### File Đã Sửa/Tạo Mới

- `src/app/layouts/admin-layout/admin-layout.scss`
- `src/app/pages/admin/media/media.ts`
- `src/app/pages/admin/media/media.html`
- `src/app/core/models/media.model.ts`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Đọc `VOYAGE_ADMIN_AUDIT_REPORT.md`, `VOYAGE_FRONTEND_AUDIT_REPORT.md` và `BACKEND_API_REPORT.md` theo yêu cầu.
- Xác nhận task Admin Media trước đã thay placeholder và tạo `AdminMediaApiService`, `AdminMediaItem` model.
- Kiểm tra `AdminLayout` hiện dùng flex layout với sidebar/content trong cùng shell.
- Kiểm tra backend media thực tế: `MediaUploadResponse` trả `secureUrl`, `bytes`, `mediaType`, `folder`, không chỉ trả `url`.
- Không sửa PublicLayout hoặc các màn public Home/Tours/TourDetail/Booking/Wishlist/Profile/Auth.

### Chức Năng Đã Thêm/Sửa

- Fix desktop admin shell để sidebar đứng yên khi content scroll:
  - `.admin-layout` dùng `height: 100vh` và `overflow: hidden`.
  - `.admin-layout__sidebar` dùng `height: 100vh`, `overflow-y: auto`, giữ width bằng biến `--admin-sidebar-width`.
  - `.admin-layout__content` scroll độc lập bằng `height: 100vh`, `overflow-y: auto`, `overflow-x: hidden`.
- Giữ responsive mobile/tablet đơn giản: dưới `900px` layout quay về column, sidebar không fixed/sticky cưỡng bức và content không khóa scroll.
- Mở rộng `AdminMediaItem` để nhận thêm các field backend/alias URL: `imageUrl`, `secureUrl`, `fileUrl`, `mediaUrl`, `bytes`, `mediaType`, `folder`, `format`, `resourceType`, `width`, `height`, `data`.
- Thêm normalize media item để map `secureUrl` từ backend về URL dùng chung.
- Thay toàn bộ render ảnh, URL rút gọn, Copy URL và Mở ảnh sang helper chung `getMediaUrl(item)`.
- Helper URL thử theo thứ tự: `url`, `imageUrl`, `secureUrl`, `fileUrl`, `mediaUrl`, `data.url`, `data.imageUrl`, `data.secureUrl`.
- Sau upload, nếu response có item và URL thật thì prepend ngay vào grid; nếu response thiếu URL nhưng có `publicId`, hiển thị cảnh báo backend chưa trả URL Cloudinary và reload list.
- Không dùng object URL preview làm URL thật, không lưu base64, không gọi Cloudinary trực tiếp từ frontend.

### API Đã Nối

- Tiếp tục dùng các API admin media hiện có:
  - `GET /api/admin/media`
  - `POST /api/admin/media/upload`
  - `DELETE /api/admin/media/{id}`
- Không đổi endpoint, không hardcode host, không tự set Authorization header.

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/Lỗi Còn Lại

- Initial bundle vẫn vượt warning budget: budget 500.00 kB, total 872.66 kB.
- `src/app/pages/public/home/components/home-hero/home-hero.scss` vẫn vượt warning budget: 9.88 kB.
- `src/app/layouts/public-layout/public-layout.scss` vẫn vượt warning budget: 9.99 kB.
- Không có lỗi TypeScript/template.
- Không phát sinh warning budget mới từ AdminLayout/AdminMedia.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- Media manager chỉ quản lý upload/lưu URL Cloudinary. Các màn admin sau sẽ dùng URL này để cập nhật `Category.imageUrl`, `Destination.imageUrl`, `Tour.thumbnailUrl`, tour gallery image URL, `Banner.imageUrl` nếu sau này có API banner, hoặc logo/site settings nếu backend bổ sung cấu hình.
- Chưa implement categories/destinations/tours/banner/logo trong bước này.
- `/admin/media` vẫn được bảo vệ bởi `adminGuard` và backend admin rule; frontend hiện không tự tạo role mới.
- Nếu sau này cần STAFF hoặc CONTENT_MANAGER quản lý ảnh, backend cần bổ sung role/permission tương ứng và frontend guard/permission UI nên được cập nhật theo.
- Backend hiện dùng field `secureUrl`; nếu backend đổi DTO, helper URL đã có alias fallback nhưng vẫn nên thống nhất contract API trong report.

### Checklist Test Thủ Công Đề Xuất

1. Đăng nhập ADMIN.
2. Vào `/admin/media`.
3. Kéo trang xuống, sidebar admin phải đứng yên, content scroll độc lập.
4. Upload ảnh module `general` hoặc `tours`.
5. Sau upload, card phải hiển thị URL thật từ `secureUrl`/alias URL.
6. Nút Copy URL copy được URL Cloudinary.
7. Nút Mở ảnh mở URL thật ở tab mới.
8. Reload trang, ảnh và URL vẫn còn.
9. Filter theo module vừa upload, ảnh vẫn hiện đúng.
10. Thử item thiếu URL hoặc ảnh lỗi, UI không vỡ và fallback `/hero/bg-home.png` hoạt động.
