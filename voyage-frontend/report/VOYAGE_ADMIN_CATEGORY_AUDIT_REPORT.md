# VOYAGE_ADMIN_AUDIT_REPORT.md - Ban rut gon

Thoi gian cap nhat: 2026-06-12 09:24:18 +07:00

## Nguyen tac ghi nhan

- Chi ghi thay doi lien quan admin frontend vao file nay.
- Khong ghi thay doi admin vao `VOYAGE_FRONTEND_AUDIT_REPORT.md`.
- Chi giu trang thai cuoi cua tung module, khong giu log thu sai, fix UI lap lai hoac build loi trung gian da xu ly.
- Backend/API chi duoc nhac den khi frontend admin dang su dung truc tiep.

## Pham vi da hoan thien

- Admin Layout
- Admin UI Feedback
- Admin Media / Cloudinary
- Admin Categories
- Admin Destinations
- Admin Tours List
- Admin Tour Preview Panel
- Admin Tour Create/Edit Form
- Admin Tour Gallery
- Admin Tour Itinerary
- Admin Tour Schedules
- E2E Admin Tour voi backend that

---

# 1. Admin Layout

## File chinh

- `src/app/layouts/admin-layout/admin-layout.html`
- `src/app/layouts/admin-layout/admin-layout.scss`
- `src/app/layouts/admin-layout/admin-layout.ts`

## Trang thai cuoi

- Admin layout dung rail icon ben trai va menu panel theo nhom.
- Cac nhom chinh:
  - Tong quan
  - Noi dung
  - Van hanh
  - He thong
  - Khac
- Active group dong bo theo URL admin hien tai.
- Co nut an/hien rail.
- Content admin scroll doc lap, topbar sticky trong vung content.
- Desktop on dinh; mobile/tablet chuyen layout de tranh vo UI.
- Sidebar/menu dung theme teal/green, khong dung mau xanh cu `#004FA8`.
- Role-based menu giu theo guard hien co.

## Icon hien tai

- Root `Van hanh`: briefcase-business style.
- Root `He thong`: settings style.
- Menu con:
  - Danh muc: layout-grid
  - Diem den: map-pin
  - Tour: plane
  - Booking: notebook
  - Danh gia: star
  - Nguoi dung: users
  - Media: book-image
  - Tinh nang: toggle-left style
  - Audit Logs: clipboard-clock

## Ghi chu

- Icon dang la inline SVG trong `admin-layout.html`, khong them dependency icon moi.
- Khong them link route chua ton tai nhu Visa/Flights.

---

# 2. Admin UI Feedback

## File chinh

- `src/app/core/services/admin-ui-feedback.service.ts`
- `src/app/core/services/admin-confirm-dialog.component.ts`
- `src/app/core/services/admin-confirm-dialog.component.scss`

## Trang thai cuoi

- Thay `window.confirm` va `window.alert` bang Taiga UI dialog/notification.
- Service chung ho tro:
  - success
  - error
  - warning
  - info
  - confirm danger
  - confirm warning
  - confirm info
- Confirm dialog dung nen sang, chu ro, nut theo theme teal/green.
- Danger action dung mau do.
- Co co che giam notification trung lap.

## Ghi chu

- `AdminUiFeedbackService.confirm*()` tra ve `Observable<boolean>`.
- Component goi confirm nen dung `take(1)`.

---

# 3. Admin Media / Cloudinary

## File chinh

- `src/app/pages/admin/media/media.ts`
- `src/app/pages/admin/media/media.html`
- `src/app/pages/admin/media/media.scss`
- `src/app/core/api/admin-media-api.service.ts`
- `src/app/core/models/media.model.ts`

## API dang dung

- `GET /api/admin/media`
- `POST /api/admin/media/upload`
- `DELETE /api/admin/media/{id}`

## Trang thai cuoi

- Upload anh qua backend len Cloudinary, khong goi Cloudinary truc tiep tu frontend.
- Khong luu anh base64.
- Validate file PNG/JPG/JPEG/WEBP, toi da 5MB.
- Preview anh truoc upload.
- Media grid responsive.
- Loc theo module:
  - All
  - Tours
  - Categories
  - Destinations
  - Avatars
  - Banners
  - General
