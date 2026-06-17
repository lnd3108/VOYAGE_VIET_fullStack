# VOYAGE_ADMIN_DESTINATION_AUDIT_REPORT.md

Thoi gian cap nhat: 2026-06-12

## Muc tieu

Refactor Admin Destinations theo huong giong Admin Categories nhung lam theo buoc an toan:

- Tach helper thuan logic ra file rieng.
- Tach toolbar filter thanh component rieng.
- Khong doi API.
- Khong doi payload.
- Khong doi backend.
- Khong doi UI/hanh vi loc hien tai.

## File code da tao

- `src/app/pages/admin/destinations/destination-utils.ts`
- `src/app/pages/admin/destinations/components/destination-filter/destination-filter.ts`
- `src/app/pages/admin/destinations/components/destination-filter/destination-filter.html`
- `src/app/pages/admin/destinations/components/destination-filter/destination-filter.scss`

## File code da sua

- `src/app/pages/admin/destinations/destinations.ts`
- `src/app/pages/admin/destinations/destinations.html`

## Noi dung da lam

### 1. Tach helper thuan logic

Da tao `destination-utils.ts` va di chuyen/tao cac helper thuan logic:

- `parseStatus`
- `statusLabel`
- `statusClass`
- `workflowLabel`
- `workflowClass`
- `isDisplayEnabled`
- `isDisplayValueEnabled`
- `displayLabel`
- `displayClass`
- `hasPendingData`
- `formatRegion`
- `formatDate`
- `getDestinationImage`
- `normalizeText`
- `generateSlug`

Trong `destinations.ts`, cac method public/private dang duoc template va logic hien tai goi van duoc giu ten cu, nhung delegate sang helper moi de giam rui ro refactor.

### 2. Tach component filter

Da tao `AdminDestinationFilterComponent` tai:

- `src/app/pages/admin/destinations/components/destination-filter/`

Component nhan `@Input`:

- `keyword`
- `statusFilter`
- `regionFilter`
- `statusFilters`
- `regionFilters`
- `totalCount`
- `filteredCount`

Component emit `@Output`:

- `keywordChange`
- `statusFilterChange`
- `regionFilterChange`
- `search`
- `reset`

Toolbar filter trong `destinations.html` da duoc thay bang:

- `<app-admin-destination-filter />`

Parent `AdminDestinations` van giu:

- `applyFilters()`
- `statusFilter`
- `regionFilter`
- `keyword`
- danh sach filter options
- danh sach destinations/filteredDestinations

### 3. Giu nguyen UI

- Component filter tiep tuc dung class `admin-destinations__toolbar`, `admin-destinations__control-wrap`, `admin-destinations__select-*` de giu markup/style cu.
- Do Angular style encapsulation khong cho style parent apply vao template child, cac rule CSS can thiet cua toolbar/select da duoc copy sang `destination-filter.scss`.
- Khong them nut visible moi, khong doi layout filter, khong doi text label.
- Hanh vi filter hien tai duoc giu: thay doi keyword/status/region van goi `applyFilters()`.

## API / Payload / Backend

- Khong them API moi.
- Khong xoa API cu.
- Khong doi request payload.
- Khong sua backend.

## Ket qua build

- `npx ng build --configuration development`: pass.
- `npm run build`: pass.

## Warning con lai

Production build van con cac warning budget hien huu:

- Initial bundle vuot warning budget 500 kB.
- Mot so SCSS vuot warning budget mem 8 kB nhung duoi hard budget, gom:
  - `src/app/pages/public/home/components/home-hero/home-hero.scss`
  - `src/app/pages/admin/tours/tour-form/tour-form.scss`
  - `src/app/pages/admin/categories/components/category-detail-panel/category-detail-panel.scss`
  - `src/app/pages/admin/categories/components/category-form/category-form.scss`
  - `src/app/pages/admin/destinations/destinations.scss`
  - `src/app/layouts/public-layout/public-layout.scss`
  - `src/app/pages/admin/tours/tours.scss`

## Ghi chu/rui ro

- Buoc nay chi refactor helper va filter, chua tach table/action/bulk/detail/form cua Admin Destinations.
- `destinations.ts` van la container lon cho nghiep vu create/edit/workflow/batch/media.
- Nen test browser thu cong lai filter sau khi reload app:
  - keyword
  - workflow status
  - region
  - count filtered/total
  - dropdown close on outside click/Escape

---

## Admin Destinations - Server-side paging va API workflow moi

Thoi gian cap nhat: 2026-06-17

### 1. File da sua/tao

Da sua:

- `src/app/core/api/admin-destination-api.service.ts`
- `src/app/pages/admin/destinations/destinations.ts`
- `src/app/pages/admin/destinations/destinations.html`

Khong tao file moi.

Ghi chu model:

- `PageResponse<T>` da co san tai `src/app/core/models/page-response.model.ts`, nen reuse va khong tao trung.
- `DestinationPageParams` da co san tai `src/app/core/models/destination.model.ts`, nen reuse va khong tao trung.

### 2. API frontend da noi

Trong `AdminDestinationApiService`:

- `getDestinationsPage(params)`: `GET /api/admin/destinations/page`.
- `getDestinationById(id)`: `GET /api/admin/destinations/{id}`.
- `createAndSubmitDestination(payload)`: `POST /api/admin/destinations/submit-create`.
- `copyDestination(id)`: `POST /api/admin/destinations/{id}/copy`.

Behavior service:

- Cac API moi unwrap `ApiResponse.data` bang helper `unwrapData(...)`.
- `getDestinationsPage(...)` bo qua param `null`, `undefined`, blank va gia tri `ALL`.
- `getDestinations()` cu van duoc giu de backward compatibility.
- Khong xoa API cu.

