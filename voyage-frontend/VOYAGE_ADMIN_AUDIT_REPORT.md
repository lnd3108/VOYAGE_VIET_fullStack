# VOYAGE_ADMIN_AUDIT_REPORT.md — Bản rút gọn sau tinh chỉnh

Thời gian cập nhật: 2026-06-08

## Mục tiêu dọn file

File audit này đã được viết lại theo hướng rút gọn, chỉ giữ các chức năng chính đã hoàn thiện đến trạng thái cuối cùng.

Đã loại bỏ các section trung gian/lặp lại như: chỉnh màu nhiều lần, thử sai chevron, fix UI nhỏ, build lỗi tạm thời đã xử lý, các prompt không còn phản ánh trạng thái cuối.

## Nguyên tắc ghi nhận

- Chỉ ghi thay đổi liên quan admin frontend vào `VOYAGE_ADMIN_AUDIT_REPORT.md`.
- Không ghi thay đổi admin vào `VOYAGE_FRONTEND_AUDIT_REPORT.md`.
- Chỉ ghi các chức năng đã làm được hoặc thay đổi có ý nghĩa cuối cùng.
- Không ghi quá chi tiết các chỉnh sửa UI nhỏ không ảnh hưởng nghiệp vụ.
- Ưu tiên mô tả trạng thái cuối cùng của từng module.

---

## Phạm vi đã hoàn thiện

- Admin Layout
- Admin UI Feedback bằng Taiga UI
- Admin Media / Cloudinary
- Admin Categories
- Admin Destinations
- Admin Tours List
- Admin Tour Preview Panel
- Admin Tour Create/Edit Form
- Admin Tour Gallery
- Admin Tour Itinerary
- Admin Tour Schedules
- E2E Admin Tour với backend thật

---

# 1. Admin Layout

## File chính

- `src/app/layouts/admin-layout/admin-layout.html`
- `src/app/layouts/admin-layout/admin-layout.scss`
- `src/app/layouts/admin-layout/admin-layout.ts`

## Chức năng đã hoàn thiện

- Sidebar admin cố định khi nội dung bên phải scroll.
- Content admin scroll độc lập.
- Topbar admin sticky trong vùng content.
- Layout desktop ổn định.
- Mobile/tablet chuyển về layout column để tránh vỡ UI.
- Scrollbar admin được làm gọn theo theme teal/green.
- Không dùng màu xanh cũ `#004FA8`.

## Ghi chú kỹ thuật

- Topbar sticky phụ thuộc vào `.admin-layout__content` là scroll container.
- Nếu thay đổi cấu trúc shell admin cần kiểm tra lại sticky behavior.

---

# 2. Admin UI Feedback

## File chính

- `src/app/core/services/admin-ui-feedback.service.ts`
- `src/app/core/services/admin-confirm-dialog.component.ts`
- Các màn admin đang dùng confirm/notification chung.

## Chức năng đã hoàn thiện

- Thay `window.confirm` và `window.alert` bằng Taiga UI dialog/notification.
- Dùng service chung cho admin feedback:
  - success
  - error
  - warning
  - info
  - confirm danger
  - confirm warning
  - confirm info
- Dialog xác nhận đồng bộ theme teal/green.
- Danger action dùng màu đỏ.
- Có cơ chế hạn chế spam notification trùng lặp.
- Các thao tác xóa, ẩn, hủy, đổi trạng thái trong admin dùng confirm UI thay vì alert browser.

## Ghi chú kỹ thuật

- `AdminUiFeedbackService.confirm*()` trả về `Observable<boolean>`.
- Các component dùng `take(1)` để tránh subscription treo.

---

# 3. Admin Media / Cloudinary

## File chính

- `src/app/pages/admin/media/media.ts`
- `src/app/pages/admin/media/media.html`
- `src/app/pages/admin/media/media.scss`
- `src/app/core/api/admin-media-api.service.ts`
- `src/app/core/models/media.model.ts`

## API đã nối

- `GET /api/admin/media`
- `POST /api/admin/media/upload`
- `DELETE /api/admin/media/{id}`

## Chức năng đã hoàn thiện

- Upload ảnh qua backend lên Cloudinary.
- Không gọi Cloudinary trực tiếp từ frontend.
- Không lưu ảnh base64.
- Validate file ảnh:
  - PNG
  - JPG/JPEG
  - WEBP
  - tối đa 5MB