- Card media hien thi anh, filename/publicId, module, content type/media type, dung luong, ngay tao va URL rut gon.
- Ho tro copy URL, mo anh tab moi, xoa media bang confirm.
- Normalize URL tu nhieu alias response: `url`, `imageUrl`, `secureUrl`, `fileUrl`, `mediaUrl`, `data.url`, `data.secureUrl`.

## Ghi chu/rui ro

- Media la nguon anh chung cho Category, Destination, Tour thumbnail va Tour gallery.
- Xoa media dang duoc entity khac dung co the lam loi anh o noi dung da gan URL.

---

# 4. Admin Categories

## File chinh

- `src/app/pages/admin/categories/categories.ts`
- `src/app/pages/admin/categories/categories.html`
- `src/app/pages/admin/categories/categories.scss`
- `src/app/pages/admin/categories/category-utils.ts`
- `src/app/pages/admin/categories/components/category-filter/*`
- `src/app/pages/admin/categories/components/category-table/*`
- `src/app/pages/admin/categories/components/category-action-cell/*`
- `src/app/pages/admin/categories/components/category-bulk-actions/*`
- `src/app/pages/admin/categories/components/category-detail-panel/*`
- `src/app/pages/admin/categories/components/category-form/*`
- `src/app/core/api/admin-category-api.service.ts`
- `src/app/core/models/category.model.ts`

## Package dang dung

- `ag-grid-angular@35.3.1`
- `ag-grid-community@35.3.1`

## API dang dung

- `GET /api/admin/categories`
- `POST /api/admin/categories`
- `POST /api/admin/categories/submit-create`
- `PATCH /api/admin/categories/{id}`
- `PATCH /api/admin/categories/{id}/image`
- `PATCH /api/admin/categories/{id}/submit`
- `PATCH /api/admin/categories/{id}/approve`
- `PATCH /api/admin/categories/{id}/reject`
- `PATCH /api/admin/categories/{id}/cancel-approve`
- `PATCH /api/admin/categories/{id}/display`
- `DELETE /api/admin/categories/{id}`
- `PATCH /api/admin/categories/batch/submit`
- `PATCH /api/admin/categories/batch/approve`
- `PATCH /api/admin/categories/batch/reject`
- `PATCH /api/admin/categories/batch/cancel-approve`
- `PATCH /api/admin/categories/batch/display`
- `GET /api/admin/media`
- `POST /api/admin/media/upload`

## Trang thai cuoi

- Man hinh Categories da tach component:
  - filter
  - table
  - action cell
  - bulk actions
  - detail panel
  - form
- Parent `categories.ts` chu yeu quan ly load/reload list, filter state, open/close form/detail, selected rows va cac handler tong.
- Bang danh sach dung AG Grid Community.
- Co search/filter theo ten, slug, workflow.
- Filter dung draft state; chi ap dung khi bam Tim kiem hoac Enter.
- Co nut Xoa bo loc.
- Header list hien `Danh sach ban ghi` va badge so luong.
- Breadcrumb form dung `Noi dung > Danh muc > Them moi/Chinh sua/Sao chep`.
- Click row mo detail modal; click checkbox/action/button khong mo detail.

## Workflow va rule hien thi

- Workflow status:
  - `DRAFT`
  - `PENDING`
  - `APPROVED`
  - `REJECTED`
  - `CANCEL_APPROVE`
- Frontend parse them `4` hoac `'4'` la `APPROVED` de tuong thich response code.
- `isActive` chi co y nghia khi category `APPROVED`.
- Public display chi cho phep toggle khi `APPROVED + isActive=1`.
- Category hop le cho tour/public la `APPROVED + isActive + isDisplay`.
- `isDisplay`:
  - dang hien thi -> action la `An`
  - dang an -> action la `Hien thi`

## Bang va action menu

- Cac cot chinh:
  - checkbox
  - Anh
  - Ten danh muc
  - Slug
  - Trang thai
  - Hoat dong
  - Hien thi
  - Phe duyet
  - Ngay tao/cap nhat
  - Hanh dong
- Action menu la nut ba cham, render body-level de tranh bi AG Grid cat/che.
- Chi mot dropdown action duoc mo tai mot thoi diem.
- Icon action dung `TuiIcon` tao dong.
- Icon action thuong mau den/xam dam; danger action mau do.
- Action theo workflow:
  - `DRAFT/REJECTED/CANCEL_APPROVE`: sua, sao chep, gui duyet, xoa neu du dieu kien.
  - `PENDING`: sao chep, xem/duyet.
  - `APPROVED`: sao chep, an/hien thi public neu active, huy duyet.
