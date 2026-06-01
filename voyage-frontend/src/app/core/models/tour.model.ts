export type TourStatus = 'DRAFT' | 'PUBLISHED' | 'INACTIVE' | 'SOLD_OUT';

export interface TourCardResponse {
  id: number;
  title: string;
  slug: string;
  shortDescription?: string;
  thumbnailUrl?: string;
  originalPrice: number;
  salePrice?: number;
  durationDays: number;
  durationNights: number;
  departureLocation?: string;
  availableSeats: number;
  featured: boolean;
  status: TourStatus;

  categoryName: string;
  categorySlug: string;

  destinationName: string;
  destinationSlug: string;
  destinationRegion?: string;

  averageRating: number;
  reviewCount: number;
}

export interface TourDetailResponse {
  id: number;
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  thumbnailUrl?: string;
  originalPrice: number;
  salePrice?: number;
  durationDays: number;
  durationNights: number;
  departureLocation?: string;
  maxParticipants: number;
  availableSeats: number;
  featured: boolean;
  status: TourStatus;

  averageRating: number;
  reviewCount: number;

  categoryId?: number;
  categoryName: string;
  categorySlug: string;

  destinationId?: number;
  destinationName: string;
  destinationSlug: string;
  destinationRegion?: string;
  destinationCountry?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface TourSearchParams {
  keyword?: string;
  categorySlug?: string;
  destinationSlug?: string;
  region?: string;
  departureLocation?: string;
  minPrice?: number;
  maxPrice?: number;
  minDurationDays?: number;
  maxDurationDays?: number;
  people?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  size?: number;
}
