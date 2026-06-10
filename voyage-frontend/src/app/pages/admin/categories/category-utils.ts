import { AdminCategory, CategoryStatus } from '../../../core/models/category.model';

export const CATEGORY_FALLBACK_IMAGE = '/hero/bg-home.png';

export function parseCategoryStatus(status?: string | null): CategoryStatus | null {
  return status === 'DRAFT' ||
    status === 'PENDING' ||
    status === 'APPROVED' ||
    status === 'REJECTED' ||
    status === 'CANCEL_APPROVE'
    ? status
    : null;
}

export function parseNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function getCategoryOrder(category: AdminCategory): number {
  const order =
    parseNumber(category.displayOrder) ??
    parseNumber(category.sortOrder) ??
    parseNumber(category.orderIndex) ??
    parseNumber(category.order) ??
    parseNumber(category.position);

  if (order === undefined || order < 1) {
    return Number.MAX_SAFE_INTEGER;
  }

  return Math.trunc(order);
}

export function normalizeDisplayOrder(value: unknown): number {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? Math.max(1, Math.trunc(numericValue)) : 1;
}

export function sortCategory(a: AdminCategory, b: AdminCategory): number {
  const orderA = getCategoryOrder(a);
  const orderB = getCategoryOrder(b);

  if (orderA !== orderB) {
    return orderA - orderB;
  }

  return (a.id ?? 0) - (b.id ?? 0);
}

export function normalizeCategory(value: unknown): AdminCategory | null {
  if (!isRecord(value)) {
    return null;
  }

  const category = value as AdminCategory;

  return {
    ...category,
    displayOrder: getCategoryOrder(category),
  };
}

export function extractCategoryItem(response: unknown): AdminCategory | null {
  if (isRecord(response) && isRecord(response['data'])) {
    return normalizeCategory(response['data']);
  }

  return normalizeCategory(response);
}

export function extractCategoryList(response: unknown): AdminCategory[] {
  if (Array.isArray(response)) {
    return response.map((item) => normalizeCategory(item)).filter(isCategory);
  }

  if (!isRecord(response)) {
    return [];
  }

  const data = response['data'];

  if (Array.isArray(data)) {
    return data.map((item) => normalizeCategory(item)).filter(isCategory);
  }

  if (isRecord(data) && Array.isArray(data['content'])) {
    return data['content'].map((item) => normalizeCategory(item)).filter(isCategory);
  }

  if (Array.isArray(response['content'])) {
    return response['content'].map((item) => normalizeCategory(item)).filter(isCategory);
  }

  return [];
}

export function normalizeCategoryOrders(categories: AdminCategory[]): AdminCategory[] {
  return [...categories]
    .sort((a, b) => sortCategory(a, b))
    .map((category, index) => ({
      ...category,
      displayOrder: index + 1,
    }));
}

export function isCategory(value: AdminCategory | null): value is AdminCategory {
  return !!value;
}

export function generateCategorySlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeSlugValue(value: unknown): string {
  const rawValue = normalizeText(value);
  return generateCategorySlug(rawValue) || rawValue;
}

export function isCategoryDisplayEnabled(value: unknown): boolean {
  return value === 1 || value === true || value === '1' || value === 'true';
}

export function workflowLabel(status?: string | null): string {
  switch (parseCategoryStatus(status)) {
    case 'PENDING':
      return 'Chờ duyệt';
    case 'APPROVED':
      return 'Đã duyệt';
    case 'REJECTED':
      return 'Từ chối';
    case 'CANCEL_APPROVE':
      return 'Hủy trình duyệt';
    case 'DRAFT':
    default:
      return 'Nháp';
  }
}

export function workflowClass(status?: string | null): string {
  return `admin-categories__workflow--${(parseCategoryStatus(status) || 'DRAFT').toLowerCase().replace('_', '-')}`;
}

export function displayLabel(category: AdminCategory): string {
  if (parseCategoryStatus(category.status) !== 'APPROVED' && isCategoryDisplayEnabled(category.isDisplay)) {
    return 'Chưa thể hiển thị';
  }

  return isCategoryDisplayEnabled(category.isDisplay) ? 'Đang hiển thị' : 'Đang ẩn';
}

export function displayClass(category: AdminCategory): string {
  if (parseCategoryStatus(category.status) !== 'APPROVED' && isCategoryDisplayEnabled(category.isDisplay)) {
    return 'admin-categories__display--blocked';
  }

  return isCategoryDisplayEnabled(category.isDisplay)
    ? 'admin-categories__display--visible'
    : 'admin-categories__display--hidden';
}

export function parseDate(value?: string): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTime(date: Date | null): string {
  if (!date) {
    return '-';
  }

  const part = (value: number) => `${value}`.padStart(2, '0');

  return `${part(date.getDate())}/${part(date.getMonth() + 1)}/${date.getFullYear()} ${part(date.getHours())}:${part(date.getMinutes())}`;
}

export function formatDate(value?: string): string {
  return formatDateTime(parseDate(value));
}

export function errorText(error: unknown, fallback: string): string {
  if (isRecord(error)) {
    const status = parseNumber(error['status']);

    if (status === 403) {
      return 'Bạn không có quyền thực hiện thao tác này.';
    }

    if (status === 401) {
      return 'Phiên đăng nhập admin không hợp lệ hoặc đã hết hạn.';
    }

    const errorBody = error['error'];

    if (isRecord(errorBody) && typeof errorBody['message'] === 'string') {
      return errorBody['message'];
    }
  }

  return fallback;
}

export function mediaErrorText(error: unknown, fallback: string): string {
  if (isRecord(error) && parseNumber(error['status']) === 403) {
    return 'Bạn không có quyền thao tác với Media này.';
  }

  return errorText(error, fallback);
}

export function handleCategoryImageError(event: Event): void {
  const image = event.target as HTMLImageElement;

  if (image.src.endsWith(CATEGORY_FALLBACK_IMAGE)) {
    return;
  }

  image.src = CATEGORY_FALLBACK_IMAGE;
}

export function hasPendingCategoryChange(category: AdminCategory): boolean {
  return (
    parseCategoryStatus(category.status) === 'PENDING' ||
    (typeof category.newData === 'string' && category.newData.trim().length > 0)
  );
}

export function currentCategoryImage(category: AdminCategory): string {
  return category.imageUrl || CATEGORY_FALLBACK_IMAGE;
}

export function getCreatedDateValue(category: AdminCategory): string | undefined {
  return category.createdAt || category.createdDate || category.createdOn;
}

export function getUpdatedDateValue(category: AdminCategory): string | undefined {
  return (
    category.updatedAt ||
    category.updatedDate ||
    category.updatedOn ||
    category.modifiedAt ||
    category.lastModifiedAt
  );
}

export function shouldShowUpdatedDate(createdDate: Date | null, updatedDate: Date | null): boolean {
  if (!updatedDate) {
    return false;
  }

  return !createdDate || createdDate.getTime() !== updatedDate.getTime();
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