- Xoa tung dong da noi API that va co confirm.
- Xoa chi hien/chay khi `SUPER_ADMIN`, status hop le, khong public va khong co pending `newData`.
- Reorder dang disable vi backend chua co endpoint reorder rieng; UI hien warning khi goi.

## Form category

- Ho tro create/edit/copy.
- Auto-generate slug tu ten, cho sua slug thu cong.
- Upload anh qua Admin Media module categories.
- Chon anh co san tu Media.
- Preview anh co fallback `/hero/bg-home.png`.
- Payload category gui `imageUrl`, khong gui file/mediaId.
- Create/copy khong cho set `isActive`; edit chi hien `isActive` khi category dang `APPROVED`.
- Co nut luu va luu/gui duyet theo rule hien co.

## Detail modal

- Detail la centered modal.
- Hien thi du lieu cu/du lieu moi theo 2 cot.
- Cac field chinh:
  - Ten danh muc
  - Duong dan
  - Mo ta
  - Anh danh muc
  - Hien thi
- Parse `newData` an toan; JSON loi hien error state thay vi crash.
- Co action workflow trong modal:
  - gui duyet
  - phe duyet
  - tu choi
  - huy duyet
  - an/hien thi
  - xoa
- Tu choi dung modal rieng, bat buoc ly do, gioi han 500 ky tu.

## Bulk actions

- Toolbar hien khi chon nhieu dong.
- Co cac action:
  - Gui duyet
  - Duyet
  - Tu choi
  - Huy duyet
  - Hien thi public
  - An public
  - Xoa
  - Bo chon
- Bulk action chi xu ly item hop le theo workflow va role.
- Confirm neu co item bi bo qua.
- Reject batch bat buoc ly do.
- Bulk delete goi `deleteCategory(id)` tung item hop le va tong hop ket qua.
- Sau batch: clear selection, reload list, hien success/warning theo response.

## Role/permission UI

- STAFF: xem, tao, sua, gui duyet; chi duoc dung Media trong module categories.
- ADMIN: them approve/reject/cancel/display/batch workflow; khong xoa category.
- SUPER_ADMIN: day du, gom xoa category.
- Backend van la lop enforce quyen chinh; frontend chi an action de UX dung.

## Ghi chu/rui ro

- Reorder category dang cho endpoint backend rieng.
- Action menu append vao `document.body`; can cleanup khi dong/destroy.
- Can QA browser cho cac flow role-sensitive sau moi dot thay doi lon.

---

# 5. Admin Destinations

## File chinh

- `src/app/pages/admin/destinations/destinations.ts`
- `src/app/pages/admin/destinations/destinations.html`
- `src/app/pages/admin/destinations/destinations.scss`
- `src/app/core/api/admin-destination-api.service.ts`
- `src/app/core/models/destination.model.ts`
- `src/app/core/api/vietnam-province-api.service.ts`
- `src/app/core/models/vietnam-province.model.ts`
- `src/app/pages/admin/shared/admin-image-upload/*`

## API dang dung

- `GET /api/admin/destinations`
- `POST /api/admin/destinations`
- `PUT /api/admin/destinations/{id}`
- `PATCH /api/admin/destinations/{id}/submit`
- `PATCH /api/admin/destinations/{id}/approve`
- `PATCH /api/admin/destinations/{id}/reject`
- `PATCH /api/admin/destinations/{id}/cancel-approve`
- `PATCH /api/admin/destinations/{id}/display`
- `PATCH /api/admin/destinations/{id}/image`
- `DELETE /api/admin/destinations/{id}`
- `PATCH /api/admin/destinations/batch/...`
- `GET /api/admin/locations/provinces`
- REST Countries / CountriesNow cho luong quoc te.

## Trang thai cuoi

- CRUD diem den.
- Workflow `DRAFT/PENDING/APPROVED/REJECTED/CANCEL_APPROVE`.
- Co `isDisplay`, `newData`, `rejectReason`.
- List co workflow badge, display badge, pending-data badge, checkbox va batch toolbar.
- Review panel parse `newData` an toan, so sanh field va co ly do tu choi.
- Role UI:
  - STAFF: tao/sua/gui duyet.
  - ADMIN/SUPER_ADMIN: duyet/tu choi/huy/display/batch.
  - SUPER_ADMIN: xoa.
