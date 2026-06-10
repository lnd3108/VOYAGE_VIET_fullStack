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


## Cập Nhật: Admin Categories Theo Workflow Payment Hub

Thời gian cập nhật: 2026-06-08 18:45:36 +07:00

### File Đã Sửa

- `src/app/core/models/category.model.ts`
- `src/app/core/api/admin-category-api.service.ts`
- `src/app/pages/admin/categories/categories.ts`
- `src/app/pages/admin/categories/categories.html`
- `src/app/pages/admin/categories/categories-grid.scss`
- `src/app/pages/admin/categories/category-action-cell-renderer.component.ts`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Đọc lại `VOYAGE_ADMIN_AUDIT_REPORT.md` và `VOYAGE_FRONTEND_AUDIT_REPORT.md`.
- Kiểm tra lại code Admin Categories hiện tại: AG Grid, model, API service, form edit, badge `newData`, filter, action menu và các style liên quan.
- Cập nhật frontend Admin Categories theo workflow status mới giống Payment Hub.
- Không sửa backend, Admin Tours, Admin Destinations, Admin Media, AdminLayout hoặc public pages.
- Không ghi thay đổi vào `VOYAGE_FRONTEND_AUDIT_REPORT.md`.

### Chức Năng Đã Sửa

- Thay status cũ `ACTIVE/INACTIVE` bằng workflow:
  - `DRAFT`
  - `PENDING`
  - `APPROVED`
  - `REJECTED`
  - `CANCEL_APPROVE`
- Thêm field frontend cho `isDisplay` và `rejectReason`.
- AG Grid Admin Categories đổi cột trạng thái thành `Workflow` với badge:
  - `DRAFT` -> `Nháp`
  - `PENDING` -> `Chờ duyệt`
  - `APPROVED` -> `Đã duyệt`
  - `REJECTED` -> `Từ chối`
  - `CANCEL_APPROVE` -> `Hủy trình duyệt`
- Thêm cột `Hiển thị` dựa vào `isDisplay`:
  - `1` hoặc `true` -> `Đang hiển thị`
  - `0`, `false`, null hoặc undefined -> `Đang ẩn`
  - Nếu chưa `APPROVED` nhưng `isDisplay=1`, hiển thị an toàn là `Chưa thể hiển thị`.
- Cột `Phê duyệt` nay hiển thị `Có thay đổi chờ duyệt` nếu `status=PENDING` hoặc `newData` có dữ liệu.
- Filter trạng thái đổi sang filter workflow: Tất cả, Nháp, Chờ duyệt, Đã duyệt, Từ chối, Hủy trình duyệt.
- Form create/edit không còn cho admin chọn `ACTIVE/INACTIVE` hoặc set workflow status thủ công.
- Edit category vẫn gọi PATCH và hiển thị message lưu dữ liệu thay đổi chờ duyệt.
- Action menu AG Grid giữ menu ba chấm, Sửa, Xóa, Chuyển lên, Chuyển xuống.
- Action menu cập nhật workflow actions:
  - `Gửi duyệt` cho `DRAFT`, `REJECTED`, `CANCEL_APPROVE`
  - `Duyệt`, `Từ chối`, `Hủy trình duyệt` cho `PENDING`
  - `Hiển thị public` / `Ẩn public` cho `APPROVED` theo `isDisplay`
- Không còn dùng `/status` để bật/tắt public display.

### API Đã Dùng

- `GET /api/admin/categories`
- `PATCH /api/admin/categories/{id}`
- `PATCH /api/admin/categories/{id}/submit`
- `PATCH /api/admin/categories/{id}/approve`
- `PATCH /api/admin/categories/{id}/reject`
- `PATCH /api/admin/categories/{id}/cancel-approve`
- `PATCH /api/admin/categories/{id}/display`
- Giữ `PATCH /api/admin/categories/{id}/status` trong service với ghi chú: endpoint này chỉ còn dùng cho workflow status, không dùng cho public display.

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/Lỗi Còn Lại

- Production build còn warning budget mềm hiện hữu:
  - Initial bundle vượt warning budget 500 kB, total 859.40 kB.
  - `src/app/layouts/public-layout/public-layout.scss`: 9.99 kB.
  - `src/app/pages/admin/destinations/destinations.scss`: 9.88 kB.
  - `src/app/pages/admin/categories/categories.scss`: 8.38 kB.
  - `src/app/pages/public/home/components/home-hero/home-hero.scss`: 9.88 kB.
  - `src/app/pages/admin/tours/tour-form/tour-form.scss`: 9.90 kB.
  - `src/app/pages/admin/categories/categories-media.scss`: 9.30 kB.
  - `src/app/pages/admin/tours/tours.scss`: 9.98 kB.
- Không có lỗi compile.
- Chưa test thủ công trên browser `/admin/categories` trong phiên này.

### Ghi Chú Kỹ Thuật/Rủi Ro

- Backend đã đổi `STATUS` sang workflow, nên frontend public display không còn dựa vào `status=ACTIVE`.
- Public display dùng `IS_DISPLAY`, backend chỉ hiển thị public khi `status=APPROVED` và `isDisplay=1`.
- `newData` chỉ là dữ liệu thay đổi chờ duyệt; frontend public không cần biết `newData`.
- Nếu DB/backend chưa chạy migration cho `IS_DISPLAY`, `REJECT_REASON`, workflow status hoặc `NEW_DATA`, API có thể lỗi schema/runtime.


## Cập Nhật: Bước 5 Admin Categories - Badge Dữ Liệu Thay Đổi Chờ Duyệt

Thời gian cập nhật: 2026-06-08 16:18:04 +07:00

### File Đã Sửa

- `src/app/pages/admin/categories/categories.ts`
- `src/app/pages/admin/categories/categories.scss`
- `src/app/pages/admin/categories/categories-grid.scss`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Lý Do Có Thêm File Ngoài Phạm Vi Ban Đầu

- Thêm `categories-grid.scss` để tách nhóm style AG Grid/badge ra khỏi `categories.scss`.
- Production build ban đầu fail vì `categories.scss` vượt hard budget 10 kB sau khi thêm badge; tách style theo file giúp giữ nguyên UI và đưa từng component style file xuống dưới hard budget.
- Không sửa `categories.html`, `category-action-cell-renderer.component.ts` hoặc module khác.

### Kiểm Tra Trước Khi Code

- Bảng Admin Categories đang dùng AG Grid qua `<ag-grid-angular>` trong `categories.html`.
- `AdminCategory` đã có field `newData?: string | null`.
- `AdminCategoryApiService.getCategories()` đang gọi `GET /api/admin/categories`; response typed theo `AdminCategory`, có `newData`.
- Form edit danh mục đang gọi `patchCategory(id, payload)` tương ứng `PATCH /api/admin/categories/{id}`.
- Hàm build row data cho AG Grid là `buildGridRows(categories)`.
- `columnDefs` được khai báo trong `categories.ts`.
- Namespace SCSS chính của màn là `.admin-categories`.

### Đầu Việc Đã Làm

- Thêm field `hasPendingChange` và `pendingChangeLabel` vào row interface của AG Grid.
- Thêm helper `hasPendingCategoryChange(category: AdminCategory)` để kiểm tra `newData` an toàn với null, undefined, chuỗi rỗng, chuỗi chỉ có khoảng trắng, JSON string hoặc text bất kỳ.
- Thêm cột `Phê duyệt` ngay sau cột `Trạng thái`.
- Thêm cell renderer badge cho trạng thái phê duyệt.
- Thêm style pill badge:
  - `admin-categories__approval`
  - `admin-categories__approval--pending`
  - `admin-categories__approval--empty`