- Preview ảnh trước khi upload.
- Hiển thị danh sách media dạng grid responsive.
- Lọc media theo module:
  - Tất cả
  - Tours
  - Categories
  - Destinations
  - Avatars
  - Banners
  - General
- Card media hiển thị:
  - ảnh
  - filename/publicId
  - module
  - content type/media type
  - dung lượng
  - ngày tạo
  - URL rút gọn
- Copy URL Cloudinary.
- Mở ảnh ở tab mới.
- Xóa media bằng confirm Taiga UI.
- Normalize URL linh hoạt theo nhiều alias response:
  - `url`
  - `imageUrl`
  - `secureUrl`
  - `fileUrl`
  - `mediaUrl`
  - `data.url`
  - `data.secureUrl`

## Ghi chú kỹ thuật/rủi ro

- Media manager là nguồn ảnh chung cho Category, Destination, Tour thumbnail và Tour gallery.
- Nếu xóa media đang được entity khác dùng, URL đã gắn ở entity đó có thể bị lỗi ảnh.

---

# 4. Admin Categories

## File chính

- `src/app/pages/admin/categories/categories.ts`
- `src/app/pages/admin/categories/categories.html`
- `src/app/pages/admin/categories/categories.scss`
- `src/app/pages/admin/categories/categories-media.scss`
- `src/app/pages/admin/categories/category-action-cell-renderer.component.ts`
- `src/app/core/api/admin-category-api.service.ts`
- `src/app/core/models/category.model.ts`
- `package.json`
- `package-lock.json`

## Package đã thêm

- `ag-grid-angular@35.3.1`
- `ag-grid-community@35.3.1`

## API đã nối

- `GET /api/admin/categories`
- `POST /api/admin/categories`
- `PUT /api/admin/categories/{id}`
- `PATCH /api/admin/categories/{id}/status`
- `PATCH /api/admin/categories/{id}/image`
- `DELETE /api/admin/categories/{id}`
- `GET /api/admin/media`
- `POST /api/admin/media/upload`

## Chức năng đã hoàn thiện

- CRUD danh mục.
- Search/filter theo tên, slug, trạng thái.
- Auto-generate slug từ tên danh mục.
- Cho phép sửa slug thủ công.
- Gắn ảnh danh mục bằng URL Cloudinary.
- Upload ảnh trực tiếp trong form danh mục qua Admin Media.
- Cho phép chọn ảnh đã có từ Media ngay trong form danh mục.
- Sau khi upload hoặc chọn ảnh, frontend tự set `imageUrl` vào form và cập nhật preview.
- Giữ `imageUrl` là dữ liệu gửi backend, không gửi `mediaId` và không gửi file trong payload category.
- Giữ endpoint cập nhật riêng ảnh danh mục trong edit mode.
- Preview ảnh danh mục có fallback `/hero/bg-home.png`.
- Chuyển danh sách Admin Categories từ bảng HTML custom sang AG Grid Angular Community.
- Giữ logic tìm kiếm, lọc trạng thái và đếm số lượng danh mục sau khi chuyển sang AG Grid.
- Thêm cột `Ngày tạo`, hiển thị `dd/MM/yyyy HH:mm` nếu backend trả dữ liệu.
- Sửa cột `Cập nhật` để hiển thị ngày giờ cập nhật thật.
- Nếu chưa có cập nhật, dữ liệu cập nhật không hợp lệ hoặc `updatedAt` trùng `createdAt`, cột `Cập nhật` hiển thị `-`.
- Bỏ cột nhập/sửa trực tiếp thứ tự trong bảng.
- Cột `Thứ tự` hiển thị `displayOrder` đã chuẩn hóa và sort mặc định tăng dần.
- Cột `Ảnh` hiển thị thumbnail danh mục, có fallback khi ảnh lỗi.
- Cột `Tên danh mục`, `Slug`, `Trạng thái` được render trong AG Grid theo dữ liệu thật.
- Cột `Hành động` dùng nút ba chấm thay vì nhiều nút inline.
- Tạo `CategoryActionCellRendererComponent` để render action menu bằng Angular component trong AG Grid.
- Action menu dùng `tui-icon` của Taiga UI cho các thao tác:
  - Chuyển lên
  - Chuyển xuống
  - Sửa
  - Bật/Tạm ẩn
  - Xóa
