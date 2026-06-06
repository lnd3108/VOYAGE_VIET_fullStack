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

## Cập Nhật: Admin Categories CRUD Và Cloudinary Image URL

Thời gian cập nhật: 2026-06-03 11:47:40 +07:00

### File Đã Sửa/Tạo Mới

- `src/app/pages/admin/categories/categories.ts`
- `src/app/pages/admin/categories/categories.html`
- `src/app/pages/admin/categories/categories.scss`
- `src/app/core/api/admin-category-api.service.ts`
- `src/app/core/models/category.model.ts`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Đọc `VOYAGE_ADMIN_AUDIT_REPORT.md`, `VOYAGE_FRONTEND_AUDIT_REPORT.md` và `BACKEND_API_REPORT.md` theo yêu cầu.
- Xác nhận Admin Media đã có helper lấy URL thật từ `secureUrl`/alias URL và dùng URL Cloudinary để copy cho category/destination/tour sau này.
- Xác nhận AdminLayout đã fix sidebar đứng yên khi content scroll; không sửa lại AdminLayout trong bước này.
- Xác nhận route `/admin/categories` đã nằm dưới `AdminLayout` và được bảo vệ bởi `adminGuard` ở parent `/admin`.
- Xác nhận component `/admin/categories` trước bước này chỉ là `AdminPagePlaceholder`.
- Không sửa PublicLayout hoặc các màn public Home/Tours/TourDetail/Booking/Wishlist/Profile/Auth.

### Chức Năng Đã Thêm/Sửa

- Thay placeholder `/admin/categories` bằng màn quản lý danh mục thật.
- Load danh sách category từ API admin khi vào trang.
- Search/filter client-side theo keyword `name/slug` và trạng thái `ALL/ACTIVE/INACTIVE`.
- Thêm form tạo/sửa category bằng Reactive Forms.
- Validate `name` và `slug` bắt buộc.
- Auto-generate slug khi tạo mới từ tên danh mục, có xử lý bỏ dấu tiếng Việt cơ bản, lowercase, thay khoảng trắng bằng `-`, loại ký tự đặc biệt.
- Cho admin sửa slug thủ công.
- Cho nhập/paste `imageUrl` lấy từ `/admin/media`, preview ảnh trực tiếp bằng URL Cloudinary.
- Không upload ảnh trực tiếp trong Categories, không gọi Cloudinary trực tiếp, không lưu base64.
- Thêm link/nút `Mở Media` ở header và form để admin lấy URL ảnh.
- Create category qua form.
- Update category qua form, gồm `imageUrl`, `displayOrder`, `status` khi edit.
- Thêm nút riêng `Cập nhật ảnh` khi edit để gọi API image patch nếu cần cập nhật nhanh URL ảnh.
- Toggle trạng thái ACTIVE/INACTIVE trên từng row, có confirm khi chuyển INACTIVE.
- Xóa category có `window.confirm`, thành công remove khỏi list local.
- UI table desktop gồm ảnh, tên, slug, trạng thái, thứ tự, ngày cập nhật, hành động.
- Responsive mobile/tablet chuyển row sang dạng card có label bằng `data-label`.
- Có loading skeleton, empty state, error state và fallback ảnh `/hero/bg-home.png` nếu ảnh lỗi.

### API Đã Nối

- `GET /api/admin/categories` qua `AdminCategoryApiService.getCategories()`.
- `POST /api/admin/categories` qua `AdminCategoryApiService.createCategory(payload)`.
- `PUT /api/admin/categories/{id}` qua `AdminCategoryApiService.updateCategory(id, payload)`.
- `PATCH /api/admin/categories/{id}/status` qua `AdminCategoryApiService.updateCategoryStatus(id, status)`.
- `PATCH /api/admin/categories/{id}/image` qua `AdminCategoryApiService.updateCategoryImage(id, imageUrl)`.
- `DELETE /api/admin/categories/{id}` qua `AdminCategoryApiService.deleteCategory(id)`.
- Service dùng `environment.apiUrl`; không set Authorization header thủ công vì `authInterceptor` đã gửi `Authorization: Bearer <token>`.
- Component có helper response linh hoạt cho `ApiResponse<AdminCategory[]>`, `AdminCategory[]`, `ApiResponse<PageResponse<AdminCategory>>`, `PageResponse<AdminCategory>`.

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/Lỗi Còn Lại

- Initial bundle vẫn vượt warning budget: budget 500.00 kB, total 906.45 kB.
- `src/app/layouts/public-layout/public-layout.scss` vẫn vượt warning budget: 9.99 kB.
- `src/app/pages/public/home/components/home-hero/home-hero.scss` vẫn vượt warning budget: 9.88 kB.
- Không có lỗi TypeScript/template.
- Không phát sinh warning budget mới từ `src/app/pages/admin/categories/categories.scss`.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- Category image workflow hiện là: upload ảnh ở `/admin/media`, copy URL Cloudinary thật, paste vào `Category.imageUrl`, sau đó lưu category.
- Nếu sau này muốn chọn ảnh trực tiếp từ media library, cần task riêng để mở media picker hoặc shared selector, hiện chưa implement.
- Backend `CategoryResponse` trong source hiện không trả `createdAt/updatedAt`; UI đã fallback `Đang cập nhật` nếu thiếu ngày.
- Xóa category có thể bị backend chặn nếu category đang được tour sử dụng; UI hiển thị message backend nếu có.
- `/admin/categories` hiện vẫn theo `adminGuard`/backend admin rule, không tự tạo role mới ở frontend.

### Checklist Test Thủ Công Đề Xuất

1. Đăng nhập ADMIN.
2. Vào `/admin/categories`.
3. Load danh sách category.
4. Tạo category mới với `name`, `slug`, `displayOrder`.
5. Mở `/admin/media`, copy URL ảnh Cloudinary.
6. Paste URL vào `imageUrl` category và kiểm tra preview.
7. Lưu category, reload trang, ảnh vẫn hiển thị.
8. Sửa `name`, `description`, `displayOrder`.
9. Toggle ACTIVE/INACTIVE.
10. Xóa category test sau khi confirm.
11. Thử nhập URL ảnh lỗi, UI phải fallback không vỡ.

## Cập Nhật: AdminLayout Sticky Topbar Và Scrollbar Gọn

Thời gian cập nhật: 2026-06-03 13:17:13 +07:00

### File Đã Sửa/Tạo Mới

- `src/app/layouts/admin-layout/admin-layout.scss`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Đọc `VOYAGE_ADMIN_AUDIT_REPORT.md` và `VOYAGE_FRONTEND_AUDIT_REPORT.md` theo yêu cầu.
- Xác nhận AdminLayout trước đó đã được sửa thành shell full viewport với sidebar/content scroll độc lập.
- Chỉ mở và sửa file liên quan trực tiếp đến AdminLayout.
- Không sửa PublicLayout hoặc các màn public Home/Tours/TourDetail/Booking/Wishlist/Profile/Auth.
- Không sửa Admin Media logic upload hoặc routes.

### Chức Năng Đã Thêm/Sửa

- Giữ `.admin-layout` là shell full viewport: `height: 100vh`, `overflow: hidden`, `display: flex`.
- Giữ sidebar desktop cao `100vh`, đứng yên trong shell và tự scroll nội bộ.
- Bổ sung `overflow-x: hidden`, `scrollbar-gutter: stable`, `scrollbar-width: thin` cho sidebar để scrollbar không đè chữ/nav item.
- Style scrollbar sidebar scoped trong AdminLayout:
  - WebKit scrollbar width `8px`.
  - Track trong suốt.
  - Thumb bo tròn, màu teal nhạt `rgba(77, 182, 167, 0.45)`, hover đậm hơn.
- Style scrollbar content scoped trong AdminLayout:
  - Firefox `scrollbar-width: thin`, `scrollbar-color` teal nhạt.
  - WebKit scrollbar width `8px`, thumb `rgba(31, 111, 104, 0.35)`, hover `rgba(31, 111, 104, 0.55)`.
- Chỉnh `.admin-layout__topbar` thành sticky trong vùng content scroll:
  - `position: sticky`, `top: 0`, `z-index: 20`.
  - Background trắng gần đặc, blur nhẹ, border-bottom và shadow nhẹ để không bị content đè/cắt khi scroll.
  - `flex: 0 0 auto` để header không bị co khi content dài.
- Dưới `900px`, topbar quay về `position: static` để tránh làm vỡ layout column mobile/tablet.
- Không dùng màu xanh cũ `#004FA8`.

### API Đã Nối

- Không nối API mới trong bước này.

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/Lỗi Còn Lại

- Initial bundle vẫn vượt warning budget: budget 500.00 kB, total 907.66 kB.
- `src/app/layouts/public-layout/public-layout.scss` vẫn vượt warning budget: 9.99 kB.
- `src/app/pages/public/home/components/home-hero/home-hero.scss` vẫn vượt warning budget: 9.88 kB.
- Không có lỗi TypeScript/template.
- Không phát sinh warning budget mới từ AdminLayout.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- Scrollbar style được scope trong `.admin-layout__sidebar` và `.admin-layout__content`, không apply global toàn app.
- Topbar sticky phụ thuộc vào `.admin-layout__content` là scroll container; nếu sau này đổi HTML shell hoặc chuyển scroll sang `main`, cần kiểm tra lại sticky behavior.
- Mobile/tablet chưa có hamburger; layout vẫn giữ dạng column hiện tại theo phạm vi task.

### Checklist Test Thủ Công Đề Xuất

1. Đăng nhập ADMIN.
2. Vào `/admin/media` hoặc `/admin/categories`.
3. Kéo content xuống sâu.
4. Sidebar phải đứng yên, nav vẫn click được.
5. Header/topbar hiển thị đầy đủ, không bị cắt, không bị content đè.
6. Scrollbar sidebar nhỏ, bo tròn, màu teal nhạt, không thô.
7. Scrollbar content nhỏ, bo tròn, màu teal nhạt.
8. Dưới `900px`, layout column không vỡ.

## Cap Nhat: Admin Destinations CRUD Va Cloudinary Image URL

Thoi gian cap nhat: 2026-06-03 13:54:36 +07:00

### File Da Sua/Tao Moi

- `src/app/core/api/admin-destination-api.service.ts`
- `src/app/core/models/destination.model.ts`
- `src/app/pages/admin/destinations/destinations.ts`
- `src/app/pages/admin/destinations/destinations.html`
- `src/app/pages/admin/destinations/destinations.scss`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Dau Viec Da Lam

- Doc `VOYAGE_ADMIN_AUDIT_REPORT.md`, `VOYAGE_FRONTEND_AUDIT_REPORT.md`, `BACKEND_API_REPORT.md` theo yeu cau.
- Xac nhan Admin Media da quan ly upload Cloudinary va lay URL that tu `secureUrl`/alias URL de copy dung cho man admin sau.
- Xac nhan Admin Categories da co pattern CRUD, search/filter, preview `imageUrl`, toggle ACTIVE/INACTIVE va xoa confirm de tai su dung cho Destinations.
- Xac nhan AdminLayout da duoc fix sidebar/topbar/scrollbar, khong sua lai trong task nay.
- Xac nhan route `/admin/destinations` da nam duoi AdminLayout/adminGuard va da tro toi `AdminDestinations`; khong can sua route.
- Thay placeholder `/admin/destinations` bang man quan ly diem den that.
- Khong sua PublicLayout hoac cac man public Home/Tours/TourDetail/Booking/Wishlist/Profile/Auth.
- Khong sua Admin Media/Admin Categories/AdminLayout trong task nay.

### Chuc Nang Da Them/Sua

- Tao `AdminDestinationApiService` dung `environment.apiUrl`, khong tu set Authorization header vi `authInterceptor` da xu ly token admin.
- Mo rong `destination.model.ts` voi `AdminDestination`, `AdminDestinationCreateRequest`, `AdminDestinationUpdateRequest`, `DestinationStatus`.
- Load danh sach destination tu API admin va xu ly response linh hoat: `ApiResponse<AdminDestination[]>`, `AdminDestination[]`, `ApiResponse<PageResponse<AdminDestination>>`, `PageResponse<AdminDestination>`.
- Them form Reactive Forms cho tao/sua destination: `name`, `slug`, `region`, `country` required; `description`, `imageUrl`, `latitude`, `longitude` optional; `status` khi edit.
- Tu generate slug tu ten khi tao moi, co xu ly tieng Viet co dau sang khong dau va van cho admin sua slug thu cong.
- Region dung input co datalist goi y `DOMESTIC`/`INTERNATIONAL`, nhung van cho nhap region text thuc te neu backend dung du lieu khac.
- Country mac dinh `Viet Nam` khi tao moi; khi region la `DOMESTIC` va country trong thi tu dien `Viet Nam`.
- Search/filter client-side theo `name`, `slug`, `country`, `region`.
- Filter status `ALL`/`ACTIVE`/`INACTIVE` va region `ALL`/`DOMESTIC`/`INTERNATIONAL`.
- Preview anh tu `imageUrl` Cloudinary paste tu `/admin/media`; neu anh loi fallback `/hero/bg-home.png`.
- Co link/nut `Mo Media` de admin upload/copy URL anh Cloudinary.
- Co nut rieng `Cap nhat anh` khi edit destination, goi endpoint patch image.
- Toggle trang thai ACTIVE/INACTIVE tren tung row, confirm nhe khi chuyen INACTIVE.
- Xoa destination co `window.confirm`; neu backend chan do destination dang duoc tour su dung thi UI uu tien hien thi message backend.
- UI table desktop gom anh, ten, slug, region, country, toa do, trang thai, ngay cap nhat, hanh dong.
- Responsive mobile/tablet chuyen row sang dang card co `data-label`.
- Co loading skeleton, empty state, error state.

### API Da Noi

- `GET /api/admin/destinations` qua `AdminDestinationApiService.getDestinations()`.
- `POST /api/admin/destinations` qua `AdminDestinationApiService.createDestination(payload)`.
- `PUT /api/admin/destinations/{id}` qua `AdminDestinationApiService.updateDestination(id, payload)`.
- `PATCH /api/admin/destinations/{id}/status` qua `AdminDestinationApiService.updateDestinationStatus(id, status)`.
- `PATCH /api/admin/destinations/{id}/image` qua `AdminDestinationApiService.updateDestinationImage(id, imageUrl)`.
- `DELETE /api/admin/destinations/{id}` qua `AdminDestinationApiService.deleteDestination(id)`.

### Ket Qua Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/Loi Con Lai

- Initial bundle van vuot warning budget: budget 500.00 kB, total 940.13 kB.
- `src/app/pages/public/home/components/home-hero/home-hero.scss` van vuot warning budget: 9.88 kB.
- `src/app/layouts/public-layout/public-layout.scss` van vuot warning budget: 9.99 kB.
- Khong co loi TypeScript/template.
- Khong phat sinh warning budget moi tu `src/app/pages/admin/destinations/destinations.scss`.

### Ghi Chu Ky Thuat Va Rui Ro

- Destination image workflow hien la: upload anh o `/admin/media`, copy URL Cloudinary that, paste vao `Destination.imageUrl`, sau do luu destination.
- Khong upload anh truc tiep trong Destinations, khong goi Cloudinary truc tiep, khong luu base64/object URL.
- Neu sau nay muon chon anh truc tiep tu media library, can task rieng de lam media picker/shared selector.
- `region` backend co the la ma `DOMESTIC`/`INTERNATIONAL` hoac text thuc te; UI form da cho nhap tu do kem datalist de tranh mat du lieu la.
- Region filter `DOMESTIC` co heuristic theo `region`/`country` Viet Nam; neu backend chuan hoa region khac, nen thong nhat enum hoac bo sung mapping.
- `/admin/destinations` hien van theo `adminGuard`/backend admin rule. Neu sau nay can STAFF hoac CONTENT_MANAGER quan ly diem den/anh, backend can bo sung role/permission tuong ung.

### Checklist Test Thu Cong De Xuat

1. Dang nhap ADMIN.
2. Vao `/admin/destinations`.
3. Load danh sach destination.
4. Tao destination moi voi `name`, `slug`, `region`, `country`.
5. Mo `/admin/media`, copy URL anh Cloudinary.
6. Paste URL vao `imageUrl` destination va kiem tra preview.
7. Luu destination, reload trang, anh van hien thi.
8. Sua `name`, `description`, `region`, `country`, `latitude`, `longitude`.
9. Toggle ACTIVE/INACTIVE.
10. Xoa destination test sau khi confirm.
11. Thu nhap URL anh loi, UI phai fallback khong vo.

## Cap Nhat: Admin Tours List Quan Ly Tour

Thoi gian cap nhat: 2026-06-03 17:16:12 +07:00

### File Da Sua/Tao Moi

- `src/app/core/api/admin-tour-api.service.ts`
- `src/app/core/models/admin-tour.model.ts`
- `src/app/pages/admin/tours/tours.ts`
- `src/app/pages/admin/tours/tours.html`
- `src/app/pages/admin/tours/tours.scss`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Dau Viec Da Lam

- Doc `VOYAGE_ADMIN_AUDIT_REPORT.md`, `VOYAGE_FRONTEND_AUDIT_REPORT.md`, `BACKEND_API_REPORT.md` theo yeu cau.
- Xac nhan Admin Media da hoan thanh workflow upload anh len backend Cloudinary, lay URL that tu `secureUrl`/alias URL va copy URL cho tour thumbnail/gallery sau nay.
- Xac nhan Admin Categories da co CRUD va imageUrl workflow de lay category data/pattern cho tour.
- Xac nhan Admin Destinations da co CRUD va imageUrl workflow de lay destination data/pattern cho tour.
- Xac nhan AdminLayout da fix sidebar/topbar/scrollbar, khong sua lai trong task nay.
- Xac nhan route `/admin/tours` da nam duoi AdminLayout/adminGuard va da tro toi `AdminTours`; component truoc do van la placeholder.
- Thay placeholder `/admin/tours` bang man quan ly danh sach tour that.
- Khong sua PublicLayout hoac cac man public Home/Tours/TourDetail/Booking/Wishlist/Profile/Auth.
- Khong sua Admin Media/Admin Categories/Admin Destinations/AdminLayout trong task nay.

### Chuc Nang Da Them/Sua

- Tao `AdminTourApiService` dung `environment.apiUrl`, khong tu set Authorization header vi `authInterceptor` da xu ly token admin.
- Tao `admin-tour.model.ts` voi `AdminTour`, `AdminTourCreateRequest`, `AdminTourUpdateRequest`, `TourStatus`, `TourPublishChecklist` theo huong optional/linh hoat.
- Load danh sach tour tu API admin va xu ly response linh hoat: `ApiResponse<AdminTour[]>`, `AdminTour[]`, `ApiResponse<PageResponse<AdminTour>>`, `PageResponse<AdminTour>`.
- Them KPI nho: tong tour, da xuat ban, nhap, het cho.
- Them search/filter client-side theo title, slug, categoryName, destinationName, departureLocation.
- Them filter status `ALL/DRAFT/PUBLISHED/INACTIVE/SOLD_OUT`.
- Them filter featured `ALL/FEATURED/NORMAL`.
- Them filter category/destination suy ra tu danh sach tour dang load.
- Them sort client-side: moi cap nhat, ten A-Z, gia thap den cao, gia cao den thap, it cho truoc.
- Hien thi table desktop gom thumbnail, ten tour, category/destination, gia, thoi luong, so cho, featured, status, ngay cap nhat, hanh dong.
- Responsive tablet/mobile chuyen row thanh card bang `data-label`.
- Format tien bang `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`.
- Format ngay theo `vi-VN`.
- Status label/chip cho `DRAFT`, `PUBLISHED`, `INACTIVE`, `SOLD_OUT`.
- Them action xem nhanh thong tin tour, count schedule/gallery/itinerary neu backend tra.
- Them action xem public `/tours/:slug` bang tab moi neu tour co slug.
- Them action cap nhat thumbnail bang URL Cloudinary paste tu `/admin/media`, co preview va fallback `/hero/bg-home.png`.
- Them action publish: goi publish checklist truoc, neu checklist hop le thi goi publish tour, neu thieu thi hien danh sach dieu kien thieu.
- Them action doi status bang select; khi chon `PUBLISHED` thi uu tien publish flow thay vi patch status truc tiep.
- Them action xoa tour co `window.confirm`, thanh cong remove local; neu backend chan do booking/schedule lien quan thi UI uu tien message backend.
- Nut `Them tour` va `Sua` da co TODO/message cho wizard `/admin/tours/new` va `/admin/tours/{id}/edit`, chua implement create/edit full form trong task nay.

### API Da Noi

- `GET /api/admin/tours` qua `AdminTourApiService.getTours()`.
- `GET /api/admin/tours/{id}` qua `AdminTourApiService.getTour(id)` da tao san cho wizard/detail sau nay.
- `POST /api/admin/tours` qua `AdminTourApiService.createTour(payload)` da tao san cho wizard sau nay.
- `PUT /api/admin/tours/{id}` qua `AdminTourApiService.updateTour(id, payload)` da tao san cho wizard sau nay.
- `PATCH /api/admin/tours/{id}/status` qua `AdminTourApiService.updateTourStatus(id, status)`.
- `PATCH /api/admin/tours/{id}/thumbnail` qua `AdminTourApiService.updateTourThumbnail(id, imageUrl)`.
- `DELETE /api/admin/tours/{id}` qua `AdminTourApiService.deleteTour(id)`.
- `GET /api/admin/tours/{id}/publish-checklist` qua `AdminTourApiService.getPublishChecklist(id)`.
- `POST /api/admin/tours/{id}/publish` qua `AdminTourApiService.publishTour(id)`.

### Ket Qua Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/Loi Con Lai

- Initial bundle van vuot warning budget: budget 500.00 kB, total 976.23 kB.
- `src/app/layouts/public-layout/public-layout.scss` van vuot warning budget: 9.99 kB.
- `src/app/pages/public/home/components/home-hero/home-hero.scss` van vuot warning budget: 9.88 kB.
- Khong co loi TypeScript/template.
- Khong phat sinh warning budget moi tu `src/app/pages/admin/tours/tours.scss`.

### Ghi Chu Ky Thuat Va Rui Ro

- Tour list khong upload anh truc tiep; admin upload o `/admin/media`, copy URL Cloudinary that, paste vao thumbnail URL va luu qua PATCH thumbnail.
- Khong goi Cloudinary truc tiep, khong luu base64/object URL.
- Category/destination filter hien suy ra tu danh sach tour admin tra ve. Neu can filter theo danh muc/diem den chua co tour, co the load them `AdminCategoryApiService` va `AdminDestinationApiService` trong task sau.
- Publish checklist duoc xu ly mem voi `canPublish`, `missingItems`, `items`, `valid`, `publishable`; neu backend doi format, UI van hien message/fallback va publish endpoint se la lop bao ve cuoi.
- Create/edit wizard, schedule, itinerary, gallery chua implement trong task nay; cac nut `Them tour` va `Sua` chi de chuan bi navigation/TODO.
- `/admin/tours` hien van theo `adminGuard`/backend admin rule. Neu sau nay can STAFF hoac CONTENT_MANAGER quan ly tour, backend can bo sung role/permission tuong ung.

### Checklist Test Thu Cong De Xuat

1. Dang nhap ADMIN.
2. Vao `/admin/tours`.
3. Load danh sach tour.
4. Search theo title/slug.
5. Filter status.
6. Filter featured.
7. Filter category/destination neu danh sach tour co data.
8. Sort theo gia, ten, ngay cap nhat.
9. Mo public tour neu co slug.
10. Mo `/admin/media`, copy URL anh Cloudinary.
11. Cap nhat thumbnail tour bang URL do va kiem tra preview.
12. Reload trang, thumbnail van hien thi.
13. Thu publish tour va kiem tra checklist neu thieu du lieu.
14. Toggle status DRAFT/INACTIVE/SOLD_OUT neu backend cho phep.
15. Xoa tour test sau khi confirm.
16. Thu thumbnail URL loi, UI phai fallback khong vo.

## Cap Nhat: Admin Tour Create/Edit Wizard Buoc 1

Thoi gian cap nhat: 2026-06-03 20:58:43 +07:00

### File Da Sua/Tao Moi

- `src/app/app.routes.ts`
- `src/app/pages/admin/tours/tours.html`
- `src/app/pages/admin/tours/tour-form/tour-form.ts`
- `src/app/pages/admin/tours/tour-form/tour-form.html`
- `src/app/pages/admin/tours/tour-form/tour-form.scss`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Dau Viec Da Lam

- Doc `VOYAGE_ADMIN_AUDIT_REPORT.md`, `VOYAGE_FRONTEND_AUDIT_REPORT.md`, `BACKEND_API_REPORT.md` theo yeu cau.
- Xac nhan Admin Tours List da co `AdminTourApiService`, `AdminTour`, status, publish checklist, update thumbnail va delete tour.
- Xac nhan Admin Media dang la noi upload anh Cloudinary, copy URL that de paste vao `thumbnailUrl`.
- Xac nhan Admin Categories va Admin Destinations da co service/list de load option cho tour form.
- Xac nhan AdminLayout da fix sidebar/topbar/scrollbar, khong sua lai trong task nay.
- Them route `/admin/tours/new` va `/admin/tours/:id/edit` duoi parent `/admin` nen van duoc bao ve boi `adminGuard`.
- Doi route form sang lazy `loadComponent` de tranh day wizard vao initial bundle va tranh loi hard budget production.
- Doi nut `Them tour` va `Sua` trong Admin Tours List sang dieu huong that.
- Khong sua PublicLayout hoac cac man public Home/Tours/TourDetail/Booking/Wishlist/Profile/Auth.
- Khong sua Admin Media/Admin Categories/Admin Destinations/AdminLayout.

### Chuc Nang Da Them/Sua

- Tao component standalone `TourForm` dung chung cho create/edit.
- Dung Reactive Forms cho thong tin co ban, phan loai, gia/thoi luong, so cho/trang thai va thumbnail.
- Inject `ActivatedRoute`, `Router`, `AdminTourApiService`, `AdminCategoryApiService`, `AdminDestinationApiService`.
- Create mode cho `/admin/tours/new`, edit mode cho `/admin/tours/:id/edit` dua tren route param `id`.
- Khi vao form: load categories, destinations; neu edit thi load tour detail bang `getTour(id)` va patch vao form.
- Validate form:
  - `title` required, minLength 3.
  - `slug`, `shortDescription`, `departureLocation`, `categoryId`, `destinationId`, `status` required.
  - `originalPrice`, `salePrice` min 0.
  - `durationDays` min 1, `durationNights` min 0.
  - `maxParticipants` min 1, `availableSeats` min 0.
  - Custom rule: `salePrice <= originalPrice`.
  - Custom rule: `availableSeats <= maxParticipants`.
  - Custom rule: `durationNights <= durationDays`.
