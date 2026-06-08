# VOYAGE_ADMIN_AUDIT_REPORT.md — Bản rút gọn cuối cùng

Thời gian tổng hợp: 2026-06-06 23:59:00 +07:00

## Mục tiêu dọn file

File audit cũ có quá nhiều section cập nhật nhỏ, lặp lại nhiều lần do quá trình sửa UI từng bước. Bản này chỉ giữ lại các chức năng chính đã hoàn thiện đến trạng thái cuối cùng, loại bỏ các log trung gian như: thử sai chevron, đổi màu nhiều lần, fix lặt vặt lặp lại, các prompt/section không còn phản ánh trạng thái cuối.

## Phạm vi đã hoàn thiện

- Admin Layout
- Admin Media
- Admin Categories
- Admin Destinations
- Admin Tours List
- Admin Tour Create/Edit Form
- Admin Tour Gallery
- Admin Tour Itinerary
- Admin Tour Schedules
- Admin UI Feedback bằng Taiga UI
- E2E Admin Tour với backend thật

Không ghi thay đổi admin vào `VOYAGE_FRONTEND_AUDIT_REPORT.md`.

---

## 1. Admin Layout

### File chính

- `src/app/layouts/admin-layout/admin-layout.html`
- `src/app/layouts/admin-layout/admin-layout.scss`
- `src/app/layouts/admin-layout/admin-layout.ts`

### Chức năng đã hoàn thiện

- Sidebar admin đứng yên khi content scroll.
- Content admin scroll độc lập.
- Topbar admin sticky trong vùng content.
- Scrollbar admin được làm gọn, màu nhẹ theo theme teal/green.
- Layout desktop ổn định, mobile/tablet quay về layout column để tránh vỡ UI.
- Không dùng màu xanh cũ `#004FA8`.

### Ghi chú

- Topbar sticky phụ thuộc vào việc `.admin-layout__content` là scroll container.
- Nếu sau này đổi cấu trúc shell admin thì cần kiểm tra lại sticky behavior.

---

## 2. Admin UI Feedback

### File chính

- `src/app/core/services/admin-ui-feedback.service.ts`
- `src/app/core/services/admin-confirm-dialog.component.ts`
- Các màn admin: Media, Categories, Destinations, Tours, Tour Gallery, Tour Itinerary, Tour Schedules

### Chức năng đã hoàn thiện

- Thay native `window.confirm` / `window.alert` bằng Taiga UI dialog và notification.
- Dùng service chung cho admin:
  - success
  - error
  - warning
  - info
  - confirm danger/warning/info
- Dialog xác nhận dùng theme admin teal/green.
- Danger action dùng màu đỏ.
- Có chống spam notification trùng trong thời gian ngắn.
- Các thao tác xóa/ẩn/hủy/cancel trong admin đều chuyển sang confirm UI thay vì alert browser.

### Ghi chú

- `AdminUiFeedbackService.confirm*()` trả về `Observable<boolean>`.
- Các component dùng `take(1)` để tránh subscription treo.

---

## 3. Admin Media / Cloudinary

### File chính

- `src/app/pages/admin/media/media.ts`
- `src/app/pages/admin/media/media.html`
- `src/app/pages/admin/media/media.scss`
- `src/app/core/api/admin-media-api.service.ts`
- `src/app/core/models/media.model.ts`

### API đã nối

- `GET /api/admin/media`
- `POST /api/admin/media/upload`
- `DELETE /api/admin/media/{id}`

### Chức năng đã hoàn thiện

- Upload ảnh qua backend lên Cloudinary.
- Không gọi Cloudinary trực tiếp từ frontend.
- Không lưu base64.
- Validate file ảnh:
  - PNG
  - JPG/JPEG
  - WEBP
  - tối đa 5MB
- Preview ảnh trước khi upload.
- Danh sách media dạng grid responsive.
- Lọc theo module:
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
- Helper URL hỗ trợ nhiều alias response:
  - `url`
  - `imageUrl`
  - `secureUrl`
  - `fileUrl`
  - `mediaUrl`
  - `data.url`
  - `data.secureUrl`

### Ghi chú

- Media manager là nguồn upload/URL chung cho Category, Destination, Tour thumbnail, Tour gallery.
- Nếu xóa media đang được dùng ở entity khác, URL đã dán có thể bị lỗi ảnh.

---

## 4. Admin Categories

### File chính

- `src/app/pages/admin/categories/categories.ts`
- `src/app/pages/admin/categories/categories.html`
- `src/app/pages/admin/categories/categories.scss`
- `src/app/core/api/admin-category-api.service.ts`
- `src/app/core/models/category.model.ts`

### API đã nối

- `GET /api/admin/categories`
- `POST /api/admin/categories`
- `PUT /api/admin/categories/{id}`
- `PATCH /api/admin/categories/{id}/status`
- `PATCH /api/admin/categories/{id}/image`
- `DELETE /api/admin/categories/{id}`

### Chức năng đã hoàn thiện

- CRUD danh mục.
- Search/filter theo tên, slug, trạng thái.
- Auto-generate slug từ tên danh mục.
- Cho sửa slug thủ công.
- Gắn ảnh danh mục bằng URL Cloudinary.
- Có preview ảnh và fallback `/hero/bg-home.png`.
- Có nút mở Admin Media để upload/copy URL.
- Toggle trạng thái ACTIVE/INACTIVE.
- Xóa category bằng Taiga confirm.
- UI table desktop và card responsive mobile.
- Đã sửa encoding tiếng Việt có dấu.
- Select trạng thái có chevron đồng bộ với UI admin.
- Button hành động theo style nhẹ:
  - Sửa: outline
  - Ẩn/hiện: warning nhẹ
  - Xóa: danger nhẹ

### Ghi chú

