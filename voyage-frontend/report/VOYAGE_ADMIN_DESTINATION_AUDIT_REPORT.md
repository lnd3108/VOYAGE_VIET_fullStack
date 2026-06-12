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