- Auto-generate slug tu title trong create mode neu admin chua sua slug thu cong, co xu ly bo dau tieng Viet co ban.
- Thumbnail URL lay tu Cloudinary: admin upload o `/admin/media`, copy URL that, paste vao `thumbnailUrl` va xem preview.
- Thumbnail loi fallback `/hero/bg-home.png` de khong vo layout.
- Submit create goi `createTour(payload)`, success hien message va quay ve `/admin/tours` sau delay ngan.
- Submit edit goi `updateTour(id, payload)`, success hien message va o lai form voi data moi patch lai.
- Preview card ben phai hien thumbnail, title, shortDescription, category/destination, price, duration va status chip.
- UI desktop 2 cot: form chinh + preview/media note; tablet/mobile 1 cot.
- Khong lam schedule/itinerary/gallery/publish trong form buoc nay.

### API Da Noi

- `GET /api/admin/categories` qua `AdminCategoryApiService.getCategories()` de load category option.
- `GET /api/admin/destinations` qua `AdminDestinationApiService.getDestinations()` de load destination option.
- `GET /api/admin/tours/{id}` qua `AdminTourApiService.getTour(id)` khi edit.
- `POST /api/admin/tours` qua `AdminTourApiService.createTour(payload)` khi create.
- `PUT /api/admin/tours/{id}` qua `AdminTourApiService.updateTour(id, payload)` khi edit.
- Khong set Authorization header thu cong vi `authInterceptor` xu ly `Authorization: Bearer <token>`.

### Ket Qua Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.
- `git diff --check` tren nhom file routes/tour-form/tours.html: khong co whitespace error.

### Warning/Loi Con Lai

- Initial bundle van vuot warning budget: budget 500.00 kB, total 979.27 kB.
- `src/app/layouts/public-layout/public-layout.scss` van vuot warning budget: 9.99 kB.
- `src/app/pages/public/home/components/home-hero/home-hero.scss` van vuot warning budget: 9.88 kB.
- Khong co loi TypeScript/template.
- Form wizard da duoc lazy load thanh chunk rieng `tour-form` raw size 29.66 kB trong production build, khong con gay loi hard budget 1MB.
- Truc tiep import `TourForm` vao routes tung lam `npm run build` fail hard budget 1MB; da sua bang `loadComponent`.

### Ghi Chu Ky Thuat Va Rui Ro

- Form tour khong upload anh truc tiep, khong goi Cloudinary truc tiep, khong luu base64/object URL.
- Payload form gui du cac field backend yeu cau cho create/update tour co ban: title, slug, shortDescription, description, thumbnailUrl, price, duration, departureLocation, seats, featured, status, categoryId, destinationId.
- Create mode mac dinh status `DRAFT`; admin van co the chon status khac nhung publish checklist van nen duoc xu ly o Tours List/task publish rieng.
- Neu backend bao slug trung hoac validation fail, UI uu tien hien thi `error.message` tu backend.
- Categories/destinations option hien load tu admin API. Neu danh sach rong, admin can tao category/destination truoc khi tao tour.
- Cac buoc schedule, itinerary, gallery va media picker truc tiep chua implement trong task nay.

### Checklist Test Thu Cong De Xuat

1. Dang nhap ADMIN.
2. Vao `/admin/tours`.
3. Click `Them tour`.
4. Form `/admin/tours/new` hien thi dung.
5. Chon category/destination da co.
6. Nhap title va kiem tra slug auto-generate.
7. Mo `/admin/media`, copy URL anh Cloudinary.
8. Paste vao `thumbnailUrl`, preview hien thi dung.
9. Nhap gia/thoi luong/so cho.
10. Submit tao tour.
11. Quay lai `/admin/tours`, tour moi xuat hien.
12. Click sua tour.
13. Form `/admin/tours/:id/edit` load dung du lieu.
14. Cap nhat title/price/thumbnail.
15. Luu thay doi va kiem tra list cap nhat.
16. Thu nhap `salePrice > originalPrice`, UI phai bao loi.
17. Thu nhap `availableSeats > maxParticipants`, UI phai bao loi.
18. Thu thumbnail URL loi, UI fallback khong vo.

## Cap Nhat: Admin Tour Gallery Bang URL Cloudinary

Thoi gian cap nhat: 2026-06-03 21:55:16 +07:00

### File Da Sua/Tao Moi

- `src/app/core/api/admin-tour-api.service.ts`
- `src/app/core/models/admin-tour.model.ts`
- `src/app/pages/admin/tours/tour-form/tour-form.ts`
- `src/app/pages/admin/tours/tour-form/tour-form.html`
- `src/app/pages/admin/tours/tour-gallery/tour-gallery.ts`
- `src/app/pages/admin/tours/tour-gallery/tour-gallery.html`
- `src/app/pages/admin/tours/tour-gallery/tour-gallery.scss`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Dau Viec Da Lam

- Doc `VOYAGE_ADMIN_AUDIT_REPORT.md`, `VOYAGE_FRONTEND_AUDIT_REPORT.md`, `BACKEND_API_REPORT.md` theo yeu cau.
- Xac nhan Admin Tour Create/Edit Wizard buoc 1 da co `/admin/tours/new`, `/admin/tours/:id/edit`, form basic info/category/destination/price/seats/status/thumbnail va lazy load `loadComponent`.
- Xac nhan Admin Tours List da co `AdminTourApiService`, `AdminTour`, status, publish checklist, thumbnail update va delete.
- Xac nhan Admin Media la noi upload anh Cloudinary va copy URL that de dung cho thumbnail/gallery.
- Kiem tra backend report muc `6.10 Tour Image Admin` va xac nhan endpoint gallery that:
  - `GET /api/admin/tours/{id}/images`
  - `POST /api/admin/tours/{id}/images`
  - `DELETE /api/admin/tours/{tourId}/images/{imageId}`
  - `PATCH /api/admin/tours/{tourId}/images/{imageId}/thumbnail`
  - `PATCH /api/admin/tours/{id}/images/reorder`
  - `PATCH /api/admin/tours/{tourId}/images/{imageId}/alt`
- Khong sua PublicLayout hoac cac man public Home/Tours/TourDetail/Booking/Wishlist/Profile/Auth.
- Khong sua AdminLayout/AdminMedia/AdminCategories/AdminDestinations/Admin Tours List route.

### Chuc Nang Da Them/Sua

- Bo sung model gallery trong `admin-tour.model.ts`:
  - `AdminTourImage`
  - `AdminTourImageCreateRequest`
  - `AdminTourImageUpdateRequest`
  - `AdminTourImageReorderRequest`
- Bo sung API methods trong `AdminTourApiService`:
  - `getTourImages(tourId)`
  - `addTourImage(tourId, payload)`
  - `updateTourImage(tourId, imageId, payload)` dung endpoint alt text cua backend.
  - `deleteTourImage(tourId, imageId)`
  - `setTourImageThumbnail(tourId, imageId)`
  - `reorderTourImages(tourId, payload)`
- Tao component standalone `TourGallery` de tach logic gallery khoi `TourForm`.
- Nhung `TourGallery` vao `/admin/tours/:id/edit` va `/admin/tours/new`.
- Create mode hien card: `Vui long luu tour truoc khi quan ly gallery anh.`
- Edit mode load gallery bang `GET /api/admin/tours/{id}/images`.
- Them form gallery gom URL anh Cloudinary, alt text, sort order va preview anh.
- Gallery khong upload anh truc tiep, khong goi Cloudinary truc tiep, khong luu base64/object URL.
- Them anh bang URL Cloudinary qua `addTourImage` tren endpoint backend hien co.
- Xu ly response linh hoat cho `ApiResponse<AdminTourImage[]>`, `AdminTourImage[]`, page response va item response.
- Helper `getImageUrl(image)` thu theo thu tu `url`, `imageUrl`, `secureUrl`, `data.url`, `data.secureUrl`.
- Grid gallery desktop 4 cot, tablet 2 cot, mobile 1 cot.
- Moi card co anh, badge Thumbnail, URL rut gon, alt text, sortOrder, Copy URL, Mo anh, Dat thumbnail, Sua, Len/Xuong, Xoa.
- Sua alt text bang endpoint `PATCH /alt`.
- Doi sortOrder/lens xuong bang endpoint reorder.
- Dat anh lam thumbnail bang endpoint thumbnail; sau thanh cong update local `isThumbnail` va emit URL len TourForm de cap nhat preview thumbnail.
- Xoa anh co `window.confirm` va remove local sau khi backend thanh cong.
- Anh loi fallback `/hero/bg-home.png`.

### API Da Noi

- `GET /api/admin/tours/{id}/images` qua `AdminTourApiService.getTourImages(tourId)`.
- `POST /api/admin/tours/{id}/images` qua `AdminTourApiService.addTourImage(tourId, payload)`.
- `PATCH /api/admin/tours/{tourId}/images/{imageId}/alt` qua `AdminTourApiService.updateTourImage(tourId, imageId, payload)`.
- `PATCH /api/admin/tours/{tourId}/images/{imageId}/thumbnail` qua `AdminTourApiService.setTourImageThumbnail(tourId, imageId)`.
- `PATCH /api/admin/tours/{id}/images/reorder` qua `AdminTourApiService.reorderTourImages(tourId, payload)`.
- `DELETE /api/admin/tours/{tourId}/images/{imageId}` qua `AdminTourApiService.deleteTourImage(tourId, imageId)`.
- Khong set Authorization header thu cong vi `authInterceptor` xu ly `Authorization: Bearer <token>`.

### Ket Qua Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.
- `git diff --check` tren nhom file tour gallery/tour form/service/model: khong co whitespace error.

### Warning/Loi Con Lai

- Initial bundle van vuot warning budget: budget 500.00 kB, total 982.32 kB.
- `src/app/pages/public/home/components/home-hero/home-hero.scss` van vuot warning budget: 9.88 kB.
- `src/app/layouts/public-layout/public-layout.scss` van vuot warning budget: 9.99 kB.
- Khong co loi TypeScript/template.
- Gallery nam trong lazy chunk `tour-form`, production raw size lazy chunk khoang 51.37 kB, khong gay loi hard budget.

### Ghi Chu Ky Thuat Va Rui Ro

- Backend report hien mo ta `POST /api/admin/tours/{id}/images` la multipart `file`, `altText`. Task frontend yeu cau them gallery bang URL Cloudinary copy tu Admin Media, nen frontend dang goi cung endpoint voi JSON payload mem `url/imageUrl/altText/sortOrder/isThumbnail`.
- Neu backend hien tai chi accept multipart file, thao tac them anh bang URL se tra loi runtime. Can bo sung backend DTO/endpoint attach-by-URL cho tour gallery hoac cho endpoint POST hien tai accept JSON URL.
- Endpoint cap nhat sortOrder rieng khong co trong report; backend co reorder endpoint. UI sua sortOrder se goi update alt text roi goi reorder de luu thu tu.
- Set thumbnail gallery cap nhat preview thumbnail trong form, nhung admin van can bam `Luu thay doi` o TourForm neu muon dong bo `Tour.thumbnailUrl` qua PUT tour/thumbnail workflow. Backend set thumbnail co the da dong bo thumbnail tour neu service backend lam viec do.
- Backend rule toi da 10 anh/tour va khong cho xoa thumbnail neu con anh khac se duoc hien thi bang message backend neu vi pham.
- Media picker truc tiep chua implement; admin van upload/copy URL tu `/admin/media`.

### Checklist Test Thu Cong De Xuat

1. Dang nhap ADMIN.
2. Vao `/admin/tours`.
3. Mo edit mot tour `/admin/tours/:id/edit`.
4. Gallery section hien thi.
5. Mo `/admin/media`, copy URL anh Cloudinary.
6. Paste URL vao gallery, preview hien thi.
7. Them anh thanh cong, anh xuat hien trong grid neu backend ho tro attach URL.
8. Reload trang, anh van con.
9. Copy URL va mo anh.
10. Sua altText/sortOrder.
11. Dat anh lam thumbnail.
12. Xoa anh sau confirm.
13. Thu URL anh loi, UI fallback khong vo.
14. Vao `/admin/tours/new`, gallery phai bao can luu tour truoc.

## Cap Nhat: Admin Tour Itinerary Quan Ly Lich Trinh Theo Ngay

Thoi gian cap nhat: 2026-06-03 22:15:12 +07:00

### File Da Sua/Tao Moi

- `src/app/core/api/admin-tour-api.service.ts`
- `src/app/core/models/admin-tour.model.ts`
- `src/app/pages/admin/tours/tour-form/tour-form.ts`
- `src/app/pages/admin/tours/tour-form/tour-form.html`
- `src/app/pages/admin/tours/tour-itinerary/tour-itinerary.ts`
- `src/app/pages/admin/tours/tour-itinerary/tour-itinerary.html`
- `src/app/pages/admin/tours/tour-itinerary/tour-itinerary.scss`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Dau Viec Da Lam

- Doc `VOYAGE_ADMIN_AUDIT_REPORT.md`, `VOYAGE_FRONTEND_AUDIT_REPORT.md`, `BACKEND_API_REPORT.md` theo yeu cau.
- Xac nhan Admin Tour Create/Edit Wizard buoc 1 da co `/admin/tours/new`, `/admin/tours/:id/edit`, form basic info/category/destination/price/seats/status/thumbnail va lazy load `loadComponent`.
- Xac nhan Admin Tour Gallery da nam trong lazy chunk `tour-form`, da co component rieng `TourGallery`.
- Kiem tra backend report muc `6.9 Tour Itinerary Admin` va xac nhan endpoint itinerary that:
  - `GET /api/admin/tours/{id}/itineraries`
  - `PUT /api/admin/tours/{id}/itineraries` de replace-all `items[]`
  - `POST /api/admin/tours/{id}/itineraries/reorder`
- Xac nhan backend khong co create/update/delete itinerary tung item rieng trong report, nen frontend dung bulk save dung endpoint that.
- Khong sua PublicLayout hoac cac man public Home/Tours/TourDetail/Booking/Wishlist/Profile/Auth.
- Khong sua AdminLayout/AdminMedia/AdminCategories/AdminDestinations/AdminToursList.

### Chuc Nang Da Them/Sua

- Bo sung model itinerary trong `admin-tour.model.ts`:
  - `AdminTourItinerary`
  - `AdminTourItineraryCreateRequest`
  - `AdminTourItineraryUpdateRequest`
  - `AdminTourItineraryBulkSaveRequest`
  - `AdminTourItineraryReorderRequest`
- Bo sung API methods trong `AdminTourApiService`:
  - `getTourItineraries(tourId)`
  - `saveTourItineraries(tourId, payload)` dung `PUT /api/admin/tours/{id}/itineraries`
  - `reorderTourItineraries(tourId, payload)` dung `POST /api/admin/tours/{id}/itineraries/reorder`
- Tao component standalone `TourItinerary` de tach logic itinerary khoi `TourForm`.
- Nhung `TourItinerary` vao `/admin/tours/:id/edit` va `/admin/tours/new`.
- Create mode hien card: `Vui long luu tour truoc khi quan ly lich trinh.`
- Edit mode load itinerary bang `GET /api/admin/tours/{id}/itineraries`.
- Them form them/sua ngay lich trinh gom:
  - dayNumber
  - title
  - description
  - hotelName
  - meals
  - transportModes
  - activities
  - placeNames
- Validate UI:
  - dayNumber >= 1.
  - title khong rong.
  - description duoc khuyen nghi bat buoc trong UI.
  - dayNumber khong trung voi ngay khac trong tour.
- Them ngay moi bang bulk save replace-all `PUT /itineraries`.
- Sua ngay bang bulk save replace-all `PUT /itineraries`.
- Xoa ngay co `window.confirm`, sau do bulk save replace-all.
- Hien thi timeline/card theo ngay, sort theo `dayNumber ASC`, sau do `sortOrder ASC`.
- Moi card co badge `Ngay X`, title, description, hotel/meals/transport/places/activities va actions Sua/Xoa/Len/Xuong.
- Nhan nut Len/Xuong se swap dayNumber voi ngay ke ben, bulk save lai danh sach, sau do goi reorder endpoint neu item co id.
- Khong them rich text editor, khong them thu vien moi.

### API Da Noi

- `GET /api/admin/tours/{id}/itineraries` qua `AdminTourApiService.getTourItineraries(tourId)`.
- `PUT /api/admin/tours/{id}/itineraries` qua `AdminTourApiService.saveTourItineraries(tourId, payload)`.
- `POST /api/admin/tours/{id}/itineraries/reorder` qua `AdminTourApiService.reorderTourItineraries(tourId, payload)`.
- Khong set Authorization header thu cong vi `authInterceptor` xu ly `Authorization: Bearer <token>`.

### Ket Qua Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.
- `git diff --check` tren nhom file tour itinerary/tour form/service/model: khong co whitespace error.

### Warning/Loi Con Lai

- Initial bundle van vuot warning budget: budget 500.00 kB, total 982.61 kB.
- `src/app/pages/public/home/components/home-hero/home-hero.scss` van vuot warning budget: 9.88 kB.
- `src/app/layouts/public-layout/public-layout.scss` van vuot warning budget: 9.99 kB.
- Khong co loi TypeScript/template.
- Itinerary nam trong lazy chunk `tour-form`, production raw size lazy chunk khoang 72.14 kB, khong gay loi hard budget.

### Ghi Chu Ky Thuat Va Rui Ro

- Backend report khong co endpoint POST/PUT/DELETE tung itinerary item. Frontend them/sua/xoa bang bulk replace-all `PUT /api/admin/tours/{id}/itineraries`, dung dung endpoint backend that.
- Backend rule khong trung `dayNumber` da duoc validate truoc o UI; backend van la lop bao ve cuoi neu co race condition.
- Reorder endpoint chi nhan `id/sortOrder`. Vi backend sort chinh theo `dayNumber`, nut Len/Xuong swap dayNumber bang bulk save roi moi goi reorder de dong bo sortOrder neu co id.
- Neu backend yeu cau `description` optional, UI van khuyen nghi bat buoc de noi dung public khong rong.
- Public Tour Detail co the hien itinerary dung du lieu nay neu public API itinerary doc chung bang `TOUR_ITINERARIES`.

### Checklist Test Thu Cong De Xuat

1. Dang nhap ADMIN.
2. Vao `/admin/tours`.
3. Mo edit mot tour `/admin/tours/:id/edit`.
4. Itinerary section hien thi.
5. Them Ngay 1 voi title/description.
6. Them Ngay 2.
7. Thu nhap trung dayNumber, UI phai bao loi.
8. Sua title/description cua mot ngay.
9. Xoa mot ngay sau confirm.
10. Reload trang, itinerary van con dung.
11. Thu nut Len/Xuong de doi thu tu ngay.
12. Vao `/admin/tours/new`, itinerary phai bao can luu tour truoc.
13. Kiem tra public tour detail neu public API itinerary da dung chung du lieu thi lich trinh hien dung.

## Cập Nhật: Chuẩn Hóa Tiếng Việt Có Dấu Cho Admin

Thời gian cập nhật: 2026-06-03 22:27:29 +07:00

### File Đã Sửa/Tạo Mới

- `src/app/pages/admin/tours/tour-form/tour-form.ts`
- `src/app/pages/admin/tours/tour-gallery/tour-gallery.ts`
- `src/app/pages/admin/tours/tour-gallery/tour-gallery.html`
- `src/app/pages/admin/tours/tour-itinerary/tour-itinerary.ts`
- `src/app/pages/admin/tours/tour-itinerary/tour-itinerary.html`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Đọc `VOYAGE_ADMIN_AUDIT_REPORT.md` và `VOYAGE_FRONTEND_AUDIT_REPORT.md` theo yêu cầu.
- Xác định các file admin đã làm gần đây gồm Admin Media, Categories, Destinations, Tours List, Tour Form, Tour Gallery và Tour Itinerary.
- Rà soát nhóm file admin được yêu cầu, tập trung vào chuỗi hiển thị UI, message, label, placeholder, empty state, confirm và audit.
- Chuẩn hóa các chuỗi tiếng Việt không dấu hoặc bị thay thế sai encoding trong Tour Form, Tour Gallery và Tour Itinerary.
- Không sửa logic API, route, service, model, enum, selector hoặc CSS class/BEM.
- Không sửa PublicLayout hoặc các màn public Home/Tours/TourDetail/Booking/Wishlist/Profile/Auth.

### Chức Năng Đã Thêm/Sửa

- Chuẩn hóa message thumbnail từ gallery trong Tour Form:
  - `Đã cập nhật preview thumbnail từ gallery. Bấm Lưu thay đổi để lưu vào tour.`
- Chuẩn hóa toàn bộ text hiển thị trong Tour Gallery:
  - tiêu đề, subtitle, notice create mode, label URL ảnh, placeholder, preview, empty state, action button và confirm xóa.
  - message lỗi/thành công khi load, thêm ảnh, sửa alt text, đặt thumbnail, reorder, copy URL và xóa ảnh.
- Chuẩn hóa toàn bộ text hiển thị trong Tour Itinerary:
  - tiêu đề, subtitle, notice create mode, form thêm/sửa, placeholder khách sạn/bữa ăn/điểm tham quan/hoạt động.
  - timeline card, empty state, action button và confirm xóa.
  - validation `Số ngày`, tiêu đề, mô tả và trùng ngày.
- Giữ nguyên các thuật ngữ kỹ thuật/code cần giữ như `Cloudinary`, `Admin Media`, `gallery`, `thumbnail`, `endpoint`, `reorder`, `sortOrder`, `tourId`, `dayNumber`.

### API Đã Nối

- Không nối API mới.
- Không thay đổi endpoint, payload hoặc auth interceptor.

### Kết Quả Build/Test

- Đã rà soát nhanh chuỗi không dấu bằng script Node trên nhóm file admin liên quan.
- `npx ng build --configuration development`: pass.
- `npm run build`: pass.
- Không có lỗi TypeScript/template.

### Warning/Lỗi Còn Lại

- Initial bundle vẫn vượt warning budget: budget 500.00 kB, total 982.61 kB.
- `src/app/layouts/public-layout/public-layout.scss` vẫn vượt warning budget: 9.99 kB.
- `src/app/pages/public/home/components/home-hero/home-hero.scss` vẫn vượt warning budget: 9.88 kB.
- Đây là warning budget cũ, không phải lỗi mới từ thay đổi text admin.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- Việc sửa chỉ thay đổi text hiển thị và audit, không thay đổi luồng nghiệp vụ.
- Khi ghi file tiếng Việt có dấu, ưu tiên `apply_patch`/Node UTF-8 để tránh lỗi mojibake từ PowerShell codepage.
- Một số section audit cũ trước đây vẫn là lịch sử triển khai; section mới này ghi nhận việc chuẩn hóa text admin sang tiếng Việt có dấu.

## Cập Nhật: Admin Tour Schedules Quản Lý Lịch Khởi Hành

Thời gian cập nhật: 2026-06-03 22:52:10 +07:00

### File Đã Sửa/Tạo Mới

- `src/app/core/api/admin-tour-api.service.ts`
- `src/app/core/models/admin-tour.model.ts`
- `src/app/pages/admin/tours/tour-form/tour-form.ts`
- `src/app/pages/admin/tours/tour-form/tour-form.html`
- `src/app/pages/admin/tours/tour-schedules/tour-schedules.ts`
- `src/app/pages/admin/tours/tour-schedules/tour-schedules.html`
- `src/app/pages/admin/tours/tour-schedules/tour-schedules.scss`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Đọc `VOYAGE_ADMIN_AUDIT_REPORT.md`, `VOYAGE_FRONTEND_AUDIT_REPORT.md`, `BACKEND_API_REPORT.md` theo yêu cầu.
- Xác nhận Admin Tour Form bước 1 đã có `/admin/tours/new`, `/admin/tours/:id/edit`, create/update tour và lazy chunk `tour-form`.
- Xác nhận Admin Tour Gallery đã có component riêng `TourGallery`.
- Xác nhận Admin Tour Itinerary đã có component riêng `TourItinerary`, dùng bulk replace-all đúng endpoint backend.
- Kiểm tra backend report mục `6.8 Tour Schedule Admin` và xác nhận endpoint schedule thật:
  - `POST /api/admin/tours/{id}/schedules`
  - `GET /api/admin/tours/{id}/schedules`
  - `GET /api/admin/tours/{tourId}/schedules/{id}`
  - `PUT /api/admin/tours/{tourId}/schedules/{id}`
  - `DELETE /api/admin/tours/{tourId}/schedules/{id}`
  - `PATCH /api/admin/tours/{tourId}/schedules/{id}/status`
  - `POST /api/admin/tours/{tourId}/schedules/{id}/duplicate`
- Không sửa PublicLayout hoặc các màn public Home/Tours/TourDetail/Booking/Wishlist/Profile/Auth.
- Không sửa AdminLayout/AdminMedia/AdminCategories/AdminDestinations/AdminToursList.

### Chức Năng Đã Thêm/Sửa

- Bổ sung model schedule trong `admin-tour.model.ts`:
  - `TourScheduleStatus`
  - `AdminTourSchedule`
  - `AdminTourScheduleCreateRequest`
  - `AdminTourScheduleUpdateRequest`
  - `AdminTourScheduleStatusRequest`
- Bổ sung API methods trong `AdminTourApiService`:
  - `getTourSchedules(tourId)`
  - `createTourSchedule(tourId, payload)`
  - `updateTourSchedule(tourId, scheduleId, payload)`
  - `updateTourScheduleStatus(tourId, scheduleId, status)`
  - `deleteTourSchedule(tourId, scheduleId)`
- Tạo component standalone `TourSchedules` để tách logic lịch khởi hành khỏi `TourForm`.
- Nhúng `TourSchedules` vào `/admin/tours/:id/edit` và `/admin/tours/new`.
- Create mode hiển thị card: `Vui lòng lưu tour trước khi quản lý lịch khởi hành.`
- Edit mode load schedule bằng `GET /api/admin/tours/{id}/schedules`.
- Thêm form thêm/sửa lịch gồm:
  - ngày khởi hành
  - ngày về
  - giá người lớn
  - giá trẻ em
  - giá em bé
  - số chỗ tối đa
  - trạng thái
  - ghi chú
- Validate UI:
  - ngày về phải lớn hơn hoặc bằng ngày khởi hành.
  - giá người lớn/trẻ em/em bé không âm.
  - số chỗ tối đa tối thiểu 1.
  - khi sửa, `maxSeats` không được nhỏ hơn `bookedSeats` nếu backend trả `bookedSeats`.
