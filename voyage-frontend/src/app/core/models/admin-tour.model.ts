export type TourStatus = 'DRAFT' | 'PUBLISHED' | 'INACTIVE' | 'SOLD_OUT';
export type TourScheduleStatus = 'OPEN' | 'CLOSED' | 'FULL' | 'CANCELLED';

export interface AdminTour {
  id?: number;
  title?: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  thumbnailUrl?: string;
  originalPrice?: number;
  salePrice?: number;
  durationDays?: number;
  durationNights?: number;
  departureLocation?: string;
  maxParticipants?: number;
  availableSeats?: number;
  featured?: boolean;
  status?: TourStatus | string;
  categoryId?: number;
  categoryName?: string;
  categorySlug?: string;
  destinationId?: number;
  destinationIds?: number[];
  destinationName?: string;
  destinationDisplayName?: string;
  selectedDestinationNames?: string[];
  destinationSlug?: string;
  scheduleCount?: number;
  imageCount?: number;
  itineraryCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminTourCreateRequest {
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
  maxParticipants?: number;
  availableSeats?: number;
  featured?: boolean;
  status?: TourStatus;
  categoryId?: number;
  destinationId?: number;
}

export interface AdminTourUpdateRequest extends AdminTourCreateRequest {}

export interface TourPublishChecklist {
  canPublish?: boolean;
  missingItems?: string[];
  items?: unknown[];
  message?: string;
  [key: string]: unknown;
}

export interface AdminTourImage {
  id?: number;
  tourId?: number;
  url?: string;
  imageUrl?: string;
  secureUrl?: string;
  publicId?: string;
  sourceType?: 'MEDIA' | 'DIRECT_UPLOAD' | string;
  mediaId?: number;
  altText?: string;
  sortOrder?: number;
  isThumbnail?: boolean;
  createdAt?: string;
  updatedAt?: string;
  data?: {
    url?: string;
    imageUrl?: string;
    secureUrl?: string;
  };
  [key: string]: unknown;
}

export interface AdminTourImageCreateRequest {
  url?: string;
  imageUrl?: string;
  altText?: string;
  sortOrder?: number;
  isThumbnail?: boolean;
}

export interface AdminTourImageFromMediaRequest {
  mediaId: number;
  altText?: string;
  sortOrder?: number;
  thumbnail?: boolean;
  isThumbnail?: boolean;
}

export interface AdminTourImageUpdateRequest {
  altText?: string;
  sortOrder?: number;
}

export interface AdminTourImageReorderRequest {
  items: Array<{
    id?: number;
    sortOrder?: number;
  }>;
}

export interface AdminTourItinerary {
  id?: number;
  tourId?: number;
  dayNumber?: number;
  title?: string;
  description?: string;
  hotelName?: string;
  meals?: string;
  transportModes?: string;
  activities?: string;
  placeNames?: string;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface AdminTourItineraryCreateRequest {
  dayNumber: number;
  title: string;
  description?: string;
  hotelName?: string;
  meals?: string;
  transportModes?: string;
  activities?: string;
  placeNames?: string;
  sortOrder?: number;
}

export interface AdminTourItineraryUpdateRequest extends AdminTourItineraryCreateRequest {
  id?: number;
}

export interface AdminTourItineraryBulkSaveRequest {
  items: AdminTourItineraryUpdateRequest[];
}

export interface AdminTourItineraryReorderRequest {
  items: Array<{
    id?: number;
    sortOrder?: number;
  }>;
}

export interface AdminTourSchedule {
  id?: number;
  tourId?: number;
  departureDate?: string;
  returnDate?: string;
  priceAdult?: number;
  priceChild?: number;
  priceInfant?: number;
  singleSupplement?: number;
  maxSeats?: number;
  bookedSeats?: number;
  remainingSeats?: number;
  status?: TourScheduleStatus | string;
  note?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface AdminTourScheduleCreateRequest {
  departureDate: string;
  returnDate: string;
  priceAdult: number;
  priceChild?: number;
  priceInfant?: number;
  singleSupplement?: number;
  maxSeats: number;
  status?: TourScheduleStatus;
  notes?: string;
}

export interface AdminTourScheduleUpdateRequest extends AdminTourScheduleCreateRequest {
  bookedSeats?: number;
}

export interface AdminTourScheduleStatusRequest {
  status: TourScheduleStatus;
}