- Không thêm approve/reject ở bước này.
- Không đổi CRUD, upload/chọn ảnh Media, reorder, action menu hoặc endpoint.

### Chức Năng Đã Thêm/Sửa

- Danh mục có `newData` là string sau `trim()` có length > 0 hiển thị badge `Có thay đổi chờ duyệt`.
- Danh mục không có `newData`, `newData` rỗng hoặc chỉ có khoảng trắng hiển thị badge `Không có`.
- Badge chỉ dựa vào `newData`, không dùng `CategoryStatus` hoặc ACTIVE/INACTIVE để suy ra trạng thái phê duyệt.
- Cột `Thứ tự` vẫn giữ sort mặc định tăng dần.

### API Đã Nối

- Không thêm API mới.
- Tiếp tục dùng `GET /api/admin/categories` để lấy `newData`.
- Tiếp tục dùng `PATCH /api/admin/categories/{id}` cho form edit danh mục hiện tại.

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/Lỗi Còn Lại

- Production build còn warning budget mềm hiện hữu:
  - Initial bundle vượt warning budget 500 kB, total 859.40 kB.
  - `src/app/layouts/public-layout/public-layout.scss`: 9.99 kB.
  - `src/app/pages/public/home/components/home-hero/home-hero.scss`: 9.88 kB.
  - `src/app/pages/admin/categories/categories-media.scss`: 9.30 kB.
  - `src/app/pages/admin/tours/tours.scss`: 9.98 kB.
  - `src/app/pages/admin/categories/categories.scss`: 8.38 kB, chỉ còn warning mềm, không còn vượt hard budget 10 kB.
  - `src/app/pages/admin/destinations/destinations.scss`: 9.88 kB.
  - `src/app/pages/admin/tours/tour-form/tour-form.scss`: 9.90 kB.
- Không có lỗi compile.
- Chưa test thủ công trên browser `/admin/categories` trong phiên này.

### Ghi Chú Kỹ Thuật/Rủi Ro

- `newData` chỉ là dữ liệu thay đổi chờ duyệt, chưa được apply vào dữ liệu thật.
- Bước approve/reject sẽ làm sau.
- Badge phê duyệt chỉ phản ánh việc `newData` có dữ liệu hay không.

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

## Báo Cáo Bổ Sung: Admin Categories Workflow Status Và Public Display

Thời gian cập nhật: 2026-06-08

### File Code Đã Thay Đổi

- `src/app/core/models/category.model.ts`
- `src/app/core/api/admin-category-api.service.ts`
- `src/app/pages/admin/categories/categories.ts`
- `src/app/pages/admin/categories/categories.html`
- `src/app/pages/admin/categories/categories-grid.scss`
- `src/app/pages/admin/categories/category-action-cell-renderer.component.ts`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Cập nhật Admin Categories frontend để tương thích backend Category workflow mới giống Payment Hub.
- Bỏ luồng hiển thị public cũ dựa trên `ACTIVE/INACTIVE`.
- Chuyển status frontend sang workflow: `DRAFT`, `PENDING`, `APPROVED`, `REJECTED`, `CANCEL_APPROVE`.
- Bổ sung xử lý `isDisplay` cho trạng thái hiển thị public.
- Giữ nguyên CRUD, upload/chọn ảnh Media, reorder và AG Grid action menu.
- Không sửa backend, Admin Tours, Admin Destinations, Admin Media, AdminLayout hoặc public pages.
- Không ghi vào `VOYAGE_FRONTEND_AUDIT_REPORT.md`.

### Chức Năng Đã Thêm/Sửa

- Model category thêm/chuẩn hóa `CategoryStatus`, `isDisplay`, `rejectReason`, `newData`.
- API service thêm các endpoint submit, approve, reject, cancel approve và display.
- AG Grid cập nhật cột `Workflow`, `Hiển thị`, `Phê duyệt`.
- Filter trạng thái đổi thành filter workflow.
- Form create/edit không còn cho admin chọn `ACTIVE/INACTIVE` hoặc tự set workflow status.
- Action menu thêm `Gửi duyệt`, `Duyệt`, `Từ chối`, `Hủy trình duyệt`, `Hiển thị public`, `Ẩn public`.
- Không dùng `/status` để bật/tắt public display.

### API Đã Dùng

- `GET /api/admin/categories`
- `PATCH /api/admin/categories/{id}`
- `PATCH /api/admin/categories/{id}/submit`
- `PATCH /api/admin/categories/{id}/approve`
- `PATCH /api/admin/categories/{id}/reject`
- `PATCH /api/admin/categories/{id}/cancel-approve`
- `PATCH /api/admin/categories/{id}/display`

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/Lỗi Còn Lại

- Production build còn warning budget mềm hiện hữu.
- Không có lỗi compile.
- Chưa test thủ công trên browser `/admin/categories` trong phiên này.

### Ghi Chú Kỹ Thuật/Rủi Ro

- Backend đã đổi `STATUS` sang workflow nên frontend không dùng `ACTIVE/INACTIVE` làm trạng thái chính nữa.
- Public display dùng `IS_DISPLAY`; public chỉ hiển thị khi backend có `status=APPROVED` và `isDisplay=1`.
- `NEW_DATA` chỉ là dữ liệu thay đổi chờ duyệt.
- Nếu DB/backend chưa chạy migration cho workflow status, `IS_DISPLAY`, `REJECT_REASON` hoặc `NEW_DATA`, API có thể lỗi schema/runtime.

## Cập Nhật: Bước 6 Đồng Bộ Màn Dùng Category Sau Workflow Status

Thời gian cập nhật: 2026-06-09 09:51:53 +07:00

### File Đã Sửa/Kiểm Tra

- `src/app/core/models/category.model.ts`
- `src/app/core/api/admin-category-api.service.ts`
- `src/app/core/api/public-api.service.ts`
- `src/app/pages/admin/tours/tour-form/tour-form.ts`
- `src/app/pages/admin/tours/tour-form/tour-form.html`
- `src/app/pages/admin/tours/tour-form/tour-form.scss`
- `src/app/pages/admin/tours/tours.ts`
- `src/app/pages/admin/tours/tours.html`
- `src/app/pages/public/home/home.ts`
- `src/app/pages/public/tours/tours.ts`
- `src/app/pages/public/home/components/home-hero/home-hero.ts`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu Việc Đã Làm

- Đọc lại `VOYAGE_ADMIN_AUDIT_REPORT.md` và `VOYAGE_FRONTEND_AUDIT_REPORT.md` trước khi rà soát code.
- Xác định các màn admin đang lấy danh mục từ admin API:
  - Tour Form dùng `AdminCategoryApiService.getCategories()` -> `GET /api/admin/categories`.
  - Admin Tours filter dùng `AdminCategoryApiService.getCategories()` -> `GET /api/admin/categories`.
- Xác định public Home/Tours hiện dùng `PublicApiService` để lấy tour public, không inject `AdminCategoryApiService`.
- Kiểm tra các chuỗi `ACTIVE/INACTIVE` còn lại: không còn là giả định category cũ trong màn dùng category; các chuỗi còn lại thuộc Tour/Destination/User status hoặc CSS active state.
- Không sửa backend, Admin Destinations, Admin Media, AdminLayout hoặc Admin Categories workflow.
- Không ghi thay đổi admin vào `VOYAGE_FRONTEND_AUDIT_REPORT.md`.