- Hiển thị danh sách lịch theo ngày khởi hành tăng dần.
- Mỗi lịch hiển thị ngày đi/ngày về, giá, maxSeats, bookedSeats, remainingSeats, trạng thái và ghi chú.
- Đổi trạng thái `OPEN/CLOSED/FULL/CANCELLED`; khi chuyển `CLOSED` hoặc `CANCELLED` có confirm nhẹ.
- Xóa lịch có `window.confirm`; nếu lịch đã có `bookedSeats > 0` thì confirm cảnh báo mạnh.
- Format tiền bằng `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`.
- Format ngày bằng `Intl.DateTimeFormat('vi-VN')`.

### API Đã Nối

- `GET /api/admin/tours/{id}/schedules` qua `AdminTourApiService.getTourSchedules(tourId)`.
- `POST /api/admin/tours/{id}/schedules` qua `AdminTourApiService.createTourSchedule(tourId, payload)`.
- `PUT /api/admin/tours/{tourId}/schedules/{id}` qua `AdminTourApiService.updateTourSchedule(tourId, scheduleId, payload)`.
- `PATCH /api/admin/tours/{tourId}/schedules/{id}/status` qua `AdminTourApiService.updateTourScheduleStatus(tourId, scheduleId, status)`.
- `DELETE /api/admin/tours/{tourId}/schedules/{id}` qua `AdminTourApiService.deleteTourSchedule(tourId, scheduleId)`.
- Chưa dùng endpoint duplicate vì task hiện tại chưa yêu cầu nhân bản lịch.
- Không set Authorization header thủ công vì `authInterceptor` xử lý `Authorization: Bearer <token>`.

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.
- Không có lỗi TypeScript/template.

### Warning/Lỗi Còn Lại

- Initial bundle vẫn vượt warning budget: budget 500.00 kB, total 983.11 kB.
- `src/app/pages/public/home/components/home-hero/home-hero.scss` vẫn vượt warning budget: 9.88 kB.
- `src/app/layouts/public-layout/public-layout.scss` vẫn vượt warning budget: 9.99 kB.
- Đây là warning budget cũ, không phải lỗi mới từ Admin Tour Schedules.
- Lazy chunk `tour-form` tăng lên khoảng 100.91 kB raw trong production build do thêm Schedule component, vẫn không gây lỗi hard budget.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- Backend report dùng field `notes`; UI dùng nhãn `Ghi chú` và payload gửi `notes`.
- Backend report có `singleSupplement`; UI chưa expose field này vì yêu cầu task không có input phụ thu phòng đơn, payload hiện gửi `singleSupplement: 0`.
- Schedule là nguồn chính cho giá và số chỗ khi user booking; thao tác sửa giá/số chỗ cần cẩn trọng nếu lịch đã có booking.
- Backend vẫn là lớp bảo vệ cuối cho oversell, optimistic lock và không cho xóa lịch đã có booking.
- Public Tour Detail/Checkout có thể phản ánh lịch mới nếu public API schedules đọc chung dữ liệu `TOUR_SCHEDULES`.

### Checklist Test Thủ Công Đề Xuất

1. Đăng nhập ADMIN.
2. Vào `/admin/tours`.
3. Mở edit một tour `/admin/tours/:id/edit`.
4. Schedule section hiển thị.
5. Thêm lịch khởi hành với ngày đi/ngày về hợp lệ.
6. Thử ngày về nhỏ hơn ngày đi, UI phải báo lỗi.
7. Nhập giá người lớn/trẻ em/em bé và số chỗ.
8. Lưu schedule thành công.
9. Reload trang, schedule vẫn còn.
10. Sửa giá hoặc maxSeats.
11. Đổi trạng thái `OPEN/CLOSED/FULL/CANCELLED`.
12. Nếu schedule có `bookedSeats > 0`, thử maxSeats nhỏ hơn bookedSeats, UI phải chặn.
13. Xóa schedule test sau confirm.
14. Vào `/admin/tours/new`, schedules phải báo cần lưu tour trước.
15. Kiểm tra public tour detail/checkout nếu public API schedules dùng chung dữ liệu thì lịch khởi hành hiển thị đúng.

## Cập Nhật: Admin Tours Compact Action Menu

Thời gian cập nhật: 2026-06-04 08:42:10 +07:00

### File Đã Sửa/Tạo Mới

- `src/app/pages/admin/tours/tours.ts`
- `src/app/pages/admin/tours/tours.html`
- `src/app/pages/admin/tours/tours.scss`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Đọc `VOYAGE_ADMIN_AUDIT_REPORT.md` và ưu tiên section mới nhất trong admin report.
- Đọc `VOYAGE_FRONTEND_AUDIT_REPORT.md` để nắm bối cảnh frontend, không ghi thay đổi admin vào frontend report.
- Xác định Admin Tours List hiện đã có load danh sách, search/filter/sort, KPI, update thumbnail, update status, publish checklist, delete, xem public, xem nhanh và sửa tour.
- Xác định cột `Hành động` trước đó đang render nhiều button và một select trạng thái nằm ngang trong `.admin-tours__row-actions`, làm grid table quá rộng và dễ bị tràn/mất bên phải.
- Chỉ sửa nhóm file liên quan trực tiếp đến Admin Tours UI, không sửa public Home/Tours/TourDetail/Booking/Wishlist/Profile/Auth và không sửa AdminLayout/Admin Media/Categories/Destinations/TourForm/Gallery/Itinerary/Schedules.

### Chức Năng Đã Thêm/Sửa

- Thêm state `openedActionTourId: number | null` để quản lý menu thao tác đang mở theo từng tour.
- Thêm `toggleActionMenu(tour, event?)`, `closeActionMenu()` và `isActionMenuOpen(tour)`.
- Thêm click outside đơn giản bằng `@HostListener('document:click')` để đóng menu khi click ra ngoài.
- Thay cụm button/select ngang trong cột `Hành động` bằng một nút icon `⋮` có `aria-label="Mở menu thao tác tour"`.
- Dropdown action gồm: `Xem nhanh`, `Sửa`, `Xem public`, `Cập nhật ảnh`, `Publish / Kiểm tra xuất bản`, nhóm `Đổi trạng thái` và `Xóa`.
- Chuyển đổi trạng thái trong row từ select ngang sang các button trong dropdown: `Nháp`, `Đã xuất bản`, `Tạm ẩn`, `Hết chỗ`.
- Giữ flow publish cũ: khi chọn trạng thái `PUBLISHED` vẫn đi qua checklist/publish flow hiện có.
- Giữ nguyên các method action cũ: quick view, edit route, public view, thumbnail panel, publish checklist, update status và delete confirm.
- Khi click action trong dropdown, menu sẽ đóng trước/sau thao tác tùy action nhưng không giữ menu mở sau khi chọn.
- Cập nhật table layout để cột `Hành động` còn 76px, giảm nguy cơ table tràn ngang.
- Cập nhật responsive card: action icon nằm góc phải row/card ở breakpoint tablet/mobile, không làm vỡ `data-label` cho các cột khác.
- Cập nhật dropdown custom với nền trắng, border `#E8E8E8`, radius 12px, shadow nhẹ, min-width 210px, z-index 40, danger action màu `#DA0808` và hover đỏ nhạt.

### API Đã Nối

- Không nối API mới.
- Không thay đổi endpoint, payload, service, model hoặc route.

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.
- Không có lỗi TypeScript/template.
- Đã phát hiện warning budget mới ở `src/app/pages/admin/tours/tours.scss` trong lần build trung gian, sau đó đã rút gọn SCSS để warning này không còn xuất hiện ở build cuối.

### Warning/Lỗi Còn Lại

- Initial bundle vẫn vượt warning budget: budget 500.00 kB, total 985.78 kB.
- `src/app/pages/public/home/components/home-hero/home-hero.scss` vẫn vượt warning budget: 9.88 kB.
- `src/app/layouts/public-layout/public-layout.scss` vẫn vượt warning budget: 9.99 kB.
- Đây là các warning budget cũ, không phải lỗi mới từ thay đổi Admin Tours action menu.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- Dropdown custom không dùng thư viện mới và không thêm import Taiga UI để tránh rủi ro compile/import không cần thiết.
- `closeActionMenu()` được dùng cả cho document click và khi chọn action; trigger/menu có stop propagation để không tự đóng ngay khi mở.
- Table container đã bỏ `overflow: hidden` để menu không bị cắt; layout desktop giảm cột action nên vẫn ưu tiên tránh scroll ngang.
- Cần test thủ công row cuối bảng để xác nhận dropdown không vượt/cắt theo viewport thực tế và kiểm tra thao tác mobile/tablet trên trình duyệt.

## Cập Nhật: Admin Taiga UI Confirm Và Notification

Thời gian cập nhật: 2026-06-04 09:02:16 +07:00

### File Đã Sửa/Tạo Mới

- `src/app/core/services/admin-ui-feedback.service.ts`
- `src/app/core/services/admin-confirm-dialog.component.ts`
- `src/app/app.routes.ts`
- `src/app/pages/admin/media/media.ts`
- `src/app/pages/admin/categories/categories.ts`
- `src/app/pages/admin/destinations/destinations.ts`
- `src/app/pages/admin/tours/tours.ts`
- `src/app/pages/admin/tours/tour-gallery/tour-gallery.ts`
- `src/app/pages/admin/tours/tour-itinerary/tour-itinerary.ts`
- `src/app/pages/admin/tours/tour-schedules/tour-schedules.ts`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Đọc `VOYAGE_ADMIN_AUDIT_REPORT.md` và ưu tiên section mới nhất.
- Đọc `VOYAGE_FRONTEND_AUDIT_REPORT.md` để nắm bối cảnh frontend, không ghi thay đổi admin vào frontend report.
- Kiểm tra `package.json`, xác nhận Taiga UI đang dùng `@taiga-ui/* 5.8.0`.
- Kiểm tra root app đã có `provideTaiga()` trong `app.config.ts` và `TuiRoot` trong `app.ts`, không cần thêm provider root mới.
- Xác định các màn admin đã làm gần đây: Admin Media, Categories, Destinations, Tours List, Tour Form, Tour Gallery, Tour Itinerary và Tour Schedules.
- Tìm toàn bộ `window.confirm`, `window.alert`, `confirm(`, `alert(` trong `src/app/pages/admin`.
- Không sửa public Home/Tours/TourDetail/Booking/Wishlist/Profile/Auth.
- Không đổi endpoint API, payload, model hoặc URL route.

### Chức Năng Đã Thêm/Sửa

- Tạo `AdminUiFeedbackService` dùng chung cho admin: success/error/warning/info và confirm danger/warning/info.
- Tạo `AdminConfirmDialogComponent` nội bộ mở bằng `TuiDialogService`, style theo theme admin teal/green, danger `#DA0808`, warning `#F59E0B`.
- Không dùng `TUI_CONFIRM` từ `@taiga-ui/kit` vì kéo thêm bundle và làm production vượt hard budget.
- Dùng `TuiNotificationService` cho toast success/error/warning/info, có chống spam notification trùng trong 800ms.
- Thay native confirm bằng Taiga dialog cho xóa media/category/destination/tour/gallery image/itinerary/schedule và đổi trạng thái INACTIVE/CLOSED/CANCELLED.
- Thêm Taiga notification cho copy URL media, set thumbnail gallery, xóa/cập nhật trạng thái thành công hoặc lỗi.
- Giữ nguyên inline `successMessage/errorMessage` hiện có để không phá UI message/card cũ.
- Đổi các admin child route trong `app.routes.ts` sang `loadComponent` để Taiga dialog/notification và admin pages không bị kéo vào initial bundle; path, guard và title giữ nguyên.

### API Đã Nối

- Không nối API mới.
- Không thay đổi endpoint, payload, service API, model hoặc auth interceptor.

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.
- Quét lại `src/app/pages/admin`: không còn `window.confirm`, `window.alert`, `confirm(` hoặc `alert(`.
- Không có lỗi TypeScript/template.
- Production build ban đầu bị hard budget do Taiga feedback bị kéo vào initial bundle; đã xử lý bằng lazy-load admin child routes và giữ feedback service trong lazy admin chunks.

### Warning/Lỗi Còn Lại

- Initial bundle vẫn vượt warning budget: budget 500.00 kB, total 858.90 kB.
- `src/app/pages/public/home/components/home-hero/home-hero.scss` vẫn vượt warning budget: 9.88 kB.
- `src/app/layouts/public-layout/public-layout.scss` vẫn vượt warning budget: 9.99 kB.
- Đây là warning budget còn lại; không có hard error sau build cuối.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- `AdminUiFeedbackService.confirm*()` trả về `Observable<boolean>`; các component dùng `take(1)` trước khi gọi API để tránh subscription treo.
- Khi người dùng hủy dialog, các thao tác delete/status không gọi API và không set loading/deleting/updating state.
- Admin Tours action dropdown đã đóng trước khi mở confirm ở các action menu, nên dialog không bị dropdown che.
- Route admin được chuyển sang lazy `loadComponent` chỉ để tối ưu bundle; URL `/admin/...`, guard và title không đổi.
- Cần test thủ công trên browser để xác nhận toast/dialog hiển thị đúng theme và select status schedule/tour không gây lệch UI khi hủy confirm.

## Cập Nhật: Admin Tours Dropdown Hành Động Phương Án B

Thời gian cập nhật: 2026-06-04 09:17:24 +07:00

### File Đã Sửa/Tạo Mới

- `src/app/pages/admin/tours/tours.ts`
- `src/app/pages/admin/tours/tours.html`
- `src/app/pages/admin/tours/tours.scss`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Đọc `VOYAGE_ADMIN_AUDIT_REPORT.md` và ưu tiên section mới nhất về Taiga UI confirm/notification.
- Đọc `VOYAGE_FRONTEND_AUDIT_REPORT.md` để nắm bối cảnh frontend, không ghi thay đổi admin vào frontend report.
- Xác định màn `/admin/tours` hiện có các action chính: xem nhanh/preview, sửa tour, xem public, cập nhật thumbnail, publish/checklist, đổi trạng thái và xóa tour.
- Refactor phần render bảng quản lý tour trong `tours.html` từ bảng nhiều metadata/action ngang sang bảng 6 cột chính: thumbnail, tên tour, giá, thời lượng, trạng thái và hành động.
- Chỉ sửa file liên quan trực tiếp đến Admin Tours UI; không sửa public pages, AdminLayout hoặc module admin khác.

### Chức Năng Đã Thêm/Sửa

- Import `TuiIcon` và dùng icon Taiga UI cho trigger/menu item: `more-vertical`, `eye`, `edit-2`, `copy`, `circle-play`, `archive`, `archive-restore`, `trash-2`.
- Cột `Hành động` chuyển sang fixed 80px, mỗi row chỉ còn một nút icon mở menu.
- Dropdown menu mới theo Phương án B gồm: `Xem trước`, `Chỉnh sửa`, `Nhân bản`, separator, primary action theo status, separator và `Xóa`.
- Primary action map theo status:
  - `DRAFT`: `Xuất bản`, dùng publish checklist flow hiện có.
  - `PUBLISHED`: `Tạm ẩn`, dùng flow update status `INACTIVE` và Taiga confirm warning hiện có.
  - `INACTIVE`/`SOLD_OUT`: `Kích hoạt lại`, dùng publish flow hiện có để đưa tour về published nếu checklist hợp lệ.
- Thêm `actionMenuPlacement` và kiểm tra `getBoundingClientRect()` để row gần đáy viewport mở dropdown lên trên bằng class `admin-tours__action-menu--top`.
- Bổ sung keyboard cơ bản: Enter/Space mở menu, Escape đóng menu.
- Thêm `duplicateTour()` dạng TODO có kiểm soát bằng Taiga notification info vì hiện chưa có API duplicate tour.
- Giữ nguyên logic nghiệp vụ/API hiện có cho preview, edit route, publish checklist, update status, Taiga confirm delete và delete tour.
- SCSS dropdown dùng light theme VoyageViet: nền trắng, border `0.5px solid rgba(0,0,0,0.15)`, radius 8px, shadow `0 4px 12px rgba(0,0,0,0.08)`, hover xám nhạt, danger `#DA0808`.
- Rút gọn SCSS không còn dùng để tránh warning budget mới ở `tours.scss`.

### API Đã Nối

- Không nối API mới.
- Không thay đổi endpoint, payload, service API, model hoặc route.
- Action `Nhân bản` chưa gọi API vì backend/service hiện chưa có endpoint duplicate trong màn này.

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.
- Không có lỗi TypeScript/template.
- Đã build production nhiều lần trong quá trình tối ưu; warning mới ở `tours.scss` đã được xử lý, build cuối không còn warning này.

### Warning/Lỗi Còn Lại

- Initial bundle vẫn vượt warning budget: budget 500.00 kB, total 859.07 kB.
- `src/app/layouts/public-layout/public-layout.scss` vẫn vượt warning budget: 9.99 kB.
- `src/app/pages/public/home/components/home-hero/home-hero.scss` vẫn vượt warning budget: 9.88 kB.
- Đây là các warning budget cũ, không phải lỗi mới từ refactor Admin Tours action dropdown.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- Dropdown custom vẫn nằm trong row/table và table để `overflow: visible`; cần test thực tế trên browser với row cuối bảng và scroll container để xác nhận menu không bị cắt.
- `Xem public` và `Cập nhật ảnh` vẫn còn method/panel trong component nhưng không còn nằm trong dropdown Phương án B theo yêu cầu mới.
- `Nhân bản` hiện chỉ hiển thị notification info; cần nối API duplicate nếu backend bổ sung endpoint ở bước sau.
- Cần test thủ công trên desktop/tablet/mobile để xác nhận layout card responsive, click outside, Esc, primary action theo status và Taiga confirm/notification hoạt động đúng.

## Cập Nhật: Admin Tours Dropdown Tối Giản Không Màu Primary

Thời gian cập nhật: 2026-06-04 09:22:12 +07:00

### File Đã Sửa/Tạo Mới

- `src/app/pages/admin/tours/tours.ts`
- `src/app/pages/admin/tours/tours.html`
- `src/app/pages/admin/tours/tours.scss`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Điều chỉnh dropdown hành động của `/admin/tours` theo ảnh mẫu người dùng gửi.
- Bỏ style xanh/teal riêng cho primary action trong dropdown.
- Giữ phạm vi chỉnh sửa trong Admin Tours, không sửa public pages hoặc module admin khác.

### Chức Năng Đã Thêm/Sửa

- Xóa helper `primaryActionClass()` vì không còn cần map màu success/warning theo status.
- Bỏ `[ngClass]="primaryActionClass(tour)"` khỏi primary action trong dropdown.
- Dropdown chuyển sang style tối giản: nền tối, chữ sáng mặc định, hover nhẹ, separator mảnh.
- Chỉ giữ style đỏ cho `Xóa` vì đây là action nguy hiểm.
- Trigger focus chuyển sang outline trung tính, không dùng màu teal/green.

### API Đã Nối

- Không nối API mới.
- Không thay đổi endpoint, payload, service API, model hoặc route.

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.
- Không có lỗi TypeScript/template.
- Không phát sinh warning mới ở `src/app/pages/admin/tours/tours.scss`.

### Warning/Lỗi Còn Lại

- Initial bundle vẫn vượt warning budget: budget 500.00 kB, total 859.07 kB.
- `src/app/layouts/public-layout/public-layout.scss` vẫn vượt warning budget: 9.99 kB.
- `src/app/pages/public/home/components/home-hero/home-hero.scss` vẫn vượt warning budget: 9.88 kB.
- Đây là các warning budget cũ, không phải lỗi mới từ chỉnh style dropdown Admin Tours.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- Dropdown hiện dùng màu mặc định tối giản cho mọi action không nguy hiểm; nếu cần phân biệt `Xuất bản/Tạm ẩn/Kích hoạt lại`, có thể bổ sung màu nhẹ sau nhưng hiện đã bỏ theo yêu cầu.
- Cần kiểm tra thực tế trên browser để xác nhận dropdown tối không bị lệch với nền trang admin light mode.

## Cập Nhật: Admin Tours Bảng Gọn Và Dropdown Trắng

Thời gian cập nhật: 2026-06-04 09:35:32 +07:00

### File Đã Sửa/Tạo Mới

- `src/app/pages/admin/tours/tours.ts`
- `src/app/pages/admin/tours/tours.html`
- `src/app/pages/admin/tours/tours.scss`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Đọc `VOYAGE_ADMIN_AUDIT_REPORT.md` và ưu tiên section mới nhất về dropdown tối giản không màu primary.
- Đọc `VOYAGE_FRONTEND_AUDIT_REPORT.md` để nắm bối cảnh frontend, không ghi thay đổi admin vào frontend report.
- Xác định task gần nhất đã chỉnh dropdown action `/admin/tours` sang nền tối và bỏ màu primary.
- Chỉ sửa file liên quan trực tiếp đến Admin Tours UI, không sửa public pages, AdminLayout hoặc module admin khác.

### Chức Năng Đã Thêm/Sửa

- Gộp `Thumbnail` và `Tên tour` thành một cột `Tour`, gồm thumbnail, title, slug và departure location.
- Bảng mới giữ các cột metadata chính: `Tour`, `Giá`, `Thời lượng`, `Số chỗ`, `Featured`, `Trạng thái`, `Cập nhật`, `Hành động`.
- Cột `Hành động` giữ một nút icon `more-vertical`, width cố định 72px và căn giữa.
- Dropdown action chuyển về nền trắng nhẹ:
  - trigger 32x32px, border `#DDE7E4`, nền trắng, icon `#1F6F68`.
  - menu nền trắng, border `#E3ECE9`, radius 12px, shadow nhẹ.
  - item cao 36px, hover nền `#F3F7F6`, không fill teal toàn item.
- Thêm màu chữ/icon nhẹ theo primary action:
  - `DRAFT`: `Xuất bản`, màu `#16A34A`.
  - `PUBLISHED`: `Tạm ẩn`, màu `#D97706`.
  - `INACTIVE`: `Kích hoạt lại`, màu `#1F6F68`.
  - `SOLD_OUT`: `Mở bán lại`, dùng flow publish hiện có.
- Giữ `Xóa` màu danger `#DA0808` và hover đỏ nhạt.
- Giữ action `Cập nhật ảnh` trong dropdown để panel thumbnail cũ vẫn truy cập được.
- Chuyển publish checklist ra khỏi row table sang card warning phía dưới toolbar, tránh làm row table phình lớn.
- Thêm `closePublishWarning()` để đóng card checklist.
- Khi checklist publish thiếu dữ liệu, hiển thị Taiga warning notification và card warning, không render inline checklist trong từng row.
- Giữ click outside, Escape, Enter/Space và logic menu mở lên trên khi gần đáy viewport.
- Rút gọn SCSS để `tours.scss` không phát sinh warning budget mới.

### API Đã Nối

- Không nối API mới.
- Không thay đổi endpoint, payload, service API, model hoặc route.
- Flow publish/checklist, update status, update thumbnail và delete vẫn dùng API hiện có.

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.
- Không có lỗi TypeScript/template.
- Đã xử lý warning mới của `src/app/pages/admin/tours/tours.scss`; build cuối không còn warning này.

### Warning/Lỗi Còn Lại

- Initial bundle vẫn vượt warning budget: budget 500.00 kB, total 859.07 kB.
- `src/app/pages/public/home/components/home-hero/home-hero.scss` vẫn vượt warning budget: 9.88 kB.
- `src/app/layouts/public-layout/public-layout.scss` vẫn vượt warning budget: 9.99 kB.
- Đây là các warning budget cũ, không phải lỗi mới từ chỉnh UI Admin Tours.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- Publish checklist card đang dùng style warning tối giản để giữ `tours.scss` dưới budget; nếu cần UI giàu hơn nên cân nhắc tách component/style riêng hoặc tăng budget có kiểm soát.
- `Nhân bản` vẫn là TODO có notification info vì chưa có API duplicate tour.
- Cần test thủ công trên browser để xác nhận dropdown trắng không bị cắt ở row cuối, action `Cập nhật ảnh` mở panel cũ và mobile/tablet không vỡ.

## Cập Nhật: Admin Tours Màu Action Dropdown Theo Trạng Thái

Thời gian cập nhật: 2026-06-04 09:47:30 +07:00

### File Đã Sửa/Tạo Mới

- `src/app/pages/admin/tours/tours.ts`
- `src/app/pages/admin/tours/tours.html`
- `src/app/pages/admin/tours/tours.scss`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Đọc `VOYAGE_ADMIN_AUDIT_REPORT.md` và ưu tiên section mới nhất về bảng gọn/dropdown trắng của Admin Tours.
- Đọc `VOYAGE_FRONTEND_AUDIT_REPORT.md` để nắm bối cảnh frontend, không ghi thay đổi admin vào frontend report.
- Chỉ sửa nhóm file liên quan trực tiếp đến Admin Tours UI, không sửa public pages, AdminLayout hoặc module admin khác.

### Chức Năng Đã Thêm/Sửa

- Thêm BEM modifier cho từng action thường trong dropdown: preview, edit, duplicate, image.
- Tăng specificity riêng cho trigger và menu item để không bị rule button chung của trang admin biến thành button gradient/teal lớn.
- Dropdown vẫn giữ nền trắng, border `#E3ECE9`, radius 12px, shadow nhẹ, hover nền nhạt.
- Action thường dùng màu trung tính/nhẹ:
  - `Xem trước`: màu mặc định trung tính.
  - `Chỉnh sửa`: màu teal `#1F6F68`.
  - `Nhân bản`: giữ màu trung tính.
  - `Cập nhật ảnh`: màu xanh nhẹ `#0EA5E9`.
- Primary action theo status dùng màu riêng:
  - `DRAFT`: `Xuất bản`, màu xanh lá `#16A34A`.
  - `PUBLISHED`: `Tạm ẩn`, màu amber `#D97706`.
  - `INACTIVE`: `Kích hoạt lại`, màu teal `#1F6F68`.
  - `SOLD_OUT`: `Mở bán lại`, màu blue `#2563EB`.
- `Xóa` luôn dùng danger `#DA0808` và hover đỏ nhạt.
- Dùng CSS variables ngắn trong SCSS để giữ `tours.scss` dưới warning budget.
- Không đổi flow publish checklist, update thumbnail, delete confirm, edit route hoặc Taiga feedback.

### API Đã Nối

- Không nối API mới.
- Không thay đổi endpoint, payload, service API, model hoặc route.

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.
- Không có lỗi TypeScript/template.
- Đã xử lý warning mới của `src/app/pages/admin/tours/tours.scss`; build cuối không còn warning này.

