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
  updatedAt?: string;
}

export interface AdminCategory {
  id?: number;
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  status?: CategoryStatus | string;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
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