- Nếu category đang được tour sử dụng, backend có thể chặn xóa và UI hiển thị message backend.

---

## 5. Admin Destinations

### File chính

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

### API đã nối

- `GET /api/admin/destinations`
- `POST /api/admin/destinations`
- `PUT /api/admin/destinations/{id}`
- `PATCH /api/admin/destinations/{id}/status`
- `PATCH /api/admin/destinations/{id}/image`
- `DELETE /api/admin/destinations/{id}`
- `GET /api/admin/locations/provinces`
- `GET https://restcountries.com/v3.1/all?fields=name,flags,population,cca2,translations`
- `POST https://countriesnow.space/api/v0.1/countries/cities`

### Chức năng đã hoàn thiện

- CRUD điểm đến.
- Search/filter theo tên, slug, quốc gia, khu vực, trạng thái.
- Form điểm đến chia 2 luồng rõ ràng:
  - Trong nước
  - Quốc tế
- Toggle `Loại điểm đến` hiển thị rõ active/inactive.
- Luồng Trong nước:
  - Chọn miền: Miền Bắc, Miền Trung, Miền Nam.
  - Chọn tỉnh/thành từ API proxy backend.
  - Khi chọn tỉnh/thành, tự set:
    - tên điểm đến
    - quốc gia = Việt Nam
    - slug
- Luồng Quốc tế:
  - Chọn quốc gia, hiển thị tên tiếng Việt nếu REST Countries có dữ liệu.
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
- `subRegion`, `cityName`, keyword search chỉ dùng trong frontend, không gửi backend.
- Upload ảnh trực tiếp trong form bằng component `AdminImageUpload`.
- Upload ảnh vẫn đi qua `AdminMediaApiService.uploadMedia(file, 'destinations')`.
- Không gọi Cloudinary trực tiếp.
- Không dùng base64.
- Việt hóa tọa độ:
  - Latitude -> Vĩ độ
  - Longitude -> Kinh độ
- Input tọa độ dùng `text + inputmode decimal` để bỏ spinner native.
- Label bắt buộc có dấu `*` màu đỏ.
- Message lỗi/help/warning đồng bộ dưới field.
- Tỉnh/Thành, Quốc gia, Thành phố dùng autocomplete native-like:
  - nền trắng
  - option một dòng
  - text căn trái
  - hover/active xanh nhạt
  - không teal block/card
- Miền và Trạng thái trong form dùng native select thật để ổn định.
- Toolbar filter Destination có chevron đồng bộ.
- Button hành động của row đồng bộ với Categories:
  - Sửa: outline
  - Tạm ẩn/Bật: warning nhẹ
  - Xóa: danger nhẹ

### Ghi chú

- Nếu điểm đến domestic cũ như `Hạ Long` không map được province API, form giữ nguyên `name/slug` backend thay vì ép map sai.
- REST Countries/CountriesNow là API ngoài; nếu lỗi runtime, UI có fallback/input tay.
- Điểm đến là nguồn dữ liệu chính cho Tour Form. Tour Form không còn tự gọi API tỉnh/thành.

---

## 6. Admin Tours List

### File chính

- `src/app/pages/admin/tours/tours.ts`
- `src/app/pages/admin/tours/tours.html`
- `src/app/pages/admin/tours/tours.scss`
- `src/app/core/api/admin-tour-api.service.ts`
- `src/app/core/models/admin-tour.model.ts`

### API đã nối

- `GET /api/admin/tours`
- `GET /api/admin/tours/{id}`
- `POST /api/admin/tours`
- `PUT /api/admin/tours/{id}`
- `PATCH /api/admin/tours/{id}/status`
- `PATCH /api/admin/tours/{id}/thumbnail`
- `DELETE /api/admin/tours/{id}`
- `GET /api/admin/tours/{id}/publish-checklist`
- `POST /api/admin/tours/{id}/publish`

### Chức năng đã hoàn thiện

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
- Filter toolbar cuối cùng dùng custom dropdown thật, không phụ thuộc native select.
- Dropdown filter có:
  - nền trắng
  - border #DDE7E4
  - radius 12px
  - SVG chevron
  - xoay 180 độ khi mở
  - option một dòng
  - hover/active xanh nhạt
  - click outside/Escape để đóng
- Table gọn:
  - Tour
  - Giá
  - Thời lượng
  - Số chỗ
  - Featured
  - Trạng thái
  - Cập nhật
  - Hành động
- Cột Hành động dùng menu icon `⋮`.
- Dropdown action màu trắng, action theo status:
  - Nháp -> Xuất bản
  - Đã xuất bản -> Tạm ẩn
  - Tạm ẩn/Hết chỗ -> Kích hoạt lại/Mở bán lại
  - Xóa luôn danger
- Action hỗ trợ:
  - Xem trước
  - Chỉnh sửa
  - Nhân bản placeholder/TODO
  - Cập nhật ảnh
  - Publish/checklist
  - Đổi trạng thái
  - Xóa
- Publish checklist hiển thị warning/card nếu thiếu dữ liệu.
- Xóa tour bằng Taiga confirm.
- Update thumbnail bằng URL Cloudinary.
- Format tiền `vi-VN`.
- Format ngày `vi-VN`.
- Responsive table/card cho tablet/mobile.

### Ghi chú

- `Nhân bản` hiện chưa nối API thật.
- Dropdown action cần test thêm row cuối nếu nằm sát viewport để tránh bị cắt.

---

## 7. Admin Tour Create/Edit Form

### File chính

- `src/app/pages/admin/tours/tour-form/tour-form.ts`
- `src/app/pages/admin/tours/tour-form/tour-form.html`
- `src/app/pages/admin/tours/tour-form/tour-form.scss`
- `src/app/app.routes.ts`

### API đã nối