### 3. Thay doi list/filter/paging

Admin Destinations da dung backend paging API:

- `loadDestinations(...)` goi `getDestinationsPage(...)`.
- Truyen `page`, `size`, `keyword`, `status`, `region`, `sort`.
- Sau khi response ve, cap nhat `destinations`, `filteredDestinations`, `page`, `size`, `totalElements`, `totalPages`, `first`, `last`.
- `applyFilters()` reset `page = 0` roi reload API.
- Doi keyword/status/region tiep tuc goi lai API server-side.
- Doi page/size goi lai API.
- Batch selection duoc clear khi load page moi de tranh thao tac nham du lieu trang cu.
- Count filter dung `filteredDestinations.length` cho current page va `totalElements` cho tong so.

Pagination UI da co:

- Hien thi tong so destination.
- Hien thi `Trang {{ page + 1 }} / {{ totalPages || 1 }}`.
- Nut `Truoc`, `Sau`.
- Page size `10`, `20`, `50`.

### 4. Submit-create/copy/reject reason

Submit-create:

- Nut `Luu va gui duyet` chi hien trong create mode.
- Goi `createAndSubmitDestination(...)`.
- Reuse validation va payload create hien co.
- Sau thanh cong dong form va reload list.
- Da giu lai success message sau reload list, tranh bi `loadDestinations()` xoa mat.

Copy:

- Row action `Sao chep` goi `copyDestination(id)`.
- Khong copy o frontend.
- Sau thanh cong reload current page va hien success message.

Reject reason:

- Single reject va batch reject deu trim reason truoc khi goi API.
- Khong goi API neu reason rong hoac chi co khoang trang.
- Body single reject dung dang `{ reason: reason.trim() }`.
- Batch reject gui `{ ids, reason }` qua service hien co.
- Them `maxlength="500"` cho textarea reject single va batch de khop backend validation.

### 5. Build/test result

Da chay:

- `npx ng build --configuration development`: PASS sau khi chay ngoai sandbox. Lan chay trong sandbox fail voi `spawn EPERM`.
- `npm run build`: PASS sau khi chay ngoai sandbox. Lan chay trong sandbox fail voi `spawn EPERM`.
- `npm test -- --watch=false`: FAIL do cac spec admin cu ngoai pham vi import sai exported component.

Test fail chi tiet:

- `src/app/pages/admin/audit-logs/audit-logs.spec.ts`: import `AuditLogs` khong ton tai.
- `src/app/pages/admin/bookings/bookings.spec.ts`: import `Bookings` khong ton tai.
- `src/app/pages/admin/features/features.spec.ts`: import `Features` khong ton tai.
- `src/app/pages/admin/media/media.spec.ts`: import `Media` khong ton tai.
- `src/app/pages/admin/reviews/reviews.spec.ts`: import `Reviews` khong ton tai.
- `src/app/pages/admin/tours/tours.spec.ts`: import `Tours` khong ton tai.
- `src/app/pages/admin/users/users.spec.ts`: import `Users` khong ton tai.

Browser/manual test:

- Chua thuc hien duoc trong phien nay vi in-app browser instance `iab` khong available.
- Da xac nhan port `4200` dang listen.

### 6. Warning/loi con lai

Production build van con warning budget hien huu:

- Initial bundle vuot warning budget 500 kB.
- Mot so SCSS vuot warning budget mem 8 kB, gom:
  - `src/app/pages/admin/tours/tour-form/tour-form.scss`
  - `src/app/pages/admin/tours/tours.scss`
  - `src/app/pages/admin/destinations/destinations.scss`
  - `src/app/pages/admin/categories/components/category-form/category-form.scss`
  - `src/app/pages/admin/categories/components/category-detail-panel/category-detail-panel.scss`
  - `src/app/layouts/public-layout/public-layout.scss`
  - `src/app/pages/public/home/components/home-hero/home-hero.scss`

### 7. Ghi chu khong lam trong luot nay

- Khong sua backend.
- Khong sua public frontend.
- Khong doi Tour payload.
- Khong lam reorder.
- Khong them AG Grid.
- Khong dung `/status` de bat/tat public; display van dung `/display`.
- Chua tach form/detail/bulk/media.
- `destinations.ts` van con lon, cac component table/form/detail/bulk se tach o task sau.

---

## Admin Destinations - Tach table va row actions

Thoi gian cap nhat: 2026-06-17

### 1. File da sua/tao

Da tao:

- `src/app/pages/admin/destinations/components/destination-table/destination-table.ts`
- `src/app/pages/admin/destinations/components/destination-table/destination-table.html`
- `src/app/pages/admin/destinations/components/destination-table/destination-table.scss`
- `src/app/pages/admin/destinations/components/destination-action-cell/destination-action-cell.ts`
- `src/app/pages/admin/destinations/components/destination-action-cell/destination-action-cell.html`
- `src/app/pages/admin/destinations/components/destination-action-cell/destination-action-cell.scss`

Da sua:

- `src/app/pages/admin/destinations/destinations.ts`
- `src/app/pages/admin/destinations/destinations.html`
- `src/app/pages/admin/destinations/destinations.scss`
- `report/VOYAGE_ADMIN_DESTINATION_AUDIT_REPORT.md`

### 2. Component da tach

Da tao `AdminDestinationTableComponent`:

- Nhan list `destinations`, `loading`, selection ids, paging state va action loading ids.
- Render custom table hien co, khong dung AG Grid.
- Chua skeleton loading, list rows, pagination va empty state.
- Emit selection, row actions, pagination va create tu empty state len parent.
- Dung lai helper label/format trong `destination-utils.ts`.