### Warning/Lỗi Còn Lại

- Initial bundle vẫn vượt warning budget: budget 500.00 kB, total 859.07 kB.
- `src/app/layouts/public-layout/public-layout.scss` vẫn vượt warning budget: 9.99 kB.
- `src/app/pages/public/home/components/home-hero/home-hero.scss` vẫn vượt warning budget: 9.88 kB.
- Đây là các warning budget cũ, không phải lỗi mới từ chỉnh màu dropdown Admin Tours.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- Icon trong menu kế thừa màu text của action để tránh tăng `tours.scss` vượt budget; màu action vẫn phản ánh đúng trạng thái và danger.
- `Nhân bản` vẫn là TODO có notification info vì chưa có API duplicate tour.
- Cần test thủ công trên browser để xác nhận hover màu nhạt, menu không bị cắt ở row cuối và các action cũ vẫn hoạt động.

## Cập Nhật: Polish UI Admin Button Và Màu Nhấn

- Thời gian cập nhật: 2026-06-04 10:01:43 +07:00
- File đã sửa/tạo mới:
  - `src/app/layouts/admin-layout/admin-layout.scss`
  - `src/app/pages/admin/media/media.scss`
  - `src/app/pages/admin/categories/categories.scss`
  - `src/app/pages/admin/destinations/destinations.scss`
  - `src/app/pages/admin/tours/tours.scss`
  - `src/app/pages/admin/tours/tour-form/tour-form.scss`
  - `src/app/pages/admin/tours/tour-gallery/tour-gallery.scss`
  - `src/app/pages/admin/tours/tour-itinerary/tour-itinerary.scss`
  - `src/app/pages/admin/tours/tour-schedules/tour-schedules.scss`
  - `VOYAGE_ADMIN_AUDIT_REPORT.md`
- Đầu việc đã làm:
  - Polish lại màu nhấn và hệ thống button trong khu vực admin để giảm việc dùng teal đặc quá nhiều.
  - Làm nhẹ card, table, form, filter, dropdown/action và status badge theo theme VoyageViet.
  - Giữ nguyên phạm vi admin, không sửa public pages, không đổi API/route/payload/model.
- Chức năng đã thêm/sửa:
  - AdminLayout: làm nhẹ nền content, sidebar active bớt nặng, link public dùng accent blue nhẹ.
  - Admin Media: summary chuyển sang nền nhạt, upload button dùng primary solid, filter active dùng soft teal, action/danger hover nhẹ, preview upload giới hạn chiều cao.
  - Admin Categories/Destinations: button chính dùng primary solid, link/phụ dùng outline, cập nhật ảnh dùng info, đổi trạng thái dùng warning, xóa dùng danger, input/select/textarea có focus teal nhẹ, status active/inactive tách màu green/amber.
  - Admin Tours: button chính bỏ gradient teal, link outline, dropdown action giữ nền trắng và màu theo action/status, status badge DRAFT/PUBLISHED/INACTIVE/SOLD_OUT đổi màu riêng.
  - Admin Tour Form/Gallery/Itinerary/Schedules: save/upload dùng primary solid, action phụ dùng outline/neutral, danger hover đỏ nhạt, input focus nhẹ, badge/status tách màu theo trạng thái, preview ảnh có giới hạn chiều cao ở các khu vực cần thiết.
- API đã nối nếu có:
  - Không có API mới.
  - Không đổi endpoint, payload, route hoặc model.
- Kết quả build/test:
  - `npx ng build --configuration development`: pass.
  - `npm run build`: pass.
  - Kiểm tra trong `src/app/pages/admin` và `src/app/layouts/admin-layout`: không có `#004FA8`, `window.confirm`, `window.alert`, `confirm(`, `alert(`.
- Warning/lỗi còn lại:
  - Còn warning budget cũ ở production build: initial bundle vượt 500 kB, `src/app/pages/public/home/components/home-hero/home-hero.scss`, `src/app/layouts/public-layout/public-layout.scss`.
  - Không còn warning budget mới ở `src/app/pages/admin/tours/tours.scss` sau khi trim lại rule phụ.
- Ghi chú kỹ thuật/rủi ro cần theo dõi:
  - Các thay đổi tập trung ở SCSS admin để tránh ảnh hưởng nghiệp vụ.
  - Không đụng các thay đổi backend/public đang có sẵn trong worktree.
  - Nên kiểm tra thủ công lại `/admin/tours`, `/admin/media`, `/admin/categories`, `/admin/destinations` và các tab Tour Form/Gallery/Itinerary/Schedules để đánh giá cảm giác màu/spacing thực tế trên desktop và mobile.

## Cập Nhật: Admin Tour Form Media Picker Và Autosave Draft

Thời gian cập nhật: 2026-06-04 07:45:42 +07:00

### File Đã Sửa/Tạo Mới

- `src/app/pages/admin/tours/tour-form/tour-form.ts`
- `src/app/pages/admin/tours/tour-form/tour-form.html`
- `src/app/pages/admin/tours/tour-form/tour-form.scss`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Chuyển các chuỗi tiếng Việt trong TourForm và section audit mới nhất sang UTF-8 đúng dấu.
- Giữ phạm vi trong nhóm Admin Tour Form và audit report; không sửa public pages.
- Không đổi API backend, endpoint tour/media hoặc payload tour.

### Chức Năng Đã Thêm/Sửa

- Media picker trong TourForm giữ 3 tab: `Chọn từ Media`, `Upload ảnh mới`, `Nhập URL thủ công`.
- Autosave draft create mode vẫn dùng key `vv_admin_tour_create_draft` và banner `Bạn có bản nháp chưa lưu.`.
- Các notification, validation message, label, placeholder và text preview đã được chuyển về tiếng Việt có dấu.

### API Đã Nối

- Tiếp tục dùng `AdminMediaApiService.getMedia(...)` và `AdminMediaApiService.uploadMedia(file, 'tours')`.
- Tiếp tục dùng `AdminTourApiService.createTour(payload)` và `updateTour(id, payload)`.

### Kết Quả Build/Test

- Cần chạy lại build sau khi chuyển mã nội dung.

### Warning/Lỗi Còn Lại

- Các warning budget cũ về initial bundle và public SCSS vẫn cần theo dõi.
- `tour-form.scss` có thể vẫn còn warning style budget 8KB do media picker UI.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- Không dùng base64 hoặc object URL làm URL thật gửi backend.
- Cần test thủ công lại `/admin/tours/new`, restore draft, chọn ảnh media, upload ảnh mới và create sang edit.

## Cập Nhật: Hoàn Thiện Việt Hóa Tour Form, Phân Loại Và Điểm Khởi Hành

Thời gian cập nhật: 2026-06-04 15:36:24 +07:00

### File Đã Sửa/Tạo Mới

- `src/app/pages/admin/tours/tour-form/tour-form.ts`
- `src/app/pages/admin/tours/tour-form/tour-form.html`
- `src/app/pages/admin/tours/tour-form/tour-form.scss`
- `src/app/pages/admin/tours/tour-gallery/tour-gallery.ts`
- `src/app/pages/admin/tours/tour-gallery/tour-gallery.html`
- `src/app/pages/admin/tours/tour-itinerary/tour-itinerary.html`
- `src/app/pages/admin/tours/tour-schedules/tour-schedules.html`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Đọc `VOYAGE_ADMIN_AUDIT_REPORT.md`, `VOYAGE_FRONTEND_AUDIT_REPORT.md` và `BACKEND_API_REPORT.md`; ưu tiên section admin mới nhất về Tour Form media picker/autosave.
- Xác nhận `AdminCategoryApiService.getCategories()`, `AdminDestinationApiService.getDestinations()` và `AdminMediaApiService.getMedia()/uploadMedia()` đã tồn tại.
- Chỉ sửa nhóm Admin Tour Form/Gallery/Itinerary/Schedules; không sửa public pages, không đổi route API backend và không ghi thay đổi admin vào frontend audit report.

### Chức Năng Đã Thêm/Sửa

- Việt hóa thêm breadcrumb, mô tả section, label, button, empty state và các message còn sót trong Tour Form/Gallery/Itinerary/Schedules.
- Danh mục tour tiếp tục lấy từ API admin categories, ưu tiên category `ACTIVE`; nếu API chỉ có inactive thì vẫn hiển thị và gắn nhãn `Tạm ẩn`.
- Option danh mục ưu tiên `name` từ API, có fallback slug quen thuộc như `tour-trong-nuoc`, `tour-nuoc-ngoai`, `tour-combo`, `visa`, `ve-may-bay`.
- Điểm đến tiếp tục lấy từ API admin destinations, hiển thị `name - country - region` nếu backend có đủ dữ liệu.
- Khi chọn category trong nước/nước ngoài, danh sách điểm đến chỉ được ưu tiên sắp xếp theo region/country phù hợp, không lọc cứng để tránh mất option.
- Điểm khởi hành đổi từ input text sang select với 3 option chuẩn: `Hà Nội`, `Đà Nẵng`, `TP. Hồ Chí Minh`.
- Edit mode giữ giá trị `departureLocation` cũ nếu khác 3 option bằng option tạm `Khác: <giá trị cũ>`.
- Create mode tự set mặc định `Hà Nội` nếu không có bản nháp.
- Preview card hiển thị thêm điểm khởi hành đã chọn.
- Empty state category/destination có link mở `/admin/categories` và `/admin/destinations`.
- Gallery đổi heading sang `Thư viện ảnh tour`, bổ sung text chọn từ Media/tải ảnh mới hoặc dán URL Cloudinary; chưa đổi endpoint gallery sang media picker thật.

### API Đã Nối

- Tiếp tục dùng `GET /api/admin/categories` qua `AdminCategoryApiService.getCategories()`.
- Tiếp tục dùng `GET /api/admin/destinations` qua `AdminDestinationApiService.getDestinations()`.
- Tiếp tục dùng `GET /api/admin/media` và `POST /api/admin/media/upload` trong Tour Form.
- Không đổi endpoint, enum backend, selector Angular hoặc key payload tour.

### Kết Quả Build/Test

- `npx ng build --configuration development`: lần đầu trong sandbox lỗi `spawn EPERM`, rerun ngoài sandbox pass.
- `npm run build`: lần đầu trong sandbox lỗi `spawn EPERM`; rerun ngoài sandbox lần 1 compile được nhưng fail budget error do `tour-form.scss` vượt hard limit 241 bytes; đã trim SCSS và rerun pass.

### Warning/Lỗi Còn Lại

- Production build còn warning budget cũ: initial bundle vượt 500 kB, `src/app/layouts/public-layout/public-layout.scss`, `src/app/pages/public/home/components/home-hero/home-hero.scss`.
- `src/app/pages/admin/tours/tour-form/tour-form.scss` còn warning budget ở mức 10.00 kB nhưng không còn vượt hard error 10 kB.
- Chưa test thủ công trên browser với backend thật nên cần kiểm tra lại category/destination/media data thực tế.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- Gallery hiện vẫn thêm ảnh bằng URL qua API tour image hiện có; nút `Chọn từ Media`/`Tải ảnh mới` đang dẫn admin sang Media, chưa mở media picker inline cho gallery.
- Category inactive bị ẩn nếu API có category active; nếu tour edit đang gắn category inactive, cần backend/API trả dữ liệu đủ hoặc bổ sung rule giữ option đang chọn ở task sau.
- Điểm đến chỉ được ưu tiên sắp xếp theo region/country, không filter cứng theo category để tránh mất dữ liệu nếu backend chưa chuẩn hóa region.

## Cập Nhật: Tích Hợp API Tỉnh/Thành Vào Admin Tour Form

Thời gian cập nhật: 2026-06-04 16:12:12 +07:00

### File Đã Sửa/Tạo Mới

- `src/app/core/models/vietnam-province.model.ts`
- `src/app/core/api/vietnam-province-api.service.ts`
- `src/environments/environment.ts`
- `src/app/pages/admin/tours/tour-form/tour-form.ts`
- `src/app/pages/admin/tours/tour-form/tour-form.html`
- `src/app/pages/admin/tours/tour-form/tour-form.scss`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Đọc `VOYAGE_ADMIN_AUDIT_REPORT.md`, `VOYAGE_FRONTEND_AUDIT_REPORT.md` và `BACKEND_API_REPORT.md`; ưu tiên section mới nhất về Tour Form.
- Xác nhận backend tour vẫn cần payload `destinationId` và `departureLocation`.
- Xác nhận `AdminDestinationApiService.getDestinations()` vẫn là nguồn dữ liệu admin destination thật.
- Chỉ sửa nhóm Admin Tour Form và service/model tỉnh thành; không sửa public pages, AdminLayout, Admin Media, Admin Tours List hoặc backend API.

### Chức Năng Đã Thêm/Sửa

- Tạo `VietnamProvince` model theo response `name`, `code`, `division_type`, `codename`, `phone_code`, `districts`.
- Tạo `VietnamProvinceApiService.getProvinces()` gọi `https://provinces.open-api.vn/api/v1/`.
- Thêm `vietnamProvinceApiUrl` vào `environment.ts`.
- TourForm load song song categories, admin destinations, provinces và tour detail nếu edit mode.
- Nếu API tỉnh/thành lỗi, form không sập; điểm đến fallback về danh sách Admin Destination hiện có.
- Field `Điểm đến` dùng danh sách tỉnh/thành Việt Nam làm option hiển thị.
- Khi chọn tỉnh/thành, form map sang Admin Destination trùng `name/slug/region` với `province.name/codename` và patch `destinationId`.
- Nếu tỉnh/thành chưa có bản ghi trong Admin > Điểm đến, form hiển thị lỗi dưới select và không cho submit vì `destinationId` vẫn invalid.
- Field `Điểm khởi hành` dùng danh sách tỉnh/thành Việt Nam; nếu API lỗi thì fallback về 3 option cũ `Hà Nội`, `Đà Nẵng`, `TP. Hồ Chí Minh`.
- Edit mode và draft restore tự đồng bộ select tỉnh/thành theo `destinationId` cũ nếu map được.
- SCSS form được chỉnh nhẹ để select cao 44px, input/select đồng bộ border/focus và error/hint nằm ngay dưới control.

### API Đã Nối

- `GET https://provinces.open-api.vn/api/v1/` qua `VietnamProvinceApiService.getProvinces()`.
- Tiếp tục dùng `GET /api/admin/destinations` để lấy `destinationId` thật cho payload tour.
- Không đổi endpoint tour backend, không đổi key payload `destinationId` hoặc `departureLocation`.

### Kết Quả Build/Test

- `npx ng build --configuration development`: lần đầu trong sandbox lỗi `spawn EPERM`, rerun ngoài sandbox pass.
- `npm run build`: lần đầu trong sandbox lỗi `spawn EPERM`; rerun ngoài sandbox phát hiện `tour-form.scss` vượt hard budget, đã trim SCSS và build cuối pass.

### Warning/Lỗi Còn Lại

- Production build còn warning budget: initial bundle vượt 500 kB.
- `src/app/pages/admin/tours/tour-form/tour-form.scss` còn warning budget 8 kB nhưng còn dưới hard error 10 kB.
- `src/app/pages/public/home/components/home-hero/home-hero.scss` và `src/app/layouts/public-layout/public-layout.scss` vẫn còn warning budget cũ.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- API tỉnh/thành là API ngoài; nếu trình duyệt không truy cập được hoặc bị CORS/network chặn thì form fallback về Admin Destination cho điểm đến và 3 điểm khởi hành cũ.
- Chọn tỉnh/thành chỉ submit được khi Admin Destination đã có bản ghi tương ứng; đây là cách giữ nguyên payload backend tour không đổi.
- Cần test thủ công với dữ liệu Admin Destination thực tế để bảo đảm tên/slug điểm đến khớp tỉnh/thành, ví dụ `Đà Nẵng`, `Hà Nội`, `TP. Hồ Chí Minh`.

## Cập Nhật: Sửa Contract Gallery Tour Từ Admin Media

Thời gian cập nhật: 2026-06-04 16:34:33 +07:00

### File Đã Sửa/Tạo Mới

- `../voyage-backend/src/main/java/com/voyageviet/backend/tour/dto/TourImageFromMediaRequest.java`
- `../voyage-backend/src/main/java/com/voyageviet/backend/tour/controller/AdminTourImageController.java`
- `../voyage-backend/src/main/java/com/voyageviet/backend/tour/service/TourImageService.java`
- `src/app/core/models/admin-tour.model.ts`
- `src/app/core/api/admin-tour-api.service.ts`
- `src/app/pages/admin/tours/tour-gallery/tour-gallery.ts`
- `src/app/pages/admin/tours/tour-gallery/tour-gallery.html`
- `src/app/pages/admin/tours/tour-gallery/tour-gallery.scss`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### API Backend Mới

- Thêm `POST /api/admin/tours/{id}/images/from-media`.
- Payload: `mediaId`, `altText`, `sortOrder`, `isThumbnail`.
- Endpoint multipart cũ `POST /api/admin/tours/{id}/images` vẫn được giữ nguyên cho upload file trực tiếp.
- Service backend kiểm tra tour tồn tại, media tồn tại, media phải là `IMAGE`, giữ rule tối đa 10 ảnh/tour, xử lý thumbnail độc nhất và trả `TourImageResponse`.
- Khi xóa tour image có `publicId` trùng Media đang lưu, backend chỉ xóa record tour image, không xóa asset Cloudinary dùng chung bởi Media.

### Frontend Đã Đổi

- Thêm model `AdminTourImageFromMediaRequest`.
- Thêm `AdminTourApiService.attachTourImageFromMedia(tourId, payload)`.
- `TourGallery` không còn gửi JSON URL vào endpoint multipart `/images`.
- Chọn ảnh từ Admin Media sẽ gọi `/images/from-media`.
- Upload ảnh mới trong gallery sẽ upload qua `AdminMediaApiService.uploadMedia(file, 'tours')`, lấy media id rồi attach bằng `/images/from-media`.
- Không gọi Cloudinary trực tiếp từ frontend và không dùng base64/object URL làm URL thật gửi backend.
- Ô dán URL thủ công được bỏ khỏi flow gallery để tránh gọi sai contract; thông báo lỗi thân thiện thay cho raw `Internal server error`.

### Kết Quả Build/Test

- Backend: `.\mvnw.cmd -DskipTests compile` pass sau khi sửa UTF-8 BOM ở các file Java mới/chỉnh.
- Frontend development: `npx ng build --configuration development` pass khi rerun ngoài sandbox; lần đầu trong sandbox lỗi `spawn EPERM`.
- Frontend production: `npm run build` pass khi rerun ngoài sandbox; lần đầu trong sandbox lỗi `spawn EPERM`.

### Warning/Lỗi Còn Lại Và Rủi Ro

- Production build còn warning budget hiện hữu: initial bundle vượt 500 kB, `home-hero.scss`, `public-layout.scss`, `tour-form.scss`.
- Chưa test thủ công đủ checklist với backend chạy thật: upload ở `/admin/media`, vào `/admin/tours/21/edit`, chọn ảnh từ Media, reload gallery, publish checklist.
- Nếu response upload media không trả `id/mediaId`, frontend sẽ báo không lấy được Media ID và không attach được ảnh.

## Cập Nhật: Cố Định Layout Validation Admin Tour Form

Thời gian cập nhật: 2026-06-04 17:00:17 +07:00

### File Đã Sửa

- `src/app/pages/admin/tours/tour-form/tour-form.html`
- `src/app/pages/admin/tours/tour-form/tour-form.scss`
- `src/app/pages/admin/tours/tour-form/tour-form.ts`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Đọc `VOYAGE_ADMIN_AUDIT_REPORT.md` và `VOYAGE_FRONTEND_AUDIT_REPORT.md`; ưu tiên section admin mới nhất.
- Chỉ sửa nhóm Admin Tour Form; không sửa public pages, AdminLayout, backend API tour hoặc `VOYAGE_FRONTEND_AUDIT_REPORT.md`.

### Chức Năng Đã Sửa

- Đổi field wrapper trong Tour Form từ label bọc toàn bộ sang cấu trúc thống nhất: `admin-tour-form__field`, `admin-tour-form__label`, `admin-tour-form__control`, `admin-tour-form__message-slot`.
- Mỗi input/select/textarea trong form chính có vùng message cố định bên dưới control, kể cả field chưa có lỗi.
- Error/help text dùng `admin-tour-form__field-error` và `admin-tour-form__field-help`, nằm trong message slot để không làm lệch các cột cùng hàng.
- Rút gọn cảnh báo tỉnh/thành:
  - Điểm đến: `Đang dùng điểm đến Admin do chưa tải được tỉnh/thành.`
  - Điểm khởi hành: `Đang dùng danh sách khởi hành dự phòng.`
- SCSS giữ input/select cao đều 44px, message slot cao cố định 34px và overflow nội dung dài để không đẩy layout grid.

### Kết Quả Build/Test

- `npx ng build --configuration development`: lần đầu trong sandbox lỗi `spawn EPERM`, rerun ngoài sandbox pass.
- `npm run build`: pass sau khi trim `tour-form.scss` để không vượt hard budget.

### Warning/Lỗi Còn Lại Và Rủi Ro

- Production build còn warning budget hiện hữu: initial bundle vượt 500 kB, `public-layout.scss`, `home-hero.scss`.
- `src/app/pages/admin/tours/tour-form/tour-form.scss` vẫn warning budget 8 kB và ở sát hard limit 10 kB, nhưng build đã pass.
- Chưa kiểm tra trực quan bằng browser tại `/admin/tours/new` và `/admin/tours/:id/edit`; cần nhìn lại các trạng thái có/không có validation để xác nhận spacing đúng như mong muốn.

## Cập Nhật: Proxy Tỉnh/Thành Và Fix NG0103 Tour Form

Thời gian cập nhật: 2026-06-04 17:14:31 +07:00

### File Đã Sửa/Tạo Mới

- `../voyage-backend/src/main/java/com/voyageviet/backend/location/controller/AdminLocationController.java`
- `../voyage-backend/src/main/java/com/voyageviet/backend/location/service/VietnamProvinceService.java`
- `../voyage-backend/src/main/java/com/voyageviet/backend/location/dto/VietnamProvinceResponse.java`
- `src/app/core/api/vietnam-province-api.service.ts`
- `src/app/core/models/vietnam-province.model.ts`
- `src/environments/environment.ts`
- `src/app/pages/admin/tours/tour-form/tour-form.ts`
- `src/app/pages/admin/tours/tour-form/tour-form.html`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Backend Đã Thêm

- Thêm `GET /api/admin/locations/provinces`.
- Backend gọi API ngoài `https://provinces.open-api.vn/api/v2/` thay cho Angular browser.
- `VietnamProvinceService` cache in-memory 12 giờ để tránh gọi API ngoài nhiều lần.
- Nếu API ngoài lỗi, service dùng cache cũ nếu có; nếu chưa có cache thì trả danh sách fallback tối thiểu gồm Hà Nội, Đà Nẵng, TP. Hồ Chí Minh và một số tỉnh/thành phổ biến.
- Response trả list đơn giản gồm `code`, `name`, `displayName`, `codename`, `divisionType`.

### Frontend Đã Sửa

- `VietnamProvinceApiService.getProvinces()` chuyển sang gọi `${environment.apiUrl}/admin/locations/provinces`.
- Bỏ `vietnamProvinceApiUrl` khỏi `environment.ts`; frontend không còn gọi trực tiếp `provinces.open-api.vn`, tránh CORS.
- `VietnamProvince` model bổ sung `displayName` và `divisionType`, vẫn giữ field cũ `division_type`, `phone_code`, `districts` để tương thích.
- Tour Form không còn dùng `destinationOptions()` và `departureOptions()` trong template.
- Thay bằng cached properties:
  - `destinationSelectOptions`
  - `departureSelectOptions`
  - `selectedDestinationMissingAdminRecord`
  - `destinationProvinceWarning`
  - `departureProvinceWarning`
- Recompute option list chỉ chạy khi load dữ liệu, đổi category, đổi departure hoặc restore/patch tour; không tạo array mới trong mỗi change detection.
- Warning tỉnh/thành được rút gọn và render từ property để không làm vỡ layout.

### Kết Quả Build/Test

- Backend: `.\mvnw.cmd -DskipTests compile` pass.
- Frontend development: `npx ng build --configuration development` pass khi rerun ngoài sandbox; lần đầu trong sandbox lỗi `spawn EPERM`.
- Frontend production: `npm run build` pass.

### Warning/Lỗi Còn Lại Và Rủi Ro

- Production build còn warning budget hiện hữu: initial bundle vượt 500 kB, `public-layout.scss`, `home-hero.scss`.
- `src/app/pages/admin/tours/tour-form/tour-form.scss` vẫn warning budget 8 kB và sát hard limit 10 kB, nhưng build pass.
- Chưa gọi thử endpoint với backend đang chạy thật; cần test đăng nhập admin rồi gọi `/api/admin/locations/provinces`.
- Nếu backend server không truy cập được Internet, form vẫn dùng fallback backend nên không còn lỗi CORS, nhưng danh sách tỉnh/thành sẽ chỉ là fallback tối thiểu.
## Cập Nhật: Admin Tour Form Chọn Nhiều Điểm Đến

Thời gian cập nhật: 2026-06-05 09:02:21 +07:00

### File Đã Sửa

- `src/app/pages/admin/tours/tour-form/tour-form.ts`
- `src/app/pages/admin/tours/tour-form/tour-form.html`
- `src/app/pages/admin/tours/tour-form/tour-form.scss`
- `src/app/core/models/admin-tour.model.ts`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Đọc `VOYAGE_ADMIN_AUDIT_REPORT.md`, `VOYAGE_FRONTEND_AUDIT_REPORT.md` và `../voyage-backend/BACKEND_API_REPORT.md`; ưu tiên section admin mới nhất về Tour Form/province proxy.
- Xác nhận TourForm trước bước này dùng `destinationSelectionKey` một giá trị để map tỉnh/thành sang `destinationId`, sau đó submit `destinationId`.
- Xác nhận backend admin tour create/update hiện chỉ nhận `destinationId`; chưa có `destinationIds` hoặc bảng liên kết nhiều điểm đến.
- Chỉ sửa nhóm Admin Tour Form và model tour admin; không sửa public pages, không sửa `VOYAGE_FRONTEND_AUDIT_REPORT.md`.

### Chức Năng Đã Sửa