- `GET /api/admin/categories`
- `GET /api/admin/destinations`
- `GET /api/admin/tours/{id}`
- `POST /api/admin/tours`
- `PUT /api/admin/tours/{id}`
- `GET /api/admin/media`
- `POST /api/admin/media/upload`

### Chức năng đã hoàn thiện

- Route:
  - `/admin/tours/new`
  - `/admin/tours/:id/edit`
- Lazy load form để tránh tăng initial bundle.
- Reactive Forms.
- Create mode và edit mode dùng chung component.
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
- Điểm khởi hành chỉ dùng 3 option chuẩn:
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
- Validation message nằm trong slot cố định, không làm lệch grid.
- Preview card bên phải hiển thị ảnh, title, mô tả, category/destination, điểm khởi hành, giá, duration, status.
- Việt hóa label/message/placeholder.

### Ghi chú

- Backend tour hiện chỉ lưu một `destinationId` chính.
- Nếu cần lưu nhiều điểm đến thật cần backend thêm `destinationIds` hoặc bảng `TOUR_DESTINATIONS`.

---

## 8. Admin Tour Gallery

### File chính

- `src/app/pages/admin/tours/tour-gallery/tour-gallery.ts`
- `src/app/pages/admin/tours/tour-gallery/tour-gallery.html`
- `src/app/pages/admin/tours/tour-gallery/tour-gallery.scss`
- `src/app/core/api/admin-tour-api.service.ts`
- `src/app/core/models/admin-tour.model.ts`

### API đã nối

- `GET /api/admin/tours/{id}/images`
- `POST /api/admin/tours/{id}/images/from-media`
- `PATCH /api/admin/tours/{tourId}/images/{imageId}/alt`
- `PATCH /api/admin/tours/{tourId}/images/{imageId}/thumbnail`
- `PATCH /api/admin/tours/{id}/images/reorder`
- `DELETE /api/admin/tours/{tourId}/images/{imageId}`

### Chức năng đã hoàn thiện

- Gallery tách thành component riêng.
- Create mode yêu cầu lưu tour trước.
- Edit mode load gallery theo tour id.
- Chọn ảnh từ Admin Media và attach bằng `mediaId`.
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

### Backend contract đã fix

- Thêm endpoint backend: `POST /api/admin/tours/{id}/images/from-media`.
- Payload dùng:
  - `mediaId`
  - `altText`
  - `sortOrder`
  - `thumbnail`
- Endpoint multipart cũ vẫn giữ cho upload file trực tiếp nếu cần.

### Ghi chú

- Nếu upload media response không có `id/mediaId`, gallery không attach được ảnh.

---

## 9. Admin Tour Itinerary

### File chính

- `src/app/pages/admin/tours/tour-itinerary/tour-itinerary.ts`
- `src/app/pages/admin/tours/tour-itinerary/tour-itinerary.html`
- `src/app/pages/admin/tours/tour-itinerary/tour-itinerary.scss`
- `src/app/core/api/admin-tour-api.service.ts`
- `src/app/core/models/admin-tour.model.ts`

### API đã nối

- `GET /api/admin/tours/{id}/itineraries`
- `PUT /api/admin/tours/{id}/itineraries`
- `POST /api/admin/tours/{id}/itineraries/reorder`

### Chức năng đã hoàn thiện

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
- UI header/empty state đã polish gọn, nhẹ, không dùng button teal nặng.

### Ghi chú

- Backend không có endpoint create/update/delete từng itinerary item nên frontend dùng bulk replace-all.

---

## 10. Admin Tour Schedules

### File chính

- `src/app/pages/admin/tours/tour-schedules/tour-schedules.ts`
- `src/app/pages/admin/tours/tour-schedules/tour-schedules.html`
- `src/app/pages/admin/tours/tour-schedules/tour-schedules.scss`
- `src/app/core/api/admin-tour-api.service.ts`
- `src/app/core/models/admin-tour.model.ts`

### API đã nối

- `GET /api/admin/tours/{id}/schedules`
- `POST /api/admin/tours/{id}/schedules`
- `PUT /api/admin/tours/{tourId}/schedules/{id}`
- `PATCH /api/admin/tours/{tourId}/schedules/{id}/status`
- `DELETE /api/admin/tours/{tourId}/schedules/{id}`

### Chức năng đã hoàn thiện

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
- UI header/empty state đã polish gọn, nhẹ.

### Ghi chú

- Schedule là nguồn chính cho giá/số chỗ khi booking.
- Backend vẫn là lớp bảo vệ cuối cho oversell/optimistic lock.

---

## 11. Polish UI Admin Chung

### Chức năng đã hoàn thiện

- Giảm dùng teal đặc quá nhiều.
- Button chính dùng primary solid gọn.
- Button phụ dùng outline/neutral.
- Button danger dùng đỏ nhẹ.
- Badge/status tách màu theo trạng thái.
- Card/table/form/filter/action đồng bộ theme teal/green.
- Header Admin Destinations đồng bộ Categories/Tours.
- Header buttons không bị stretch cao.
- Dropdown/autocomplete Admin Destinations về nền trắng, option phẳng, không card teal.
- Dropdown filter Admin Tours chuyển sang custom dropdown thật để kiểm soát chevron/menu.

---

## 12. E2E Admin Tour Với Backend Thật

### Đã test bằng API thật

- Login ADMIN thành công với `admin@voyageviet.local`.
- Gọi Admin Media lấy được media có `id`, `secureUrl`, `publicId`, `mediaType=IMAGE`.
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

### Kết quả build

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

---

## Warning còn lại

Các warning này là warning budget hiện hữu, không phải lỗi compile:

- Initial bundle vượt 500 kB.
- `src/app/layouts/public-layout/public-layout.scss` vượt warning budget.
- `src/app/pages/public/home/components/home-hero/home-hero.scss` vượt warning budget.
- `src/app/pages/admin/destinations/destinations.scss` có lúc vượt warning mềm nhưng dưới hard budget.
- `src/app/pages/admin/tours/tour-form/tour-form.scss` ở sát/vượt warning 8 kB nhưng build pass.

---

## TODO còn lại

- Admin Booking Detail frontend chưa làm.
- WebSocket JWT handshake chưa làm.
- STAFF permission / feature permission chi tiết chưa làm.
- API duplicate tour chưa có, action `Nhân bản` vẫn là TODO.
- Backend chưa hỗ trợ lưu nhiều destination thật cho tour; UI hiện chỉ lưu `destinationId` chính.
- Cần test thủ công browser đầy đủ sau khi restart frontend/backend nếu process dev cũ không phản hồi ổn định.

---

## Các nhóm update đã loại bỏ khỏi audit rút gọn

- Các section thử sai chevron nhiều lần.
- Các section đổi màu toggle/button lặp lại.
- Các section fix encoding nhỏ lặp lại.
- Các section native select rồi đổi custom rồi quay lại native.
- Các section chỉ sửa vài pixel/spacing nhỏ nhưng không còn phản ánh trạng thái cuối.
- Các build log trung gian bị lỗi do budget rồi đã fix lại sau đó.

## Cap Nhat: Slide-over Xem Truoc Tour Admin Tours

Thoi gian cap nhat: 2026-06-06 23:49:04 +07:00

### File Tao Moi

- src/app/shared/components/tour-preview-panel/tour-preview-panel.component.ts
- src/app/shared/components/tour-preview-panel/tour-preview-panel.component.html
- src/app/shared/components/tour-preview-panel/tour-preview-panel.component.scss

### File Da Sua

- src/app/pages/admin/tours/tours.ts
- src/app/pages/admin/tours/tours.html
- src/app/pages/admin/tours/tours.scss
- src/app/core/models/admin-tour.model.ts
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Dau Viec Da Lam

- Doc VOYAGE_ADMIN_AUDIT_REPORT.md va VOYAGE_FRONTEND_AUDIT_REPORT.md, uu tien section moi nhat ve custom dropdown Admin Tours.
- Kiem tra AdminTourApiService va xac nhan da co getTour(id) goi GET /api/admin/tours/{id}, khong can them API method moi.
- Chi sua man Admin Tours va model lien quan preview data; khong sua Admin Destinations, Categories, Media, TourForm, public pages, AdminLayout, API backend hoac payload backend.
- Khong ghi vao VOYAGE_FRONTEND_AUDIT_REPORT.md.

### Chuc Nang Da Them

- Tao TourPreviewPanelComponent standalone.
- Them slide-over preview truot tu ben phai khi click action Xem truoc trong menu hanh dong tour.
- Them overlay/backdrop mo phu toan trang, click overlay dong panel.
- Panel tu goi API chi tiet tour khi tourId khac null.
- Them loading skeleton khi dang tai API.
- Them error state voi nut Thu lai khi khong tai duoc thong tin tour.
- Hien thi anh chinh voi fallback Chua co anh.
- Hien thi gia, thoi luong, so cho, diem den, mo ta, thong ke nhanh, lich khoi hanh va lich trinh.
- Mo ta co Xem them / Thu gon khi noi dung dai.
- Lich khoi hanh hien thi toi da 3 item mac dinh, co mo rong danh sach trong panel.
- Lich trinh hien thi dang accordion, mac dinh toi da 3 ngay dau va co nut xem them.
- Footer sticky co action Chinh sua, Xuat ban cho tour DRAFT va Tam an cho tour PUBLISHED.
- Component chi emit editTour, publishTour, suspendTour; logic publish/suspend van do AdminTours xu ly.
- Them body scroll lock khi panel mo va khoi phuc khi dong hoac component page destroy.
- ESC dong panel; click nut X dong panel.

### API Da Dung

- GET /api/admin/tours/{id} thong qua AdminTourApiService.getTour(id).

### Ket Qua Build/Test

- npx ng build --configuration development: pass.
- npm run build: pass.

### Warning/Loi Con Lai

- Production build con warning budget hien huu: initial bundle, public-layout.scss, home-hero.scss, destinations.scss, categories.scss, tour-form.scss.
- tours.scss van co warning budget mem 8 kB va dang duoi hard budget 10 kB.
- Khong co loi compile.

### Ghi Chu Ky Thuat Va Rui Ro

- Khong dung Angular CDK Overlay va khong them thu vien moi.
- Slide-over dung CSS transform animation khoang 280ms.
- Overlay va panel dung fixed positioning, khong day layout bang tour.
- Body scroll duoc khoa/mo lai trong AdminTours, co cleanup trong ngOnDestroy.
- Detail response duoc parse linh hoat voi data wrapper hoac object truc tiep; schedules/images/itinerary la optional de tranh crash template khi backend thieu field.
- Chua test thu cong tren browser that voi API runtime; can kiem tra lai UI truot, overlay, scroll body va data detail thuc te tai /admin/tours.


















## Cap Nhat: Fix Mapping Du Lieu Tour Preview Panel

Thoi gian cap nhat: 2026-06-07 00:01:46 +07:00

### File Da Sua

- src/app/shared/components/tour-preview-panel/tour-preview-panel.component.ts
- src/app/shared/components/tour-preview-panel/tour-preview-panel.component.html
- src/app/shared/components/tour-preview-panel/tour-preview-panel.component.scss
- src/app/pages/admin/tours/tours.ts
- src/app/pages/admin/tours/tours.html
- src/app/core/models/admin-tour.model.ts
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Dau Viec Da Lam