Da tao `AdminDestinationActionCellComponent`:

- Render inline buttons nhu UI hien tai.
- Nhan boolean permission/action da tinh san tu parent/table.
- Emit event `edit`, `copy`, `submit`, `approve`, `reject`, `cancelApprove`, `show`, `hide`, `delete`.
- Khong goi API truc tiep.
- Co `stopPropagation()` cho click/mousedown action.

### 3. Logic giu o parent

`AdminDestinations` van giu nguyen cac logic nghiep vu:

- Server-side paging va `loadDestinations(...)`.
- Filter server-side qua component filter hien co.
- Pagination state `page`, `size`, `totalElements`, `totalPages`, `first`, `last`.
- Selection state `selectedDestinationIds`, `selectedBatchDestinations`, `selectedBatchCount`.
- Batch toolbar va batch workflow.
- Workflow API calls submit/approve/reject/cancel/display.
- Copy API.
- Delete API.
- Pending review panel.
- Form create/edit.
- Media/image upload.

Parent chi them wrapper/predicate de truyen xuong table:

- `canEditDestinationForTable`
- `canSubmitDestinationForTable`
- `canApproveDestinationForTable`
- `canRejectDestinationForTable`
- `canCancelApproveDestinationForTable`
- `canUpdateDisplayForTable`
- `handleDestinationSelectionToggle(...)`
- `handleDestinationDisplayToggle(...)`

### 4. UI/API co doi khong

- UI giu custom table va inline row buttons nhu truoc.
- Filter component khong doi.
- Batch toolbar khong tach va khong doi.
- Pending review/detail panel khong tach va khong doi.
- API khong doi.
- Workflow rule khong doi.
- Khong dung `/status` de bat/tat public; display van dung `/display`.
- Khong them AG Grid.

### 5. Build/test result

Da chay:

- `npx ng build --configuration development`: PASS sau khi chay ngoai sandbox. Lan chay trong sandbox fail voi `spawn EPERM`.
- `npm run build`: PASS sau khi chay ngoai sandbox. Lan chay trong sandbox fail voi `spawn EPERM`.
- `npm test -- --watch=false`: FAIL do cac spec admin cu ngoai pham vi import sai exported component.

Test fail chi tiet:

- `src/app/pages/admin/audit-logs/audit-logs.spec.ts`: import `AuditLogs` khong ton tai.
- `src/app/pages/admin/bookings/bookings.spec.ts`: import `Bookings` khong ton tai.
- `src/app/pages/admin/features/features.spec.ts`: import `Features` khong ton tai.
- `src/app/pages/admin/media/media.spec.ts`: import `Media` khong ton tai.
- `src/app/pages/admin/reviews/reviews.spec.ts`: import `Reviews` khong ton tai.
- `src/app/pages/admin/tours/tours.spec.ts`: import `Tours` khong ton tai.
- `src/app/pages/admin/users/users.spec.ts`: import `Users` khong ton tai.

### 6. Warning/loi con lai

- Browser/manual test chua thuc hien trong phien nay.
- Production build van con warning budget hien huu:
  - Initial bundle vuot warning budget 500 kB.
  - `src/app/layouts/public-layout/public-layout.scss`.
  - `src/app/pages/admin/tours/tours.scss`.
  - `src/app/pages/admin/tours/tour-form/tour-form.scss`.
  - `src/app/pages/admin/categories/components/category-detail-panel/category-detail-panel.scss`.
  - `src/app/pages/admin/categories/components/category-form/category-form.scss`.
  - `src/app/pages/public/home/components/home-hero/home-hero.scss`.
- `src/app/pages/admin/destinations/destinations.scss` khong con nam trong danh sach warning budget sau khi tach CSS table/action.
- `npm test -- --watch=false` fail do cac spec admin cu ngoai pham vi: AuditLogs, Bookings, Features, Media, Reviews, Tours, Users.
- `destinations.ts` da nhe hon phan table/action nhung van con lon do con giu form/detail/bulk/media/workflow.

### 7. Ghi chu khong lam trong luot nay

- Khong sua backend.
- Khong sua public frontend.
- Khong doi Tour payload.
- Khong lam reorder.
- Khong tach form/detail/bulk.
- Khong doi workflow rule.
- Khong doi server-side paging hien co.

---

## Admin Destinations - Tach bulk actions va chuyen logic batch vao component

Thoi gian cap nhat: 2026-06-17

### 1. File da sua/tao

Da tao:

- `src/app/pages/admin/destinations/components/destination-bulk-actions/destination-bulk-actions.ts`
- `src/app/pages/admin/destinations/components/destination-bulk-actions/destination-bulk-actions.html`
- `src/app/pages/admin/destinations/components/destination-bulk-actions/destination-bulk-actions.scss`

Da sua:

- `src/app/pages/admin/destinations/destinations.ts`
- `src/app/pages/admin/destinations/destinations.html`
- `src/app/pages/admin/destinations/destinations.scss`
- `report/VOYAGE_ADMIN_DESTINATION_AUDIT_REPORT.md`

### 2. Component da tach

Da tao `AdminDestinationBulkActionsComponent`:

- Nhan `selectedDestinations`.
- Tu render toolbar batch.
- Tu quan ly `batchProcessing`, `batchErrorMessage`, `batchRejectMode`, `batchRejectReason`.
- Tu tinh eligibility tung action batch.
- Tu validate reject reason khong rong.
- Tu confirm truoc khi goi API.
- Tu goi API batch qua `AdminDestinationApiService`.
- Tu xu ly response success/fail va feedback.
- Emit `clearSelection` va `completed` de parent clear selected ids va reload list.