- Đổi field `Điểm đến` từ select một lựa chọn sang multi-select custom có checkbox/selected state.
- Dropdown option chỉ hiển thị tên ngắn của tỉnh/thành hoặc destination, bỏ hoàn toàn hậu tố `chưa có trong Admin > Điểm đến` khỏi option.
- Thêm nút `Xóa tất cả` trong dropdown.
- Thêm state `selectedDestinationIds`, `selectedDestinationOptions` và label cache `selectedDestinationLabel`.
- Khi chọn nhiều điểm đến, label hiển thị nối bằng ` - `; nếu quá 3 điểm thì hiển thị 3 điểm đầu và `+N điểm`.
- Preview tour dùng label nhiều điểm đến đã chọn thay vì chỉ đọc destination chính.
- Draft create lưu/khôi phục được danh sách key điểm đến đã chọn qua form control `destinationSelectionKeys`.
- Edit mode vẫn patch tour cũ từ `destinationId`; nếu response sau này có `destinationIds`, form có thể đọc để hiển thị nhiều điểm.
- Warning điểm đến chưa có bản ghi Admin được chuyển xuống `.admin-tour-form__message-slot`.
- Ghi chú dưới field: `Điểm đến đầu tiên sẽ được dùng làm điểm đến chính của tour.`

### Payload Và Backend

- Tiếp tục submit payload cũ với `destinationId`.
- Khi chọn nhiều điểm đến, option đầu tiên trong danh sách chọn được dùng làm `destinationId` chính.
- Không gửi `destinationIds` lên backend vì `BACKEND_API_REPORT.md` chưa ghi nhận contract này.
- `AdminTour` model chỉ bổ sung field response/frontend-compatible: `destinationIds`, `destinationDisplayName`, `selectedDestinationNames`; request create/update không đổi.

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/Lỗi Còn Lại Và Rủi Ro

- Production build còn warning budget hiện hữu: initial bundle, `public-layout.scss`, `home-hero.scss`.
- `src/app/pages/admin/tours/tour-form/tour-form.scss` còn warning budget ở mức 10.00 kB nhưng không vượt hard error.
- Multi-select nhiều điểm đến hiện là UI/display an toàn; backend vẫn chỉ lưu một điểm đến chính.
- TODO backend nếu muốn lưu nhiều điểm đến thật: thêm request `destinationIds: number[]` hoặc bảng liên kết `TOUR_DESTINATIONS`, sau đó cập nhật create/update/detail response và publish/search logic tương ứng.

## Cập Nhật: Polish UI Lịch Trình Và Lịch Khởi Hành Admin Tour Form

Thời gian cập nhật: 2026-06-05 09:52:55 +07:00

### File Đã Sửa

- `src/app/pages/admin/tours/tour-itinerary/tour-itinerary.html`
- `src/app/pages/admin/tours/tour-itinerary/tour-itinerary.scss`
- `src/app/pages/admin/tours/tour-schedules/tour-schedules.html`
- `src/app/pages/admin/tours/tour-schedules/tour-schedules.scss`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Đọc `VOYAGE_ADMIN_AUDIT_REPORT.md` và `VOYAGE_FRONTEND_AUDIT_REPORT.md`; ưu tiên section admin mới nhất về Admin Tour Form chọn nhiều điểm đến.
- Kiểm tra UI hiện tại của `TourItinerary` và `TourSchedules`, tập trung vào header section, CTA thêm mới và empty state.
- Chỉ sửa nhóm Admin Tour Form sub-section liên quan tới Lịch trình/Lịch khởi hành; không sửa public pages, không đổi API/backend payload và không ghi vào frontend audit report.

### Chức Năng Đã Thêm/Sửa

- Header `Lịch trình tour` và `Lịch khởi hành` chuyển sang nền gradient mint rất nhẹ, padding `20px 24px`, title nhỏ gọn hơn.
- Nút thêm ở header đổi thành soft outline nhỏ, cao 40px, nền `#EAF7F4`, chữ `#1F6F68`, hover `#DDF2EE`.
- Áp dụng hướng B để tránh lặp nút nặng: khi danh sách rỗng, header không hiển thị nút thêm; khi đã có dữ liệu, nút thêm xuất hiện ở header; empty state có CTA nhỏ để tạo item đầu tiên.
- Empty state của lịch trình/lịch khởi hành có nội dung giới hạn `max-width: 520px`, padding gọn `32px 24px`, icon tròn 44px nền mint nhạt.
- Thêm class BEM mới cho itinerary: `admin-tour-itinerary__hero`, `__hero-content`, `__hero-action`, `__empty-inner`, `__empty-icon`, `__empty-title`, `__empty-text`, `__empty-action`.
- Thêm class BEM mới cho schedules: `admin-tour-schedules__hero`, `__hero-content`, `__hero-action`, `__empty-inner`, `__empty-icon`, `__empty-title`, `__empty-text`, `__empty-action`.
- Giữ nguyên method click hiện có: `openCreateForm()`, save/edit/delete/reorder/status không đổi.
- Mobile tiếp tục chuyển header/form head sang column và action stretch theo layout cũ.

### API Đã Nối

- Không nối API mới.
- Không đổi endpoint, payload, model hoặc service.

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/Lỗi Còn Lại

- Production build còn warning budget hiện hữu: initial bundle vượt 500 kB.
- `src/app/layouts/public-layout/public-layout.scss` và `src/app/pages/public/home/components/home-hero/home-hero.scss` vẫn vượt warning budget cũ.
- `src/app/pages/admin/tours/tour-form/tour-form.scss` vẫn warning budget ở mức 10.00 kB nhưng không vượt hard error.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- Thay đổi chỉ là HTML/SCSS cho sub-section admin tour; không tác động logic nghiệp vụ hoặc contract backend.
- Chưa test trực quan bằng browser thật tại `/admin/tours/:id/edit`; cần kiểm tra lại spacing, hover, empty state và responsive với dữ liệu thật.

## Cập Nhật: Chuẩn Bị Data Điểm Đến Cho Admin Destinations

Thời gian cập nhật: 2026-06-05 10:17:33 +07:00

### File Đã Sửa

- `src/app/core/models/destination.model.ts`
- `src/app/core/api/admin-destination-api.service.ts`
- `src/app/pages/admin/destinations/destinations.ts`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Đọc `VOYAGE_ADMIN_AUDIT_REPORT.md`, `VOYAGE_FRONTEND_AUDIT_REPORT.md` và `../voyage-backend/BACKEND_API_REPORT.md`; ưu tiên section admin mới nhất về polish Tour Form sub-section.
- Xác nhận Admin Destinations CRUD hiện nằm ở `src/app/pages/admin/destinations/destinations.ts/html/scss`, dùng `AdminDestinationApiService` và `destination.model.ts`.
- Xác nhận `VietnamProvinceApiService.getProvinces()` đã có và đang gọi backend proxy `GET /api/admin/locations/provinces`.
- Chỉ chuẩn bị data/model/service cho Admin Destinations; không sửa TourForm, public pages, AdminLayout hoặc backend payload.
- Không ghi thay đổi admin vào `VOYAGE_FRONTEND_AUDIT_REPORT.md`.

### Chức Năng Đã Thêm/Sửa

- Bổ sung model/type destination:
  - `CountryOption`
  - `CountriesNowCitiesResponse`
  - `DestinationRegion`
  - `DestinationSubRegion`
  - `ProvinceRegionMap`
- Bổ sung `AdminDestinationApiService.getCountries()` gọi REST Countries: `GET https://restcountries.com/v3.1/all?fields=name,flags,population`.
- Bổ sung `AdminDestinationApiService.getCitiesByCountry(country)` gọi CountriesNow: `POST https://countriesnow.space/api/v0.1/countries/cities`.
- `AdminDestinations` inject thêm `VietnamProvinceApiService` và load reference data độc lập với CRUD destinations.
- Thêm state chuẩn bị cho form:
  - `vietnamProvinces`
  - `countryOptions`
  - `internationalCityOptions`
  - `destinationDataLoading`
  - `internationalCitiesLoading`
  - `destinationDataWarning`
  - `internationalCitiesWarning`
- Thêm `provinceRegionMap` để map tỉnh/thành Việt Nam theo `NORTH/CENTRAL/SOUTH`.
- Thêm fallback quốc gia và thành phố quốc tế phổ biến nếu REST Countries hoặc CountriesNow lỗi.
- Thêm watcher `region/country` để:
  - `DOMESTIC` tự giữ country là `Việt Nam` và clear city quốc tế.
  - `INTERNATIONAL` load city theo country đang chọn.
- Thêm helper chuẩn hóa province/country/city và helper xác định sub-region của tỉnh.
- Không đổi form payload `AdminDestinationCreateRequest/UpdateRequest`; CRUD hiện tại vẫn gửi `name`, `slug`, `region`, `country`, `description`, `imageUrl`, `latitude`, `longitude`, `status`.

### API Đã Nối

- Tiếp tục dùng API backend hiện có:
  - `GET /api/admin/destinations`
  - `POST /api/admin/destinations`
  - `PUT /api/admin/destinations/{id}`
  - `PATCH /api/admin/destinations/{id}/status`
  - `PATCH /api/admin/destinations/{id}/image`
  - `DELETE /api/admin/destinations/{id}`
- Tái sử dụng proxy backend:
  - `GET /api/admin/locations/provinces`
- Thêm data source frontend cho reference data quốc tế:
  - `GET https://restcountries.com/v3.1/all?fields=name,flags,population`
  - `POST https://countriesnow.space/api/v0.1/countries/cities`

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/Lỗi Còn Lại

- Production build còn warning budget hiện hữu: initial bundle vượt 500 kB.
- `src/app/pages/admin/tours/tour-form/tour-form.scss`, `src/app/layouts/public-layout/public-layout.scss` và `src/app/pages/public/home/components/home-hero/home-hero.scss` vẫn vượt warning budget cũ.
- Chưa test runtime gọi REST Countries/CountriesNow trên browser thật; nếu CORS/network lỗi, UI đã có fallback data và warning state.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- Lượt này chỉ chuẩn bị data/model/service cho Admin Destinations; chưa đổi HTML form để chọn tỉnh/quốc gia/thành phố.
- REST Countries và CountriesNow đang được gọi trực tiếp từ frontend; nếu muốn quản lý CORS/cache chặt hơn, nên thêm backend proxy tương tự `/api/admin/locations/provinces`.
- TourForm chưa được chuyển nguồn điểm đến trong lượt này; task sau có thể dùng dữ liệu Admin Destinations đã chuẩn hóa để TourForm chỉ chọn destination đã tạo.

## Cập Nhật: Refactor UI Form Admin Destinations Theo Trong Nước / Quốc Tế

Thời gian cập nhật: 2026-06-05 11:09:36 +07:00

### File Đã Sửa

- `src/app/pages/admin/destinations/destinations.ts`
- `src/app/pages/admin/destinations/destinations.html`
- `src/app/pages/admin/destinations/destinations.scss`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Đọc `VOYAGE_ADMIN_AUDIT_REPORT.md`, `VOYAGE_FRONTEND_AUDIT_REPORT.md` và `../voyage-backend/BACKEND_API_REPORT.md`; ưu tiên section admin mới nhất về chuẩn bị data Admin Destinations.
- Xác nhận Prompt 1 đã chuẩn bị `VietnamProvinceApiService`, REST Countries, CountriesNow, model `CountryOption`, `DestinationRegion`, `DestinationSubRegion`, `ProvinceRegionMap` và fallback data.
- Xác nhận backend Destination vẫn nhận contract hiện tại: `name`, `slug`, `region`, `country`, `description`, `imageUrl`, `latitude`, `longitude`, `status` khi update.
- Chỉ sửa nhóm Admin Destinations; không sửa TourForm, public pages, AdminLayout hoặc frontend audit report.

### Chức Năng Đã Thêm/Sửa

- Đưa field `Khu vực` lên đầu form và đổi sang toggle `Trong nước` / `Quốc tế`.
- Luồng `Trong nước`: chọn `Miền Bắc`, `Miền Trung`, `Miền Nam` bằng `subRegion` frontend-only.
- Sau khi chọn miền, hiển thị search/dropdown tỉnh/thành Việt Nam từ `VietnamProvinceApiService.getProvinces()`.
- Option chỉ hiển thị tên ngắn của tỉnh/thành, không có text cảnh báo dài.
- Khi chọn tỉnh/thành, tự set `cityName`, `name`, `country = Việt Nam` và auto slug.
- Luồng `Quốc tế`: search/dropdown quốc gia từ REST Countries, hiển thị cờ và tên quốc gia.
- Khi chọn quốc gia, set `country`, reset city/name/slug và gọi CountriesNow để lấy city list.
- Search/dropdown thành phố theo quốc gia; chọn city sẽ tự set `cityName`, `name`, `slug`.
- Nếu city API lỗi hoặc không có data, form chuyển sang input text thủ công `Nhập tên thành phố`.
- Khi switch region, chỉ reset nhóm location/name/slug; giữ nguyên `description`, `imageUrl`, `latitude`, `longitude`, `status`.
- Khi edit destination, form tự infer region, country, cityName và subRegion nếu là điểm đến trong nước.
- Payload create/update vẫn map về đúng contract backend hiện tại, không gửi `subRegion`, `cityName`, `countrySearch`, `citySearch`.
- SCSS bổ sung tối thiểu cho region toggle và dropdown list; đã tinh gọn để không tạo warning budget mới cho `destinations.scss`.

### API Đã Nối

- Không thêm API backend mới.
- Tái sử dụng data source đã chuẩn bị ở Prompt 1:
  - `GET /api/admin/locations/provinces`
  - `GET https://restcountries.com/v3.1/all?fields=name,flags,population`
  - `POST https://countriesnow.space/api/v0.1/countries/cities`
- CRUD Destination vẫn dùng endpoint cũ:
  - `POST /api/admin/destinations`
  - `PUT /api/admin/destinations/{id}`

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/Lỗi Còn Lại

- Production build còn warning budget hiện hữu:
  - initial bundle vượt 500 kB.
  - `src/app/pages/admin/tours/tour-form/tour-form.scss` vượt 8 kB.
  - `src/app/layouts/public-layout/public-layout.scss` vượt 8 kB.
  - `src/app/pages/public/home/components/home-hero/home-hero.scss` vượt 8 kB.
- Không còn warning mới cho `src/app/pages/admin/destinations/destinations.scss` sau khi tinh gọn CSS.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- `subRegion`, `cityName`, `countrySearch`, `citySearch` là state/control phục vụ UI, không gửi backend.
- Nếu REST Countries hoặc CountriesNow bị CORS/network ở runtime, form có fallback quốc gia/thành phố và input city thủ công.
- Chưa test thủ công bằng browser thật tại `/admin/destinations`; cần kiểm tra UX dropdown/search với dữ liệu thật và việc tạo/sửa destination trên API đang chạy.

## Cập Nhật: Dọn Tour Form Chỉ Dùng Admin Destinations

Thời gian cập nhật: 2026-06-05 11:56:40 +07:00

### File Đã Sửa

- `src/app/pages/admin/tours/tour-form/tour-form.ts`
- `src/app/pages/admin/tours/tour-form/tour-form.html`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Đọc `VOYAGE_ADMIN_AUDIT_REPORT.md`, `VOYAGE_FRONTEND_AUDIT_REPORT.md` và `../voyage-backend/BACKEND_API_REPORT.md`; ưu tiên section admin mới nhất về Admin Destinations theo luồng Trong nước / Quốc tế.
- Xác nhận Admin Destinations đã được nâng cấp để tạo điểm đến trong nước/quốc tế và chuẩn hóa dữ liệu tỉnh/quốc gia/thành phố tại `/admin/destinations`.
- Xác nhận backend tour hiện vẫn chỉ nhận `destinationId` trong create/update tour; chưa có `destinationIds`.
- Chỉ sửa Admin Tour Form; không sửa Admin Destinations, public pages hoặc frontend audit report.

### Chức Năng Đã Sửa

- Xóa hoàn toàn luồng province API khỏi Tour Form:
  - Không inject `VietnamProvinceApiService`.
  - Không gọi `GET /api/admin/locations/provinces`.
  - Không còn state/helper `provinces`, province warning, province selection key hoặc mapping province -> destination.
- Field `Điểm đến` chỉ lấy dữ liệu thật từ `AdminDestinationApiService.getDestinations()`.
- Dropdown điểm đến chỉ hiển thị destination đã tạo trong Admin Destinations, không còn option tỉnh/thành chưa tạo.
- Label option:
  - Trong nước: `Tên điểm đến - Việt Nam` hoặc kèm region nếu backend lưu region khác `DOMESTIC`.
  - Quốc tế: `Tên điểm đến - Quốc gia`.
- Multi-select điểm đến vẫn giữ:
  - Label trigger/preview dùng tên ngắn và nối bằng ` - `.
  - Điểm đầu tiên được chọn tiếp tục là `destinationId` chính gửi backend.
  - Không gửi `destinationIds` vì backend report chưa hỗ trợ.
- Empty/help text hiển thị khi chưa có điểm đến: `Chưa có điểm đến. Vui lòng tạo điểm đến trong Admin > Điểm đến.`
- Điểm khởi hành không còn lấy province; chỉ dùng `Hà Nội`, `Đà Nẵng`, `TP. Hồ Chí Minh`.
- Nếu edit/draft có `departureLocation` khác 3 option chuẩn, dropdown thêm option tạm `Khác: <giá trị cũ>`.
- Bỏ các warning cũ:
  - `Đang dùng điểm đến Admin.`
  - `Đang dùng danh sách dự phòng.`
  - Cảnh báo điểm đến chưa được tạo trong Admin.

### API Đã Nối

- Tiếp tục dùng:
  - `GET /api/admin/categories`
  - `GET /api/admin/destinations`
  - `GET /api/admin/tours/{id}` khi edit.
- Không còn request từ Tour Form tới:
  - `GET /api/admin/locations/provinces`
  - `provinces.open-api.vn`

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/Lỗi Còn Lại

- Production build còn warning budget hiện hữu:
  - initial bundle vượt 500 kB.
  - `src/app/pages/admin/tours/tour-form/tour-form.scss` vượt 8 kB.
  - `src/app/layouts/public-layout/public-layout.scss` vượt 8 kB.
  - `src/app/pages/public/home/components/home-hero/home-hero.scss` vượt 8 kB.
- Chưa test thủ công bằng browser thật với Network tab.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- Backend tour hiện vẫn chỉ lưu `destinationId` chính; multi-select trong Tour Form chỉ hỗ trợ display/UI tạm cho các điểm còn lại.
- Nếu muốn lưu nhiều điểm đến thật, backend cần thêm `destinationIds` hoặc bảng liên kết `TOUR_DESTINATIONS`.
- Tour Form giờ phụ thuộc vào việc admin đã tạo destination trước tại `/admin/destinations`; nếu danh sách rỗng, tour không thể submit hợp lệ vì thiếu `destinationId`.

## Cập Nhật: Dropdown Quốc Gia Tiếng Việt Cho Admin Destinations

Thời gian cập nhật: 2026-06-05 13:44:09 +07:00

### File Đã Sửa

- `src/app/pages/admin/destinations/destinations.ts`
- `src/app/pages/admin/destinations/destinations.html`
- `src/app/core/models/destination.model.ts`
- `src/app/core/api/admin-destination-api.service.ts`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Đọc `VOYAGE_ADMIN_AUDIT_REPORT.md`, `VOYAGE_FRONTEND_AUDIT_REPORT.md` và `../voyage-backend/BACKEND_API_REPORT.md`; ưu tiên section admin mới nhất.
- Xác nhận task Admin Destinations gần nhất đã refactor form theo luồng:
  - Trong nước: `Miền -> Tỉnh/Thành`.
  - Quốc tế: `Quốc gia -> Thành phố`.
- Xác nhận backend Destination vẫn giữ contract `name`, `slug`, `region`, `country`, `description`, `imageUrl`, `latitude`, `longitude`, `status`.
- Chỉ sửa nhóm Admin Destinations/model/service liên quan; không sửa TourForm, public pages, AdminLayout hoặc frontend audit report.

### Chức Năng Đã Sửa

- Country picker của luồng `Quốc tế` chuyển sang custom searchable dropdown:
  - List quốc gia không còn bung trực tiếp trong form.
  - Input search là trigger mở dropdown.
  - Dropdown nằm absolute dưới input, có max-height/scroll, không kéo cao layout form.
  - Chọn quốc gia xong dropdown tự đóng.
- Quốc gia hiển thị bằng tiếng Việt:
  - Ưu tiên `translations.vie.common` từ REST Countries.
  - Fallback qua `Intl.DisplayNames(['vi'], { type: 'region' })` theo `cca2`.
  - Fallback cuối cùng là `name.common`.
- Vẫn hiển thị cờ quốc gia nếu REST Countries trả `flags.svg/png`.
- Search quốc gia hỗ trợ tên tiếng Việt, tên tiếng Anh, tên official và mã `cca2`.
- Khi chọn quốc gia:
  - Form set `country` và `countrySearch` bằng tên tiếng Việt.
  - `CountriesNow` vẫn được gọi bằng `name.common` tiếng Anh từ `selectedCountryOption` để giảm lỗi API city.
- Edit mode nếu destination cũ đang lưu tên tiếng Anh sẽ cố gắng map lại sang country option và hiển thị/lưu lại tên tiếng Việt.

### API Đã Nối

- Cập nhật REST Countries fields:
  - `GET https://restcountries.com/v3.1/all?fields=name,flags,population,cca2,translations`
- Tiếp tục dùng:
  - `POST https://countriesnow.space/api/v0.1/countries/cities`
  - CRUD Destination hiện có qua `/api/admin/destinations`.

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/Lỗi Còn Lại

- Production build còn warning budget hiện hữu:
  - initial bundle vượt 500 kB.
  - `src/app/pages/admin/tours/tour-form/tour-form.scss` vượt 8 kB.
  - `src/app/layouts/public-layout/public-layout.scss` vượt 8 kB.
  - `src/app/pages/public/home/components/home-hero/home-hero.scss` vượt 8 kB.
- Chưa test thủ công bằng browser thật tại `/admin/destinations` với REST Countries/CountriesNow runtime.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- Không dùng Taiga UI import mới để tránh rủi ro dependency/template; dùng custom dropdown theo style hiện tại với behavior tương đương.
- Backend hiện chỉ lưu `country` dạng string; sau thay đổi này điểm đến quốc tế mới sẽ lưu tên quốc gia tiếng Việt.
- CountriesNow vẫn phụ thuộc tên tiếng Anh; nếu REST Countries không map được country option khi edit dữ liệu cũ, city API có thể fallback sang input thủ công như trước.

## Cập Nhật: Dropdown Thành Phố Cho Admin Destinations Quốc Tế

Thời gian cập nhật: 2026-06-05 13:57:09 +07:00

### File Đã Sửa

- `src/app/pages/admin/destinations/destinations.ts`
- `src/app/pages/admin/destinations/destinations.html`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Đọc `VOYAGE_ADMIN_AUDIT_REPORT.md`, `VOYAGE_FRONTEND_AUDIT_REPORT.md` và `../voyage-backend/BACKEND_API_REPORT.md`; ưu tiên section admin mới nhất.
- Xác nhận task gần nhất đã sửa country picker thành custom searchable dropdown, hiển thị tên quốc gia tiếng Việt và vẫn gọi CountriesNow bằng tên tiếng Anh.
- Chỉ sửa nhóm Admin Destinations; không sửa TourForm, public pages, AdminLayout hoặc frontend audit report.
- Xác nhận backend Destination vẫn giữ payload CRUD hiện tại, không cần đổi API/backend payload.

### Chức Năng Đã Sửa

- City picker của luồng `Quốc tế` chuyển sang dropdown/searchable dropdown giống phần `Quốc gia`:
  - Khi chưa focus/click, form chỉ hiển thị một ô search `Tìm thành phố`.
  - Danh sách thành phố chỉ render khi dropdown đang mở.
  - Panel thành phố dùng `position: absolute`, max-height/scroll theo style lookup hiện có, nên không kéo cao form khi city list dài.
- Thêm state `isCityDropdownOpen` để kiểm soát đóng/mở dropdown city, tránh gọi hàm tạo list trong template.
- Khi search thành phố:
  - Cập nhật `citySearch`.
  - Mở dropdown.
  - Filter từ `internationalCityOptions` đã cache trong component.
- Khi chọn thành phố:
  - Set `cityName`.
  - Set `name = cityName`.
  - Auto generate `slug` theo `cityName`.
  - Đóng dropdown.
- Khi chọn quốc gia mới, đổi region, không có country, hoặc fallback sang input thủ công:
  - Đóng city dropdown.
  - Reset city options/filter phù hợp.
- Manual input vẫn giữ nguyên khi CountriesNow lỗi hoặc trả danh sách rỗng.

### API Đã Nối

- Không thêm API mới.
- Tiếp tục dùng API hiện tại:
  - `POST https://countriesnow.space/api/v0.1/countries/cities`
  - Body: `{ "country": "<English country name>" }`
- CRUD Destination vẫn dùng contract backend hiện tại qua `/api/admin/destinations`.

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/Lỗi Còn Lại

- Production build còn warning budget hiện hữu:
  - initial bundle vượt 500 kB, total 859.40 kB.
  - `src/app/pages/admin/tours/tour-form/tour-form.scss` vượt 8 kB, total 10.00 kB.
  - `src/app/pages/public/home/components/home-hero/home-hero.scss` vượt 8 kB, total 9.88 kB.
  - `src/app/layouts/public-layout/public-layout.scss` vượt 8 kB, total 9.99 kB.
- Chưa test thủ công bằng browser thật tại `/admin/destinations` với city list dài từ CountriesNow.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- City list từ CountriesNow có thể rất dài; component vẫn slice tối đa 120 option để tránh render quá nặng.
- Dropdown city hiện là custom dropdown inline style để đồng bộ với country dropdown và tránh thêm import Taiga UI mới.
- Nếu CountriesNow lỗi hoặc trả data rỗng, form vẫn fallback sang input `Nhập tên thành phố`; backend chỉ nhận `name/country/region` như trước.

## Cập Nhật: Fix Layout Form Và Dropdown Tỉnh/Thành Admin Destinations

Thời gian cập nhật: 2026-06-05 14:53:23 +07:00

### File Đã Sửa

- `src/app/pages/admin/destinations/destinations.ts`
- `src/app/pages/admin/destinations/destinations.html`
- `src/app/pages/admin/destinations/destinations.scss`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Đọc `VOYAGE_ADMIN_AUDIT_REPORT.md`, `VOYAGE_FRONTEND_AUDIT_REPORT.md` và `../voyage-backend/BACKEND_API_REPORT.md`; ưu tiên section admin mới nhất.
- Xác nhận backend Destination vẫn dùng contract CRUD hiện tại: `name`, `slug`, `region`, `country`, `description`, `imageUrl`, `latitude`, `longitude`, `status`.
- Chỉ sửa Admin Destinations; không sửa TourForm, public pages, AdminLayout hoặc frontend audit report.

