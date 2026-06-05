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