### Chức Năng Đã Sửa

- Đồng bộ các màn dùng category sau khi backend đổi Category `STATUS` sang workflow.
- `CategoryStatus` dùng workflow: `DRAFT`, `PENDING`, `APPROVED`, `REJECTED`, `CANCEL_APPROVE`.
- Thêm/giữ helper `isCategorySelectableForTour()` để xác định danh mục hợp lệ cho tour theo rule:
  - `status === 'APPROVED'`
  - `isDisplay` là `1`, `true`, `'1'` hoặc `'true'`.
- Tour Form tạo mới chỉ hiển thị option category hợp lệ `APPROVED + isDisplay=1`.
- Tour Form edit vẫn giữ category hiện tại nếu category cũ không còn hợp lệ, thêm option tạm vào dropdown và gắn nhãn `(chưa duyệt)` hoặc `(không còn hiển thị)`.
- Tour Form hiển thị warning nhẹ dưới field category khi category hiện tại chưa được duyệt hoặc đang bị ẩn.
- Tour Form create validate category hợp lệ trước khi submit; không đổi payload và vẫn gửi `categoryId` như cũ.
- Admin Tours filter category lấy từ admin API nhưng chỉ hiển thị category hợp lệ để tránh admin lọc nhầm category pending/hidden.
- Public Home/Tours tiếp tục dùng public API; frontend không tự hiển thị category workflow không hợp lệ và không còn check category `ACTIVE/INACTIVE`.
- Tối ưu nhỏ `tour-form.scss` để production build không vượt hard budget 10 kB sau khi thêm warning UI.

### API Đã Dùng

- Giữ API category hiện có, không thêm API mới.
- `GET /api/admin/categories` cho Tour Form và Admin Tours filter.
- Public pages tiếp tục dùng API public hiện có qua `PublicApiService`, ví dụ `GET /api/public/tours` và `GET /api/public/tours/featured`.

### Kết Quả Build/Test

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.
- Chưa test thủ công trên browser trong phiên này.

### Warning/Lỗi Còn Lại

- Production build còn warning budget mềm hiện hữu:
  - Initial bundle vượt warning budget 500 kB, total 859.40 kB.
  - `src/app/layouts/public-layout/public-layout.scss`: 9.99 kB.
  - `src/app/pages/admin/destinations/destinations.scss`: 9.88 kB.
  - `src/app/pages/admin/tours/tour-form/tour-form.scss`: 9.99 kB, dưới hard budget 10 kB.
  - `src/app/pages/admin/tours/tours.scss`: 9.98 kB.
  - `src/app/pages/admin/categories/categories-media.scss`: 9.30 kB.
  - `src/app/pages/public/home/components/home-hero/home-hero.scss`: 9.88 kB.
  - `src/app/pages/admin/categories/categories.scss`: 8.38 kB.
- Không có lỗi compile sau khi tối ưu `tour-form.scss`.

### Ghi Chú Kỹ Thuật/Rủi Ro

- Backend đã đổi Category `STATUS` sang workflow, nên màn tiêu thụ category không được dùng `ACTIVE/INACTIVE` cho category nữa.
- Category public hợp lệ là `APPROVED + isDisplay=1`.
- Nếu tour cũ đang gắn category không hợp lệ, UI giữ dữ liệu để tránh mất thông tin nhưng cảnh báo admin chọn lại category hợp lệ trước khi xuất bản.
- Admin Tours filter chọn hướng ít rủi ro: chỉ dùng category hợp lệ từ admin catalog; nếu `GET /api/admin/categories` lỗi, filter fallback theo category đang có trong tour như logic cũ.

## 2026-06-09 10:48:07 +07:00 - Bước 7: Admin Categories pending newData review

### File đã sửa
- `src/app/core/models/category.model.ts`
- `src/app/pages/admin/categories/categories.ts`
- `src/app/pages/admin/categories/categories.html`
- `src/app/pages/admin/categories/categories-grid.scss`
- `src/app/pages/admin/categories/categories-media.scss`
- `src/app/pages/admin/categories/category-action-cell-renderer.component.ts`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu việc đã làm
- Thêm kiểu `CategoryNewData` để mô tả dữ liệu thay đổi đang nằm trong `newData`.
- Thêm view model nội bộ cho panel xem dữ liệu chờ duyệt, không parse JSON trực tiếp trong template.
- Parse `newData` an toàn: null/rỗng trả về trạng thái không có dữ liệu; JSON lỗi hiển thị error state `Không thể đọc dữ liệu thay đổi.` thay vì crash UI.
- So sánh dữ liệu hiện tại với dữ liệu chờ duyệt theo các trường: tên, slug, mô tả, ảnh, workflow status, hiển thị public, thứ tự hiển thị.
- Highlight field đã thay đổi bằng row nền vàng/cam nhạt và trạng thái `Đã thay đổi`.
- Thêm action `Xem thay đổi` trong AG Grid action menu khi category có `newData` hoặc đang `PENDING`.
- Thêm slide-over panel xem chi tiết dữ liệu chờ duyệt, có thumbnail ảnh hiện tại/ảnh chờ duyệt và chống vỡ layout URL dài.
- Hỗ trợ thao tác workflow ngay trong panel: `Duyệt`, `Từ chối`, `Hủy trình duyệt`, `Đóng`.
- Thêm textarea `Lý do từ chối`; khi xác nhận từ chối gửi `{ reason: value || null }`.
- Giữ nguyên logic upload ảnh, chọn ảnh Media, CRUD, reorder, search/filter và các action workflow/display hiện có.

### Chức năng đã thêm/sửa
- Admin có thể xem chi tiết dữ liệu thay đổi chờ duyệt trước khi duyệt/từ chối/hủy trình duyệt.
- Category `REJECTED` còn `newData` vẫn xem được dữ liệu thay đổi.
- Category `PENDING` có lỗi parse `newData` vẫn mở panel được và có thể hủy trình duyệt để backend clear dữ liệu lỗi.
- Action menu được nhóm thêm `Xem thay đổi` ở đầu, không làm mất các action cũ: gửi duyệt, duyệt, từ chối, hủy trình duyệt, hiển thị public, ẩn public, sửa, xóa, chuyển lên, chuyển xuống.

### API đã dùng
- `PATCH /api/admin/categories/{id}/approve`
- `PATCH /api/admin/categories/{id}/reject`
- `PATCH /api/admin/categories/{id}/cancel-approve`
- Không thêm API mới, không đổi payload backend hiện có.

### Kết quả build/test
- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/lỗi còn lại
- Production build còn warning budget cũ:
  - initial bundle vượt budget 500 kB, tổng 861.01 kB.
  - `src/app/layouts/public-layout/public-layout.scss` 9.99 kB.
  - `src/app/pages/public/home/components/home-hero/home-hero.scss` 9.88 kB.
  - `src/app/pages/admin/categories/categories.scss` 8.38 kB.
  - `src/app/pages/admin/tours/tour-form/tour-form.scss` 9.99 kB.
  - `src/app/pages/admin/tours/tours.scss` 9.98 kB.
  - `src/app/pages/admin/categories/categories-media.scss` 9.38 kB.
  - `src/app/pages/admin/destinations/destinations.scss` 9.88 kB.
- Không phát sinh build error.
- Style panel mới đặt trong `categories-grid.scss`; file này không phát sinh warning budget trong build.