### Chức Năng Đã Thêm/Sửa

- Fix layout form tạo/sửa điểm đến:
  - Form grid dùng 2 cột đều, row-gap/column-gap ổn định.
  - Mỗi field trong form dùng cấu trúc thống nhất: label, control-wrap, message-slot.
  - Error/help/warning nằm trong message slot cố định để không làm lệch input giữa hai cột.
  - Dưới 900px form chuyển về 1 cột.
- Chuyển dropdown Tỉnh/Thành trong nước sang popup absolute:
  - Khi đóng chỉ còn input `Tìm tỉnh/thành`.
  - Focus/click/search mới mở dropdown.
  - Menu nằm absolute trong control-wrap, z-index 200, max-height 240px, không đẩy form/grid xuống.
  - Option có selected state khi map được province hiện tại.
- Đồng bộ dropdown behavior:
  - Thêm click outside để đóng dropdown.
  - Escape đóng dropdown.
  - Chỉ một dropdown mở tại một thời điểm: province, country hoặc city.
- Fix patch edit mode:
  - Khi mở edit, patch trực tiếp dữ liệu destination hiện tại trước, không reset name/slug sau patch.
  - Domestic edit cố gắng map province theo `name` hoặc `slug`; nếu không map được vẫn giữ nguyên `name`, `slug`, `country` từ backend.
  - Không còn tự ghi đè slug/name khi chỉ mở form edit.
  - Chỉ khi user chọn tỉnh/thành mới thì `name`, `cityName`, `country = Việt Nam` và `slug` được generate lại theo tỉnh/thành mới.
- Giữ nguyên luồng quốc tế đã làm:
  - Quốc gia và Thành phố vẫn là searchable dropdown, không render list trực tiếp trong form.
  - Manual city input vẫn fallback khi CountriesNow lỗi hoặc không có data.

### API Đã Nối

- Không thêm API mới.
- Tiếp tục dùng:
  - `GET /api/admin/destinations`
  - CRUD `/api/admin/destinations`
  - `GET /api/admin/locations/provinces`
  - `GET https://restcountries.com/v3.1/all?fields=name,flags,population,cca2,translations`
  - `POST https://countriesnow.space/api/v0.1/countries/cities`

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/Lỗi Còn Lại

- Production build còn warning budget hiện hữu:
  - initial bundle vượt 500 kB, total 859.40 kB.
  - `src/app/pages/admin/tours/tour-form/tour-form.scss` vượt 8 kB, total 10.00 kB.
  - `src/app/pages/public/home/components/home-hero/home-hero.scss` vượt 8 kB, total 9.88 kB.
  - `src/app/layouts/public-layout/public-layout.scss` vượt 8 kB, total 9.99 kB.
- `src/app/pages/admin/destinations/destinations.scss` không còn vượt budget sau khi giảm CSS trang trí.
- Chưa test thủ công bằng browser thật với case edit Hạ Long và city/province dropdown runtime.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- Nếu destination domestic cũ là một địa danh nhỏ như `Hạ Long` nhưng province API chỉ có `Quảng Ninh`, form sẽ giữ nguyên `name/slug` backend thay vì ép map sai province.
- Nếu admin đổi Miền trong domestic form, selection tỉnh/thành cũ bị clear theo yêu cầu; name/slug chỉ cập nhật lại khi chọn tỉnh/thành mới.
- Một số CSS trang trí của bảng danh sách đã được giảm để giữ component dưới Angular style budget; phần form/dropdown là ưu tiên của lượt sửa này.

## Cập Nhật: Đổi Admin Destinations Về Native Select Đơn Giản

Thời gian cập nhật: 2026-06-05 15:02:03 +07:00

### File Đã Sửa

- `src/app/pages/admin/destinations/destinations.ts`
- `src/app/pages/admin/destinations/destinations.html`
- `src/app/pages/admin/destinations/destinations.scss`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Đọc `VOYAGE_ADMIN_AUDIT_REPORT.md`, `VOYAGE_FRONTEND_AUDIT_REPORT.md` và `../voyage-backend/BACKEND_API_REPORT.md`; ưu tiên section admin mới nhất.
- Xác nhận yêu cầu mới là bỏ custom dropdown rườm rà ở form Destination và đưa về select đơn giản giống field `Miền`.
- Chỉ sửa Admin Destinations; không sửa TourForm, public pages, AdminLayout hoặc frontend audit report.
- Xác nhận backend Destination vẫn giữ contract CRUD hiện tại, không cần đổi model/payload.

### Chức Năng Đã Thêm/Sửa

- Bỏ custom dropdown trong form tạo/sửa điểm đến:
  - Tỉnh/Thành điểm đến chuyển từ input + popup option button sang native `<select>`.
  - Quốc gia chuyển từ custom searchable dropdown sang native `<select>`.
  - Thành phố quốc tế chuyển từ custom dropdown sang native `<select>`.
  - Không còn option dạng button/card hoặc nền teal lớn trong form.
- Giữ tên quốc gia tiếng Việt:
  - Option quốc gia vẫn dùng `countryOptionLabel(country)`.
  - Khi chọn quốc gia, component vẫn map về `CountryOption` để gọi CountriesNow bằng `name.common` tiếng Anh.
- Giữ logic tự động:
  - Chọn tỉnh/thành sẽ set `cityName`, `name`, `slug`, `country = Việt Nam`.
  - Chọn quốc gia sẽ reset city/name/slug và tải city list.
  - Chọn thành phố sẽ set `cityName`, `name`, `slug`.
  - Nếu CountriesNow lỗi hoặc rỗng, vẫn fallback input thủ công `Nhập tên thành phố`.
- Dọn state/handler custom dropdown:
  - Bỏ `HostListener` click outside/Escape.
  - Bỏ state `isProvinceDropdownOpen`, `isCountryDropdownOpen`, `isCityDropdownOpen`.
  - Bỏ các handler mở/đóng/search dropdown cũ.
- SCSS select thống nhất:
  - Field `Miền`, `Tỉnh/Thành`, `Quốc gia`, `Thành phố`, `Trạng thái` dùng cùng style `.admin-destinations__select`.
  - Không dùng màu xanh cũ `#004FA8`.
  - Không còn CSS custom dropdown menu/option.

### API Đã Nối

- Không thêm API mới.
- Tiếp tục dùng:
  - `GET /api/admin/locations/provinces`
  - `GET https://restcountries.com/v3.1/all?fields=name,flags,population,cca2,translations`
  - `POST https://countriesnow.space/api/v0.1/countries/cities`
  - CRUD `/api/admin/destinations`

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/Lỗi Còn Lại

- Production build còn warning budget hiện hữu:
  - initial bundle vượt 500 kB, total 859.40 kB.
  - `src/app/pages/admin/tours/tour-form/tour-form.scss` vượt 8 kB, total 10.00 kB.
  - `src/app/pages/public/home/components/home-hero/home-hero.scss` vượt 8 kB, total 9.88 kB.
  - `src/app/layouts/public-layout/public-layout.scss` vượt 8 kB, total 9.99 kB.
- `src/app/pages/admin/destinations/destinations.scss` không vượt budget.
- Chưa test thủ công bằng browser thật tại `/admin/destinations`.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- Native select không có search trong dropdown; đổi lại UI đơn giản, không kéo dài form và không có item nền teal.
- Với country list dài, native select phụ thuộc behavior trình duyệt; nếu sau này cần search lại thì nên dùng component select/search chính thức, không quay lại custom option card lớn.
- Domestic destination cũ không map được province vẫn giữ `name/slug` backend; select tỉnh/thành có thể ở placeholder cho đến khi admin chọn lại tỉnh/thành mới.

## Cập Nhật: Autocomplete Thành Phố Quốc Tế Cho Admin Destinations

Thời gian cập nhật: 2026-06-05 15:10:30 +07:00

### File Đã Sửa

- `src/app/pages/admin/destinations/destinations.ts`
- `src/app/pages/admin/destinations/destinations.html`
- `src/app/pages/admin/destinations/destinations.scss`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Đọc `VOYAGE_ADMIN_AUDIT_REPORT.md`, `VOYAGE_FRONTEND_AUDIT_REPORT.md` và `../voyage-backend/BACKEND_API_REPORT.md`; ưu tiên section admin mới nhất.
- Xác nhận task gần nhất đã đưa Admin Destinations về native select đơn giản.
- Chỉ sửa Admin Destinations; không sửa TourForm, public pages, AdminLayout hoặc frontend audit report.
- Xác nhận backend Destination vẫn giữ contract CRUD hiện tại, không đổi payload.

### Chức Năng Đã Thêm/Sửa

- Giữ `Quốc gia` dạng native select đơn giản:
  - Option vẫn hiển thị tên quốc gia tiếng Việt qua `countryOptionLabel(country)`.
  - Khi chọn quốc gia, component vẫn giữ `selectedCountryOption` để gọi CountriesNow bằng `name.common` tiếng Anh.
- Đổi `Thành phố` quốc tế từ native select sang input autocomplete:
  - Input placeholder: `Nhập hoặc tìm thành phố`.
  - Admin có thể nhập tự do, không bị select tự nhảy/chốt option đầu tiên.
  - Dropdown chỉ là gợi ý từ city API, không render list trực tiếp làm dài form.
  - Click gợi ý mới gọi `selectCity(city)` và set `cityName`, `name`, `slug`.
- Không patch `name/slug` khi admin mới gõ:
  - `onCityInput()` chỉ cập nhật keyword và filter gợi ý.
  - Nếu admin blur hoặc submit với text nhập tay, `commitManualCity()` mới set `cityName/name/slug`.
- Hỗ trợ nhập tay khi API city lỗi hoặc rỗng:
  - Vẫn dùng cùng input autocomplete.
  - Hiển thị help/warning: `Không tải được danh sách thành phố, bạn có thể nhập thủ công.`
- Keyboard/click behavior:
  - Click/focus input mở gợi ý nếu đã chọn quốc gia.
  - Click ngoài hoặc Escape đóng dropdown.
  - Enter chỉ chọn gợi ý nếu admin đã highlight bằng phím mũi tên; không tự chọn option đầu tiên.
- Khôi phục field `Tên điểm đến` trong grid trước `Slug` để form không mất trường hiển thị tên.

### API Đã Nối

- Không thêm API mới.
- Tiếp tục dùng:
  - `POST https://countriesnow.space/api/v0.1/countries/cities`
  - `GET https://restcountries.com/v3.1/all?fields=name,flags,population,cca2,translations`
  - CRUD `/api/admin/destinations`

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/Lỗi Còn Lại

- Production build còn warning budget hiện hữu:
  - initial bundle vượt 500 kB, total 859.40 kB.
  - `src/app/pages/admin/tours/tour-form/tour-form.scss` vượt 8 kB, total 10.00 kB.
  - `src/app/pages/public/home/components/home-hero/home-hero.scss` vượt 8 kB, total 9.88 kB.
  - `src/app/layouts/public-layout/public-layout.scss` vượt 8 kB, total 9.99 kB.
- `src/app/pages/admin/destinations/destinations.scss` không vượt budget.
- Chưa test thủ công bằng browser thật với case gõ `Par`/`Paris` và city list dài từ CountriesNow.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- City autocomplete dùng state riêng `citySearchKeyword`, `selectedCityName`, `cityOptions`, `filteredCityOptions`; template không gọi hàm tạo list.
- Khi user gõ nhưng chưa chọn gợi ý, form tạm clear `name/slug`; submit sẽ commit keyword nhập tay trước khi validate để không block nếu text hợp lệ.
- Native select quốc gia vẫn không có search; nếu danh sách quốc gia quá dài, cần cân nhắc component select/search chính thức ở bước sau.
## Cập Nhật: Autocomplete Thật Cho Quốc Gia/Tỉnh-Thành/Thành Phố Admin Destinations

Thời gian cập nhật: 2026-06-05 15:32:03 +07:00

### File Đã Sửa

- `src/app/pages/admin/destinations/destinations.ts`
- `src/app/pages/admin/destinations/destinations.html`
- `src/app/pages/admin/destinations/destinations.scss`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Đọc `VOYAGE_ADMIN_AUDIT_REPORT.md`, `VOYAGE_FRONTEND_AUDIT_REPORT.md` và `../voyage-backend/BACKEND_API_REPORT.md`; ưu tiên section admin mới nhất.
- Chỉ sửa Admin Destinations; không sửa TourForm, public pages, AdminLayout hoặc frontend audit report.
- Xác nhận backend Destination CRUD vẫn giữ contract hiện tại, không cần đổi payload hoặc service.

### Chức Năng Đã Thêm/Sửa

- Chuyển `Tỉnh/Thành điểm đến`, `Quốc gia`, `Thành phố` sang autocomplete input thật:
  - Không dùng native select cho danh sách dài.
  - Gõ text chỉ cập nhật keyword và filter gợi ý.
  - Không tự chọn option đầu tiên dù filtered list chỉ còn một item.
  - Chỉ chọn chính thức khi admin click option hoặc bấm Enter khi đã highlight option bằng phím mũi tên.
- Giữ `Miền` là native select vì chỉ có 3 option.
- Sửa luồng nhập:
  - Gõ `B` ở tỉnh/thành không còn tự chốt `Bắc Ninh`.
  - Gõ `P` ở quốc gia/thành phố không còn tự chốt option đầu tiên.
  - Admin có thể xóa keyword và tìm lại bình thường.
- Thành phố quốc tế hỗ trợ nhập tay:
  - Nếu không chọn gợi ý, blur/submit/Enter không highlight sẽ commit text thủ công.
  - Vẫn fallback nhập tay khi CountriesNow lỗi hoặc trả list rỗng.
- Thiết kế lại block chọn mode:
  - Label mới: `Loại điểm đến`.
  - Hai segmented card `Trong nước` / `Quốc tế` kèm mô tả ngắn để admin thấy rõ luồng đang tạo.
  - Active state dùng border/background mint nhẹ, không dùng teal đặc.
- Dropdown autocomplete:
  - Menu absolute trong control, không đẩy form cao lên.
  - Click outside hoặc Escape đóng tất cả dropdown.
  - Chỉ một dropdown mở tại một thời điểm.
- Fix edit/reset state:
  - Edit domestic giữ `name/slug` backend, map province nếu có nhưng không tự chọn option đầu tiên.
  - Edit international giữ `country/name/slug`, map country nếu có để gọi city API bằng tên tiếng Anh.
  - Switch mode hoặc đổi miền clear đúng state riêng của mode cũ nhưng không reset description/image/coordinates/status.

### API Đã Nối

- Không thêm API mới.
- Tiếp tục dùng:
  - `GET /api/admin/locations/provinces`
  - `GET https://restcountries.com/v3.1/all?fields=name,flags,population,cca2,translations`
  - `POST https://countriesnow.space/api/v0.1/countries/cities`
  - CRUD `/api/admin/destinations`

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/Lỗi Còn Lại

- Production build còn warning budget hiện hữu:
  - initial bundle vượt 500 kB, total 859.40 kB.
  - `src/app/pages/admin/tours/tour-form/tour-form.scss` vượt 8 kB, total 10.00 kB.
  - `src/app/pages/public/home/components/home-hero/home-hero.scss` vượt 8 kB, total 9.88 kB.
  - `src/app/layouts/public-layout/public-layout.scss` vượt 8 kB, total 9.99 kB.
- `src/app/pages/admin/destinations/destinations.scss` không còn warning budget sau khi thu gọn CSS.
- Chưa test thủ công bằng browser thật tại `/admin/destinations`.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- Autocomplete dùng state riêng `provinceSearchKeyword`, `countrySearchKeyword`, `citySearchKeyword`; template chỉ đọc các mảng filtered đã tính sẵn, không gọi hàm tạo list.
- Quốc gia vẫn lưu tên tiếng Việt vào form/payload; component giữ `selectedCountryOriginalName` để gọi CountriesNow bằng tên tiếng Anh khi map được REST Countries.
- Nếu destination quốc tế cũ có country không map được REST Countries, city API có thể không trả dữ liệu; form vẫn cho nhập city thủ công và giữ payload CRUD hiện tại.

## Cap Nhat: Lam Gon UI Autocomplete Admin Destinations

Thoi gian cap nhat: 2026-06-05 20:44:21 +07:00

### File Da Sua

- src/app/pages/admin/destinations/destinations.html
- src/app/pages/admin/destinations/destinations.scss
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Dau Viec Da Lam

- Doc VOYAGE_ADMIN_AUDIT_REPORT.md va VOYAGE_FRONTEND_AUDIT_REPORT.md; uu tien section admin moi nhat ve autocomplete that cho Quoc gia/Tinh-Thanh/Thanh pho.
- Chi sua Admin Destinations; khong sua TourForm, public pages, AdminLayout hoac frontend audit report.
- Giu nguyen logic filter/chon/tim autocomplete hien tai, khong doi handler trong destinations.ts.

### Chuc Nang Da Them/Sua

- Chinh dropdown autocomplete Tinh/Thanh diem den, Quoc gia va Thanh pho ve style nhe giong native select.
- Menu dung nen trang, border xam nhe, padding 0, max-height 240px, absolute duoi input, z-index 300.
- Option mot dong, nen trang, chu toi, font 14px, min-height 32px, padding 6px 14px.
- Loai bo cam giac item dang button/card lon: khong dung nen teal dac, khong bo tron tung item, khong margin giua option, khong text trang.
- Hover/active/selected dung nen xanh nhat #EAF3FF/#DCEBFF va chu #0F172A.
- Bo sung class rieng cho option province/country/city de kiem soat style scoped: admin-destinations__province-option, admin-destinations__country-option, admin-destinations__city-option.
- Bo sung selected class cho option dang duoc chon de hien thi nhe bang nen xanh nhat va font-weight 600.

### API Da Noi

- Khong them API moi.
- Tiep tuc dung cac API hien co cho Admin Destinations va du lieu location.

### Ket Qua Build/Test

- npx ng build --configuration development: pass.
- npm run build: pass.
- Production build con warning budget hien huu: initial bundle 859.40 kB, tour-form.scss 10.00 kB, home-hero.scss 9.88 kB, public-layout.scss 9.99 kB.
- destinations.scss khong con warning budget sau khi thu gon SCSS.

### Ghi Chu Ky Thuat Va Rui Ro

- Input autocomplete van giu style hien tai: cao 44px, border #DDE7E4, radius 12px, focus theo #1F6F68.
- Dropdown van render absolute trong admin-destinations__control-wrap, nen khong lam form/grid bi day xuong.
- Khong sua VOYAGE_FRONTEND_AUDIT_REPORT.md vi day la thay doi admin-only.


## Cap Nhat: Ep Autocomplete Select Admin Destinations Ve Nen Trang

Thoi gian cap nhat: 2026-06-05 21:56:21 +07:00

### File Da Sua

- src/app/pages/admin/destinations/destinations.scss
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Dau Viec Da Lam

- Doi chieu anh mau native select: input trang, option phang mot dong, selected xanh nhat.
- Chi sua Admin Destinations; khong sua TourForm, public pages, AdminLayout hoac frontend audit report.

### Chuc Nang Da Them/Sua

- Loai autocomplete option khoi rule button chung bang selector button:not(.admin-destinations__autocomplete-option).
- Dam bao cac option Tinh/Thanh, Quoc gia va Thanh pho khong bi nen teal, chu trang, bo goc button hoac hover teal tu button global.
- Giu dropdown autocomplete nen trang, border xam nhe, option mot dong, hover/active/selected xanh nhat nhu native select.
- Giu native select Mien/Trang thai/Khu vuc theo style input trang hien co.

### Ket Qua Build/Test

- npx ng build --configuration development: pass.
- npm run build: pass.
- Production build con warning budget hien huu: initial bundle 859.40 kB, home-hero.scss 9.88 kB, tour-form.scss 10.00 kB, public-layout.scss 9.99 kB.
- destinations.scss khong con warning budget.

### Ghi Chu Ky Thuat

- Khong doi logic autocomplete, khong doi handler TypeScript.
- Fix chinh la specificity CSS: option dang la button nen truoc do co the bi rule button chung ap mau teal.

## Cap Nhat: Mau Nut Hanh Dong Admin Destinations

Thoi gian cap nhat: 2026-06-05 22:54:06 +07:00

### File Da Sua

- src/app/pages/admin/destinations/destinations.scss
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Dau Viec Da Lam

- Doi chieu anh mau cot Hanh dong: Sua trang, Tam an vang nhat, Xoa do nhat.
- Chi sua style nut Hanh dong trong Admin Destinations; khong doi logic CRUD va khong sua TourForm/public pages/AdminLayout.

### Chuc Nang Da Them/Sua

- Nut Sua giu nen trang, vien nhe, chu xanh dam.
- Nut Tam an/Bat dung nen vang nhat va chu cam, khong con button teal.
- Nut Xoa dung nen do rat nhat va chu do, khong con button teal.
- Style scoped trong admin-destinations__row-actions, khong anh huong button form/header.

### Ket Qua Build/Test

- npm run build: pass.
- Production build con warning budget hien huu: initial bundle 859.40 kB, tour-form.scss 10.00 kB, home-hero.scss 9.88 kB, public-layout.scss 9.99 kB.
- destinations.scss khong con warning budget.

## Cap Nhat: Nut Header Admin Destinations Khong Bi Keo Cao

Thoi gian cap nhat: 2026-06-05 23:12:47 +07:00

### File Da Sua

- src/app/pages/admin/destinations/destinations.scss
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Dau Viec Da Lam

- Doi chieu hai anh mau: hien tai nut Mo Media/Them diem den bi keo cao nhu card, mau mong muon la hai nut nho nam ngang.
- Chi sua Admin Destinations; khong doi logic va khong sua TourForm/public pages/AdminLayout.

### Chuc Nang Da Them/Sua

- Them align-items cho admin-destinations__actions de cac nut header khong bi stretch theo chieu cao header.
- Nut Mo Media va Them diem den giu kich thuoc gon, nam ngang, giong mau tham chieu.
- Thu gon mot so style phu de giu destinations.scss duoi Angular style budget.

### Ket Qua Build/Test

- npm run build: pass.
- Production build con warning budget hien huu: initial bundle 859.40 kB, tour-form.scss 10.00 kB, home-hero.scss 9.88 kB, public-layout.scss 9.99 kB.
- destinations.scss khong con warning budget.

## Cap Nhat: Header Admin Destinations Dong Bo Categories Tours

Thoi gian cap nhat: 2026-06-05 23:35:17 +07:00

### File Da Sua

- src/app/pages/admin/destinations/destinations.scss
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Dau Viec Da Lam

- Doi chieu anh hien tai cua Admin Destinations voi hai header mau Admin Categories va Admin Tours.
- Chi sua style header Admin Destinations; khong doi logic, khong sua TourForm/public pages/AdminLayout.

### Chuc Nang Da Them/Sua

- Khoi phuc nen gradient mint o goc phai header de dong bo voi Categories/Tours.
- Khoi phuc letter-spacing title va mau mo ta header.
- Khoi phuc eyebrow uppercase cho Admin Destinations.
- Giu nhom nut Mo Media/Them diem den dang nho gon, khong bi stretch.
- Thu gon mot so style phu de destinations.scss khong vuot budget.

### Ket Qua Build/Test

- npm run build: pass.
- Production build con warning budget hien huu: initial bundle 859.40 kB, tour-form.scss 10.00 kB, home-hero.scss 9.88 kB, public-layout.scss 9.99 kB.
- destinations.scss khong con warning budget.

## Cap Nhat: Dong Bo Nut Hanh Dong Destinations Theo Categories

Thoi gian cap nhat: 2026-06-05 23:45:11 +07:00

### File Da Sua

- src/app/pages/admin/destinations/destinations.scss
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Dau Viec Da Lam

- Doi chieu cot Hanh dong Admin Destinations voi Admin Categories theo anh mau.
- Chi sua style row-actions cua Admin Destinations; khong doi logic CRUD va khong sua TourForm/public pages/AdminLayout.

### Chuc Nang Da Them/Sua

- Nut Sua trong Destinations dung style outline trang/chu xanh dam nhu Categories.
- Nut Tam an/Bat dung vien cam nhat, nen vang nhat, chu cam nhu Categories.
- Nut Xoa dung vien do nhat, nen trang, chu do va hover do nhat nhu Categories.
- Giu style scoped trong admin-destinations__row-actions.
- Thu gon style phu de destinations.scss khong vuot budget.

### Ket Qua Build/Test

- npm run build: pass.
- Production build con warning budget hien huu: initial bundle 859.40 kB, tour-form.scss 10.00 kB, home-hero.scss 9.88 kB, public-layout.scss 9.99 kB.
- destinations.scss khong con warning budget.

## Cap Nhat: Copy Chinh Xac Nut Hanh Dong Categories Sang Destinations

Thoi gian cap nhat: 2026-06-06 00:11:45 +07:00

### File Da Sua

- src/app/pages/admin/destinations/destinations.scss
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Dau Viec Da Lam

- Doi chieu lai anh cot Hanh dong va CSS goc cua Admin Categories.
- Chi sua style cot Hanh dong cua Admin Destinations; khong doi HTML/TypeScript va khong sua TourForm/public pages/AdminLayout.

### Chuc Nang Da Them/Sua

- Copy dung rule Categories cho admin-destinations__row-actions button: min-height 34px, padding 0 10px, border teal nhat, nen trang, chu xanh dam, font-size 12px.
- Copy dung rule button thu hai: border rgba(245, 158, 11, 0.25), background #fff7ed, color #d97706.
- Copy dung rule danger: border rgba(218, 8, 8, 0.2), chu do, hover rgba(218, 8, 8, 0.08).
- Thu gon style phu khong lien quan de destinations.scss khong vuot budget.

### Ket Qua Build/Test

- npm run build: pass.
- Production build con warning budget hien huu: initial bundle 859.40 kB, tour-form.scss 10.00 kB, home-hero.scss 9.88 kB, public-layout.scss 9.99 kB.
- destinations.scss khong con warning budget.

## Cap Nhat: Fix Specificity Nut Sua Hanh Dong Destinations

Thoi gian cap nhat: 2026-06-06 00:16:22 +07:00

### File Da Sua

- src/app/pages/admin/destinations/destinations.scss
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Dau Viec Da Lam

- Kiem tra anh moi: nut Sua cua Destinations van teal trong khi Categories la outline trang.
- Xac dinh nguyen nhan: rule global button:not(.admin-destinations__autocomplete-option) co specificity cao hon row-actions button, nen de nen teal de len nut Sua.

