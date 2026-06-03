export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | string;

export interface BookingListParams {
  status?: BookingStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface BookingCreateRequest {
  scheduleId: number;
  adultCount: number;
  childCount: number;
  infantCount: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  note?: string;
  tourId?: number;
  startDate?: string;
  numberOfPeople?: number;
}

export interface BookingResponse {
  id: number;
  bookingCode?: string;
  tourId?: number;
  tourTitle?: string;
  tourSlug?: string;
  tourThumbnailUrl?: string;
  thumbnailUrl?: string;
  scheduleId?: number;
  departureDate?: string;
  returnDate?: string;
  adultCount?: number;
  childCount?: number;
  infantCount?: number;
  priceAdult?: number;
  priceChild?: number;
  priceInfant?: number;
  totalPeople?: number;
  totalAmount?: number;
  paymentStatus?: PaymentStatus;
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