### 3. Logic da chuyen vao component

Da chuyen khoi parent va dua vao bulk component:

- Hien thi batch toolbar.
- Enable/disable cac action batch.
- Reject mode va reject reason.
- Validate reject reason blank.
- Confirm thao tac hang loat, co dem tong selected, so hop le va so bi bo qua.
- API calls:
  - `submitDestinations(ids)`
  - `approveDestinations(ids)`
  - `rejectDestinations(ids, reason)`
  - `cancelApproveDestinations(ids)`
  - `updateDestinationsDisplay(ids, 1)`
  - `updateDestinationsDisplay(ids, 0)`
- Parse `DestinationBatchActionResponse`.
- Feedback success/warning/error.

Rule giu nguyen:

- Batch toolbar chi render khi co selected destination va role `ADMIN` hoac `SUPER_ADMIN`.
- Submit hop le voi `DRAFT`, `REJECTED`, `CANCEL_APPROVE`.
- Approve/Reject/Cancel approve giu rule hien tai cua parent cu: `PENDING`.
- Show/Hide chi voi `APPROVED` va display state tuong ung.
- Display batch van dung `/batch/display`, khong dung `/status`.

### 4. Logic con o parent

`AdminDestinations` van giu:

- `selectedDestinationIds`.
- `selectedBatchDestinations`.
- `selectedBatchCount`.
- `clearBatchSelection()`.
- `syncBatchSelection()`.
- `loadDestinations(...)`.
- Single workflow actions.
- Pending review/detail.
- Form create/edit.
- Media/image.

Parent khong con giu:

- `batchProcessing`.
- `batchErrorMessage`.
- `batchRejectMode`.
- `batchRejectReason`.
- `runBatchAction(...)`.
- `canRunBatchAction(...)`.
- `updateBatchRejectReason(...)`.
- `cancelBatchReject(...)`.
- Batch response parsing helper.

### 5. UI/API co doi khong

- UI batch toolbar giu text va inline button nhu truoc.
- Textarea reject batch giu `maxlength="500"`.
- API khong doi.
- Khong sua backend.
- Khong sua public frontend.
- Khong doi Tour payload.
- Khong lam reorder.
- Khong them AG Grid.

### 6. Build/test result

Da chay:

- `npx ng build --configuration development`: PASS sau khi chay ngoai sandbox. Lan chay trong sandbox fail voi `spawn EPERM`.
- `npm run build`: PASS sau khi chay ngoai sandbox. Lan chay trong sandbox fail voi `spawn EPERM`.
- `npm test -- --watch=false`: FAIL do cac spec admin cu ngoai pham vi import sai exported component.

Test fail chi tiet:

- `src/app/pages/admin/audit-logs/audit-logs.spec.ts`: import `AuditLogs` khong ton tai.
- `src/app/pages/admin/bookings/bookings.spec.ts`: import `Bookings` khong ton tai.
- `src/app/pages/admin/features/features.spec.ts`: import `Features` khong ton tai.
- `src/app/pages/admin/media/media.spec.ts`: import `Media` khong ton tai.
- `src/app/pages/admin/reviews/reviews.spec.ts`: import `Reviews` khong ton tai.
- `src/app/pages/admin/tours/tours.spec.ts`: import `Tours` khong ton tai.
- `src/app/pages/admin/users/users.spec.ts`: import `Users` khong ton tai.

### 7. Warning/loi con lai

- Browser/manual test chua thuc hien trong phien nay.
- Production build van con warning budget hien huu:
  - Initial bundle vuot warning budget 500 kB.
  - `src/app/layouts/public-layout/public-layout.scss`.
  - `src/app/pages/admin/categories/components/category-detail-panel/category-detail-panel.scss`.
  - `src/app/pages/admin/tours/tours.scss`.
  - `src/app/pages/public/home/components/home-hero/home-hero.scss`.
  - `src/app/pages/admin/tours/tour-form/tour-form.scss`.
  - `src/app/pages/admin/categories/components/category-form/category-form.scss`.
- `npm test -- --watch=false` fail do cac spec admin cu ngoai pham vi: AuditLogs, Bookings, Features, Media, Reviews, Tours, Users.
- `destinations.ts` van con giu form/detail/media va single workflow actions.

### 8. Ghi chu khong lam trong luot nay

- Khong sua backend.
- Khong sua public frontend.
- Khong doi Tour payload.
- Khong lam reorder.
- Chua tach form/detail/media.

---

## Admin Destinations - Tach detail panel va chuyen logic pending review vao component

Thoi gian cap nhat: 2026-06-17

### 1. File da sua/tao

Da tao:

- `src/app/pages/admin/destinations/components/destination-detail-panel/destination-detail-panel.ts`
- `src/app/pages/admin/destinations/components/destination-detail-panel/destination-detail-panel.html`
- `src/app/pages/admin/destinations/components/destination-detail-panel/destination-detail-panel.scss`

Da sua:

- `src/app/pages/admin/destinations/destinations.ts`
- `src/app/pages/admin/destinations/destinations.html`
- `src/app/pages/admin/destinations/destinations.scss`
- `report/VOYAGE_ADMIN_DESTINATION_AUDIT_REPORT.md`

### 2. Component da tach

Da tao `AdminDestinationDetailPanelComponent`:

- Nhan `destination`.
- Tu build view model detail/pending review.
- Tu parse `newData` an toan.
- Tu so sanh du lieu hien tai va du lieu cho duyet.
- Tu render old/new data, anh cu/moi va fallback anh loi.
- Tu quan ly reject mode, reject reason va submitting state.
- Tu xu ly approve/reject/cancel approve trong panel.
- Tu confirm truoc khi approve va cancel approve theo pattern Admin Categories.
- Emit `completed` de parent reload list.
- Emit `closed` de parent dong modal.

