export type CategoryStatus = 'ACTIVE' | 'INACTIVE';

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  status: CategoryStatus;
  displayOrder?: number;
}