- Form ho tro luong Trong nuoc/Quoc te.
- Trong nuoc dung mien va tinh/thanh tu backend proxy.
- Quoc te dung REST Countries va CountriesNow, co fallback nhap tay.
- Upload anh di qua Admin Media, khong goi Cloudinary truc tiep.
- Tour Form chi cho chon destination `APPROVED + isDisplay=1`; edit giu destination cu neu khong hop le va hien canh bao.

## Ghi chu/rui ro

- API ngoai REST Countries/CountriesNow co the loi runtime; UI co fallback.
- STAFF can duoc quyen read-only `GET /api/admin/locations/provinces`.

---

# 6. Admin Tours List

## File chinh

- `src/app/pages/admin/tours/tours.ts`
- `src/app/pages/admin/tours/tours.html`
- `src/app/pages/admin/tours/tours.scss`
- `src/app/core/api/admin-tour-api.service.ts`
- `src/app/core/models/admin-tour.model.ts`

## API dang dung

- `GET /api/admin/tours`
- `GET /api/admin/tours/{id}`
- `POST /api/admin/tours`
- `PUT /api/admin/tours/{id}`
- `PATCH /api/admin/tours/{id}/status`
- `PATCH /api/admin/tours/{id}/thumbnail`
- `DELETE /api/admin/tours/{id}`
- `GET /api/admin/tours/{id}/publish-checklist`
- `POST /api/admin/tours/{id}/publish`

## Trang thai cuoi

- Danh sach tour that thay placeholder.
- KPI: tong tour, da xuat ban, nhap, het cho.
- Search theo title, slug, category, destination, departure location.
- Filter theo trang thai, featured, danh muc, diem den va sap xep.
- Filter toolbar dung custom dropdown.
- Table hien tour, gia, thoi luong, so cho, featured, trang thai, cap nhat va hanh dong.
- Action menu ba cham ho tro:
  - xem truoc
  - chinh sua
  - nhan ban placeholder/TODO
  - cap nhat anh
  - publish/checklist
  - doi trang thai
  - xoa
- Xoa tour bang Taiga confirm.
- Publish checklist canh bao neu thieu du lieu.
- Format tien/ngay theo `vi-VN`.

## Ghi chu/rui ro

- API duplicate tour chua co; action nhan ban van la TODO.
- Dropdown action can test voi row sat viewport.

---

# 7. Admin Tour Preview Panel

## File chinh

- `src/app/shared/components/tour-preview-panel/*`
- `src/app/pages/admin/tours/tours.ts`
- `src/app/pages/admin/tours/tours.html`
- `src/app/pages/admin/tours/tours.scss`
- `src/app/core/models/admin-tour.model.ts`

## API dang dung

- `GET /api/admin/tours/{id}`

## Trang thai cuoi

- Slide-over preview ben phai khi bam `Xem truoc`.
- Co backdrop, ESC/overlay/close de dong.
- Khoa body scroll khi panel mo.
- Goi detail API va dung row fallback neu API cham/loi.
- Normalize response detail linh hoat qua `data`, `result`, `content` va wrapper long nhau.
- Hien thi anh, gia, thoi luong, so cho, diem den, mo ta, thong ke nhanh, lich khoi hanh va lich trinh.
- Mo ta dai co xem them/thu gon.
- Footer action emit ve Admin Tours, logic xu ly van nam o parent.

---

# 8. Admin Tour Create/Edit Form

## File chinh

- `src/app/pages/admin/tours/tour-form/tour-form.ts`
- `src/app/pages/admin/tours/tour-form/tour-form.html`
- `src/app/pages/admin/tours/tour-form/tour-form.scss`
- `src/app/pages/admin/tours/tour-form/tour-form-media.scss`
- `src/app/app.routes.ts`

## API dang dung

- `GET /api/admin/categories`
- `GET /api/admin/destinations`
- `GET /api/admin/tours/{id}`
- `POST /api/admin/tours`
- `PUT /api/admin/tours/{id}`
- `GET /api/admin/media`
- `POST /api/admin/media/upload`

## Trang thai cuoi

- Routes:
  - `/admin/tours/new`
  - `/admin/tours/:id/edit`