- Sửa cảnh báo `CategoryActionCellRendererComponent is never used in a component template` bằng cách không đưa cell renderer vào `imports` của `AdminCategories`; component chỉ được AG Grid gọi qua `cellRenderer`.
- Chức năng chuyển lên/chuyển xuống vẫn swap thứ tự giữa hai danh mục liền kề qua API update hiện có.
- Khóa reorder khi đang search, đang lọc trạng thái hoặc khi AG Grid đang sort không đúng thứ tự mặc định.
- Loading và empty state chuyển sang overlay của AG Grid.
- Không thêm AG Grid Enterprise.
- Không đổi backend API.
- Không đổi payload category.

## Ghi chú kỹ thuật/rủi ro

- Frontend phụ thuộc backend trả `createdAt`, `updatedAt` hoặc các alias tương đương để hiển thị ngày tạo/ngày cập nhật.
- Nếu backend không trả ngày tạo/ngày cập nhật thì AG Grid hiển thị `-`.
- Action cell renderer là Angular component riêng, không dùng HTML string để nhúng `<tui-icon>` vì AG Grid render string sẽ không được Angular compile.
- Nếu icon Taiga UI như `@tui.trash-2`, `@tui.arrow-up`, `@tui.arrow-down` không có trong bộ icon runtime, cần đổi sang icon đang có trong project.
- Reorder vẫn dùng logic swap/update hiện có, chưa thêm endpoint reorder riêng ở backend.
- Route Admin Categories tăng dung lượng lazy chunk do thêm AG Grid Community.

---

# 5. Admin Destinations

## File chính

- `src/app/pages/admin/destinations/destinations.ts`
- `src/app/pages/admin/destinations/destinations.html`
- `src/app/pages/admin/destinations/destinations.scss`
- `src/app/core/api/admin-destination-api.service.ts`
- `src/app/core/models/destination.model.ts`
- `src/app/core/api/vietnam-province-api.service.ts`
- `src/app/core/models/vietnam-province.model.ts`
- `src/app/pages/admin/shared/admin-image-upload/admin-image-upload.ts`
- `src/app/pages/admin/shared/admin-image-upload/admin-image-upload.html`
- `src/app/pages/admin/shared/admin-image-upload/admin-image-upload.scss`

## API đã nối

- `GET /api/admin/destinations`
- `POST /api/admin/destinations`
- `PUT /api/admin/destinations/{id}`
- `PATCH /api/admin/destinations/{id}/status`
- `PATCH /api/admin/destinations/{id}/image`
- `DELETE /api/admin/destinations/{id}`
- `GET /api/admin/locations/provinces`
- `GET https://restcountries.com/v3.1/all?fields=name,flags,population,cca2,translations`
- `POST https://countriesnow.space/api/v0.1/countries/cities`

## Chức năng đã hoàn thiện

- CRUD điểm đến.
- Search/filter theo tên, slug, quốc gia, khu vực, trạng thái.
- Form điểm đến chia 2 luồng:
  - Trong nước
  - Quốc tế
- Luồng Trong nước:
  - Chọn miền: Miền Bắc, Miền Trung, Miền Nam.
  - Chọn tỉnh/thành từ API proxy backend.
  - Khi chọn tỉnh/thành, tự set tên điểm đến, quốc gia Việt Nam và slug.
- Luồng Quốc tế:
  - Chọn quốc gia.
  - Hiển thị tên tiếng Việt nếu REST Countries có dữ liệu.
  - Chọn hoặc nhập thành phố.
  - CountriesNow dùng tên tiếng Anh của quốc gia để giảm lỗi API.
  - Nếu API city lỗi/rỗng, cho nhập tay.
- Form giữ contract backend cũ:
  - `name`
  - `slug`
  - `region`
  - `country`
  - `description`
  - `imageUrl`
  - `latitude`
  - `longitude`
  - `status`
- `subRegion`, `cityName`, keyword search chỉ dùng frontend, không gửi backend.
- Upload ảnh trực tiếp trong form bằng component `AdminImageUpload`.
- Upload ảnh đi qua `AdminMediaApiService.uploadMedia(file, 'destinations')`.
- Không gọi Cloudinary trực tiếp.
- Không dùng base64.
- Việt hóa tọa độ:
  - Latitude -> Vĩ độ
  - Longitude -> Kinh độ
