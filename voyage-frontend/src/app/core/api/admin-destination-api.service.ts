import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  AdminDestination,
  AdminDestinationCreateRequest,
  AdminDestinationUpdateRequest,
  DestinationStatus,
} from '../models/destination.model';
import { PageResponse } from '../models/page-response.model';

export type AdminDestinationListResponse =
  | ApiResponse<AdminDestination[] | PageResponse<AdminDestination>>
  | AdminDestination[]
  | PageResponse<AdminDestination>;

@Injectable({
  providedIn: 'root',
})
export class AdminDestinationApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getDestinations() {
    return this.http.get<AdminDestinationListResponse>(`${this.apiUrl}/admin/destinations`);
  }

  createDestination(payload: AdminDestinationCreateRequest) {
    return this.http.post<ApiResponse<AdminDestination> | AdminDestination>(`${this.apiUrl}/admin/destinations`, payload);
  }

  updateDestination(id: number, payload: AdminDestinationUpdateRequest) {
    return this.http.put<ApiResponse<AdminDestination> | AdminDestination>(`${this.apiUrl}/admin/destinations/${id}`, payload);
  }

  updateDestinationStatus(id: number, status: DestinationStatus) {
    return this.http.patch<ApiResponse<AdminDestination> | AdminDestination>(`${this.apiUrl}/admin/destinations/${id}/status`, {
      status,
    });
  }

  updateDestinationImage(id: number, imageUrl: string) {
    return this.http.patch<ApiResponse<AdminDestination> | AdminDestination>(`${this.apiUrl}/admin/destinations/${id}/image`, {
      imageUrl,
    });
  }

  deleteDestination(id: number) {
    return this.http.delete<ApiResponse<unknown> | unknown>(`${this.apiUrl}/admin/destinations/${id}`);
  }
}