### Ghi chú kỹ thuật/rủi ro
- Backend đang lưu `newData` dạng JSON string; frontend chỉ parse khi admin mở panel xem thay đổi.
- Nếu `newData` lỗi parse, UI hiển thị error state thay vì throw lỗi Angular.
- Reject giữ `newData` để admin vẫn xem/sửa tiếp theo workflow backend.
- Approve mới apply dữ liệu thật; panel chỉ hiển thị so sánh và gọi API workflow hiện có.
- Hủy trình duyệt gọi API hiện có để backend clear `newData` và chuyển trạng thái theo workflow backend.

## 2026-06-09 12:15:11 +07:00 - Bước 8: Admin Categories batch workflow actions

### File đã sửa
- `src/app/pages/admin/categories/categories.ts`
- `src/app/pages/admin/categories/categories.html`
- `src/app/pages/admin/categories/categories.scss`
- `src/app/pages/admin/categories/categories-grid.scss`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Đầu việc đã làm
- Đọc lại `VOYAGE_ADMIN_AUDIT_REPORT.md` và `VOYAGE_FRONTEND_AUDIT_REPORT.md` trước khi sửa code.
- Kiểm tra lại Admin Categories đang dùng AG Grid và có action menu từng dòng.
- Xác nhận workflow status hiện có: `DRAFT`, `PENDING`, `APPROVED`, `REJECTED`, `CANCEL_APPROVE`.
- Xác nhận frontend service đang có API single action: submit, approve, reject, cancel approve và display.
- Sửa lại phần audit Bước 7 bị mojibake sang tiếng Việt UTF-8 chuẩn, không xóa nội dung lịch sử.
- Bật chọn nhiều dòng trong AG Grid bằng `rowSelection` object của AG Grid 35.
- Thêm batch toolbar phía trên AG Grid khi có dòng được chọn.
- Dùng `forkJoin` để gọi nhiều request single action vì backend chưa có batch endpoint riêng.

### Chức năng đã thêm/sửa
- Sửa lỗi encoding tiếng Việt trong phần Bước 7 của `VOYAGE_ADMIN_AUDIT_REPORT.md`.
- Admin Categories có checkbox chọn dòng và checkbox chọn tất cả của AG Grid.
- Toolbar batch hiển thị số lượng đang chọn: `Đã chọn X danh mục`.
- Thêm nút batch: `Gửi duyệt`, `Duyệt`, `Từ chối`, `Hủy trình duyệt`, `Hiển thị public`, `Ẩn public`, `Bỏ chọn`.
- Batch submit chỉ xử lý category `DRAFT`, `REJECTED`, `CANCEL_APPROVE`.
- Batch approve chỉ xử lý category `PENDING`.
- Batch reject chỉ xử lý category `PENDING` và có ô nhập lý do từ chối; mỗi request gửi `{ reason: value || null }`.
- Batch cancel approve chỉ xử lý category `PENDING`.
- Batch hiển thị public chỉ xử lý category `APPROVED` đang ẩn public.
- Batch ẩn public chỉ xử lý category `APPROVED` đang hiển thị public.
- Confirm trước khi chạy batch có nêu tổng dòng đang chọn, số dòng hợp lệ và số dòng bị bỏ qua.
- Nếu không có dòng hợp lệ, không gọi API và hiển thị warning.
- Nếu một số request fail, UI không crash; báo số thành công/thất bại và reload danh sách cuối cùng.
- Sau batch, clear selection, đóng reject mode và reload danh sách category.
- Giữ nguyên single-row action menu, panel `Xem thay đổi`, create/edit, upload/chọn ảnh Media, search/filter và reorder.

### API đã dùng
- `PATCH /api/admin/categories/{id}/submit`
- `PATCH /api/admin/categories/{id}/approve`
- `PATCH /api/admin/categories/{id}/reject`
- `PATCH /api/admin/categories/{id}/cancel-approve`
- `PATCH /api/admin/categories/{id}/display`
- Không thêm API mới.
- Không dùng `/status` cho display.

### Kết quả build/test
- `npx ng build --configuration development`: pass.
- `npm run build`: pass.
- Chưa test thủ công trên browser trong phiên này.

### Warning/lỗi còn lại
- Production build còn warning budget mềm hiện hữu:
  - initial bundle vượt budget 500 kB, tổng 861.01 kB.
  - `src/app/pages/admin/categories/categories-media.scss`: 9.38 kB.
  - `src/app/pages/admin/tours/tour-form/tour-form.scss`: 9.99 kB.
  - `src/app/pages/admin/tours/tours.scss`: 9.98 kB.
  - `src/app/pages/admin/destinations/destinations.scss`: 9.88 kB.
  - `src/app/pages/admin/categories/categories.scss`: 9.17 kB, vẫn dưới hard budget 10 kB.
  - `src/app/pages/public/home/components/home-hero/home-hero.scss`: 9.88 kB.
  - `src/app/layouts/public-layout/public-layout.scss`: 9.99 kB.
- `categories-grid.scss` từng phát sinh warning sau khi thêm batch toolbar, đã tối ưu bằng cách chuyển phần toolbar style sang `categories.scss`; build cuối không còn warning cho `categories-grid.scss`.
- Không có lỗi compile.

### Ghi chú kỹ thuật/rủi ro
- Hiện dùng nhiều request single action vì backend chưa có batch endpoint riêng.
- Nếu cần tối ưu hiệu năng/số request, backend có thể bổ sung batch endpoint sau.
- Batch action chỉ xử lý các dòng hợp lệ theo workflow hiện tại; dòng không hợp lệ bị bỏ qua sau confirm.
- Batch display dùng endpoint `/display` với `isDisplay = 1` hoặc `isDisplay = 0`, không dùng `/status`.
- Khi một phần request thất bại, frontend reload danh sách để đồng bộ lại trạng thái thật từ backend.

## 2026-06-09 12:24:52 +07:00 - Bước 9: Admin Categories batch workflow API thật

### File đã sửa/tạo mới
- `voyage-backend/src/main/java/com/voyageviet/backend/category/controller/AdminCategoryController.java`
- `voyage-backend/src/main/java/com/voyageviet/backend/category/service/CategoryService.java`
- `voyage-backend/src/main/java/com/voyageviet/backend/category/dto/CategoryBatchRequest.java`
- `voyage-backend/src/main/java/com/voyageviet/backend/category/dto/CategoryBatchRejectRequest.java`
- `voyage-backend/src/main/java/com/voyageviet/backend/category/dto/CategoryBatchDisplayRequest.java`
- `voyage-backend/src/main/java/com/voyageviet/backend/category/dto/CategoryBatchActionResponse.java`
- `voyage-backend/src/main/java/com/voyageviet/backend/category/dto/CategoryBatchActionItemResponse.java`
- `voyage-frontend/src/app/core/models/category.model.ts`
- `voyage-frontend/src/app/core/api/admin-category-api.service.ts`
- `voyage-frontend/src/app/pages/admin/categories/categories.ts`
- `voyage-backend/BACKEND_API_REPORT.md`
- `voyage-frontend/VOYAGE_ADMIN_AUDIT_REPORT.md`

### DTO đã thêm
- `CategoryBatchRequest`: danh sách `ids`.
- `CategoryBatchRejectRequest`: danh sách `ids` và `reason` optional.
- `CategoryBatchDisplayRequest`: danh sách `ids` và `isDisplay`.
- `CategoryBatchActionResponse`: tổng request, số thành công, số thất bại, danh sách item thành công/thất bại.
- `CategoryBatchActionItemResponse`: `id`, `name`, `success`, `message`.
- Frontend thêm type `CategoryBatchActionResponse` và `CategoryBatchActionItemResponse` tương ứng.

