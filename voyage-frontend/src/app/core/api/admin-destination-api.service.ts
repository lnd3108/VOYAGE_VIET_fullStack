import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  AdminDestination,
  AdminDestinationCreateRequest,
  AdminDestinationUpdateRequest,
  CountriesNowCitiesResponse,
  CountryOption,
  DestinationBatchActionResponse,
  DestinationPageParams,
  DestinationStatus,
} from '../models/destination.model';
import { PageResponse } from '../models/page-response.model';

export interface AdminDestinationRejectRequest {
  reason: string;
}

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
  private readonly restCountriesUrl = 'https://restcountries.com/v3.1/all';
  private readonly countriesNowUrl = 'https://countriesnow.space/api/v0.1/countries/cities';

  getDestinations() {
    return this.http.get<AdminDestinationListResponse>(`${this.apiUrl}/admin/destinations`);
  }

  getDestinationsPage(params: DestinationPageParams) {
    return this.http.get<ApiResponse<PageResponse<AdminDestination>> | PageResponse<AdminDestination>>(
      `${this.apiUrl}/admin/destinations/page`,
      { params: this.buildDestinationPageParams(params) },
    );
  }

  getDestinationById(id: number) {
    return this.http.get<ApiResponse<AdminDestination> | AdminDestination>(`${this.apiUrl}/admin/destinations/${id}`);
  }

  getCountries() {
    return this.http.get<CountryOption[]>(this.restCountriesUrl, {
      params: {
        fields: 'name,flags,population,cca2,translations',
      },
    });
  }

  getCitiesByCountry(country: string) {
    return this.http.post<CountriesNowCitiesResponse>(this.countriesNowUrl, { country });
  }

  createDestination(payload: AdminDestinationCreateRequest) {
    return this.http.post<ApiResponse<AdminDestination> | AdminDestination>(`${this.apiUrl}/admin/destinations`, payload);
  }

  createAndSubmitDestination(payload: AdminDestinationCreateRequest) {
    return this.http.post<ApiResponse<AdminDestination> | AdminDestination>(
      `${this.apiUrl}/admin/destinations/submit-create`,
      payload,
    );
  }

  copyDestination(id: number) {
    return this.http.post<ApiResponse<AdminDestination> | AdminDestination>(`${this.apiUrl}/admin/destinations/${id}/copy`, {});
  }

  updateDestination(id: number, payload: AdminDestinationUpdateRequest) {
    return this.http.put<ApiResponse<AdminDestination> | AdminDestination>(`${this.apiUrl}/admin/destinations/${id}`, payload);
  }

  patchDestination(id: number, payload: AdminDestinationUpdateRequest) {
    return this.http.patch<ApiResponse<AdminDestination> | AdminDestination>(`${this.apiUrl}/admin/destinations/${id}`, payload);
  }

  updateDestinationStatus(id: number, status: DestinationStatus) {
    return this.http.patch<ApiResponse<AdminDestination> | AdminDestination>(`${this.apiUrl}/admin/destinations/${id}/status`, {
      status,
    });
  }

  submitDestination(id: number) {
    return this.http.patch<ApiResponse<AdminDestination> | AdminDestination>(`${this.apiUrl}/admin/destinations/${id}/submit`, {});
  }

  submitDestinations(ids: number[]) {
    return this.http.patch<ApiResponse<DestinationBatchActionResponse> | DestinationBatchActionResponse>(
      `${this.apiUrl}/admin/destinations/batch/submit`,
      { ids },
    );
  }

  approveDestination(id: number) {
    return this.http.patch<ApiResponse<AdminDestination> | AdminDestination>(`${this.apiUrl}/admin/destinations/${id}/approve`, {});
  }

  approveDestinations(ids: number[]) {
    return this.http.patch<ApiResponse<DestinationBatchActionResponse> | DestinationBatchActionResponse>(
      `${this.apiUrl}/admin/destinations/batch/approve`,
      { ids },
    );
  }

  rejectDestination(id: number, payload: AdminDestinationRejectRequest) {
    return this.http.patch<ApiResponse<AdminDestination> | AdminDestination>(`${this.apiUrl}/admin/destinations/${id}/reject`, payload);
  }

  rejectDestinations(ids: number[], reason: string) {
    return this.http.patch<ApiResponse<DestinationBatchActionResponse> | DestinationBatchActionResponse>(
      `${this.apiUrl}/admin/destinations/batch/reject`,
      { ids, reason },
    );
  }

  cancelApproveDestination(id: number) {
    return this.http.patch<ApiResponse<AdminDestination> | AdminDestination>(`${this.apiUrl}/admin/destinations/${id}/cancel-approve`, {});
  }

  cancelApproveDestinations(ids: number[]) {
    return this.http.patch<ApiResponse<DestinationBatchActionResponse> | DestinationBatchActionResponse>(
      `${this.apiUrl}/admin/destinations/batch/cancel-approve`,
      { ids },
    );
  }

  updateDestinationDisplay(id: number, isDisplay: 0 | 1) {
    return this.http.patch<ApiResponse<AdminDestination> | AdminDestination>(`${this.apiUrl}/admin/destinations/${id}/display`, {
      isDisplay,
    });
  }

  updateDestinationsDisplay(ids: number[], isDisplay: 0 | 1) {
    return this.http.patch<ApiResponse<DestinationBatchActionResponse> | DestinationBatchActionResponse>(
      `${this.apiUrl}/admin/destinations/batch/display`,
      { ids, isDisplay },
    );
  }

  updateDestinationImage(id: number, imageUrl: string) {
    return this.http.patch<ApiResponse<AdminDestination> | AdminDestination>(`${this.apiUrl}/admin/destinations/${id}/image`, {
      imageUrl,
    });
  }

  deleteDestination(id: number) {
    return this.http.delete<ApiResponse<unknown> | unknown>(`${this.apiUrl}/admin/destinations/${id}`);
  }

  private buildDestinationPageParams(params: DestinationPageParams): HttpParams {
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, rawValue]) => {
      if (rawValue === null || rawValue === undefined) {
        return;
      }

      const value = String(rawValue).trim();

      if (!value || value === 'ALL') {
        return;
      }

      httpParams = httpParams.set(key, value);
    });

    return httpParams;
  }
}