- Input tọa độ dùng `text + inputmode decimal` để bỏ spinner native.
- Label bắt buộc có dấu `*`.
- Message lỗi/help/warning đồng bộ dưới field.
- Điểm đến là nguồn dữ liệu chính cho Tour Form.

## Ghi chú kỹ thuật/rủi ro

- Nếu điểm đến domestic cũ như `Hạ Long` không map được province API, form giữ nguyên dữ liệu backend thay vì ép map sai.
- REST Countries/CountriesNow là API ngoài; nếu lỗi runtime, UI có fallback/input tay.

---

# 6. Admin Tours List

## File chính

- `src/app/pages/admin/tours/tours.ts`
- `src/app/pages/admin/tours/tours.html`
- `src/app/pages/admin/tours/tours.scss`
- `src/app/core/api/admin-tour-api.service.ts`
- `src/app/core/models/admin-tour.model.ts`

## API đã nối

- `GET /api/admin/tours`
- `GET /api/admin/tours/{id}`
- `POST /api/admin/tours`
- `PUT /api/admin/tours/{id}`
- `PATCH /api/admin/tours/{id}/status`
- `PATCH /api/admin/tours/{id}/thumbnail`
- `DELETE /api/admin/tours/{id}`
- `GET /api/admin/tours/{id}/publish-checklist`
- `POST /api/admin/tours/{id}/publish`

## Chức năng đã hoàn thiện

- Danh sách tour thật thay placeholder.
- KPI:
  - Tổng tour
  - Đã xuất bản
  - Nháp
  - Hết chỗ
- Search theo title, slug, category, destination, departure location.
- Filter:
  - trạng thái
  - featured
  - danh mục
  - điểm đến
  - sắp xếp
- Filter toolbar dùng custom dropdown.
- Table hiển thị các cột chính:
  - Tour
  - Giá
  - Thời lượng
  - Số chỗ
  - Featured
  - Trạng thái
  - Cập nhật
  - Hành động
- Cột Hành động dùng menu icon ba chấm.
- Action theo status:
  - Nháp -> Xuất bản
  - Đã xuất bản -> Tạm ẩn
  - Tạm ẩn/Hết chỗ -> Kích hoạt lại/Mở bán lại
  - Xóa là danger action
- Action hỗ trợ:
  - Xem trước
  - Chỉnh sửa
  - Nhân bản placeholder/TODO
  - Cập nhật ảnh
  - Publish/checklist
  - Đổi trạng thái
  - Xóa
- Publish checklist hiển thị cảnh báo nếu thiếu dữ liệu.
- Xóa tour bằng Taiga confirm.
- Update thumbnail bằng URL Cloudinary.
- Format tiền theo `vi-VN`.
- Format ngày theo `vi-VN`.
- Responsive cho tablet/mobile.

## Ghi chú kỹ thuật/rủi ro

- `Nhân bản` hiện chưa nối API thật.
- Dropdown action cần test thêm với row cuối khi nằm sát viewport.

---

# 7. Admin Tour Preview Panel

## File chính

- `src/app/shared/components/tour-preview-panel/tour-preview-panel.component.ts`
- `src/app/shared/components/tour-preview-panel/tour-preview-panel.component.html`
- `src/app/shared/components/tour-preview-panel/tour-preview-panel.component.scss`
- `src/app/pages/admin/tours/tours.ts`
- `src/app/pages/admin/tours/tours.html`
- `src/app/pages/admin/tours/tours.scss`
- `src/app/core/models/admin-tour.model.ts`

## API đã dùng

- `GET /api/admin/tours/{id}`

## Chức năng đã hoàn thiện

- Tạo slide-over preview tour bên phải khi bấm `Xem trước` trong menu hành động.
- Có overlay/backdrop toàn trang.
- Click overlay, bấm nút đóng hoặc ESC để đóng panel.
- Khóa body scroll khi panel mở và khôi phục khi đóng.
- Panel gọi API chi tiết tour khi có `tourId`.
- Có loading skeleton khi tải dữ liệu.
- Có error state và nút thử lại khi không tải được dữ liệu.
- Truyền tour row fallback từ bảng vào preview panel.
- Panel hiển thị dữ liệu fallback ngay khi mở, sau đó merge thêm dữ liệu detail API.
- Merge detail với fallback theo nguyên tắc detail có giá trị mới ghi đè, detail rỗng không xóa dữ liệu fallback.
- Normalize response detail linh hoạt với object trực tiếp, `data`, `result`, `content` và wrapper lồng nhau.
- Map nhiều alias field cho:
  - tên tour
  - ảnh
  - giá
  - thời lượng
  - số chỗ
  - điểm đến
  - trạng thái
  - lịch khởi hành
  - gallery
  - lịch trình