### API batch đã thêm
- `PATCH /api/admin/categories/batch/submit`
- `PATCH /api/admin/categories/batch/approve`
- `PATCH /api/admin/categories/batch/reject`
- `PATCH /api/admin/categories/batch/cancel-approve`
- `PATCH /api/admin/categories/batch/display`

### Frontend đã sửa
- `AdminCategoryApiService` thêm methods:
  - `submitCategories(ids)`
  - `approveCategories(ids)`
  - `rejectCategories(ids, reason)`
  - `cancelApproveCategories(ids)`
  - `updateCategoriesDisplay(ids, isDisplay)`
- Admin Categories batch toolbar chuyển sang gọi batch endpoint thật.
- Bỏ logic `forkJoin` nhiều request single trong batch action.
- Vẫn giữ lọc selected rows hợp lệ ở frontend để UX tốt; backend vẫn validate lại workflow rule.
- Sau response batch: hiển thị số thành công/tổng số, cảnh báo nếu có `failedItems`, reload danh sách và clear selection.
- Single action từng dòng vẫn giữ nguyên API single hiện tại.

### Kết quả build/test backend
- `./mvnw.cmd clean test`: pass, tests run 1, failures 0, errors 0.
- `./mvnw.cmd clean package -DskipTests`: pass.

### Kết quả build/test frontend
- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/lỗi còn lại
- Backend test local còn warning ORA-02290 từ `DataSeeder` do constraint role/feature enum hardening chưa apply đầy đủ; test vẫn pass.
- Backend còn warning Java/Lombok/Mockito hiện hữu về deprecated Unsafe/dynamic agent.
- Frontend production build còn warning budget mềm hiện hữu:
  - initial bundle 861.01 kB vượt budget 500 kB.
  - `src/app/layouts/public-layout/public-layout.scss` 9.99 kB.
  - `src/app/pages/admin/categories/categories.scss` 9.17 kB.
  - `src/app/pages/admin/tours/tours.scss` 9.98 kB.
  - `src/app/pages/public/home/components/home-hero/home-hero.scss` 9.88 kB.
  - `src/app/pages/admin/tours/tour-form/tour-form.scss` 9.99 kB.
  - `src/app/pages/admin/categories/categories-media.scss` 9.38 kB.
  - `src/app/pages/admin/destinations/destinations.scss` 9.88 kB.
- Chưa test API batch thủ công bằng browser/HTTP trong phiên này.

### Ghi chú kỹ thuật/rủi ro
- Single API vẫn giữ để không ảnh hưởng action từng dòng.
- Batch API xử lý từng item độc lập và trả `successItems`/`failedItems`.
- Backend vẫn validate workflow rule, không tin hoàn toàn vào frontend.
- Nếu một item fail, toàn bộ batch không fail theo item đó.
- Batch display dùng `/batch/display` với `isDisplay = 0|1`, không dùng `/status`.
- Nếu cần tối ưu transaction tách biệt tuyệt đối từng item, có thể bổ sung item-level service propagation riêng ở bước sau.
## 2026-06-09 12:39:35 +07:00 - Bước 10: E2E Category workflow với backend thật

### File đã sửa trong bước 10
- voyage-backend/src/main/java/com/voyageviet/backend/category/dto/CategoryResponse.java
- voyage-backend/BACKEND_API_REPORT.md
- voyage-frontend/VOYAGE_ADMIN_AUDIT_REPORT.md

### Test DB migration
- Đã kiểm tra Oracle local schema VOYAGE.
- Bảng CATEGORIES có đủ STATUS, IS_DISPLAY, NEW_DATA, REJECT_REASON, DISPLAY_ORDER.
- Constraint status đúng workflow DRAFT/PENDING/APPROVED/REJECTED/CANCEL_APPROVE.
- Constraint display đúng IS_DISPLAY IN (0, 1).
- Không còn dữ liệu category ACTIVE/INACTIVE.

### Test backend single API
- Test HTTP trên backend thật chạy từ source hiện tại ở http://localhost:18081/api.
- Đã test create, submit, reject, submit lại, approve, display show/hide, patch tạo newData, cancel approve.
- Kết quả đúng workflow: create DRAFT, approve chỉ từ PENDING, patch không apply dữ liệu thật, cancel clear newData và giữ dữ liệu thật.

### Test backend batch API
- Đã test batch submit, approve, reject, cancel approve, display show/hide.
- Đã test danh sách có item hợp lệ, item sai status, id không tồn tại và id trùng.
- Response batch có total, successCount, failedCount, successItems, failedItems.
- Một item fail không làm fail toàn bộ batch.

### Test public category API
- GET /api/public/categories chỉ trả category APPROVED + isDisplay = 1.
- Không trả category draft/pending/rejected/cancel approve/approved hidden.
- Phát hiện và sửa lỗi public response vẫn có field newData/rejectReason null; sau fix hai field này không còn xuất hiện khi null.

### Test frontend Admin Categories
- Frontend dev server local http://localhost:4200/admin/categories trả HTTP 200.
- Không có Playwright/e2e dependency trong repo, nên không thể thao tác AG Grid trên browser bằng automation trong phiên này.
- Đã xác nhận bằng build và HTTP E2E backend rằng các endpoint batch/single/frontend service đang dùng tồn tại và trả response đúng shape.
- Các luồng cần kiểm tra thủ công còn lại trên browser: action menu từng dòng, panel xem thay đổi, batch toolbar UI, upload/chọn ảnh Media, search/filter/reorder.

### Lỗi phát hiện và cách sửa
- Lỗi: public category response vẫn serialize newData và rejectReason với giá trị null.
- Sửa: thêm JsonInclude NON_NULL cho newData và rejectReason trong CategoryResponse.
- Không đổi payload admin, không đổi endpoint, không đổi workflow status.

### Kết quả build/test backend
- ./mvnw.cmd clean test: pass.
- ./mvnw.cmd clean package -DskipTests: pass.

### Kết quả build/test frontend
- npx ng build --configuration development: pass.
- npm run build: pass.

### Warning/lỗi còn lại
- Backend còn warning DataSeeder ORA-02290 cho role/feature enum constraint cũ, không liên quan Category workflow.
- Backend còn warning Java/Lombok/Mockito hiện hữu về deprecated Unsafe/dynamic agent.
- Production build frontend còn warning budget mềm hiện hữu: initial bundle 861.01 kB; public-layout.scss, tours.scss, categories-media.scss, destinations.scss, tour-form.scss, home-hero.scss, categories.scss đều vượt warning budget 8 kB nhưng dưới hard budget.
- Browser manual test chưa thực hiện được do không có công cụ automation trong phiên này.

### Ghi chú kỹ thuật/rủi ro
- Batch endpoint đã được test với dữ liệu hợp lệ/không hợp lệ.
- Public API chỉ trả approved + displayed.
- Frontend Admin Categories đã được kiểm tra compile/build; browser interaction cần QA thủ công trên môi trường đang chạy.
- Backend phụ dùng cho E2E ở port 18081 đã được dừng sau test.

## 2026-06-09 13:25:00 +07:00 - Bước 11: Phân quyền Category Workflow theo STAFF / ADMIN / SUPER_ADMIN