- Doc VOYAGE_ADMIN_AUDIT_REPORT.md va VOYAGE_FRONTEND_AUDIT_REPORT.md, uu tien section moi nhat ve slide-over preview Admin Tours.
- Kiem tra AdminTourApiService.getTour(id) va xac nhan van dung GET /api/admin/tours/{id}.
- Kiem tra TourPreviewPanelComponent hien tai dang chi render sau API detail, nen neu detail thieu field thi mat du lieu row da co tren bang.
- Chi sua Admin Tours preview panel va model lien quan; khong sua Admin Destinations, TourForm, public pages, AdminLayout, API backend hoac logic CRUD.
- Khong ghi vao VOYAGE_FRONTEND_AUDIT_REPORT.md.

### Chuc Nang Da Sua

- Truyen tour row fallback tu bang Admin Tours vao TourPreviewPanelComponent qua input tourFallback.
- Luu selectedPreviewTour trong AdminTours khi click Xem truoc.
- Panel render du lieu fallback ngay khi mo, dong thoi van goi API detail de bo sung du lieu day du.
- Merge detail API voi fallback theo nguyen tac detail co gia tri moi ghi de, detail rong/null/undefined/array rong khong xoa du lieu fallback.
- Normalize/unwrap response detail linh hoat hon voi object truc tiep, data, result, content va wrapper long nhau toi 3 lop.
- Map nhieu alias field cho title/name/tourName, imageUrl/thumbnailUrl/coverImageUrl/thumbnail/images, price/salePrice/currentPrice/originalPrice/adultPrice, duration/durationText/durationDays/durationNights, maxParticipants/maxPeople/totalSeats/availableSeats/seats, destination/destinationName/destinations/selectedDestinationNames, status/tourStatus.
- Ho tro schedules/tourSchedules/departures, images/gallery/tourImages/galleryImages, itinerary/itineraries/tourItinerary/tourItineraries.
- Khi detail API loi nhung co fallback row, panel van hien thi du lieu co ban va chi hien warning nho.
- Khong de panel quay ve Tour chua dat ten/Chua co gia/Chua cap nhat neu bang tour da co du lieu.

### API Da Dung

- GET /api/admin/tours/{id} thong qua AdminTourApiService.getTour(id).

### Ket Qua Build/Test

- npx ng build --configuration development: pass.
- npm run build: pass.

### Warning/Loi Con Lai

- Production build con warning budget hien huu: initial bundle, public-layout.scss, home-hero.scss, destinations.scss, categories.scss, tour-form.scss.
- tours.scss van co warning budget mem 8 kB va dang duoi hard budget 10 kB.
- Khong co loi compile.

### Ghi Chu Ky Thuat Va Rui Ro

- Neu backend detail thieu du lieu, panel dung du lieu row lam fallback cho thong tin co ban.
- schedules/images/itinerary chi hien thi day du khi API detail tra dung field tuong ung.
- Can kiem tra Network response thuc te tai GET /api/admin/tours/{id} de thong nhat DTO lau dai va giam alias mapping ve sau.
- Khong de lai console.log debug.
## Cập Nhật: Việt Hóa Text Tour Preview Panel

Thời gian cập nhật: 2026-06-07 00:06:43 +07:00

### File Đã Sửa

- src/app/shared/components/tour-preview-panel/tour-preview-panel.component.ts
- src/app/shared/components/tour-preview-panel/tour-preview-panel.component.html
- src/app/pages/admin/tours/tours.ts
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Đầu Việc Đã Làm

- Việt hóa các text hiển thị trong slide-over Xem trước tour sang tiếng Việt có dấu.
- Giữ nguyên logic fallback row, merge detail API, overlay, animation, body scroll lock và các emit action edit/publish/suspend.
- Không sửa Admin Destinations, TourForm, public pages, AdminLayout, API backend hoặc payload backend.
- Không ghi thay đổi admin vào VOYAGE_FRONTEND_AUDIT_REPORT.md.

### Chức Năng Đã Sửa

- Đổi các fallback/error/loading text như Không thể tải thông tin tour, Chưa có giá, Chưa cập nhật, Chưa có điểm đến, Tour chưa có mô tả.
- Đổi các label UI như Giá, Thời lượng, Số chỗ, Điểm đến, Mô tả, Lịch khởi hành, Lịch trình.
- Đổi badge/status/schedule text như Nháp, Đã xuất bản, Tạm ẩn, Hết chỗ, Còn chỗ, Gần hết, Đã hủy.
- Đổi action/footer text như Chỉnh sửa, Xuất bản, Tạm ẩn.
- Đổi format duration/seats/itinerary title sang có dấu: ngày, đêm, chỗ, Ngày N.
- Đổi thông báo lỗi mở preview trong Admin Tours sang tiếng Việt có dấu.

### Kết Quả Build/Test

- npx ng build --configuration development: pass.
- npm run build: pass.

### Warning/Lỗi Còn Lại

- Production build còn warning budget hiện hữu: initial bundle, destinations.scss, public-layout.scss, tours.scss, categories.scss, tour-form.scss, home-hero.scss.
- Không có lỗi compile.

### Ghi Chú Kỹ Thuật Và Rủi Ro

- Thay đổi chỉ nằm ở text hiển thị; không đổi mapping data, API call hoặc filter/action logic.
- Cần kiểm tra nhanh trên browser để xác nhận font render tiếng Việt đúng theo môi trường runtime.







## Cap Nhat: UI Dropdown Va Thu Vien Anh Tour Form

Thoi gian cap nhat: 2026-06-07 16:38:44 +07:00

### File Da Sua/Tao Moi

- src/app/pages/admin/tours/tour-form/tour-form.ts
- src/app/pages/admin/tours/tour-form/tour-form.html
- src/app/pages/admin/tours/tour-form/tour-form.scss
- src/app/pages/admin/tours/tour-form/tour-form-media.scss
- src/app/pages/admin/tours/tour-gallery/tour-gallery.html
- src/app/pages/admin/tours/tour-gallery/tour-gallery.scss
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Dau Viec Da Lam