- Khi detail API lỗi nhưng có fallback row, panel vẫn hiển thị dữ liệu cơ bản.
- Việt hóa toàn bộ text hiển thị trong preview panel.
- Hiển thị:
  - ảnh chính
  - giá
  - thời lượng
  - số chỗ
  - điểm đến
  - mô tả
  - thống kê nhanh
  - lịch khởi hành
  - lịch trình
- Mô tả có xem thêm/thu gọn khi dài.
- Footer sticky có action:
  - Chỉnh sửa
  - Xuất bản cho tour nháp
  - Tạm ẩn cho tour đã xuất bản
- Component chỉ emit action, logic xử lý publish/suspend vẫn nằm ở Admin Tours.

## Ghi chú kỹ thuật/rủi ro

- Không dùng Angular CDK Overlay.
- Không thêm thư viện mới cho preview panel.
- Cần kiểm tra response thật của `GET /api/admin/tours/{id}` để thống nhất DTO lâu dài và giảm alias mapping.

---

# 8. Admin Tour Create/Edit Form

## File chính

- `src/app/pages/admin/tours/tour-form/tour-form.ts`
- `src/app/pages/admin/tours/tour-form/tour-form.html`
- `src/app/pages/admin/tours/tour-form/tour-form.scss`
- `src/app/pages/admin/tours/tour-form/tour-form-media.scss`
- `src/app/app.routes.ts`

## API đã nối

- `GET /api/admin/categories`
- `GET /api/admin/destinations`
- `GET /api/admin/tours/{id}`
- `POST /api/admin/tours`
- `PUT /api/admin/tours/{id}`
- `GET /api/admin/media`
- `POST /api/admin/media/upload`

## Chức năng đã hoàn thiện

- Route:
  - `/admin/tours/new`
  - `/admin/tours/:id/edit`
- Lazy load form để tránh tăng initial bundle.
- Create mode và edit mode dùng chung component.
- Reactive Forms.
- Validate:
  - title required/min length
  - slug required
  - shortDescription required
  - category required
  - destination required
  - departureLocation required
  - price >= 0
  - salePrice <= originalPrice
  - durationDays >= 1
  - durationNights <= durationDays
  - maxParticipants >= 1
  - availableSeats <= maxParticipants
- Auto-generate slug từ title.
- Category lấy từ Admin Categories.
- Destination lấy từ Admin Destinations.
- Điểm khởi hành dùng 3 option chuẩn:
  - Hà Nội
  - Đà Nẵng
  - TP. Hồ Chí Minh
- Nếu edit/draft có departure khác 3 option, thêm option tạm `Khác: ...`.
- Multi-select điểm đến ở UI:
  - hiển thị nhiều điểm đến bằng dấu ` - `
  - điểm đầu tiên dùng làm `destinationId` chính
  - chưa gửi `destinationIds` vì backend chưa hỗ trợ
- Media picker trong Tour Form:
  - Chọn từ Media
  - Upload ảnh mới
  - Nhập URL thủ công
- Autosave draft cho create mode.
- Có banner khôi phục bản nháp.
- Preview card bên phải hiển thị ảnh, title, mô tả, category/destination, điểm khởi hành, giá, duration, status.
- Dropdown Danh mục, Điểm đến, Điểm khởi hành và Trạng thái đã chuyển về custom dropdown thống nhất với form.
- Number input đã bỏ spinner native nhưng vẫn giữ `type="number"` và validate hiện có.
- Việt hóa label, placeholder và message.

## Ghi chú kỹ thuật/rủi ro

- Backend tour hiện chỉ lưu một `destinationId` chính.
- Nếu cần lưu nhiều điểm đến thật cần backend thêm `destinationIds` hoặc bảng `TOUR_DESTINATIONS`.
- Custom dropdown hiện đóng khi chọn option hoặc mở dropdown khác; click-outside riêng có thể bổ sung sau nếu cần.

---