### File đã sửa
- voyage-backend/src/main/java/com/voyageviet/backend/common/config/SecurityConfig.java
- voyage-backend/BACKEND_API_REPORT.md
- voyage-frontend/src/app/core/models/user.model.ts
- voyage-frontend/src/app/core/auth/auth.service.ts
- voyage-frontend/src/app/core/guards/admin.guard.ts
- voyage-frontend/src/app/layouts/admin-layout/admin-layout.ts
- voyage-frontend/src/app/layouts/admin-layout/admin-layout.html
- voyage-frontend/src/app/pages/admin/categories/categories.ts
- voyage-frontend/src/app/pages/admin/categories/categories.html
- voyage-frontend/src/app/pages/admin/categories/category-action-cell-renderer.component.ts
- voyage-frontend/src/app/pages/public/profile/profile.ts
- voyage-frontend/VOYAGE_ADMIN_AUDIT_REPORT.md

### Role matrix đã áp dụng
- STAFF: xem, tạo, sửa danh mục, gửi duyệt; không duyệt, không từ chối, không hủy trình duyệt, không bật/tắt public, không xóa, không batch workflow.
- ADMIN: có quyền STAFF, thêm duyệt, từ chối, hủy trình duyệt, bật/tắt public và batch workflow; không xóa category theo rule hiện tại.
- SUPER_ADMIN: toàn quyền, bao gồm xóa category.

