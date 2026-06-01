export type ReviewStatus = 'ACTIVE' | 'HIDDEN';

export interface ReviewResponse {
  id: number;
  userId?: number;
  userFullName?: string;
  userAvatarUrl?: string;
  tourId?: number;
  tourTitle?: string;
  tourSlug?: string;
  rating: number;
  comment?: string;
  status?: ReviewStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewCreateRequest {
  tourId: number;
  rating: number;
  comment?: string;
}
