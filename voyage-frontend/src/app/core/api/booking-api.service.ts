import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { BookingCreateRequest, BookingResponse } from '../models/booking.model';

@Injectable({
  providedIn: 'root',
})
export class BookingApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  createBooking(request: BookingCreateRequest) {
    return this.http.post<ApiResponse<BookingResponse>>(`${this.apiUrl}/bookings`, request);
  }

  getMyBookings() {
    return this.http.get<ApiResponse<BookingResponse[]>>(`${this.apiUrl}/bookings/me`);
  }

  cancelBooking(id: number) {
    return this.http.patch<ApiResponse<BookingResponse>>(`${this.apiUrl}/bookings/${id}/cancel`, {});
  }
}