### Chuc Nang Da Them/Sua

- Doi selector global sang button:where(:not(.admin-destinations__autocomplete-option)) de ha specificity.
- Row-actions cua Destinations bay gio override duoc nhu Categories.
- Giu rule row-actions dung theo Categories: Sua outline trang, Tam an vang nhat, Xoa outline do/hover do nhat.
- Khong doi HTML/TypeScript, khong doi logic CRUD.

### Ket Qua Build/Test

- npm run build: pass.
- Production build con warning budget hien huu: initial bundle 859.40 kB, tour-form.scss 10.00 kB, home-hero.scss 9.88 kB, public-layout.scss 9.99 kB.
- destinations.scss khong con warning budget.

## Cap Nhat: Tach Dong Toggle Loai Diem Den Admin Destinations

Thoi gian cap nhat: 2026-06-06 00:51:20 +07:00

### File Da Sua

- src/app/pages/admin/destinations/destinations.html
- src/app/pages/admin/destinations/destinations.scss
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Dau Viec Da Lam

- Doc VOYAGE_ADMIN_AUDIT_REPORT.md va VOYAGE_FRONTEND_AUDIT_REPORT.md truoc khi code; uu tien section admin moi nhat.
- Chi sua UI cum 2 button toggle Trong nuoc / Quoc te trong form Admin Destinations.
- Khong sua dropdown tinh/thanh, quoc gia, thanh pho; khong sua API logic, TourForm, public pages hoac AdminLayout.
- Khong ghi thay doi admin vao VOYAGE_FRONTEND_AUDIT_REPORT.md.

### Chuc Nang Da Them/Sua

- Giu label section la Loai diem den va doi validation text tu Khu vuc sang Loai diem den.
- Button toggle chuyen sang layout cot de title va mo ta tach thanh 2 dong ro rang.
- Doi mo ta thanh dong nho hon, tranh hien thi dinh chu nhu Trong nuocChon mien va tinh/thanh Viet Nam.
- Giu 2 button chia deu tren desktop va xep doc tren mobile theo responsive hien co.
- Giu inactive nen trang/border nhe va active nen xanh rat nhat theo style Admin Destinations hien co.

### Ket Qua Build/Test

- npm run build: pass.
- Production build con warning budget hien huu: initial bundle 859.40 kB, public-layout.scss 9.99 kB, tour-form.scss 10.00 kB, home-hero.scss 9.88 kB.
- destinations.scss khong con warning budget sau khi tinh gon CSS.

## Cap Nhat: Lam Ro Active Inactive Toggle Loai Diem Den

Thoi gian cap nhat: 2026-06-06 01:00:23 +07:00

### File Da Sua

- src/app/pages/admin/destinations/destinations.scss
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Dau Viec Da Lam

- Chi sua UI 2 button toggle Trong nuoc / Quoc te trong form Admin Destinations.
- Khong sua dropdown tinh/thanh, quoc gia, thanh pho.
- Khong sua TypeScript, API, payload backend, TourForm, public pages hoac AdminLayout.

### Chuc Nang Da Them/Sua

- Ep mode option inactive dung nen trang de khong bi rule button chung hien teal.
- Active option dung nen xanh nhat #eaf7f4, border teal 2px va box-shadow nhe.
- Inactive option dung border nhe, title mau #334155 va hover xanh rat nhat.
- Mo ta inactive dung mau #64748b; mo ta active dung mau xanh dam cua theme.
- Giu layout 2 dong title/mo ta va responsive hien co.

### Ket Qua Build/Test

- npm run build: pass.
- Production build con warning budget hien huu: initial bundle 859.40 kB, public-layout.scss 9.99 kB, tour-form.scss 10.00 kB, home-hero.scss 9.88 kB.
- destinations.scss hien warning budget 8.26 kB, vuot 259 bytes sau khi bo sung active/inactive visual cho toggle.

## Cap Nhat: Tang Contrast Chu Toggle Loai Diem Den

Thoi gian cap nhat: 2026-06-06 01:02:44 +07:00

### File Da Sua

- src/app/pages/admin/destinations/destinations.scss
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Dau Viec Da Lam

- Chi sua mau chu trong 2 button toggle Trong nuoc / Quoc te cua Admin Destinations.
- Khong sua layout, dropdown, API, payload backend, TypeScript, TourForm hoac public pages.

### Chuc Nang Da Them/Sua

- Title inactive doi sang mau gan den #0f172a de de doc hon.
- Title active doi sang xanh dam cua theme de noi bat tren nen xanh nhat.
- Mo ta inactive doi sang #475569 va font-weight 700.
- Mo ta active doi sang #0f3f3b de tang contrast.

### Ket Qua Build/Test

- npm run build: pass.
- Production build con warning budget hien huu: initial bundle 859.40 kB, public-layout.scss 9.99 kB, home-hero.scss 9.88 kB, tour-form.scss 10.00 kB.
- destinations.scss hien warning budget 8.25 kB, vuot 247 bytes do cac style toggle active/inactive bo sung truoc do.

## Cap Nhat: Doi Chu Toggle Loai Diem Den Sang Den

Thoi gian cap nhat: 2026-06-06 01:04:42 +07:00

### File Da Sua

- src/app/pages/admin/destinations/destinations.scss
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Dau Viec Da Lam

- Chi sua mau chu trong 2 button toggle Trong nuoc / Quoc te cua Admin Destinations.
- Khong sua layout, dropdown, API, payload backend, TypeScript, TourForm hoac public pages.

### Chuc Nang Da Them/Sua

- Doi title inactive va active sang mau den #000.
- Doi mo ta inactive va active sang mau den #000 de tang do doc theo anh feedback.
- Giu nen active/inactive, border, hover va logic toggle hien co.

### Ket Qua Build/Test

- npm run build: pass.
- Production build con warning budget: initial bundle 859.40 kB, destinations.scss 8.23 kB, tour-form.scss 10.00 kB, public-layout.scss 9.99 kB, home-hero.scss 9.88 kB.

## Cap Nhat: Fix Specificity Chu Title Toggle Loai Diem Den

Thoi gian cap nhat: 2026-06-06 01:06:59 +07:00

### File Da Sua

- src/app/pages/admin/destinations/destinations.scss
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Dau Viec Da Lam

- Kiem tra feedback anh: title Trong nuoc / Quoc te van hien mau trang.
- Xac dinh nguyen nhan: rule button chung color #fff co specificity cao hon mode-option, nen title span van ke thua mau trang.
- Chi sua CSS toggle Loai diem den; khong sua HTML, TypeScript, dropdown, API, payload backend, TourForm hoac public pages.

### Chuc Nang Da Them/Sua

- Ep color #000 !important tren admin-destinations__mode-option de override rule button chung.
- Them rule rieng cho admin-destinations__mode-title color #000.
- Giu mode-text mau #000 nhu buoc truoc.

### Ket Qua Build/Test

- npm run build: pass.
- Production build con warning budget: initial bundle 859.40 kB, destinations.scss 8.28 kB, home-hero.scss 9.88 kB, public-layout.scss 9.99 kB, tour-form.scss 10.00 kB.

## Cap Nhat: Viet Hoa Toa Do Va Chevron Form Destinations

Thoi gian cap nhat: 2026-06-06 01:11:13 +07:00

### File Da Sua

- src/app/pages/admin/destinations/destinations.html
- src/app/pages/admin/destinations/destinations.scss
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Dau Viec Da Lam

- Doc VOYAGE_ADMIN_AUDIT_REPORT.md va VOYAGE_FRONTEND_AUDIT_REPORT.md truoc khi code; uu tien section admin moi nhat.
- Chi sua UI form Admin Destinations.
- Khong sua TourForm, public pages, AdminLayout, API backend, payload backend hoac logic chon tinh/quoc gia/thanh pho.
- Khong ghi thay doi admin vao VOYAGE_FRONTEND_AUDIT_REPORT.md.

### Chuc Nang Da Them/Sua

- Doi label Latitude thanh Vi do va Longitude thanh Kinh do.
- Doi placeholder toa do thanh Vi du: 16.054407 va Vi du: 108.202167.
- Doi input toa do tu type number sang type text voi inputmode decimal de bo spinner native tho.
- Giu formControl latitude va longitude, payload van parse number bang buildPayload hien co.
- Them chevron cho cac control dropdown/autocomplete trong form: Mien, Tinh/Thanh diem den, Quoc gia, Thanh pho, Trang thai.
- Them padding-right cho input/select co chevron de khong che mat text.
- Chevron doi mau khi hover/focus va xoay 180 do khi autocomplete mo hoac select focus.

### Ket Qua Build/Test

- npm run build: pass.
- Production build con warning budget: initial bundle 859.40 kB, destinations.scss 8.99 kB, tour-form.scss 10.00 kB, public-layout.scss 9.99 kB, home-hero.scss 9.88 kB.

## Cap Nhat: Chuyen Chevron Destinations Sang Taiga Icon

Thoi gian cap nhat: 2026-06-06 01:13:38 +07:00

### File Da Sua

- src/app/pages/admin/destinations/destinations.ts
- src/app/pages/admin/destinations/destinations.html
- src/app/pages/admin/destinations/destinations.scss
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Dau Viec Da Lam

- Kiem tra project dang co Taiga UI va cac man khac dung TuiIcon voi icon @tui.chevron-down.
- Chi sua Admin Destinations; khong sua TourForm, public pages, AdminLayout, API backend hoac payload backend.
- Khong ghi thay doi admin vao VOYAGE_FRONTEND_AUDIT_REPORT.md.

### Chuc Nang Da Them/Sua

- Import TuiIcon vao component AdminDestinations.
- Doi chevron dang ky tu thuong sang tui-icon icon @tui.chevron-down cho Mien, Tinh/Thanh, Quoc gia, Thanh pho va Trang thai.
- Giu style kich thuoc 16px, mau hover/focus va animation rotate hien co.

### Ket Qua Build/Test

- npm run build: pass.
- Production build con warning budget: initial bundle 859.40 kB, destinations.scss 9.00 kB, tour-form.scss 10.00 kB, public-layout.scss 9.99 kB, home-hero.scss 9.88 kB.

## Cap Nhat: Fix Chevron Select Bi Ket Huong Len

Thoi gian cap nhat: 2026-06-06 01:15:51 +07:00

### File Da Sua

- src/app/pages/admin/destinations/destinations.scss
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Dau Viec Da Lam

- Kiem tra feedback: click ra ngoai nhung chevron van huong len.
- Xac dinh nguyen nhan: native select dang xoay chevron theo :focus-within, nen icon co the van huong len khi select giu focus.
- Chi sua CSS Admin Destinations; khong sua dropdown logic, API, payload backend, TourForm hoac public pages.

### Chuc Nang Da Them/Sua

- Bo rule xoay chevron cua native select theo focus-within.
- Giu xoay chevron cho autocomplete dua tren state mo that admin-destinations__control-wrap--open.
- Giu hover/focus doi mau chevron nhu cu.

### Ket Qua Build/Test

- npm run build: pass.
- Production build con warning budget: initial bundle 859.40 kB, destinations.scss 8.92 kB, tour-form.scss 10.00 kB, public-layout.scss 9.99 kB, home-hero.scss 9.88 kB.

## Cap Nhat: Mau Do Message Va Dau Sao Bat Buoc Form Destinations

Thoi gian cap nhat: 2026-06-06 01:18:49 +07:00

### File Da Sua

- src/app/pages/admin/destinations/destinations.html
- src/app/pages/admin/destinations/destinations.scss
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Dau Viec Da Lam

- Chi sua UI form Admin Destinations.
- Khong sua TypeScript, logic validate, API backend, payload backend, TourForm, public pages hoac AdminLayout.
- Khong ghi thay doi admin vao VOYAGE_FRONTEND_AUDIT_REPORT.md.

### Chuc Nang Da Them/Sua

- Them class label required cho cac field bat buoc: Loai diem den, Mien, Tinh/Thanh diem den, Quoc gia, Thanh pho, Ten diem den, Slug.
- Them dau * mau do tren label bat buoc bang CSS pseudo-element.
- Doi cac message duoi field gom field-error, field-help va field-warning sang mau do var(--dest-danger) de de phan biet.
- Giu nguyen logic form, validator va payload hien co.

### Ket Qua Build/Test

- npm run build: pass.
- Production build con warning budget: initial bundle 859.40 kB, destinations.scss 9.18 kB, tour-form.scss 10.00 kB, public-layout.scss 9.99 kB, home-hero.scss 9.88 kB.

## Cap Nhat: Upload Anh Truc Tiep Trong Form Destinations

Thoi gian cap nhat: 2026-06-06 01:24:26 +07:00

### File Da Sua/Tao Moi

- src/app/pages/admin/shared/admin-image-upload/admin-image-upload.ts
- src/app/pages/admin/shared/admin-image-upload/admin-image-upload.html
- src/app/pages/admin/shared/admin-image-upload/admin-image-upload.scss
- src/app/pages/admin/destinations/destinations.ts
- src/app/pages/admin/destinations/destinations.html
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Dau Viec Da Lam

- Kiem tra flow upload hien co cua Admin Media va Tour thumbnail/gallery.
- Tao component upload anh dung chung de sau co the gan lai cho Categories hoac cac form admin khac.
- Chi gan component moi vao form Admin Destinations trong luot nay.
- Khong sua TourForm, public pages, AdminLayout, backend API hoac payload destination.
- Khong ghi thay doi admin vao VOYAGE_FRONTEND_AUDIT_REPORT.md.

### Chuc Nang Da Them/Sua

- Tao component standalone AdminImageUpload co ControlValueAccessor de dung truc tiep voi formControlName.
- Component ho tro chon anh PNG/JPG/JPEG/WEBP toi da 5MB.
- Component hien preview file local truoc khi upload va preview URL hien co neu form da co imageUrl.
- Component upload bang AdminMediaApiService.uploadMedia(file, module), dung endpoint hien co /admin/media/upload.
- Component extract URL tu cac dang response media pho bien: url, imageUrl, secureUrl, fileUrl, mediaUrl va data.*.
- Khi upload thanh cong, component gan URL tra ve vao form control imageUrl.
- Form Admin Destinations doi field URL anh Cloudinary cu sang app-admin-image-upload voi uploadModule destinations.
- Payload create/update va updateImageOnly van dung truong imageUrl nhu cu.
- Them cleanup object URL preview khi component destroy.

### Ket Qua Build/Test

- npm run build: pass.
- Production build con warning budget: initial bundle 859.40 kB, destinations.scss 9.18 kB, tour-form.scss 10.00 kB, public-layout.scss 9.99 kB, home-hero.scss 9.88 kB.

## Cap Nhat: Mau O URL Upload Anh Admin Image Upload

Thoi gian cap nhat: 2026-06-06 08:38:05 +07:00

### File Da Sua

- src/app/pages/admin/shared/admin-image-upload/admin-image-upload.scss
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Dau Viec Da Lam

- Chi sua UI o URL trong component upload anh dung chung dang duoc dung o Admin Destinations.
- Khong sua logic upload, API backend, payload backend, TourForm, public pages hoac AdminLayout.

### Chuc Nang Da Them/Sua

- Ep input URL nen trang #fff.
- Ep chu input URL mau den #000.
- Doi placeholder sang mau #475569 de de doc hon tren nen trang.

### Ket Qua Build/Test

- npm run build: pass.
- Production build con warning budget: initial bundle 859.40 kB, destinations.scss 9.18 kB, tour-form.scss 10.00 kB, public-layout.scss 9.99 kB, home-hero.scss 9.88 kB.

## Cap Nhat: Fix Click Chevron Form Destinations

Thoi gian cap nhat: 2026-06-06 08:45:47 +07:00

### File Da Sua

- src/app/pages/admin/destinations/destinations.html
- src/app/pages/admin/destinations/destinations.scss
- src/app/pages/admin/destinations/destinations.ts
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Dau Viec Da Lam

- Kiem tra feedback: chevron hien thi nhung bam vao khong mo dropdown/select.
- Chi sua tuong tac chevron trong form Admin Destinations.
- Khong sua API backend, payload backend, TourForm, public pages hoac AdminLayout.

### Chuc Nang Da Them/Sua

- Doi chevron tu trang thai pointer-events none sang co the click.
- Chevron autocomplete goi truc tiep openProvinceDropdown, openCountryDropdown va openCityDropdown.
- Native select Mien va Trang thai them template ref va goi openNativeSelect(select).
- openNativeSelect focus select va dung showPicker neu browser ho tro, fallback giu focus neu khong ho tro.

### Ket Qua Build/Test

- npm run build: pass.
- Production build con warning budget: initial bundle 859.40 kB, destinations.scss 9.19 kB, tour-form.scss 10.00 kB, public-layout.scss 9.99 kB, home-hero.scss 9.88 kB.

## Cap Nhat: Chuan Hoa Tuong Tac Tat Ca Chevron Destinations

Thoi gian cap nhat: 2026-06-06 08:59:44 +07:00

### File Da Sua

- src/app/pages/admin/destinations/destinations.html
- src/app/pages/admin/destinations/destinations.scss
- src/app/pages/admin/destinations/destinations.ts
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Dau Viec Da Lam

- Kiem tra feedback: chevron trong trang chua hoat dong chuan.
- Tach hanh vi chevron autocomplete va native select de on dinh hon.
- Chi sua Admin Destinations; khong sua API backend, payload backend, TourForm, public pages hoac AdminLayout.

### Chuc Nang Da Them/Sua

- Autocomplete chevron doi thanh button that, khong con click truc tiep tren tui-icon.
- Button chevron dung mousedown preventDefault/stopPropagation de tranh blur dong dropdown som.
- Them toggleProvinceDropdown, toggleCountryDropdown va toggleCityDropdown de bam chevron co the mo/dong dropdown.
- Native select Mien va Trang thai dung chevron passive pointer-events none de click vao vung chevron di thang vao select native.
- Bo phu thuoc showPicker cho select vi khong dong nhat giua browser.

### Ket Qua Build/Test

- npm run build: pass.
- Production build con warning budget: initial bundle 859.40 kB, destinations.scss 9.62 kB, tour-form.scss 10.00 kB, public-layout.scss 9.99 kB, home-hero.scss 9.88 kB.

## Cap Nhat: Sua Lai Chevron Autocomplete Bang Wrapper Click

Thoi gian cap nhat: 2026-06-06 09:26:04 +07:00

### File Da Sua

- src/app/pages/admin/destinations/destinations.html
- src/app/pages/admin/destinations/destinations.scss
- src/app/pages/admin/destinations/destinations.ts
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Dau Viec Da Lam

- Kiem tra feedback: cac chevron van chua hoat dong dung trong UI thuc te.
- Bo huong dung button chevron rieng vi de bi chain event/CSS global lam sai.
- Chi sua tuong tac trong Admin Destinations; khong sua API backend, payload backend, TourForm, public pages hoac AdminLayout.

### Chuc Nang Da Them/Sua

- Autocomplete Tinh/Thanh, Quoc gia va Thanh pho dung mousedown tren toan bo control-wrap de mo dropdown.
- Chevron trong autocomplete chi con la icon passive pointer-events none, nen bam vao vung icon cung tinh la bam vao control-wrap.
- Bo button chevron rieng va cac ham toggleProvinceDropdown, toggleCountryDropdown, toggleCityDropdown.
- Them handleProvinceControlMouseDown, handleCountryControlMouseDown va handleCityControlMouseDown.
- Khi bam option trong menu, handler wrapper bo qua de khong mo lai dropdown sau khi chon.
- Native select Mien va Trang thai tiep tuc dung chevron passive de hanh vi chon la native select.

### Ket Qua Build/Test

- npm run build: pass.
- Production build con warning budget: initial bundle 859.40 kB, destinations.scss 9.22 kB, tour-form.scss 10.00 kB, public-layout.scss 9.99 kB, home-hero.scss 9.88 kB.

## Cap Nhat: Sua Lai Button Chevron Autocomplete Destinations

Thoi gian cap nhat: 2026-06-06 09:46:27 +07:00

### File Da Sua

- src/app/pages/admin/destinations/destinations.html
- src/app/pages/admin/destinations/destinations.scss
- src/app/pages/admin/destinations/destinations.ts
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Dau Viec Da Lam

- Tiep tuc sua feedback chevron Admin Destinations chua hoat dong tot.
- Chuyen lai autocomplete chevron sang button bam that nhung sua cau truc: button la vung click 44px, icon nam tinh ben trong button.
- Chi sua Admin Destinations; khong sua API backend, payload backend, TourForm, public pages hoac AdminLayout.

### Chuc Nang Da Them/Sua

- Tinh/Thanh, Quoc gia va Thanh pho co chevron-button rieng de mo/dong dropdown.
- Button chevron dung mousedown preventDefault/stopPropagation va click goi toggle dropdown.
- Icon TuiIcon ben trong button dung class admin-destinations__chevron-icon, khong con absolute doc lap.
- CSS ep chevron-button nen trong suot, khong bi button teal global de len.
- Native select Mien va Trang thai tiep tuc dung chevron passive de click vao vung icon roi vao select native.

### Ket Qua Build/Test

- npm run build: pass.
- Production build con warning budget: initial bundle 859.40 kB, destinations.scss 9.98 kB, tour-form.scss 10.00 kB, public-layout.scss 9.99 kB, home-hero.scss 9.88 kB.
## Cap Nhat: Fix Chevron Admin Destinations

Thoi gian cap nhat: 2026-06-06 10:11:39 +07:00

### File Da Sua

- `src/app/pages/admin/destinations/destinations.html`
- `src/app/pages/admin/destinations/destinations.scss`
- `src/app/pages/admin/destinations/destinations.ts`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Dau Viec Da Lam

- Doc `VOYAGE_ADMIN_AUDIT_REPORT.md` va `VOYAGE_FRONTEND_AUDIT_REPORT.md` truoc khi sua.
- Chi kiem tra va sua component Admin Destinations.
- Khong sua TourForm, public pages, AdminLayout hoac API/payload backend.

### Noi Dung Sua

- Doi chevron autocomplete cua `Tinh/Thanh`, `Quoc gia`, `Thanh pho` tu luong `mousedown` chan su kien roi cho `click` sang `pointerdown` truc tiep de toggle on dinh hon.
- Doi chevron cua native select `Mien` va `Trang thai` tu icon passive sang button overlay co handler rieng.
- Them `openSelectFromChevron()` de focus select va goi `showPicker()` neu browser ho tro, fallback focus neu khong ho tro.
- Rut gon CSS chevron, bo style icon passive khong con dung, giu Taiga UI `tui-icon` cho bieu tuong chevron.
- Giu nguyen logic filter/chon tinh, quoc gia, thanh pho.

### Ket Qua Build/Test

- `npm run build`: pass.

### Warning Con Lai

- Initial bundle van vuot warning budget: total 859.40 kB.
- `src/app/pages/public/home/components/home-hero/home-hero.scss` van vuot warning budget: total 9.88 kB.
- `src/app/pages/admin/destinations/destinations.scss` van vuot warning budget mem: total 9.38 kB, duoi hard budget.
- `src/app/layouts/public-layout/public-layout.scss` van vuot warning budget: total 9.99 kB.
- `src/app/pages/admin/tours/tour-form/tour-form.scss` van vuot warning budget: total 10.00 kB.

## Cap Nhat: Sua Lai Event Chevron Admin Destinations

Thoi gian cap nhat: 2026-06-06 10:14:20 +07:00

### File Da Sua

- `src/app/pages/admin/destinations/destinations.html`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Noi Dung Sua

- Doi autocomplete chevron cua `Tinh/Thanh`, `Quoc gia`, `Thanh pho` tu `pointerdown` sang `mousedown` toggle truc tiep.
- Ly do: `pointerdown` co the lam input blur truoc/sau khi toggle, dac biet o `Thanh pho` co `(blur)="commitManualCity()"`, dan den dropdown mo roi dong ngay.
- Giu `preventDefault()` va `stopPropagation()` trong toggle TS de nut chevron khong lay focus va khong kich hoat document click close.
- Doi chevron native select `Mien` va `Trang thai` sang `click` goi `openSelectFromChevron()` de `showPicker()` co user activation on dinh hon.

### Ket Qua Build/Test

- `npm run build`: pass.

### Warning Con Lai

- Chi con cac warning budget hien huu: initial bundle, public-layout.scss, tour-form.scss, home-hero.scss, destinations.scss.

## Cap Nhat: Toggle Dong Dropdown Khi Click Lai Input Admin Destinations

Thoi gian cap nhat: 2026-06-06 10:23:11 +07:00

### File Da Sua

- `src/app/pages/admin/destinations/destinations.html`
- `src/app/pages/admin/destinations/destinations.ts`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Noi Dung Sua

- Bo `(click)="open...Dropdown()"` tren cac input autocomplete `Tinh/Thanh`, `Quoc gia`, `Thanh pho` vi click vao input dang mo se mo lai dropdown thay vi dong.
- Them handler `mousedown` rieng cho tung input autocomplete.
- Khi dropdown dang mo, click lai vao chinh input se `preventDefault`, `stopPropagation` va dong dropdown.
- Khi input dang focus nhung dropdown da dong, click lai vao input se mo dropdown.
- Click ra ngoai van dung `document:click` hien co de dong tat ca autocomplete dropdown.
- Khong sua logic filter/chon option/API/payload.

### Ket Qua Build/Test

- `npm run build`: pass.

### Warning Con Lai

- Chi con cac warning budget hien huu: initial bundle, public-layout.scss, tour-form.scss, destinations.scss, home-hero.scss.

## Cap Nhat: Doi Mien Va Trang Thai Sang Taiga UI Select

Thoi gian cap nhat: 2026-06-06 10:32:43 +07:00

### File Da Sua

- `src/app/pages/admin/destinations/destinations.html`
- `src/app/pages/admin/destinations/destinations.scss`
- `src/app/pages/admin/destinations/destinations.ts`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Noi Dung Sua

- Doi 2 o `Mien` va `Trang thai` tu native select + custom chevron overlay sang Taiga UI `tui-textfield` + `select tuiSelect`.
- Import `TuiSelect` tu `@taiga-ui/kit` vao standalone component Admin Destinations.
- Them `subRegionSelectItems`, `statusSelectItems` va stringify handlers de form value van giu `NORTH/CENTRAL/SOUTH`, `ACTIVE/INACTIVE` nhung UI hien label tieng Viet.
- Bo chevron glyph/custom overlay cho 2 o select nay; chevron do Taiga UI quan ly.
- Giu nguyen autocomplete `Tinh/Thanh`, `Quoc gia`, `Thanh pho` vi phan do da hoat dong on.
- Khong sua TourForm, public pages, AdminLayout, API hoac payload backend.