- Doc VOYAGE_ADMIN_AUDIT_REPORT.md va VOYAGE_FRONTEND_AUDIT_REPORT.md, uu tien section admin moi nhat ve Tour Preview Panel va ghi nhan cac warning budget hien huu.
- Chi sua UI Tour Form va Tour Gallery lien quan dropdown/chevron, file picker, gallery card; khong sua Admin Tours list, Tour Preview Panel, Admin Destinations, Categories, Media page, AdminLayout, public pages hoac backend API.
- Khong ghi thay doi vao VOYAGE_FRONTEND_AUDIT_REPORT.md.

### Chuc Nang Da Sua

- Dong bo dropdown/chevron trong Tour Form cho Danh muc, Diem den, Diem khoi hanh va Trang thai.
- Native select duoc boc bang select wrapper, an native arrow bang CSS appearance va dung chevron custom bang CSS border, khong con ky tu v tho hoac arrow chong nhau.
- Custom multi-select Diem den bo inline style, them panel nen trang, option mot dong, hover nen nhe, text can trai va chevron xoay khi dropdown mo.
- Chinh hover/focus dropdown sang theme teal #1F6F68 voi border/shadow nhe; khong dung mau xanh cu #004FA8.
- Thay input file native trong khu upload anh dai dien bang UI chon file custom hien text Chon anh tu may va ten file/Chua chon anh.
- Chinh style phan Thu vien anh tour trong Tour Gallery: form mo ta anh + thu tu can hang, file picker custom, nut Tai anh moi/ Them anh da chon dong bo theme, disabled ro rang.
- Chinh card anh gallery gon hon: preview cao co dinh, border #DDE7E4, radius 14px, shadow nhe, badge Dang chon/Anh dai dien, action button nho gon.
- URL anh dai duoc dat trong box code co ellipsis/title de khong pha layout card.
- Empty state doi text thanh Chua co anh trong thu vien tour va goi y Tai anh moi hoac chon anh tu Media de them vao tour.
- Tach style media/upload cua Tour Form sang tour-form-media.scss de giu tour-form.scss duoi hard budget 10 kB.

### API Da Noi

- Khong noi API moi.
- Van giu flow hien co: AdminMediaApiService.uploadMedia(file, 'tours'), AdminTourApiService.attachTourImageFromMedia, getTourImages, update/delete/reorder/set thumbnail.

### Ket Qua Build/Test

- npx ng build --configuration development: pass.
- npm run build: pass.

### Warning/Loi Con Lai

- Production build con warning budget hien huu: initial bundle 859.40 kB vuot budget 500 kB.
- Cac warning style hien huu van con: public-layout.scss, home-hero.scss, destinations.scss, categories.scss, tours.scss.
- tour-form.scss con warning mem 8.86 kB, nhung duoi hard budget 10 kB nen production build pass.
- Khong co loi compile.

### Ghi Chu Ky Thuat Va Rui Ro

- Khong doi payload backend, khong doi formControlName va khong doi mapping category/destination/departure/status.
- Khong patch form trong getter, khong goi function tao list truc tiep trong template va khong them state co nguy co NG0103 infinite change detection.
- Flow upload/chon anh/add gallery hien co duoc giu nguyen; thay doi chi nam o markup/style UI.
- Neu backend gallery thieu URL hoac metadata, UI fallback an toan bang text Chua co URL/fallback image va khong lam vo card.
- Chua test thu cong tren browser that voi API runtime; can kiem tra click dropdown, upload file, attach media, set thumbnail va save tour tren moi truong dang chay backend.

## Cap Nhat: Fix Cuoi Dropdown Chevron Va Gallery Tour Form

Thoi gian cap nhat: 2026-06-07 16:50:22 +07:00

### File Da Sua

- src/app/pages/admin/tours/tour-form/tour-form.scss
- src/app/pages/admin/tours/tour-form/tour-form-media.scss
- src/app/pages/admin/tours/tour-gallery/tour-gallery.scss
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Dau Viec Da Lam

- Doc VOYAGE_ADMIN_AUDIT_REPORT.md va VOYAGE_FRONTEND_AUDIT_REPORT.md, uu tien section admin moi nhat ve UI Dropdown Va Thu Vien Anh Tour Form.
- Kiem tra truc tiep template va SCSS dang duoc Tour Form/Tour Gallery su dung de tim conflict CSS.
- Xac dinh nguyen nhan o Diem den bi nen teal dac: rule global trong Tour Form `button { background: var(--p); color: #fff; }` dang tac dong vao custom trigger `admin-tour-form__ms-trigger`.
- Chi sua cac class dang duoc template dung; khong sua Admin Tours list, Tour Preview Panel, Admin Destinations, Categories, Media page, AdminLayout, public pages hoac backend API.
- Khong ghi thay doi vao VOYAGE_FRONTEND_AUDIT_REPORT.md.

### Chuc Nang Da Sua