### Backend endpoint đã enforce quyền
- Đã cấu hình matcher riêng cho Admin Categories trong SecurityConfig trước matcher chung /api/admin/**.
- STAFF/ADMIN/SUPER_ADMIN được GET/POST/PATCH/PUT category, submit và endpoint image của category.
- ADMIN/SUPER_ADMIN được approve, reject, cancel approve, display và các batch workflow endpoints.
- SUPER_ADMIN được delete category.
- API trái quyền trả 403 từ backend, không phụ thuộc vào việc frontend có ẩn nút hay không.

### Frontend action menu/batch toolbar
- Thêm RoleCode STAFF và AuthService.isStaff().
- Admin guard cho STAFF chỉ vào được /admin/categories; các route admin khác bị chặn trên frontend.
- Admin layout ẩn các menu admin khác với STAFF, giữ Categories.
- Categories component có helper quyền: create, edit, submit, approve, reject, cancel approve, display, delete, batch workflow, reorder, image update.
- AG Grid action menu chỉ hiện action theo quyền role và workflow status hợp lệ.
- Batch toolbar chỉ hiện batch action theo quyền; nút bỏ chọn vẫn có khi đã chọn dòng.
- Review panel newData giữ khả năng xem, nhưng STAFF không thấy action duyệt/từ chối/hủy trình duyệt.
- API 401/403 hiển thị thông báo thân thiện, 403 dùng thông điệp: Bạn không có quyền thực hiện thao tác này.

### Kết quả test STAFF
- GET list, create, patch update, submit đều pass với token STAFF.
- Approve, reject, cancel approve, display, delete và các batch actions trái quyền đều trả 403.
- Frontend build xác nhận các helper quyền compile đúng.

### Kết quả test ADMIN
- Approve, display show/hide, batch submit và batch reject pass với token ADMIN.
- Delete trả 403 theo rule chỉ SUPER_ADMIN được xóa.

### Kết quả test SUPER_ADMIN
- Delete category test pass với token SUPER_ADMIN.
- SUPER_ADMIN có đầy đủ action theo rule hiện tại.

### Kết quả build/test backend
- ./mvnw.cmd clean test: pass.
- ./mvnw.cmd clean package -DskipTests: pass.

### Kết quả build/test frontend
- npx ng build --configuration development: pass.
- npm run build: pass.

### Warning/lỗi còn lại
- Production build còn warning budget mềm hiện hữu: initial bundle 863.73 kB vượt 500 kB; một số SCSS admin/public gần 10 kB nhưng dưới hard budget.
- Backend còn warning hiện hữu OracleDialect/open-in-view/SpringDoc và Java/Lombok/Mockito deprecated Unsafe/dynamic agent.
- Chưa chạy browser automation do repo không có Playwright/e2e dependency; đã test RBAC bằng HTTP với backend thật và build frontend.

### Ghi chú kỹ thuật/rủi ro
- Backend là lớp chặn quyền chính; frontend chỉ hỗ trợ UX bằng cách ẩn action không hợp lệ.
- Bước này dùng role-based security. Nếu sau này có permission code chi tiết CATEGORY_* thì có thể thay bằng permission-based.
- Không mở quyền Admin Media cho STAFF trong bước này, nên UI upload/chọn Media vẫn được giữ theo quyền admin để tránh mở rộng phạm vi module Media.
- Không đổi workflow status, IS_DISPLAY, payload API, single API, batch API hoặc public filtering.

## 2026-06-09 17:13:27 +07:00 - Bước 12: Quyền Media giới hạn cho STAFF trong Admin Categories

### File đã sửa
- voyage-backend/src/main/java/com/voyageviet/backend/common/config/SecurityConfig.java
- voyage-backend/src/main/java/com/voyageviet/backend/media/controller/AdminMediaController.java
- voyage-backend/src/main/java/com/voyageviet/backend/media/service/MediaService.java
- voyage-backend/src/main/java/com/voyageviet/backend/media/repository/MediaRepository.java
- voyage-backend/BACKEND_API_REPORT.md
- voyage-frontend/src/app/pages/admin/categories/categories.ts
- voyage-frontend/src/app/pages/admin/categories/categories.html
- voyage-frontend/src/app/pages/admin/categories/categories-media.scss
- voyage-frontend/VOYAGE_ADMIN_AUDIT_REPORT.md

### Rule quyền Media cho STAFF
- STAFF được upload ảnh Media với module categories khi đang tạo/sửa danh mục.
- STAFF được list/chọn ảnh Media chỉ trong module categories.
- STAFF không được list all Media, không được xem module tours/banners/avatars/destinations/general.
- STAFF không được xóa media và không được vào full Admin Media page.
- ADMIN/SUPER_ADMIN giữ quyền Media hiện tại.

### Backend đã enforce quyền
- Mở matcher GET /api/admin/media và POST /api/admin/media/upload cho STAFF nhưng controller bắt buộc STAFF-only dùng module categories.
- DELETE /api/admin/media/{id} vẫn không cho STAFF.
- List Media cho STAFF dùng exact folder module categories, không dùng contains rộng.
- API trái phạm vi trả 403.

### Frontend đã ẩn/hiện theo role
- Form Admin Categories cho STAFF thấy nút Tải ảnh từ máy, Chọn từ Media và Cập nhật ảnh.
- Media picker với STAFF chỉ hiển thị chip Categories qua visibleMediaModuleOptions, không tạo list trực tiếp trong template.
- Khi STAFF mở picker, component ép selectedMediaModule về categories trước khi gọi API.
- Nếu Media API trả 403, form hiển thị thông báo: Bạn không có quyền thao tác với Media này.
- Sidebar Admin Media và route /admin/media vẫn chỉ dành cho ADMIN/SUPER_ADMIN theo guard/layout đã có từ bước 11.

### Kết quả test STAFF
- GET /api/admin/media?module=categories: 200.
- GET /api/admin/media không truyền module: 403.
- GET /api/admin/media?module=tours: 403.
- GET /api/admin/media?module=banners: 403.
- DELETE /api/admin/media/999999999: 403.
- Upload module categories bằng PNG 1x1: 200.
- Upload module tours bằng PNG 1x1: 403.
- Create category với imageUrl: 200, status DRAFT.
- Patch category image endpoint: 200.

### Kết quả test ADMIN
- GET /api/admin/media all: 200.
- Upload module general bằng PNG 1x1: 200.
- Admin Media full page không bị mở cho STAFF và không bị đổi logic cho ADMIN.

### Kết quả test SUPER_ADMIN
- GET /api/admin/media all: 200.
- SUPER_ADMIN giữ quyền Media đầy đủ theo role hiện tại.

### Kết quả build/test backend
- ./mvnw.cmd clean test: pass.
- ./mvnw.cmd clean package -DskipTests: pass.

### Kết quả build/test frontend
- npx ng build --configuration development: pass.
- npm run build: pass.

### Warning/lỗi còn lại
- Production build còn warning budget mềm hiện hữu: initial bundle 863.73 kB; public-layout.scss, categories.scss, categories-media.scss, destinations.scss, tour-form.scss, tours.scss, home-hero.scss vượt warning budget 8 kB nhưng dưới hard budget.
- Backend còn warning hiện hữu OracleDialect/open-in-view/SpringDoc và Java/Lombok/Mockito deprecated Unsafe/dynamic agent.
- Không chạy browser automation do repo không có Playwright/e2e dependency; đã test quyền bằng HTTP với backend thật và build frontend.

### Ghi chú kỹ thuật/rủi ro
- STAFF chỉ được dùng Media trong phạm vi category.
- Admin Media full page vẫn chỉ dành cho ADMIN/SUPER_ADMIN.
- Backend là lớp chặn quyền chính; frontend chỉ hỗ trợ UX.
- Không đổi Category workflow, IS_DISPLAY, payload category hoặc public API.

## 2026-06-09 21:50:30 +07:00 - B??c 13: S?a encoding ti?ng Vi?t to?n repo

### File ?? s?a
- .editorconfig
- voyage-frontend/src/app/pages/admin/categories/categories.ts
- voyage-frontend/src/app/pages/admin/categories/categories.html
- voyage-frontend/src/app/pages/public/profile/profile.ts
- voyage-frontend/VOYAGE_ADMIN_AUDIT_REPORT.md
- voyage-frontend/VOYAGE_FRONTEND_AUDIT_REPORT.md
- voyage-backend/src/main/java/com/voyageviet/backend/tour/service/TourStatsService.java
- voyage-backend/BACKEND_API_REPORT.md

### Ph?m vi ?? scan
- To?n repo, b? qua .git/node_modules/dist/target/.angular/.idea.
- Frontend src/app, layouts, admin pages, public pages, shared/core.
- Backend src/main Java/resources, SQL/manual migration, report markdown.
- B? pattern exact mojibake ph? bi?n v? broad scan ?? ki?m false positive.

### Nh?m l?i encoding ?? s?a
- C?c label/action workflow Category: B??c, ??, ch? duy?t, Duy?t, T? ch?i, H?y tr?nh duy?t, hi?n th?, danh m?c.
- C?c message UI Admin Categories: tr?ng th?i t?i d? li?u, l?i thao t?c, confirm dialog, batch toolbar, Media picker.
- C?c message public profile: t?i h? s?, c?p nh?t h? s?, ?nh ??i di?n, vai tr? Kh?ch h?ng/Nh?n vi?n.
- Report admin/frontend/backend: ti?u ??, m?c ti?u, k?t qu?, ghi ch? k? thu?t, r?i ro, n?i dung l?ch s? b? sai encoding.
- Backend TourStatsService: chu?i so s?nh t?n qu?c gia Vi?t Nam b? sai encoding.

### Nguy?n nh?n nghi ng?
- M?t s? n?i dung ?? b? copy/ghi t? terminal ho?c editor Windows v?i encoding kh?ng ??ng nh?t.
- Repo ?? c? c?u h?nh backend UTF-8; b? sung .editorconfig ? root ?? kh?a UTF-8/LF cho editor.
- index.html ?? c? meta charset utf-8.
- Kh?ng c? b?ng ch?ng c?n s?a d? li?u DB h?ng lo?t trong b??c n?y.

### K?t qu? build/test
- npx ng build --configuration development: pass.
- npm run build: pass.
- ./mvnw.cmd clean test: pass.
- ./mvnw.cmd clean package -DskipTests: pass.

### Warning/loi con lai
- Production build c?n warning budget m?m hi?n h?u: initial bundle 863.30 kB; m?t s? SCSS g?n 10 kB nh?ng d??i hard budget.
- Backend c?n warning hi?n h?u OracleDialect/open-in-view/SpringDoc v? Java/Lombok/Mockito deprecated Unsafe/dynamic agent.
- Broad scan c?n false positive ti?ng Vi?t h?p l? nh? Ch?u ?u, B?c ?u, H? S? C? NH?N, S?N PH?M B?N ?? XEM.

### Ghi ch? k? thu?t/r?i ro
- C?c file ?? ???c ghi l?i UTF-8 kh?ng BOM, m?t newline cu?i file.
- Exact mojibake scan to?n repo tr? v? 0 hit sau khi s?a.
- Kh?ng ??i nghi?p v?, API, workflow, quy?n STAFF/ADMIN/SUPER_ADMIN ho?c payload.
- N?u sau n?y ph?t hi?n d? li?u DB b? sai encoding, c?n script ki?m tra/s?a d? li?u ri?ng theo b?ng v? field c? th?.

## Cập nhật: Admin Destinations Workflow

Thời gian cập nhật: 2026-06-09 22:33 +07:00

### File đã sửa/tạo mới
- src/app/core/models/destination.model.ts
- src/app/core/api/admin-destination-api.service.ts
- src/app/pages/admin/destinations/destinations.ts
- src/app/pages/admin/destinations/destinations.html
- src/app/pages/admin/destinations/destinations.scss
- src/app/pages/admin/tours/tour-form/tour-form.ts
- src/app/pages/admin/tours/tour-form/tour-form.html

### Nội dung đã làm
- Admin Destinations chuyển sang workflow DRAFT/PENDING/APPROVED/REJECTED/CANCEL_APPROVE.
- Thêm model/API cho isDisplay, newData, rejectReason, single workflow action và batch workflow action.
- UI list thêm workflow badge, display badge, pending data badge, checkbox chọn nhiều và batch toolbar.
- Thêm review panel parse newData an toàn trong TypeScript, không parse trong template; có so sánh field và textarea lý do từ chối.
- Role-based UI: STAFF chỉ tạo/sửa/gửi duyệt; ADMIN/SUPER_ADMIN duyệt/từ chối/hủy/display/batch; SUPER_ADMIN xóa.
- Form Destination bỏ dropdown ACTIVE/INACTIVE trực tiếp; display public dùng workflow action riêng.
- Tour Form chỉ cho chọn destination APPROVED + isDisplay = 1 khi tạo/chọn mới.
- Edit tour cũ giữ destination hiện tại nếu chưa duyệt/không còn hiển thị, thêm nhãn cảnh báo để tránh mất dữ liệu.

### Kết quả test
-
px ng build --configuration development: PASS.
-
pm run build: PASS, còn các warning budget sẵn có; destinations.scss còn warning nhưng dưới error threshold.

### Ghi chú kỹ thuật/rủi ro
- Review panel giữ styling tối giản để không vượt Angular component style budget.
- Public frontend không được sửa trong bước này; không ghi thay đổi admin vào VOYAGE_FRONTEND_AUDIT_REPORT.md.

## 2026-06-10 09:05:00 +07:00 - Bước 15: Đồng bộ Admin Destinations với backend workflow thật

### File admin/frontend đã kiểm tra/sửa
- `src/app/core/models/destination.model.ts`
- `src/app/core/api/admin-destination-api.service.ts`
- `src/app/pages/admin/destinations/destinations.ts`
- `src/app/pages/admin/destinations/destinations.html`
- `src/app/pages/admin/tours/tour-form/tour-form.ts`
- `VOYAGE_ADMIN_AUDIT_REPORT.md`

### Nội dung xác nhận
- Admin Destination API service đang gọi đúng backend thật: `/submit`, `/approve`, `/reject`, `/cancel-approve`, `/display`, `/batch/...`.
- Request body reject/display/batch khớp DTO backend: `reason`, `isDisplay`, `ids`.
- Batch response parse đúng `total`, `successCount`, `failedCount`, `successItems`, `failedItems`.
- UI không dùng `/status` để bật/tắt public destination.
- Model dùng đúng field `newData` và `rejectReason`.
- Tour Form chỉ chọn destination `APPROVED + isDisplay=1` khi tạo/chọn mới.
- Edit tour cũ vẫn giữ destination hiện tại không hợp lệ và hiển thị cảnh báo, không đổi payload tour.

### Sửa audit bước 14
- Sửa lỗi text xuống dòng sai `isDisplay, newData, rejectReason` trong audit Step 14.
- Sửa đoạn `parse newData` trong audit Step 14.
- Không xóa lịch sử audit.

### Test frontend
- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

### Warning/lỗi còn lại
- Production build còn warning budget hiện hữu:
  - initial bundle 863.30 kB vượt warning budget 500 kB.
  - `public-layout.scss`, `destinations.scss`, `categories-media.scss`, `tour-form.scss`, `tours.scss`, `categories.scss`, `home-hero.scss` vượt style warning budget 8 kB nhưng build vẫn pass.
- Không chạy browser manual automation vì repo không có Playwright/e2e dependency trong phiên này.

### Ghi chú kỹ thuật/rủi ro
- Backend HTTP E2E đã xác nhận endpoint frontend đang gọi tồn tại và trả response shape đúng.
- Không ghi thay đổi admin vào `VOYAGE_FRONTEND_AUDIT_REPORT.md`.


## Cap nhat 2026-06-10 09:26:50 +07:00 - Buoc 16: Browser QA Category/Destination/Tour Form

### Thoi gian cap nhat
- 2026-06-10 09:26:50 +07.

### Pham vi browser QA
- Chay browser that bang Google Chrome headless tren frontend dev server `http://localhost:4200` va backend that `http://localhost:8081/api`.
- Kiem tra cac man: `/admin/categories`, `/admin/destinations`, `/admin/tours/new`, route chan `/admin/media` cho STAFF.
- Kiem tra role: STAFF, ADMIN, SUPER_ADMIN.
- Kiem tra console error, HTTP response >= 400, link sidebar/media, action visibility va exact mojibake pattern tren DOM.

### Tai khoan/role da test
- ADMIN seed: `admin@voyageviet.local`.
- SUPER_ADMIN seed: `superadmin@voyageviet.local`.
- STAFF test tao qua API local voi tien to `staff-step16-*`, duoc set role STAFF bang SUPER_ADMIN.

### Ket qua test Admin Categories
- ADMIN/SUPER_ADMIN load `/admin/categories` thanh cong, co Angular root, khong co console error, khong co API 4xx bat thuong.
- STAFF load `/admin/categories` thanh cong.
- STAFF khong thay link full Admin Media trong header Categories.
- STAFF khong thay cac action cam: approve, reject, cancel approve, display show/hide, delete, batch workflow.
- Batch toolbar Categories duoc an hoan toan voi STAFF khi khong co quyen batch.

### Ket qua test Admin Destinations
- ADMIN/SUPER_ADMIN load `/admin/destinations` thanh cong, khong co console error, text workflow/filter hien dung: `Tat ca`, `Tat ca khu vuc` tren DOM.
- STAFF load `/admin/destinations` thanh cong theo rule backend buoc 15.
- STAFF thay list/create/edit/submit phu hop, khong thay approve/reject/cancel/display/delete/batch workflow.
- STAFF khong thay link full Admin Media tren Destination page.
- Phat hien va fix loi tich hop: STAFF Destination page bi 403 khi goi `GET /api/admin/locations/provinces` de load tinh/thanh. Da mo read-only endpoint nay cho STAFF/ADMIN/SUPER_ADMIN o backend.

### Ket qua test Tour Form
- ADMIN load `/admin/tours/new` thanh cong, khong co console error va khong co API 4xx bat thuong.
- Tour Form van dung payload hien co, khong sua Tour API/payload.
- Browser text scan khong phat hien exact mojibake tren Tour Form.

### Ket qua test Media permission
- STAFF direct `/admin/media` bi guard chuyen ve `/`, sidebar/link Media khong hien trong admin layout.
- HTTP RBAC that voi STAFF:
  - `GET /api/admin/media`: 403.
  - `GET /api/admin/media?module=categories`: 200.
  - `GET /api/admin/media?module=destinations`: 200.
  - `GET /api/admin/locations/provinces`: 200.
- ADMIN/SUPER_ADMIN van thay link full Media theo role admin.

### Ket qua test encoding
- Browser DOM scan tren admin Categories, Destinations, Tour Form khong con exact mojibake pattern lien quan: `cA-ring`, `BAE-deg`, `A-diaeresis-dstroke`, `cha-quote`, `hia-quote`, `danh-ma-quote`, `Ka-masc`, `replacement`, `T?t`, `Ch?`, `H?`.
- Code scan cac file lien quan tra `NO_RELEVANT_MOJIBAKE_HITS`.
- Da sua cac literal mojibake that con lai trong `destinations.ts`: status/region labels, fallback province/country strings, warning/error messages, regex normalize `Thanh pho/Tinh`.

### Loi phat hien va file da sua
- `src/app/core/guards/admin.guard.ts`: cho STAFF vao `/admin/destinations` va redirect `/admin` ve Categories.
- `src/app/layouts/admin-layout/admin-layout.html`: cho STAFF thay menu Destinations, van an Dashboard/Tours/Bookings/Users/Reviews/Media/Features/Audit Logs.
- `src/app/pages/admin/destinations/destinations.html`: an link full Media va batch toolbar voi STAFF.
- `src/app/pages/admin/destinations/destinations.ts`: sua mojibake labels/messages, slug normalize ky tu d-stroke/D-stroke, them helper role display cho Media/batch.
- `src/app/pages/admin/categories/categories.html`: an batch toolbar voi STAFF.
- Backend fix lien quan duoc ghi trong `BACKEND_API_REPORT.md`: SecurityConfig mo `GET /api/admin/locations/provinces` cho STAFF.

### Ket qua build frontend
- `npx ng build --configuration development`: PASS.
- `npm run build`: PASS.

### Warning/loi con lai
- Production build con warning budget hien huu:
  - initial bundle vuot 500 kB.
  - mot so SCSS vuot budget 8 kB: home hero, admin categories, admin destinations, categories media, public layout, tour form, tours.
- Khi STAFF bi redirect ve public `/` tu `/admin/media`, public home co mot request wishlist tra 400 voi STAFF role; khong thuoc pham vi admin workflow buoc 16 va khong anh huong route admin da test.

### Ghi chu ky thuat/rui ro
- Da test browser that bang Chrome headless/CDP tren backend/frontend dang chay that.
- Khong doi workflow Category/Destination, khong doi Tour payload, khong doi DB schema, khong doi public route.
- Upload anh tu file local khong thuc hien trong headless browser; quyen media duoc xac minh bang HTTP endpoint that va UI link/module visibility.