### 3. Logic da chuyen vao component

Da chuyen khoi parent:

- `pendingReview` view model.
- `pendingRejectMode`.
- `pendingRejectReason`.
- `pendingReviewSubmitting`.
- Build pending review view model.
- Parse `destination.newData`.
- Build comparison rows.
- Format pending value status/display/region/number/image/text.
- Validate reject reason khong rong.
- Goi API panel:
  - `approveDestination(id)`.
  - `rejectDestination(id, { reason })`.
  - `cancelApproveDestination(id)`.
- Feedback success/error trong panel.

Rule giu nguyen:

- Approve/Reject chi hien voi status `PENDING`, parse data hop le va role `ADMIN`/`SUPER_ADMIN`.
- Cancel approve trong panel giu rule cu cua parent: status `PENDING` va role `ADMIN`/`SUPER_ADMIN`.
- Reject reason trim truoc khi gui.
- Khong dung `/status`.

### 4. Logic con o parent

`AdminDestinations` chi con giu:

- `detailDestination`.
- `openPendingReview(destination)`: set destination.
- `closePendingReview()`: clear destination.
- Reload list khi detail panel emit `completed`.

Parent van giu cac phan ngoai pham vi task:

- Form create/edit.
- Media/image.
- Single row workflow actions ngoai panel.
- Table/filter/paging/bulk components.

### 5. UI/API co doi khong

- UI detail panel giu gan voi panel cu: header, badge workflow/display, bang so sanh old/new, reject box va action buttons.
- Textarea reject co `maxlength="500"`.
- API khong doi.
- Khong sua backend.
- Khong sua public frontend.
- Khong doi Tour payload.
- Khong lam reorder.
- Khong them AG Grid.

### 6. Build/test result

Da chay:

- `npx ng build --configuration development`: PASS sau khi chay ngoai sandbox. Lan chay trong sandbox fail voi `spawn EPERM`.
- `npm run build`: PASS sau khi chay ngoai sandbox. Lan chay trong sandbox fail voi `spawn EPERM`.
- `npm test -- --watch=false`: FAIL do cac spec admin cu ngoai pham vi import sai exported component.

Test fail chi tiet:

- `src/app/pages/admin/audit-logs/audit-logs.spec.ts`: import `AuditLogs` khong ton tai.
- `src/app/pages/admin/bookings/bookings.spec.ts`: import `Bookings` khong ton tai.
- `src/app/pages/admin/features/features.spec.ts`: import `Features` khong ton tai.
- `src/app/pages/admin/media/media.spec.ts`: import `Media` khong ton tai.
- `src/app/pages/admin/reviews/reviews.spec.ts`: import `Reviews` khong ton tai.
- `src/app/pages/admin/tours/tours.spec.ts`: import `Tours` khong ton tai.
- `src/app/pages/admin/users/users.spec.ts`: import `Users` khong ton tai.

### 7. Warning/loi con lai

- Browser/manual test chua thuc hien trong phien nay.
- Production build con warning budget hien huu:
  - Initial bundle vuot warning budget 500 kB, total 876.00 kB.
  - `src/app/layouts/public-layout/public-layout.scss`.
  - `src/app/pages/admin/categories/components/category-detail-panel/category-detail-panel.scss`.
  - `src/app/pages/admin/categories/components/category-form/category-form.scss`.
  - `src/app/pages/admin/tours/tour-form/tour-form.scss`.
  - `src/app/pages/admin/tours/tours.scss`.
  - `src/app/pages/public/home/components/home-hero/home-hero.scss`.
- `npm test -- --watch=false` fail do cac spec admin cu ngoai pham vi: AuditLogs, Bookings, Features, Media, Reviews, Tours, Users.
- `destinations.ts` van con giu form/media va mot so single workflow actions.

### 8. Ghi chu khong lam trong luot nay

- Khong sua backend.
- Khong sua public frontend.
- Khong doi Tour payload.
- Khong lam reorder.
- Chua tach form/media.

---

## Admin Destinations - Tach form va chuyen logic create/edit/media vao component

Thoi gian cap nhat: 2026-06-17

### 1. File da sua/tao

Da tao:

- `src/app/pages/admin/destinations/components/destination-form/destination-form.ts`
- `src/app/pages/admin/destinations/components/destination-form/destination-form.html`
- `src/app/pages/admin/destinations/components/destination-form/destination-form.scss`

Da sua:

- `src/app/pages/admin/destinations/destinations.ts`
- `src/app/pages/admin/destinations/destinations.html`
- `report/VOYAGE_ADMIN_DESTINATION_AUDIT_REPORT.md`

Khong co `VOYAGE_ADMIN_AUDIT_REPORT.md` trong repo nen khong cap nhat file tong hop nay.

### 2. Component da tach

Da tao `AdminDestinationFormComponent` standalone:

- Nhan `destination` va `mode` (`create`/`edit`).
- Emit `closed` de parent dong form.
- Emit `completed` de parent reload list.
- Import va dung lai `AdminImageUpload` voi `uploadModule="destinations"` de upload anh qua Admin Media hien co.

### 3. Logic da chuyen vao component

Da chuyen khoi parent vao form component:

- Reactive Form.
- Create mode va edit mode.
- Create thuong.
- Create va gui duyet qua `createAndSubmitDestination(...)`.
- Update destination qua `updateDestination(...)`.
- Update anh rieng qua `updateDestinationImage(...)`.
- Build create/update payload giu field hien co.
- Validate required fields va `markAllAsTouched()` khi submit loi.
- Auto-generate slug khi chon tinh/thanh/thanh pho, giu slug thu cong neu user da sua.
- Domestic/international mode.
- Region/subRegion va province autocomplete tu backend proxy.
- Country autocomplete tu service hien co.
- City autocomplete, fallback danh sach du phong va cho nhap tay khi API city loi.
- Image upload/URL qua `AdminImageUpload`.
- Preview anh va fallback anh loi.
- Feedback success/error.
- Dong form va emit reload list sau khi thao tac create/update thanh cong.

### 4. Logic con o parent

`AdminDestinations` con giu:

- `isFormOpen`.
- `isEditMode`.
- `selectedDestination`.
- `openCreateForm()`.
- `openEditForm(destination)`.
- `closeForm()`.
- Reload list khi form emit `completed`.
- Selection/table/filter/paging/bulk/detail panel.
- Single row workflow actions ngoai form: submit/approve/reject/cancel approve/display/copy/delete.

Parent khong con goi API create/update/submit-create/update-image cua form.

### 5. UI/API co doi khong

- UI form giu class prefix `admin-destinations__...` va layout gan voi UI cu.
- API khong doi.
- Khong sua backend.
- Khong sua public frontend.
- Khong doi Tour payload.
- Khong lam reorder.
- Khong them AG Grid.
- Khong dung `/status` de bat/tat public; display van dung `/display`.
- Khong goi Cloudinary truc tiep tu frontend.
- Upload anh van di qua Admin Media/shared `AdminImageUpload`.

### 6. Build/test result

Da chay:

- `npx ng build --configuration development`: PASS sau khi chay ngoai sandbox. Lan chay trong sandbox fail voi `spawn EPERM`.
- `npm run build`: PASS sau khi chay ngoai sandbox. Lan chay trong sandbox fail voi `spawn EPERM`.
- `npm test -- --watch=false`: FAIL do cac spec admin cu ngoai pham vi import sai exported component.

Test fail chi tiet:

- `src/app/pages/admin/audit-logs/audit-logs.spec.ts`: import `AuditLogs` khong ton tai.
- `src/app/pages/admin/bookings/bookings.spec.ts`: import `Bookings` khong ton tai.
- `src/app/pages/admin/features/features.spec.ts`: import `Features` khong ton tai.
- `src/app/pages/admin/media/media.spec.ts`: import `Media` khong ton tai.
- `src/app/pages/admin/reviews/reviews.spec.ts`: import `Reviews` khong ton tai.
- `src/app/pages/admin/tours/tours.spec.ts`: import `Tours` khong ton tai.
- `src/app/pages/admin/users/users.spec.ts`: import `Users` khong ton tai.

### 7. Warning/loi con lai

- Browser/manual test chua thuc hien trong phien nay.
- Production build con warning budget hien huu:
  - Initial bundle vuot warning budget 500 kB, total 876.00 kB.
  - `src/app/layouts/public-layout/public-layout.scss`.
  - `src/app/pages/admin/categories/components/category-detail-panel/category-detail-panel.scss`.
  - `src/app/pages/admin/categories/components/category-form/category-form.scss`.
  - `src/app/pages/admin/tours/tour-form/tour-form.scss`.
  - `src/app/pages/admin/tours/tours.scss`.
  - `src/app/pages/public/home/components/home-hero/home-hero.scss`.
- `npm test -- --watch=false` fail do cac spec admin cu ngoai pham vi: AuditLogs, Bookings, Features, Media, Reviews, Tours, Users.

### 8. Ghi chu/rui ro

- Chua thuc hien browser/manual test cac luong create/edit domestic/international.
- `destinations.ts` da nhe hon phan form/media/location nhung van con single row workflow actions ngoai form.
- Cac thay doi frontend chi nam trong Admin Destinations.

## Admin Destinations - Chuyen filter va row actions vao component

### 1. File da sua/tao

- `src/app/pages/admin/destinations/destinations.ts`
- `src/app/pages/admin/destinations/destinations.html`
- `src/app/pages/admin/destinations/components/destination-filter/destination-filter.ts`
- `src/app/pages/admin/destinations/components/destination-filter/destination-filter.html`
- `src/app/pages/admin/destinations/components/destination-action-cell/destination-action-cell.ts`
- `src/app/pages/admin/destinations/components/destination-action-cell/destination-action-cell.html`
- `src/app/pages/admin/destinations/components/destination-table/destination-table.ts`
- `src/app/pages/admin/destinations/components/destination-table/destination-table.html`
- `report/VOYAGE_ADMIN_DESTINATION_AUDIT_REPORT.md`

Khong tim thay `VOYAGE_ADMIN_AUDIT_REPORT.md`; report duoc cap nhat vao file audit destination hien co.

### 2. Logic filter da chuyen vao component

`AdminDestinationFilterComponent` hien tu quan ly:

- `keywordDraft`.
- `statusDraft`.
- `regionDraft`.
- Danh sach option status/region.
- Chon status/region.
- Search keyword.
- Reset filter.

Component emit mot object duy nhat `DestinationFilterValue` qua `filterChange`:

- `keyword`
- `status`
- `region`

Parent khong con giu `keyword`, `statusFilters`, `regionFilters`, cac output rieng `keywordChange/statusFilterChange/regionFilterChange/search/reset`.

### 3. Logic row actions da chuyen vao component

`AdminDestinationActionCellComponent` hien tu xu ly single-row actions:

- Tinh quyen hien thi nut theo role/status.
- Submit.
- Approve.
- Cancel approve.
- Show/hide public bang API `/display`.
- Copy.
- Delete voi confirm danger.
- Feedback success/error.
- Loading state rieng cua tung action trong cell.
- Emit `completed` de parent reload list.
- Emit `editRequested` de parent mo form edit.
- Emit `reviewRequested` de parent mo detail panel.

Nut reject khong reject nhanh; van emit `reviewRequested` de mo detail panel.

### 4. Logic con o parent

`AdminDestinations` chi con giu:

- Load list/paging/sort page.
- `currentFilters` object va goi load khi filter component emit.
- Selection va batch selection.
- Open/close create/edit form.
- Open/close detail panel review.
- Reload list khi child emit `completed`.
- Guard role cho nut create/edit va media link.

Parent khong con goi API submit/approve/cancel/display/copy/delete cho single row actions.

### 5. UI/API co doi khong

- UI khong doi ve luong chinh; chi doi ownership logic giua parent va child component.
- API khong doi.
- Khong sua backend.
- Khong sua public frontend.
- Khong doi Tour payload.
- Khong lam reorder.
- Khong them AG Grid.
- Khong dung `/status` de bat/tat public; display van dung `/display`.

### 6. Build/test result

Da chay:

- `npx ng build --configuration development`: PASS sau khi chay ngoai sandbox. Lan chay trong sandbox fail voi `spawn EPERM`.
- `npm run build`: PASS sau khi chay ngoai sandbox. Lan chay trong sandbox fail voi `spawn EPERM`.
- `npm test -- --watch=false`: FAIL do cac spec admin cu ngoai pham vi import sai exported component.

Test fail chi tiet:

- `src/app/pages/admin/audit-logs/audit-logs.spec.ts`: import `AuditLogs` khong ton tai.
- `src/app/pages/admin/bookings/bookings.spec.ts`: import `Bookings` khong ton tai.
- `src/app/pages/admin/features/features.spec.ts`: import `Features` khong ton tai.
- `src/app/pages/admin/media/media.spec.ts`: import `Media` khong ton tai.
- `src/app/pages/admin/reviews/reviews.spec.ts`: import `Reviews` khong ton tai.
- `src/app/pages/admin/tours/tours.spec.ts`: import `Tours` khong ton tai.
- `src/app/pages/admin/users/users.spec.ts`: import `Users` khong ton tai.

### 7. Warning/loi con lai

- Production build con warning budget hien huu:
  - Initial bundle vuot warning budget 500 kB, total 876.00 kB.
  - `src/app/pages/admin/categories/components/category-detail-panel/category-detail-panel.scss`.
  - `src/app/pages/admin/tours/tours.scss`.
  - `src/app/pages/admin/categories/components/category-form/category-form.scss`.
  - `src/app/layouts/public-layout/public-layout.scss`.
  - `src/app/pages/public/home/components/home-hero/home-hero.scss`.
  - `src/app/pages/admin/tours/tour-form/tour-form.scss`.
- Browser/manual test chua thuc hien trong phien nay.

### 8. Ghi chu khong lam trong luot nay

- Khong sua backend.
- Khong sua public frontend.
- Khong doi Tour payload.
- Khong lam reorder.
- Khong sua cac spec admin cu dang fail vi nam ngoai pham vi.

## Admin Destinations - Cleanup container va QA refactor

### Thoi gian cap nhat

- 2026-06-17 10:45:43 +07:00

### File da sua

- `src/app/pages/admin/destinations/destinations.ts`
- `src/app/pages/admin/destinations/destinations.html`
- `src/app/pages/admin/destinations/destinations.scss`
- `src/app/pages/admin/destinations/components/destination-filter/destination-filter.scss`
- `report/VOYAGE_ADMIN_DESTINATION_AUDIT_REPORT.md`

Khong tim thay `VOYAGE_ADMIN_AUDIT_REPORT.md`, nen khong co file audit admin tong de cap nhat them.

### Dead code/import da xoa

- Xoa `successMessage` khoi parent vi cac component con da dung `AdminUiFeedbackService`.
- Xoa notice block trong `destinations.html`.
- Rut gon `loadDestinations(...)` ve `loadDestinations()` vi khong con preserve success message.
- Xoa CSS form cu khoi `destinations.scss`:
  - `__form`
  - `__form-head`
  - `__form-grid`
  - `__field`
  - `__control-wrap`
  - autocomplete/select/menu cua form cu
  - mode selector
  - preview image
  - form action styles
- Xoa CSS parent khong con phu hop voi table/bulk/detail/filter sau khi component con da co SCSS rieng.
- Giu lai trong parent SCSS chi page wrapper, header, top actions va error box.
- Them card/reset style vao `destination-filter.scss` de filter tu so huu UI cua no, khong phu thuoc parent.

### Parent hien con giu logic gi

`AdminDestinations` hien chi con vai tro container orchestration:

- Load list server-side paging qua `getDestinationsPage(...)`.
- Giu `currentFilters`, page, size, total, first/last va sort.
- Reset page ve 0 khi filter component emit `filterChange`.
- Selection va batch selection.
- Mo/dong create/edit form.
- Mo/dong detail panel pending review.
- Reload list khi form/table/bulk/detail emit `completed`.
- Role guard cho nut them moi va link Media.
- Error message khi load list/role guard bi tu choi.

Parent khong con:

- Reactive Form.
- Create/update/submit-create API.
- Domestic/international/province/country/city state.
- Image update state.
- Single row workflow API.
- Batch workflow API.
- Pending review parse/newData logic.
- Filter draft state hoac filter options.
- Loading state rieng cua child components.

### Component con hien so huu logic gi