# 9. Admin Tour Gallery

## File chính

- `src/app/pages/admin/tours/tour-gallery/tour-gallery.ts`
- `src/app/pages/admin/tours/tour-gallery/tour-gallery.html`
- `src/app/pages/admin/tours/tour-gallery/tour-gallery.scss`
- `src/app/core/api/admin-tour-api.service.ts`
- `src/app/core/models/admin-tour.model.ts`

## API đã nối

- `GET /api/admin/tours/{id}/images`
- `POST /api/admin/tours/{id}/images/from-media`
- `PATCH /api/admin/tours/{tourId}/images/{imageId}/alt`
- `PATCH /api/admin/tours/{tourId}/images/{imageId}/thumbnail`
- `PATCH /api/admin/tours/{id}/images/reorder`
- `DELETE /api/admin/tours/{tourId}/images/{imageId}`

## Chức năng đã hoàn thiện

- Gallery tách thành component riêng.
- Create mode yêu cầu lưu tour trước.
- Edit mode load gallery theo tour id.
- Chọn ảnh từ Admin Media và attach vào tour bằng `mediaId`.
- Upload ảnh mới trong gallery đi qua Admin Media trước, sau đó attach vào tour gallery.
- Không gửi JSON URL vào endpoint multipart cũ.
- Không gọi Cloudinary trực tiếp từ frontend.
- Không dùng base64/object URL làm URL thật.
- Hiển thị grid gallery responsive.
- Mỗi ảnh có:
  - preview
  - badge thumbnail
  - URL rút gọn
  - alt text
  - sort order
  - Copy URL
  - Mở ảnh
  - Đặt thumbnail
  - Sửa
  - Lên/Xuống
  - Xóa
- Set thumbnail cập nhật local state và emit URL lên Tour Form.
- Xóa ảnh bằng Taiga confirm.
- Fallback ảnh lỗi `/hero/bg-home.png`.

## Backend contract đã fix

- Thêm endpoint backend: `POST /api/admin/tours/{id}/images/from-media`.
- Payload dùng:
  - `mediaId`
  - `altText`
  - `sortOrder`
  - `thumbnail`
- Endpoint multipart cũ vẫn giữ nếu cần upload file trực tiếp.

## Ghi chú kỹ thuật/rủi ro

- Nếu upload media response không có `id/mediaId`, gallery không attach được ảnh.

---

# 10. Admin Tour Itinerary

## File chính

- `src/app/pages/admin/tours/tour-itinerary/tour-itinerary.ts`
- `src/app/pages/admin/tours/tour-itinerary/tour-itinerary.html`
- `src/app/pages/admin/tours/tour-itinerary/tour-itinerary.scss`
- `src/app/core/api/admin-tour-api.service.ts`
- `src/app/core/models/admin-tour.model.ts`

## API đã nối

- `GET /api/admin/tours/{id}/itineraries`
- `PUT /api/admin/tours/{id}/itineraries`
- `POST /api/admin/tours/{id}/itineraries/reorder`

## Chức năng đã hoàn thiện

- Itinerary tách thành component riêng.
- Create mode yêu cầu lưu tour trước.
- Edit mode load lịch trình theo tour.
- Quản lý lịch trình theo ngày:
  - dayNumber
  - title
  - description
  - hotelName
  - meals
  - transportModes
  - activities
  - placeNames
- Validate:
  - dayNumber >= 1
  - title required
  - không trùng dayNumber
- Thêm/sửa/xóa bằng bulk save đúng endpoint backend.
- Hiển thị timeline/card theo ngày.
- Reorder lên/xuống.

## Ghi chú kỹ thuật/rủi ro

- Backend chưa có endpoint create/update/delete từng itinerary item nên frontend đang dùng bulk replace-all.

---

# 11. Admin Tour Schedules

## File chính

- `src/app/pages/admin/tours/tour-schedules/tour-schedules.ts`
- `src/app/pages/admin/tours/tour-schedules/tour-schedules.html`
- `src/app/pages/admin/tours/tour-schedules/tour-schedules.scss`
- `src/app/core/api/admin-tour-api.service.ts`
- `src/app/core/models/admin-tour.model.ts`

## API đã nối

