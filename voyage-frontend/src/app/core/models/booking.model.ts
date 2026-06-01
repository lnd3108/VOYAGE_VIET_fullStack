export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface BookingCreateRequest {
  tourId: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  startDate: string;
  numberOfPeople: number;
  note?: string;
}

export interface BookingResponse {
  id: number;
  tourId?: number;
  tourTitle?: string;
  tourSlug?: string;
  tourThumbnailUrl?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  startDate?: string;
  numberOfPeople?: number;
  totalPrice?: number;
  status: BookingStatus;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}
