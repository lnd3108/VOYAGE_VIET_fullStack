export type CategoryStatus = 'ACTIVE' | 'INACTIVE';

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  status: CategoryStatus;
  displayOrder?: number;
  createdAt?: string;
  createdDate?: string;
  createdOn?: string;
  updatedAt?: string;
  updatedDate?: string;
  updatedOn?: string;
  modifiedAt?: string;
  lastModifiedAt?: string;
}

export interface AdminCategory {
  id?: number;
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  status?: CategoryStatus | string;
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
}

export interface AdminCategoryCreateRequest {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
}

export interface AdminCategoryUpdateRequest extends AdminCategoryCreateRequest {
  status?: CategoryStatus;
}

export interface AdminCategoryOrderSwapItem {
  id: number;
  payload: AdminCategoryUpdateRequest;
}
