export type CategoryStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCEL_APPROVE';

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  status: CategoryStatus;
  isActive?: number | boolean | string | null;
  isDisplay?: number | boolean | null;
  rejectReason?: string | null;
  displayOrder?: number;
  createdAt?: string;
  createdDate?: string;
  createdOn?: string;
  updatedAt?: string;
  updatedDate?: string;
  updatedOn?: string;
  modifiedAt?: string;
  lastModifiedAt?: string;
  newData?: string | null;
}

export interface AdminCategory {
  id?: number;
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  status?: CategoryStatus | string;
  isActive?: number | boolean | string | null;
  isDisplay?: number | boolean | null;
  rejectReason?: string | null;
  displayOrder?: number;
  sortOrder?: number;
  orderIndex?: number;
  order?: number;
  position?: number;
  createdAt?: string;
  createdDate?: string;
  createdOn?: string;
  updatedAt?: string;
  updatedDate?: string;
  updatedOn?: string;
  modifiedAt?: string;
  lastModifiedAt?: string;
  newData?: string | null;
}

export interface AdminCategoryCreateRequest {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive?: number | boolean | null;
  displayOrder?: number;
}

export interface AdminCategoryUpdateRequest extends AdminCategoryCreateRequest {
}

export interface CategoryBatchActionItemResponse {
  id: number | null;
  name?: string | null;
  success: boolean;
  message?: string | null;
}

export interface CategoryBatchActionResponse {
  total: number;
  successCount: number;
  failedCount: number;
  successItems: CategoryBatchActionItemResponse[];
  failedItems: CategoryBatchActionItemResponse[];
}

export type CategoryDisplayValue = number | boolean | string | null | undefined;
export type CategoryActiveValue = number | boolean | string | null | undefined;

export interface CategoryNewData {
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  status?: CategoryStatus | string | null;
  isActive?: CategoryActiveValue;
  isDisplay?: CategoryDisplayValue;
  displayOrder?: number | string | null;
  sortOrder?: number | string | null;
  orderIndex?: number | string | null;
  order?: number | string | null;
  position?: number | string | null;
}

export function isCategoryDisplayEnabled(value: CategoryDisplayValue): boolean {
  return value === 1 || value === true || value === '1' || value === 'true';
}

export function isCategoryActive(value: CategoryActiveValue): boolean {
  return value === undefined || value === null || value === 1 || value === true || value === '1' || value === 'true';
}

export function isCategorySelectableForTour(category: Pick<AdminCategory, 'status' | 'isActive' | 'isDisplay'>): boolean {
  return category.status === 'APPROVED' && isCategoryActive(category.isActive) && isCategoryDisplayEnabled(category.isDisplay);
}