### Ket Qua Build/Test

- `npm run build`: pass.

### Warning Con Lai

- Con warning budget hien huu: initial bundle, public-layout.scss, tour-form.scss, home-hero.scss, destinations.scss.
- Lazy chunk `destinations` tang kich thuoc do import them Taiga `TuiSelect`.

## Cập Nhật: E2E Admin Tour Với Backend Thật

Thời gian cập nhật: 2026-06-06 10:34:00 +07:00

### File frontend/admin đã sửa

- `src/app/core/models/admin-tour.model.ts`
  - `AdminTourImage` thêm `sourceType`, `mediaId` để nhận response gallery mới.
  - `AdminTourImageFromMediaRequest` thêm field chuẩn `thumbnail`, giữ `isThumbnail` để backward-compatible.
- `src/app/pages/admin/tours/tour-gallery/tour-gallery.ts`
  - Payload attach Media đổi sang `thumbnail: false` khi gọi `POST /api/admin/tours/{id}/images/from-media`.

Không sửa public Home/Tours/TourDetail/Booking/Wishlist/Profile/Auth trong phase này.

### API đã nối/thay đổi

- Giữ flow Admin Media upload qua backend: `POST /api/admin/media/upload`.
- Gallery dùng endpoint backend thật: `POST /api/admin/tours/{id}/images/from-media` với `mediaId`, `altText`, `sortOrder`, `thumbnail`.
- Không gọi Cloudinary trực tiếp từ frontend.
- Không dùng base64 ảnh.
- Không đổi API path hiện có.

### Lỗi contract phát hiện và cách fix

- Rủi ro cũ: frontend/gallery có thể attach ảnh theo URL hoặc gửi payload không khớp multipart.
- Thực tế hiện tại: `TourGallery` đã upload qua Admin Media rồi attach bằng `mediaId`; backend đã có endpoint `from-media`.
- Fix Phase 9: chuẩn hóa request frontend sang field `thumbnail`, backend vẫn nhận alias `isThumbnail` để không vỡ client cũ.
- Backend response gallery mới có thể trả thêm `sourceType/mediaId`; model frontend đã mở rộng để nhận mà không ảnh hưởng render hiện tại.

### Luồng đã test với backend thật

Server/port:

- Port `8081` đã có Java process chạy từ trước task, `GET /api/public/ping` trả `UP`.
- Port `4200` đã có Node process listen từ trước task nhưng HTTP request vào frontend không trả ổn định trong môi trường terminal, nên không restart/dừng process này vì không phải do task tạo.
- Do đó E2E được test bằng API thật với token ADMIN thay vì thao tác UI browser đầy đủ.

Admin auth/media:

- Login ADMIN thật thành công với `admin@voyageviet.local`.
- `GET /api/admin/media?module=tours&page=0&size=5&sortBy=createdAt&sortDir=desc` trả media `id=32`, `secureUrl`, `publicId`, `mediaType=IMAGE`.

Create tour/gallery/itinerary/schedules/publish:

- Tạo tour draft test thành công: `id=41`, slug `phase-9-e2e-admin-tour-20260606103234`.
- Publish checklist khi thiếu gallery/itinerary/schedule: `canPublish=false`.
- Attach ảnh từ Media `id=32` vào gallery qua `POST /api/admin/tours/41/images/from-media`: thành công, ảnh đầu tiên là thumbnail.
- Lưu itinerary 2 ngày qua `PUT /api/admin/tours/41/itineraries`: thành công, reload API public itinerary trả 2 item.
- Tạo schedule OPEN future qua `POST /api/admin/tours/41/schedules`: thành công.
- Publish checklist sau khi đủ thumbnail/gallery/itinerary/open schedule: `canPublish=true`.
- Publish tour qua `POST /api/admin/tours/41/publish`: thành công.
- Public detail `GET /api/public/tours/phase-9-e2e-admin-tour-20260606103234`: trả tour `PUBLISHED`.
- Public schedules trả 1 item khi schedule `OPEN`.
- Đổi schedule sang `CLOSED`: public schedules trả 0 item.
- Đổi lại `OPEN`: public schedules trả 1 item.
- Attach ảnh Media lần 2 rồi xóa ảnh gallery đó: media library vẫn còn media `id=32`, không bị xóa nhầm.

### Kết quả build

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning còn lại

- Warning budget production build vẫn còn:
  - initial bundle: 865.23 kB, vượt budget 500.00 kB.
  - `src/app/layouts/public-layout/public-layout.scss`: 9.99 kB, vượt budget 8.00 kB.
  - `src/app/pages/public/home/components/home-hero/home-hero.scss`: 9.88 kB, vượt budget 8.00 kB.
  - `src/app/pages/admin/destinations/destinations.scss`: 9.56 kB, vượt budget 8.00 kB.
  - `src/app/pages/admin/tours/tour-form/tour-form.scss`: 10.00 kB, vượt budget 8.00 kB.
- Các warning này là warning budget hiện hữu, không phải hard error TypeScript/template.

### Checklist test thủ công

- Vào `/admin/media`, upload ảnh module `tours`, kiểm tra response có `id` và `secureUrl`.
- Vào `/admin/tours/new`, tạo tour draft với thumbnail URL từ media.
- Vào `/admin/tours/{id}/edit`, chọn ảnh từ Media và attach gallery.
- Reload edit page, gallery vẫn còn.
- Set thumbnail từ gallery và lưu tour nếu cần sync `thumbnailUrl` trong form.
- Thêm/sửa itinerary 2 ngày, reorder nếu cần.
- Thêm/sửa schedule OPEN future, đổi OPEN/CLOSED.
- Gọi publish checklist trước/sau khi đủ dữ liệu.
- Publish tour và mở public detail `/tours/{slug}`.

### TODO còn lại

- Cần restart frontend process `4200` nếu muốn test UI browser đầy đủ, vì process hiện có không phản hồi HTTP ổn định trong terminal và không phải process do task này tạo.
- Cần restart backend để load code Phase 9 mới (`sourceType/mediaId`, alias `thumbnail`) sau khi port `8081` được giải phóng hoặc được phép dừng process hiện tại.
- Admin Booking Detail frontend chưa làm.
- WebSocket JWT handshake chưa làm.
- STAFF permission/feature permission chi tiết chưa làm.
- Không cập nhật `VOYAGE_FRONTEND_AUDIT_REPORT.md` vì phase này chỉ sửa admin tour model/gallery, không sửa public/core dùng chung theo nghĩa ảnh hưởng public pages.

## Cap Nhat: Fix O Mien Va Trang Thai Bi Trong Sau Khi Doi Taiga Select

Thoi gian cap nhat: 2026-06-06 10:38:06 +07:00

### File Da Sua

- `src/app/pages/admin/destinations/destinations.html`
- `src/app/pages/admin/destinations/destinations.scss`
- `src/app/pages/admin/destinations/destinations.ts`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Noi Dung Sua

- Phat hien `select tuiSelect` render thanh o trang trong UI thuc te cua Admin Destinations.
- Bo cau truc `select tuiSelect` cho 2 o `Mien` va `Trang thai`.
- Giu wrapper Taiga UI `tui-textfield` de 2 o van nam trong he UI Taiga.
- Dung native select that ben trong wrapper de hien option on dinh va giu formControl cu.
- Them chevron bang Taiga `tui-icon` (`@tui.chevron-down`) overlay ben phai, khong dung glyph text.
- Sua rieng label/placeholder cua 2 o bang HTML entity de tranh loi mojibake hien thi.
- Khong sua autocomplete `Tinh/Thanh`, `Quoc gia`, `Thanh pho`.
- Khong sua API, payload backend, TourForm, public pages hoac AdminLayout.

### Ket Qua Build/Test

- `npm run build`: pass.

### Warning Con Lai

- Chi con cac warning budget hien huu: initial bundle, home-hero.scss, public-layout.scss, destinations.scss, tour-form.scss.

## Cap Nhat: Hien Chevron Cho O Mien Va Trang Thai

Thoi gian cap nhat: 2026-06-06 10:45:05 +07:00

### File Da Sua

- `src/app/pages/admin/destinations/destinations.html`
- `src/app/pages/admin/destinations/destinations.scss`
- `src/app/pages/admin/destinations/destinations.ts`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Noi Dung Sua

- Bo `tui-textfield` wrapper quanh 2 select `Mien` va `Trang thai` vi wrapper nay lam `tui-icon` chevron khong hien trong UI thuc te.
- Giu native select that de dropdown hien va chon on dinh.
- Dung Taiga `tui-icon` (`@tui.chevron-down`) lam chevron overlay ben phai select.
- Ep `appearance: none` va `-webkit-appearance: none` cho select co chevron de an mui ten native, tranh trung icon.
- Khong sua autocomplete `Tinh/Thanh`, `Quoc gia`, `Thanh pho`.

### Ket Qua Build/Test

- `npm run build`: pass.

### Warning Con Lai

- Chi con warning budget hien huu: initial bundle, destinations.scss, public-layout.scss, tour-form.scss, home-hero.scss.

## Cap Nhat: Fix Chevron Select Va Encoding Admin Destinations

Thoi gian cap nhat: 2026-06-06 10:50:18 +07:00

### File Da Sua

- `src/app/pages/admin/destinations/destinations.html`
- `src/app/pages/admin/destinations/destinations.scss`
- `src/app/pages/admin/destinations/destinations.ts`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Noi Dung Sua

- Sua mojibake tieng Viet trong `destinations.html` va cac chuoi bi loi trong `destinations.ts` bang cach decode lai cac dong co dau hieu sai encoding.
- Sua cac label/placeholder hien thi trong form Admin Destinations ve tieng Viet dung dau.
- Doi chevron cua `Mien` va `Trang thai` tu icon tinh sang button that nam ben phai select.
- Button chevron goi `openNativeSelectFromChevron()` de focus select va goi `showPicker()` neu browser ho tro.
- Giu native select on dinh, khong doi formControl, khong doi payload/API.
- Giu autocomplete `Tinh/Thanh`, `Quoc gia`, `Thanh pho` nhu trang thai da on.

### Ket Qua Build/Test

- `npm run build`: pass.

### Warning Con Lai

- Con warning budget hien huu: initial bundle, home-hero.scss, tour-form.scss, destinations.scss, public-layout.scss.

## Cap Nhat: Fix Dut Diem Chevron Dropdown Admin Destinations

Thoi gian cap nhat: 2026-06-06 10:54:18 +07:00

### File Da Sua

- `src/app/pages/admin/destinations/destinations.html`
- `src/app/pages/admin/destinations/destinations.scss`
- `src/app/pages/admin/destinations/destinations.ts`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Noi Dung Sua

- Doc `VOYAGE_ADMIN_AUDIT_REPORT.md` va `VOYAGE_FRONTEND_AUDIT_REPORT.md` truoc khi sua.
- Doi `Mien` va `Trang thai` sang pattern native select co wrapper `admin-destinations__control-wrap--select` va state `focusedSelect`.
- Bo button `openNativeSelectFromChevron()` vi co the chan hanh vi native select va lam chevron khong ro rang.
- Native select an mui ten browser bang `appearance: none` va `-webkit-appearance: none`.
- Them chevron custom `admin-destinations__chevron` voi `pointer-events: none`; click vao vung chevron van la click vao select that.
- Chevron native select doi mau teal khi hover/focus va xoay 180 do khi `focusedSelect` dang active.
- Autocomplete `Tinh/Thanh`, `Quoc gia`, `Thanh pho` tiep tuc dung state open hien co de xoay `tui-icon` trong `admin-destinations__chevron-button`.
- Kiem tra lai encoding Admin Destinations: cac chuoi mojibake chinh trong HTML/TS da duoc sua ve tieng Viet dung dau.
- Khong sua logic filter, API, payload backend, TourForm, public pages hoac AdminLayout.

### Ket Qua Build/Test

- `npm run build`: pass.

### Warning Con Lai

- Con warning budget hien huu: initial bundle, home-hero.scss, public-layout.scss, tour-form.scss, destinations.scss.

## Cap Nhat: Dong Bo Chevron Native Select Voi Autocomplete Admin Destinations

Thoi gian cap nhat: 2026-06-06 10:56:57 +07:00

### File Da Sua

- `src/app/pages/admin/destinations/destinations.html`
- `src/app/pages/admin/destinations/destinations.scss`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Noi Dung Sua

- Thay chevron text cua `Mien` va `Trang thai` bang Taiga `tui-icon` `@tui.chevron-down`, dung cung icon voi cac o autocomplete nhu `Tinh/Thanh`.
- Them modifier `admin-destinations__chevron-icon--select` de icon select can giua ben phai va khong chan click vao native select.
- Giu state `focusedSelect` va `control-wrap--open` de icon select doi mau/xoay giong pattern autocomplete.
- Khong sua logic chon/filter/API/payload.

### Ket Qua Build/Test

- `npm run build`: pass.

### Warning Con Lai

- Con warning budget hien huu: initial bundle, home-hero.scss, destinations.scss, tour-form.scss, public-layout.scss.

## Cap Nhat: Reset Chevron Sau Khi Chon Gia Tri Select Admin Destinations

Thoi gian cap nhat: 2026-06-06 10:59:54 +07:00

### File Da Sua

- `src/app/pages/admin/destinations/destinations.html`
- `src/app/pages/admin/destinations/destinations.ts`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Noi Dung Sua

- Fix loi chevron cua `Mien` va `Trang thai` van huong len sau khi chon gia tri.
- Them `closeFocusedSelect()` de clear `focusedSelect` va blur native select sau event `change`.
- `selectSubRegion()` goi `closeFocusedSelect(event)` sau khi cap nhat form control.
- Select `Trang thai` them `(change)="closeFocusedSelect($event)"`.
- Khong sua logic filter/autocomplete/API/payload.

### Ket Qua Build/Test

- `npm run build`: pass.

### Warning Con Lai

- Con warning budget hien huu: initial bundle, public-layout.scss, home-hero.scss, destinations.scss, tour-form.scss.

## Cap Nhat: Chevron Toolbar Filter Admin Destinations

Thoi gian cap nhat: 2026-06-06 11:04:24 +07:00

### File Da Sua

- `src/app/pages/admin/destinations/destinations.html`
- `src/app/pages/admin/destinations/destinations.scss`
- `src/app/pages/admin/destinations/destinations.ts`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Noi Dung Sua

- Them chevron custom cho 2 select filter toolbar `Trang thai` va `Khu vuc` trong trang Quan ly diem den.
- Bọc select filter bang `admin-destinations__control-wrap--select` va dung Taiga `tui-icon @tui.chevron-down` giong pattern form.
- Mo rong `focusedSelect` them `statusFilter` va `regionFilter` de chevron doi mau/xoay khi focus.
- Sau khi chon filter, `updateStatusFilter()` va `updateRegionFilter()` goi `closeFocusedSelect()` de chevron quay xuong.
- Khong sua logic filter, API hoac payload backend.

### Ket Qua Build/Test

- `npm run build`: pass.

### Warning Con Lai

- Con warning budget hien huu: initial bundle, home-hero.scss, destinations.scss, tour-form.scss, public-layout.scss.

## Cap Nhat: Chevron Select Admin Categories

Thoi gian cap nhat: 2026-06-06 11:10:41 +07:00

### File Da Sua

- `src/app/pages/admin/categories/categories.html`
- `src/app/pages/admin/categories/categories.scss`
- `src/app/pages/admin/categories/categories.ts`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Noi Dung Sua

- Them chevron custom cho select `Trang thai` trong toolbar Quan ly danh muc.
- Them chevron custom cho select `Trang thai` trong form edit danh muc.
- Import `TuiIcon` va dung `@tui.chevron-down` de dong bo voi Admin Destinations.
- Them state `focusedSelect` de chevron doi mau/xoay khi focus/open.
- Sau khi chon filter/form status, clear focus de chevron quay xuong.
- An mui ten native cua browser bang `appearance: none` va `-webkit-appearance: none`.
- Khong sua logic filter, API hoac payload backend.

### Ket Qua Build/Test

- `npm run build`: pass.

### Warning Con Lai

- Con warning budget hien huu: initial bundle, public-layout.scss, tour-form.scss, destinations.scss, home-hero.scss.

## Cap Nhat: Fix Encoding Admin Categories

Thoi gian cap nhat: 2026-06-06 11:13:48 +07:00

### File Da Sua

- src/app/pages/admin/categories/categories.html
- src/app/pages/admin/categories/categories.ts
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Noi Dung Sua

- Sua loi mojibake/encoding tieng Viet trong component Quan ly danh muc.
- Khoi phuc cac label, placeholder, message, confirm text va status label ve tieng Viet dung dau.
- Giu nguyen logic CRUD/filter/API/payload cua Admin Categories.
- Khong sua public pages, TourForm, AdminLayout hoac VOYAGE_FRONTEND_AUDIT_REPORT.md.

### Ket Qua Build/Test

- npm run build: pass.

## Cap Nhat: Repeat Click Chevron Admin Categories

Thoi gian cap nhat: 2026-06-06 11:18:22 +07:00

### File Da Sua

- src/app/pages/admin/categories/categories.html
- src/app/pages/admin/categories/categories.ts
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Noi Dung Sua

- Them handler repeat-click cho select Trang thai trong form va toolbar Quan ly danh muc.
- Khi click lai vao select dang focus ma khong chon value, clear focusedSelect va blur select de chevron quay xuong ngay.
- Khong sua logic filter, CRUD, API hoac payload backend.
- Khong sua public pages, TourForm, AdminLayout hoac VOYAGE_FRONTEND_AUDIT_REPORT.md.

### Ket Qua Build/Test

- npm run build: pass.
## Cap Nhat: Chevron Native Select Repeat Click

Thoi gian cap nhat: 2026-06-06 11:21:38 +07:00

### File Da Sua

- src/app/pages/admin/categories/categories.html
- src/app/pages/admin/categories/categories.ts
- src/app/pages/admin/destinations/destinations.html
- src/app/pages/admin/destinations/destinations.ts
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Noi Dung Sua

- Thay handler mousedown cua native select bang co che schedule close sau click de clear state chevron khi dropdown native dong nhung select van focus.
- Ap dung cho select Trang thai trong Admin Categories.
- Ap dung cho select native Mien, Trang thai, Status filter va Khu vuc filter trong Admin Destinations.
- Khong sua logic filter, CRUD, API hoac payload backend.
- Khong sua public pages, TourForm, AdminLayout hoac VOYAGE_FRONTEND_AUDIT_REPORT.md.

### Ket Qua Build/Test

- npm run build: pass.
## Cap Nhat: Fix Native Select Pick Value

Thoi gian cap nhat: 2026-06-06 11:24:16 +07:00

### File Da Sua

- src/app/pages/admin/categories/categories.ts
- src/app/pages/admin/destinations/destinations.ts
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Noi Dung Sua

- Sua loi scheduled click goi blur lam native select dong ngay va khong pick duoc value.
- scheduleSelectClose hien chi reset focusedSelect de icon chevron quay xuong, khong blur select sau click.
- change/blur van xu ly dong state khi chon value hoac click ra ngoai.
- Khong sua logic filter, CRUD, API hoac payload backend.

### Ket Qua Build/Test

- npm run build: pass.
## Cap Nhat: Dropdown Custom Cho Chevron Select Admin

Thoi gian cap nhat: 2026-06-06 11:30:33 +07:00

### File Da Sua

- src/app/pages/admin/categories/categories.html
- src/app/pages/admin/categories/categories.scss
- src/app/pages/admin/categories/categories.ts
- src/app/pages/admin/destinations/destinations.html
- src/app/pages/admin/destinations/destinations.scss
- src/app/pages/admin/destinations/destinations.ts
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Noi Dung Sua

- Thay native select co chevron bang dropdown custom co state that cho Admin Categories va Admin Destinations.
- Fix dut diem loi chevron quay len roi quay xuong ngay hoac click vao select bi dong truoc khi pick value.
- Click mo dropdown thi chevron quay len, click lai dong dropdown thi chevron quay xuong, chon option van cap nhat value binh thuong.
- Click ra ngoai va phim Escape dong dropdown.
- Tai su dung style menu/option gon nhe de khong vuot hard budget SCSS cua destinations.
- Khong sua logic CRUD, filter business, API hoac payload backend.

### Ket Qua Build/Test

- npm run build: pass.
## Cap Nhat: Native Select Mien Va Trang Thai Admin Destinations

Thoi gian cap nhat: 2026-06-06 14:58:54 +07:00

### File Da Sua

- src/app/pages/admin/destinations/destinations.html
- src/app/pages/admin/destinations/destinations.scss
- src/app/pages/admin/destinations/destinations.ts
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Noi Dung Sua

- Doi o Mien trong form Admin Destinations ve native select that.
- Doi o Trang thai trong form edit Admin Destinations ve native select that.
- Bo custom button/menu/card cho hai o nay; option dropdown do browser quan ly de giong native select.
- Giu nguyen logic form, filter, API va payload backend.
- Khong sua TourForm, public pages, AdminLayout hoac VOYAGE_FRONTEND_AUDIT_REPORT.md.

### Ket Qua Build/Test

- npm run build: pass.
## Cap Nhat: Option Dropdown Native-Like Admin Destinations

Thoi gian cap nhat: 2026-06-06 16:52:37 +07:00

### File Da Sua

- src/app/pages/admin/destinations/destinations.scss
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Noi Dung Sua

- Fix style option cho dropdown autocomplete Tinh/Thanh, Quoc gia va Thanh pho trong Admin Destinations.
- Ep option dang mot dong phang, nen trang, can trai, padding nho, khong bo tron tung item va khong dung nen teal dac.
- Giu Mien va Trang thai trong form la native select that.
- Khong sua logic filter/autocomplete, API, payload backend, TourForm, public pages hoac AdminLayout.
- Khong ghi vao VOYAGE_FRONTEND_AUDIT_REPORT.md.

### Ket Qua Build/Test

- npm run build: pass.
## Cap Nhat: Chevron Select Filter Admin Tours

Thoi gian cap nhat: 2026-06-06 16:59:52 +07:00

### File Da Sua

- src/app/pages/admin/tours/tours.html
- src/app/pages/admin/tours/tours.scss
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Noi Dung Sua

- Boc cac select filter trong man Quan ly tour bang admin-tours__select-wrap.
- Them chevron rieng cho cac o Trang thai, Featured, Danh muc, Diem den va Sap xep.
- An mui ten native bang appearance none va them padding-right de chevron khong che text.
- Dong bo hover/focus theo theme teal VoyageViet, khong dung mau xanh cu #004FA8.
- Khong sua Admin Destinations, TourForm them/sua tour, public pages, AdminLayout, API hoac payload backend.
- Khong ghi vao VOYAGE_FRONTEND_AUDIT_REPORT.md.

### Ket Qua Build/Test

- npm run build: pass.
- Con warning budget hien huu va warning moi o src/app/pages/admin/tours/tours.scss do them style chevron filter, khong gay loi build.

## Cap Nhat: Fix Dut Diem Chevron Select Filter Admin Tours

Thoi gian cap nhat: 2026-06-06 21:37:39 +07:00

### File Da Sua

- src/app/pages/admin/tours/tours.html
- src/app/pages/admin/tours/tours.scss
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Noi Dung Sua

- Kiem tra lai toan bo select filter trong man Quan ly tour: Trang thai, Featured, Danh muc, Diem den va Sap xep.
- Xac nhan HTML dang dung admin-tours__select-wrap, admin-tours__select va admin-tours__select-chevron cho 5 select filter.
- Xoa ky tu chevron hien thi truc tiep trong span de tranh render thanh chu v tho.
- Doi chevron sang icon ve bang CSS border tren span rong, can giua doc va doi mau teal khi hover/focus.
- Bo mui ten native bang appearance none va -webkit-appearance none tren dung class admin-tours__select.
- Sua truc tiep class dang duoc HTML su dung, khong tao class moi khong dung.
- Khong sua Admin Destinations, TourForm, public pages, AdminLayout, API hoac payload backend.
- Khong ghi vao VOYAGE_FRONTEND_AUDIT_REPORT.md.

### Ket Qua Build/Test

- npm run build: pass.
- Con warning budget o tours.scss va cac warning budget hien huu khac, khong gay loi build.








## Cap Nhat: SVG Chevron Select Filter Admin Tours

Thoi gian cap nhat: 2026-06-06 22:30:31 +07:00

### File Da Sua

- src/app/pages/admin/tours/tours.html
- src/app/pages/admin/tours/tours.scss
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Noi Dung Sua

- Thay toan bo span chevron rong trong filter select Admin Tours bang SVG chevron that trong HTML.
- Ap dung cho cac select Trang thai, Featured, Danh muc, Diem den va Sap xep.
- Doi SCSS tu admin-tours__select-chevron sang admin-tours__select-icon, dat kich thuoc 18px va can giua theo chieu doc.
- Giu appearance none va -webkit-appearance none tren admin-tours__select de an mui ten native.
- Chevron SVG doi mau teal khi hover/focus thong qua class dang duoc HTML su dung.
- Khong sua Admin Destinations, TourForm, public pages, AdminLayout, API hoac filter logic.
- Khong ghi vao VOYAGE_FRONTEND_AUDIT_REPORT.md.

### Ket Qua Build/Test

- npm run build: pass.
- Con warning budget hien huu va warning tours.scss, khong gay loi build.
## Cap Nhat: Custom Dropdown Filter Admin Tours

Thoi gian cap nhat: 2026-06-06 23:33:15 +07:00

### File Da Sua

- src/app/pages/admin/tours/tours.html
- src/app/pages/admin/tours/tours.scss
- src/app/pages/admin/tours/tours.ts
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Noi Dung Sua

- Chuyen 5 filter trong toolbar Quan ly tour tu native select sang custom dropdown that.
- Ap dung cho Trang thai, Featured, Danh muc, Diem den va Sap xep.
- Giu o Tim kiem la input cu, khong sua logic search.
- Them openedFilter va cac handler toggle/select de kiem soat mo dong dropdown, click ngoai va Escape.
- Dropdown trigger co nen trang, border #DDE7E4, radius 12px, SVG chevron ben phai va xoay 180 do khi mo.
- Menu dropdown custom nen trang, option mot dong, hover/active xanh nhat, khong dung menu native browser.
- Khong sua Admin Destinations, TourForm them/sua tour, public pages, AdminLayout, API hoac payload backend.
- Khong ghi vao VOYAGE_FRONTEND_AUDIT_REPORT.md.

### Ket Qua Build/Test

- npm run build: pass.
- Con warning budget hien huu va warning tours.scss, khong gay loi build.