- Lazy load form.
- Reactive Forms voi validate title, slug, shortDescription, category, destination, departureLocation, gia, duration, participants, seats.
- Auto-generate slug tu title.
- Category/Destination chi cho chon ban hop le da duyet va dang public khi tao/chon moi.
- Edit giu category/destination cu neu khong hop le va hien canh bao.
- Diem khoi hanh co 3 option chuan va option tam neu du lieu cu khac.
- UI multi-select diem den nhung payload hien gui `destinationId` chinh.
- Media picker trong form:
  - chon tu Media
  - upload anh moi
  - nhap URL thu cong
- Autosave draft cho create mode.
- Preview card ben phai cap nhat theo form.
- Dropdown dung custom UI dong bo.

## Ghi chu/rui ro

- Backend tour hien chi luu mot `destinationId` chinh.
- Neu can luu nhieu destination that, backend can them `destinationIds` hoac bang lien ket.

---

# 9. Admin Tour Gallery

## File chinh

- `src/app/pages/admin/tours/tour-gallery/*`
- `src/app/core/api/admin-tour-api.service.ts`
- `src/app/core/models/admin-tour.model.ts`

## API dang dung

- `GET /api/admin/tours/{id}/images`
- `POST /api/admin/tours/{id}/images/from-media`
- `PATCH /api/admin/tours/{tourId}/images/{imageId}/alt`
- `PATCH /api/admin/tours/{tourId}/images/{imageId}/thumbnail`
- `PATCH /api/admin/tours/{id}/images/reorder`
- `DELETE /api/admin/tours/{tourId}/images/{imageId}`

## Trang thai cuoi

- Gallery tach component.
- Create mode yeu cau luu tour truoc.
- Edit mode load gallery theo tour id.
- Chon anh tu Admin Media va attach bang `mediaId`.
- Upload anh moi qua Admin Media truoc, sau do attach vao gallery.
- Khong goi Cloudinary truc tiep, khong dung base64/object URL lam URL that.
- Grid gallery responsive.
- Moi anh co preview, badge thumbnail, URL rut gon, alt text, sort order va cac action copy/mo/dat thumbnail/sua/len/xuong/xoa.
- Xoa anh bang confirm.
- Fallback anh loi `/hero/bg-home.png`.

## Ghi chu/rui ro

- Neu upload media response khong co `id/mediaId`, gallery khong attach duoc anh.

---

# 10. Admin Tour Itinerary

## File chinh

- `src/app/pages/admin/tours/tour-itinerary/*`
- `src/app/core/api/admin-tour-api.service.ts`
- `src/app/core/models/admin-tour.model.ts`

## API dang dung

- `GET /api/admin/tours/{id}/itineraries`
- `PUT /api/admin/tours/{id}/itineraries`
- `POST /api/admin/tours/{id}/itineraries/reorder`

## Trang thai cuoi

- Itinerary tach component.
- Create mode yeu cau luu tour truoc.
- Edit mode load lich trinh theo tour.
- Quan ly theo ngay: dayNumber, title, description, hotelName, meals, transportModes, activities, placeNames.
- Validate dayNumber, title va khong trung dayNumber.
- Them/sua/xoa bang bulk save.
- Timeline/card theo ngay.
- Reorder len/xuong.

## Ghi chu/rui ro

- Backend chua co endpoint create/update/delete tung itinerary item, frontend dung bulk replace-all.

---

# 11. Admin Tour Schedules

## File chinh

- `src/app/pages/admin/tours/tour-schedules/*`
- `src/app/core/api/admin-tour-api.service.ts`
- `src/app/core/models/admin-tour.model.ts`

## API dang dung

- `GET /api/admin/tours/{id}/schedules`
- `POST /api/admin/tours/{id}/schedules`
- `PUT /api/admin/tours/{tourId}/schedules/{id}`
- `PATCH /api/admin/tours/{tourId}/schedules/{id}/status`
- `DELETE /api/admin/tours/{tourId}/schedules/{id}`

## Trang thai cuoi