- Fix dropdown/chevron trong Tour Form lan cuoi cho Danh muc, Diem den, Diem khoi hanh va Trang thai.
- Sua o Diem den khong con nen teal dac: `admin-tour-form__ms-trigger` duoc override nen trang, text #0F172A, hover nen trang/xanh rat nhe.
- Dong bo style dropdown/select: height 44px, border #DDE7E4, radius 12px, focus border #1F6F68 va shadow nhe.
- Chinh chevron CSS border can giua doc, mau mac dinh #64748B, hover/focus/open doi sang #1F6F68, custom dropdown xoay khi mo.
- Chinh menu Diem den nen trang, option can trai, padding gon, selected dung nen mint nhe, khong dung text trang hoac block teal lon.
- Chinh file picker trong Thu vien anh tour va khu upload anh dai dien: input file native van bi an, button Chon anh tu may dung nen mint sang de doc hon, hover/focus ro hon.
- Chinh style button upload/add image trong Tour Gallery: `Tai anh moi` la primary teal ro, `Them anh da chon` la secondary sang nhung du tuong phan, disabled state co nen/ch? nhat ro rang.
- Chinh card anh gallery gon hon: giam chieu cao preview, grid card khong keo rong qua muc khi it anh, hover shadow nhe, title va URL ellipsis khong lam card cao bat thuong.
- Xu ly URL anh dai bang box code ellipsis/title, khong de Cloudinary URL pha layout.
- Toi uu `tour-gallery.scss` sau build de khong tao warning budget moi tu file nay.

### API Da Noi

- Khong noi API moi.
- Van giu nguyen cac API/flow hien co: upload media, attach media vao gallery, load gallery, delete image, set thumbnail va reorder image.

### Ket Qua Build/Test

- npx ng build --configuration development: pass.
- npm run build: pass.

### Warning/Loi Con Lai

- Production build con warning budget hien huu: initial bundle 859.40 kB vuot budget 500 kB.
- Cac warning style hien huu van con: categories.scss, destinations.scss, tours.scss, home-hero.scss, public-layout.scss.
- tour-form.scss con warning mem 9.30 kB, duoi hard budget 10 kB nen production build pass.
- Khong con warning budget moi tu tour-gallery.scss sau khi toi uu.
- Khong co loi compile.

### Ghi Chu Ky Thuat Va Rui Ro

- Khong doi payload backend, khong doi formControlName va khong doi mapping category/destination/departure/status.
- Khong doi endpoint, khong rewrite flow upload/chon anh/add gallery/set thumbnail.
- Khong patch form trong getter, khong goi function tao list truc tiep trong template va khong them logic co nguy co NG0103 infinite change detection.
- CSS conflict cu da duoc sua truc tiep tren class dang dung trong template, dac biet `admin-tour-form__ms-trigger`, `admin-tour-gallery__file-button`, `admin-tour-gallery__primary`, `admin-tour-gallery__secondary`.
- Chua test thu cong tren browser that voi API runtime; can kiem tra click dropdown, upload file, attach media, set thumbnail va luu/cap nhat tour tren moi truong backend dang chay.

## Cap Nhat: Ke Thua Chevron Admin Tours Filter Va An Spinner Number Tour Form

Thoi gian cap nhat: 2026-06-07 16:59:49 +07:00

### File Da Sua/Tao Moi

- src/app/pages/admin/tours/tour-form/tour-form.ts
- src/app/pages/admin/tours/tour-form/tour-form.html
- src/app/pages/admin/tours/tour-form/tour-form.scss
- src/app/pages/admin/tours/tour-form/tour-form-controls.scss
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Dau Viec Da Lam

- Doc VOYAGE_ADMIN_AUDIT_REPORT.md va VOYAGE_FRONTEND_AUDIT_REPORT.md, uu tien section admin moi nhat ve fix dropdown/gallery Tour Form.
- Tham khao pattern chevron dang hoat dong o Admin Tours filter trong tours.html, tours.scss va tours.ts.
- Xac nhan Admin Tours filter dung custom dropdown state `openedFilter`, SVG icon path `M5.5 7.5L10 12l4.5-4.5`, hover/open doi mau va open rotate 180 do.
- Chi sua Tour Form; khong sua logic Admin Tours list, Tour Preview Panel, Admin Destinations, Categories, Admin Media page, AdminLayout, public pages, backend API hoac payload backend.
- Khong ghi thay doi admin vao VOYAGE_FRONTEND_AUDIT_REPORT.md.

### Chuc Nang Da Sua

- Ke thua pattern chevron tu filter ngoai Admin Tours bang SVG chevron cung viewBox/path thay cho chevron CSS border.
- Fix chevron cho Danh muc, Diem den, Diem khoi hanh va Trang thai trong Tour Form.
- Native select van giu logic select/formControlName hien co, duoc boc wrapper va an native arrow bang `appearance: none`/`-webkit-appearance: none`.
- Custom dropdown Diem den giu logic multi-select hien co, trigger nen trang, text #0F172A, SVG chevron xoay 180 do khi mo.
- Hover/focus/open state dong bo: border #1F6F68, shadow nhe va chevron doi mau #1F6F68.
- Bo native arrow bi chong voi custom chevron; khong dung ky tu `v`, `?`, `?` lam chevron.
- Bo spinner native trong cac input number cua Tour Form bang CSS cho Chrome/Edge/Safari va Firefox.
- Cac input so van giu `type="number"`, min, validation va parse number hien co, nen khong anh huong payload backend.
- Tach style control/dropdown/number sang `tour-form-controls.scss` va dang ky trong `styleUrls` de tranh warning budget moi tren `tour-form.scss`.

### API Da Noi

- Khong noi API moi.
- Khong doi endpoint hoac payload backend.

### Ket Qua Build/Test

- npx ng build --configuration development: pass.
- npm run build: pass.

### Warning/Loi Con Lai

- Production build con warning budget hien huu: initial bundle 859.40 kB vuot budget 500 kB.
- Cac warning style hien huu van con: public-layout.scss, categories.scss, destinations.scss, tours.scss, home-hero.scss.
- Khong con warning budget tu tour-form.scss sau khi tach `tour-form-controls.scss`.
- Khong co loi compile.

### Ghi Chu Ky Thuat Va Rui Ro