- `GET /api/admin/tours/{id}/schedules`
- `POST /api/admin/tours/{id}/schedules`
- `PUT /api/admin/tours/{tourId}/schedules/{id}`
- `PATCH /api/admin/tours/{tourId}/schedules/{id}/status`
- `DELETE /api/admin/tours/{tourId}/schedules/{id}`

## Chức năng đã hoàn thiện

- Schedules tách thành component riêng.
- Create mode yêu cầu lưu tour trước.
- Edit mode load lịch khởi hành theo tour.
- Quản lý lịch:
  - ngày khởi hành
  - ngày về
  - giá người lớn
  - giá trẻ em
  - giá em bé
  - số chỗ tối đa
  - trạng thái
  - ghi chú
- Validate:
  - ngày về >= ngày khởi hành
  - giá không âm
  - maxSeats >= 1
  - maxSeats không nhỏ hơn bookedSeats khi edit
- Trạng thái:
  - OPEN
  - CLOSED
  - FULL
  - CANCELLED
- Đổi trạng thái CLOSED/CANCELLED có confirm.
- Xóa lịch có confirm, cảnh báo mạnh nếu đã có booking.
- Format tiền và ngày theo `vi-VN`.

## Ghi chú kỹ thuật/rủi ro

- Schedule là nguồn chính cho giá/số chỗ khi booking.
- Backend vẫn là lớp bảo vệ cuối cho oversell/optimistic lock.

---

# 12. E2E Admin Tour Với Backend Thật

## Đã test bằng API thật

- Login ADMIN thành công với `admin@voyageviet.local`.
- Gọi Admin Media lấy được media có:
  - `id`
  - `secureUrl`
  - `publicId`
  - `mediaType=IMAGE`
- Tạo tour draft test thành công.
- Publish checklist khi thiếu gallery/itinerary/schedule trả `canPublish=false`.
- Attach ảnh từ Media vào gallery bằng `/images/from-media` thành công.
- Lưu itinerary 2 ngày thành công.
- Tạo schedule OPEN future thành công.
- Publish checklist sau khi đủ dữ liệu trả `canPublish=true`.
- Publish tour thành công.
- Public detail trả tour `PUBLISHED`.
- Public schedules:
  - schedule OPEN hiển thị
  - schedule CLOSED không hiển thị
  - đổi lại OPEN hiển thị lại
- Attach ảnh lần 2 rồi xóa tour image, Media gốc vẫn còn, không bị xóa nhầm asset dùng chung.

---

# 13. Kết Quả Build/Test Ghi Nhận

## Build đã pass trong các lần cập nhật

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

## Ghi chú

- Sau các tinh chỉnh nhỏ cuối cùng ở Admin Categories, nên chạy lại build nếu chưa chạy sau khi áp dụng code thực tế.
- Các warning budget còn lại là warning hiện hữu, không phải lỗi compile.

---

# 14. Warning Còn Lại

Các warning này là warning budget hiện hữu của dự án:

- Initial bundle vượt warning budget 500 kB.
- Một số file SCSS vượt warning budget mềm 8 kB nhưng vẫn dưới hard budget 10 kB.
- Các file thường xuất hiện warning:
  - `src/app/layouts/public-layout/public-layout.scss`
  - `src/app/pages/public/home/components/home-hero/home-hero.scss`
  - `src/app/pages/admin/destinations/destinations.scss`
  - `src/app/pages/admin/tours/tour-form/tour-form.scss`
  - `src/app/pages/admin/tours/tours.scss`
  - `src/app/pages/admin/categories/categories.scss`
- Lazy chunk Admin Categories tăng do thêm AG Grid Community.

---

# 15. TODO Còn Lại

- Admin Booking Detail frontend chưa làm.
- WebSocket JWT handshake chưa làm.
- STAFF permission / feature permission chi tiết chưa làm.
- API duplicate tour chưa có, action `Nhân bản` vẫn là TODO.
- Backend chưa hỗ trợ lưu nhiều destination thật cho tour; UI hiện chỉ lưu `destinationId` chính.
- Backend chưa có endpoint reorder riêng cho Categories; frontend đang swap/update hai danh mục liền kề.
- Cần test thủ công đầy đủ trên browser sau khi restart frontend/backend nếu dev process cũ không phản hồi ổn định.

---

# 16. Các Nhóm Update Đã Loại Bỏ Khỏi Audit Rút Gọn