- Schedules tach component.
- Create mode yeu cau luu tour truoc.
- Edit mode load lich khoi hanh theo tour.
- Quan ly ngay khoi hanh/ngay ve, gia nguoi lon/tre em/em be, so cho toi da, trang thai, ghi chu.
- Validate ngay ve, gia, maxSeats va bookedSeats khi edit.
- Trang thai: `OPEN`, `CLOSED`, `FULL`, `CANCELLED`.
- Doi CLOSED/CANCELLED co confirm.
- Xoa lich co confirm va canh bao neu da co booking.
- Format tien/ngay theo `vi-VN`.

## Ghi chu/rui ro

- Schedule la nguon chinh cho gia/so cho khi booking.
- Backend van la lop bao ve cuoi cho oversell/optimistic lock.

---

# 12. E2E / QA da ghi nhan

## Backend/API that

- Da test Category workflow single va batch voi backend/DB local:
  - create
  - submit
  - reject
  - submit lai
  - approve
  - display show/hide
  - patch tao `newData`
  - cancel approve
  - batch submit/approve/reject/cancel/display
- Public category API chi tra `APPROVED + isDisplay=1`.
- Role Category:
  - STAFF: get/create/patch/submit pass; approve/reject/cancel/display/delete/batch bi 403.
  - ADMIN: approve/display/batch pass; delete bi 403.
  - SUPER_ADMIN: delete pass.
- Media STAFF:
  - duoc module categories/destinations theo rule da mo.
  - khong duoc all media/full page/delete.
- E2E Admin Tour voi backend that da test duoc create draft, attach media, itinerary, schedule, publish checklist, publish, public detail/schedules.

## Browser QA da ghi nhan

- Chrome headless da kiem tra `/admin/categories`, `/admin/destinations`, `/admin/tours/new`.
- STAFF bi chan `/admin/media`, khong thay link full Media.
- Khong phat hien exact mojibake pattern tren cac man admin da scan tai thoi diem QA.
- Upload file local bang browser automation chua thuc hien; quyen media da xac minh bang HTTP endpoint.

---

# 13. Build/Test gan day

## Frontend

- `npx ng build --configuration development`: pass trong cac dot cap nhat chinh.
- `npm run build`: pass sau cac thay doi gan day.

## Backend

- Cac dot lien quan Category/Destination workflow da ghi nhan:
  - `./mvnw.cmd clean test`: pass.
  - `./mvnw.cmd clean package -DskipTests`: pass.

## Warning hien huu

- Initial bundle vuot warning budget 500 kB.
- Mot so SCSS vuot warning budget mem 8 kB nhung duoi hard budget 10 kB, thuong gap:
  - `src/app/layouts/public-layout/public-layout.scss`
  - `src/app/pages/public/home/components/home-hero/home-hero.scss`
  - `src/app/pages/admin/destinations/destinations.scss`
  - `src/app/pages/admin/tours/tour-form/tour-form.scss`
  - `src/app/pages/admin/tours/tours.scss`
  - `src/app/pages/admin/categories/components/category-form/category-form.scss`
  - `src/app/pages/admin/categories/components/category-detail-panel/category-detail-panel.scss`
- Lazy chunk Admin Categories lon do AG Grid Community.

---

# 14. TODO / Rui ro con lai

- Admin Booking Detail frontend chua lam.
- WebSocket JWT handshake chua lam.
- Feature permission chi tiet chua hoan thien.
- API duplicate tour chua co; action `Nhan ban` tour van la TODO.
- Backend chua ho tro luu nhieu destination that cho tour; UI hien chi luu `destinationId` chinh.
- Backend chua co endpoint reorder rieng cho Categories; UI reorder dang disable/warning.
- Can test browser thu cong day du sau khi restart frontend/backend cho:
  - Category action menu row dau/giua/cuoi.
  - Category display toggle row va bulk.
  - Category delete row va bulk bang SUPER_ADMIN.
  - Category detail modal approve/reject/display/delete.
  - STAFF Media upload/chon anh trong Categories/Destinations.
  - Tour create/edit/gallery/itinerary/schedules.

---

# 15. Noi dung da loai bo khoi ban rut gon

- Log build trung gian da fix.
- Cac lan sua mau/icon/spacing lap lai.
- Cac thu sai chevron/dropdown/overlay khong con phan anh trang thai cuoi.
- Cac section mojibake cu da duoc thay bang trang thai QA/encoding hien tai.
- Cac prompt va ghi chu trung lap quanh cung mot thay doi.
- Cac mo ta chi tiet tung dong code khong anh huong nghiep vu.