- Da sua truc tiep class dang duoc template dung: `admin-tour-form__select-wrap`, `admin-tour-form__select`, `admin-tour-form__chevron`, `admin-tour-form__ms-trigger`, `admin-tour-form__ms-panel`, `admin-tour-form__control[type='number']`.
- Khong doi formControlName, enum value, endpoint, payload hoac flow Tour Form.
- Khong rewrite form, khong patch form trong getter, khong goi function tao list truc tiep trong template va khong them logic co nguy co NG0103.
- Chua test thu cong tren browser/API runtime; can kiem tra dropdown native/custom, number input khong con spinner, edit mode patch data va submit tour tren moi truong backend dang chay.

## Cap Nhat: Fix NG2008 Tour Form Controls Stylesheet

Thoi gian cap nhat: 2026-06-07 17:03:30 +07:00

### File Da Sua

- src/app/pages/admin/tours/tour-form/tour-form.ts
- src/app/pages/admin/tours/tour-form/tour-form.scss
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Dau Viec Da Lam

- Xu ly loi build NG2008: Angular compiler khong tim thay `./tour-form-controls.scss` trong `styleUrls` cua TourForm.
- Bo dependency vao stylesheet moi de tranh loi file moi/untracked/khong duoc moi truong build nhan ra.
- Gop lai style control/dropdown/number vao `tour-form.scss` la file san co va dang duoc Angular resolve on dinh.
- Xoa file `tour-form-controls.scss` khong con duoc su dung de tranh nham lan.
- Khong ghi thay doi vao VOYAGE_FRONTEND_AUDIT_REPORT.md.

### Chuc Nang Da Giu Nguyen

- SVG chevron ke thua pattern filter Admin Tours van giu cho Danh muc, Diem den, Diem khoi hanh va Trang thai.
- Native select van an native arrow va dung custom SVG chevron.
- Custom dropdown Diem den van xoay chevron khi mo.
- Number input van an spinner native tren Chrome/Edge/Safari/Firefox.
- Khong doi formControlName, endpoint, payload hoac flow Tour Form.

### Ket Qua Build/Test

- npx ng build --configuration development: pass.
- npm run build: pass.

### Warning/Loi Con Lai

- Khong con loi NG2008.
- Production build con warning budget hien huu: initial bundle, categories.scss, tours.scss, home-hero.scss, public-layout.scss, destinations.scss.
- tour-form.scss con warning mem 9.44 kB, duoi hard budget 10 kB nen production build pass.
- Khong co loi compile.

### Ghi Chu Ky Thuat Va Rui Ro

- Uu tien build on dinh hon viec tach stylesheet moi.
- `tour-form.scss` tiep tuc chua style control/dropdown/number de Angular compiler khong phu thuoc file controls moi.

## Cap Nhat: Dong Bo Custom Dropdown Tour Form Va Fix Chevron Cuoi

Thoi gian cap nhat: 2026-06-07 21:49:00 +07:00

### File Da Sua

- src/app/pages/admin/tours/tour-form/tour-form.ts
- src/app/pages/admin/tours/tour-form/tour-form.html
- src/app/pages/admin/tours/tour-form/tour-form.scss
- VOYAGE_ADMIN_AUDIT_REPORT.md

### Dau Viec Da Lam

- Doi cac native select trong Tour Form gom Danh muc, Diem khoi hanh va Trang thai sang custom dropdown cung pattern voi dropdown Diem den.
- Giu nguyen form control hien co va chi set value vao `categoryId`, `departureLocation`, `status` bang handler UI.
- Loai bo chevron dang ky tu/button tho o Diem den, thay bang SVG chevron cung pattern Admin Tours filter.
- Chinh trigger dropdown thanh dang input/select nen trang, can trai, khong con nhin nhu button teal.
- Dam bao dropdown dang mo co chevron xoay va dong dropdown khac khi mo mot dropdown moi.
- Tiep tuc giu CSS an native spinner cho input number da sua truoc do.
- Khong ghi thay doi admin vao VOYAGE_FRONTEND_AUDIT_REPORT.md.

### Chuc Nang Da Sua

- Danh muc: custom dropdown nen trang, chevron SVG ro, selected state nen mint nhe, set dung `categoryId`.
- Diem den: giu flow multi-select hien co, trigger khong con class/button style cu, chevron SVG xoay khi mo.
- Diem khoi hanh: custom dropdown chon duoc cac option hien co, set dung `departureLocation`.
- Trang thai: custom dropdown chon dung enum `DRAFT`, `PUBLISHED`, `INACTIVE`, `SOLD_OUT`.
- Hover/focus/open state dong bo border teal va shadow nhe.
- Khong con native select arrow chong custom chevron o cac field tren.

### API Da Noi

- Khong noi API moi.
- Khong doi endpoint hoac payload backend.

### Ket Qua Build/Test

- npx ng build --configuration development: pass.
- npm run build: pass.

### Warning/Loi Con Lai

- Production build con warning budget hien huu: initial bundle 859.40 kB vuot budget 500 kB.
- Cac warning style hien huu van con: public-layout.scss, categories.scss, destinations.scss, tours.scss, home-hero.scss.
- tour-form.scss warning mem: 9.77 kB vuot warning budget 8.00 kB nhung van duoi hard budget 10 kB nen build pass.
- Khong con loi NG2008 lien quan `tour-form-controls.scss`.

### Ghi Chu Ky Thuat Va Rui Ro

- Da sua truc tiep class dang render trong template: `admin-tour-form__select-wrap`, `admin-tour-form__select-trigger`, `admin-tour-form__ms-trigger`, `admin-tour-form__ms-panel`, `admin-tour-form__chevron`.
- Khong doi formControlName, enum value, endpoint, payload hoac flow submit Tour Form.
- Khong rewrite flow upload/chon anh/gallery.
- Custom dropdown hien chua co click-outside close rieng; dropdown se dong khi chon option hoac mo dropdown khac.
