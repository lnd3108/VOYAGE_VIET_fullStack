import { TourCardResponse } from './tour.model';

export interface WishlistListParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface WishlistItem {
  id?: number;
  tour?: Partial<TourCardResponse>;
  tourId?: number;
  tourTitle?: string;
  tourSlug?: string;
  thumbnailUrl?: string;
  originalPrice?: number;
  salePrice?: number;
  durationDays?: number;
  durationNights?: number;
  departureLocation?: string;
  availableSeats?: number;
  categoryName?: string;
  categorySlug?: string;
  destinationName?: string;
  destinationSlug?: string;
  destinationRegion?: string;
  averageRating?: number;
  reviewCount?: number;
  createdAt?: string;
}

export interface WishlistToggleResponse {
  wishlisted?: boolean;
  added?: boolean;
  removed?: boolean;
  tourId?: number;
  message?: string;
}