- Các section thử sai chevron nhiều lần.
- Các section đổi màu/tinh chỉnh button lặp lại.
- Các section fix encoding nhỏ lặp lại.
- Các section native select rồi đổi custom rồi quay lại native.
- Các section chỉ sửa vài pixel/spacing nhỏ.
- Các build log trung gian bị lỗi tạm thời nhưng đã fix.
- Các prompt/ghi chú không còn phản ánh trạng thái cuối.


## Cập Nhật: Tối Ưu Code Admin Categories Sau Khi Dùng AG Grid

Thời gian cập nhật: 2026-06-08

### File Đã Sửa

- `src/app/pages/admin/categories/categories.ts`
- `src/app/pages/admin/categories/categories.html`
- `src/app/pages/admin/categories/categories.scss`
- `src/app/pages/admin/categories/categories-media.scss`
- `src/app/pages/admin/categories/category-action-cell-renderer.component.ts`
- `src/app/pages/admin/categories/categories.spec.ts`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Kiểm tra lại toàn bộ code Admin Categories sau khi chuyển sang AG Grid.
- Tối ưu code theo hướng giữ nguyên logic, API và render UI hiện tại.
- Không refactor lớn để tránh ảnh hưởng nghiệp vụ đang chạy.
- Không ghi thay đổi admin vào `VOYAGE_FRONTEND_AUDIT_REPORT.md`.

### Chức Năng Đã Giữ Nguyên

- CRUD danh mục.
- Search/filter danh mục.
- Upload ảnh danh mục qua Admin Media.
- Chọn ảnh từ Media trong form danh mục.
- Hiển thị danh sách bằng AG Grid.
- Cột ngày tạo/ngày cập nhật.
- Cột hành động bằng menu ba chấm.
- Action chuyển lên/chuyển xuống/sửa/bật/tạm ẩn/xóa.
- Confirm Taiga UI cho các thao tác quan trọng.
- Reorder vẫn bị khóa khi đang search/filter hoặc sort sai thứ tự mặc định.

### Phần Đã Tối Ưu

- Xóa import không dùng.
- Xóa state khai báo trùng.
- Xóa các hàm cũ không còn được template hoặc AG Grid sử dụng.
- Giữ `CategoryActionCellRendererComponent` chỉ được AG Grid gọi qua `cellRenderer`, không đưa vào `imports` của `AdminCategories`.
- Gom xử lý click action trong cell renderer để giảm lặp code.
- Gộp và dọn CSS action menu trong `categories-media.scss`.
- Bỏ các class SCSS action cũ không còn dùng.
- Giữ fix overflow/z-index để action menu trong AG Grid không bị cắt.
- Sửa spec import đúng component `AdminCategories`.

### API Đã Dùng

- Không thêm API mới.
- Giữ nguyên các API hiện có của Admin Categories và Admin Media.

### Kết Quả Build/Test

- Cần chạy lại:
  - `npx ng build --configuration development`
  - `npm run build`

### Warning/Lỗi Còn Lại

- Chưa test thủ công trên browser sau khi thay file tối ưu.
- Các warning budget SCSS/initial bundle nếu còn là warning hiện hữu của dự án.
- Nếu icon Taiga UI nào không có trong runtime, cần đổi sang icon đang được project hỗ trợ.

### Ghi Chú Kỹ Thuật/Rủi Ro

- Tối ưu chỉ dọn code lặp và code dư, không đổi payload/backend contract.
- Không thay đổi cách AG Grid nhận `rowData`, `columnDefs` và `context`.
- Không đổi logic reorder hiện có; frontend vẫn swap/update hai danh mục liền kề.


## Cập Nhật: Tối Ưu Render Form Và Danh Sách Admin Categories

Thời gian cập nhật: 2026-06-08

### File Đã Sửa

- `src/app/pages/admin/categories/categories.html`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Chức Năng Đã Sửa

- Khi mở form thêm mới/chỉnh sửa danh mục, chỉ render form thao tác hiện tại.
- Khi đang ở form, không render toolbar tìm kiếm/lọc, reorder note và AG Grid danh sách.
- Khi đóng form, toolbar và bảng danh mục render lại bình thường.
- Ẩn cụm action header `Mở Media` và `Thêm danh mục` khi đang ở form.
- Không thay đổi TypeScript, API hoặc payload backend.

### Kết Quả Build/Test

- Cần chạy lại:
  - `npx ng build --configuration development`
  - `npm run build`
