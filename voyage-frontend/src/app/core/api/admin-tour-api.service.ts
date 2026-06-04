import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  AdminTour,
  AdminTourCreateRequest,
  AdminTourImage,
  AdminTourImageCreateRequest,
  AdminTourImageReorderRequest,
  AdminTourImageUpdateRequest,
  AdminTourItinerary,
  AdminTourItineraryBulkSaveRequest,
  AdminTourItineraryReorderRequest,
  AdminTourSchedule,
  AdminTourScheduleCreateRequest,
  AdminTourScheduleUpdateRequest,
  AdminTourUpdateRequest,
  TourPublishChecklist,
  TourScheduleStatus,
  TourStatus,
} from '../models/admin-tour.model';
import { PageResponse } from '../models/page-response.model';

export type AdminTourListResponse =
  | ApiResponse<AdminTour[] | PageResponse<AdminTour>>
  | AdminTour[]
  | PageResponse<AdminTour>;

export type AdminTourImageListResponse =
  | ApiResponse<AdminTourImage[] | PageResponse<AdminTourImage>>
  | AdminTourImage[]
  | PageResponse<AdminTourImage>;

export type AdminTourItineraryListResponse =
  | ApiResponse<AdminTourItinerary[] | PageResponse<AdminTourItinerary>>
  | AdminTourItinerary[]
  | PageResponse<AdminTourItinerary>;

export type AdminTourScheduleListResponse =
  | ApiResponse<AdminTourSchedule[] | PageResponse<AdminTourSchedule>>
  | AdminTourSchedule[]
  | PageResponse<AdminTourSchedule>;

@Injectable({
  providedIn: 'root',
})
export class AdminTourApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getTours() {
    return this.http.get<AdminTourListResponse>(`${this.apiUrl}/admin/tours`);
  }

  getTour(id: number) {
    return this.http.get<ApiResponse<AdminTour> | AdminTour>(`${this.apiUrl}/admin/tours/${id}`);
  }

  createTour(payload: AdminTourCreateRequest) {
    return this.http.post<ApiResponse<AdminTour> | AdminTour>(`${this.apiUrl}/admin/tours`, payload);
  }

  updateTour(id: number, payload: AdminTourUpdateRequest) {
    return this.http.put<ApiResponse<AdminTour> | AdminTour>(`${this.apiUrl}/admin/tours/${id}`, payload);
  }

  updateTourStatus(id: number, status: TourStatus) {
    return this.http.patch<ApiResponse<AdminTour> | AdminTour>(`${this.apiUrl}/admin/tours/${id}/status`, { status });
  }

  updateTourThumbnail(id: number, imageUrl: string) {
    return this.http.patch<ApiResponse<AdminTour> | AdminTour>(`${this.apiUrl}/admin/tours/${id}/thumbnail`, { imageUrl });
  }

  deleteTour(id: number) {
    return this.http.delete<ApiResponse<unknown> | unknown>(`${this.apiUrl}/admin/tours/${id}`);
  }

  getPublishChecklist(id: number) {
    return this.http.get<ApiResponse<TourPublishChecklist> | TourPublishChecklist>(`${this.apiUrl}/admin/tours/${id}/publish-checklist`);
  }

  publishTour(id: number) {
    return this.http.post<ApiResponse<AdminTour> | AdminTour>(`${this.apiUrl}/admin/tours/${id}/publish`, {});
  }

  getTourImages(tourId: number) {
    return this.http.get<AdminTourImageListResponse>(`${this.apiUrl}/admin/tours/${tourId}/images`);
  }

  addTourImage(tourId: number, payload: AdminTourImageCreateRequest) {
    return this.http.post<ApiResponse<AdminTourImage> | AdminTourImage>(`${this.apiUrl}/admin/tours/${tourId}/images`, payload);
  }

  updateTourImage(tourId: number, imageId: number, payload: AdminTourImageUpdateRequest) {
    return this.http.patch<ApiResponse<AdminTourImage> | AdminTourImage>(`${this.apiUrl}/admin/tours/${tourId}/images/${imageId}/alt`, {
      altText: payload.altText,
    });
  }

  deleteTourImage(tourId: number, imageId: number) {
    return this.http.delete<ApiResponse<unknown> | unknown>(`${this.apiUrl}/admin/tours/${tourId}/images/${imageId}`);
  }

  setTourImageThumbnail(tourId: number, imageId: number) {
    return this.http.patch<ApiResponse<AdminTourImage> | AdminTourImage>(`${this.apiUrl}/admin/tours/${tourId}/images/${imageId}/thumbnail`, {});
  }

  reorderTourImages(tourId: number, payload: AdminTourImageReorderRequest) {
    return this.http.patch<ApiResponse<AdminTourImage[]> | AdminTourImage[]>(`${this.apiUrl}/admin/tours/${tourId}/images/reorder`, payload);
  }

  getTourItineraries(tourId: number) {
    return this.http.get<AdminTourItineraryListResponse>(`${this.apiUrl}/admin/tours/${tourId}/itineraries`);
  }

  saveTourItineraries(tourId: number, payload: AdminTourItineraryBulkSaveRequest) {
    return this.http.put<ApiResponse<AdminTourItinerary[]> | AdminTourItinerary[]>(`${this.apiUrl}/admin/tours/${tourId}/itineraries`, payload);
  }

  reorderTourItineraries(tourId: number, payload: AdminTourItineraryReorderRequest) {
    return this.http.post<ApiResponse<AdminTourItinerary[]> | AdminTourItinerary[]>(`${this.apiUrl}/admin/tours/${tourId}/itineraries/reorder`, payload);
  }

  getTourSchedules(tourId: number) {
    return this.http.get<AdminTourScheduleListResponse>(`${this.apiUrl}/admin/tours/${tourId}/schedules`);
  }

  createTourSchedule(tourId: number, payload: AdminTourScheduleCreateRequest) {
    return this.http.post<ApiResponse<AdminTourSchedule> | AdminTourSchedule>(`${this.apiUrl}/admin/tours/${tourId}/schedules`, payload);
  }

  updateTourSchedule(tourId: number, scheduleId: number, payload: AdminTourScheduleUpdateRequest) {
    return this.http.put<ApiResponse<AdminTourSchedule> | AdminTourSchedule>(`${this.apiUrl}/admin/tours/${tourId}/schedules/${scheduleId}`, payload);
  }

  updateTourScheduleStatus(tourId: number, scheduleId: number, status: TourScheduleStatus) {
    return this.http.patch<ApiResponse<AdminTourSchedule> | AdminTourSchedule>(`${this.apiUrl}/admin/tours/${tourId}/schedules/${scheduleId}/status`, { status });
  }

  deleteTourSchedule(tourId: number, scheduleId: number) {
    return this.http.delete<ApiResponse<unknown> | unknown>(`${this.apiUrl}/admin/tours/${tourId}/schedules/${scheduleId}`);
  }
}