- `destination-filter`: giu keyword/status/region draft, option filter, reset filter va emit `DestinationFilterValue`; khong goi API, khong client-side filter.
- `destination-table`: render list/table/pagination/empty state, selection va forward `editRequested`, `reviewRequested`, `completed`; khong goi workflow API.
- `destination-action-cell`: tu tinh permission, tu goi API single row, tu feedback, emit `completed`; edit/review chi emit; khong quick reject.
- `destination-bulk-actions`: tu tinh eligible rows, validate reject reason, confirm, goi batch API, feedback, emit `completed`/`clearSelection`.
- `destination-detail-panel`: tu parse `newData`, hien old/new data, xu ly approve/reject/cancel approve trong panel, reject reason bat buoc, emit `completed`/`closed`.
- `destination-form`: tu xu ly create/edit/submit-create/image/location, khong goi Cloudinary truc tiep, emit `completed`/`closed`.

### UI/API co doi khong

- UI khong doi lon; chi cleanup ownership va dua filter card/reset style ve dung component.
- API khong doi.
- Khong sua backend.
- Khong sua public frontend.
- Khong doi Tour payload.
- Khong lam reorder.
- Khong them AG Grid.
- Khong dung `/status` de bat/tat public; display van dung `/display`.
- Khong doi workflow rule.
- Khong doi payload create/update.
- Khong doi behavior filter/paging.

### Build/test result

Da chay:

- `npx ng build --configuration development`: PASS sau khi chay ngoai sandbox. Lan chay trong sandbox fail voi `spawn EPERM`.
- `npm run build`: PASS sau khi chay ngoai sandbox. Lan chay trong sandbox fail voi `spawn EPERM`.
- `npm test -- --watch=false`: FAIL do cac spec admin cu ngoai pham vi import sai exported component.

Test fail chi tiet:

- `src/app/pages/admin/audit-logs/audit-logs.spec.ts`: import `AuditLogs` khong ton tai.
- `src/app/pages/admin/bookings/bookings.spec.ts`: import `Bookings` khong ton tai.
- `src/app/pages/admin/features/features.spec.ts`: import `Features` khong ton tai.
- `src/app/pages/admin/media/media.spec.ts`: import `Media` khong ton tai.
- `src/app/pages/admin/reviews/reviews.spec.ts`: import `Reviews` khong ton tai.
- `src/app/pages/admin/tours/tours.spec.ts`: import `Tours` khong ton tai.
- `src/app/pages/admin/users/users.spec.ts`: import `Users` khong ton tai.

### Browser QA result

- Chua chay duoc browser QA trong phien nay.
- Dev server dang listen port 4200, nhung Browser plugin tra ve `Browser is not available: iab`.
- Khong thuc hien manual click/visual QA do khong co browser surface kha dung.

### Checklist browser QA can test

Load/filter/paging:

- `/admin/destinations` load list.
- List API la `GET /api/admin/destinations/page`.
- Keyword filter goi server-side API.
- Status filter goi server-side API.
- Region filter goi server-side API.
- Reset filter dua ve mac dinh.
- Previous/Next giu filter hien tai.
- Page size 10/20/50 hoat dong.
- Doi page/filter thi selection clear.

Form:

- Tao diem den trong nuoc DRAFT.
- Tao diem den trong nuoc bang `Luu va gui duyet` thanh PENDING.
- Tao diem den quoc te voi country/city.
- API ngoai loi van nhap tay city duoc.
- Edit destination patch dung.
- Upload/preview anh khong loi.
- Slug auto-generate dung.
- User sua slug thu cong khong bi ghi de.

Row actions:

- Sua mo form edit.
- Gui duyet row goi API.
- Duyet row goi API neu action hien thi.
- Tu choi row mo detail panel.
- Huy trinh duyet row goi API.
- Hien thi/An public goi `/display`.
- Sao chep tao ban DRAFT moi.
- Xoa co confirm danger.

Bulk actions:

- Chon nhieu dong hien bulk toolbar.
- Bo chon an bulk toolbar.
- Batch submit.
- Batch approve.
- Batch reject reason rong khong goi API.
- Batch reject reason hop le goi API.
- Batch cancel approve.
- Batch show/hide.

Detail panel:

- Mo detail panel voi destination co `newData`.
- Old/new data hien thi dung.
- JSON `newData` loi khong crash.
- Approve trong panel.
- Reject trong panel reason rong khong goi API.
- Reject trong panel reason hop le.
- Cancel approve trong panel neu workflow hop le.

Role:

- STAFF khong thay approve/reject/cancel/display/delete/batch vuot quyen.
- ADMIN thay approve/reject/cancel/display/batch, khong delete.
- SUPER_ADMIN thay delete neu workflow hop le.

### Warning/loi con lai

- Production build con warning budget hien huu:
  - Initial bundle vuot warning budget 500 kB, total 876.00 kB.
  - `src/app/layouts/public-layout/public-layout.scss`.
  - `src/app/pages/public/home/components/home-hero/home-hero.scss`.
  - `src/app/pages/admin/tours/tour-form/tour-form.scss`.
  - `src/app/pages/admin/categories/components/category-form/category-form.scss`.
  - `src/app/pages/admin/tours/tours.scss`.
  - `src/app/pages/admin/categories/components/category-detail-panel/category-detail-panel.scss`.
- `npm test -- --watch=false` van fail do cac spec admin cu ngoai pham vi.

### Ghi chu/rui ro

- Khong sua spec admin cu ngoai pham vi.
- Browser QA can duoc chay lai khi Browser plugin hoac browser surface kha dung.
- Cleanup chi gioi han trong Admin Destinations frontend.
