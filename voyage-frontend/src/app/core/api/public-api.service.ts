import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PublicFeatureMap } from '../models/feature.model';
import { HomeResponse } from '../models/home.model';
import { PageResponse } from '../models/page-response.model';
import { ReviewResponse } from '../models/review.model';
import { TourCardResponse, TourDetailResponse, TourSearchParams } from '../models/tour.model';

@Injectable({
  providedIn: 'root',
})
export class PublicApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getHome() {
    return this.http.get<ApiResponse<HomeResponse>>(`${this.apiUrl}/public/home`);
  }

  getTours(params: TourSearchParams = {}) {
    const httpParams = this.buildParams({
      page: 0,
      size: 12,
      sortBy: 'createdAt',
      sortDir: 'desc',
      ...params,
    });

    return this.http.get<ApiResponse<PageResponse<TourCardResponse>>>(
      `${this.apiUrl}/public/tours`,
      { params: httpParams },
    );
  }

  getFeaturedTours() {
    return this.http.get<ApiResponse<TourCardResponse[]>>(`${this.apiUrl}/public/tours/featured`);
  }

  getTourBySlug(slug: string) {
    return this.http.get<ApiResponse<TourDetailResponse>>(`${this.apiUrl}/public/tours/${slug}`);
  }

  getTourReviews(slug: string) {
    return this.http.get<ApiResponse<ReviewResponse[]>>(`${this.apiUrl}/public/tours/${slug}/reviews`);
  }

  getPublicFeatures() {
    return this.http.get<ApiResponse<PublicFeatureMap>>(`${this.apiUrl}/public/features`);
  }

  private buildParams(params: Record<string, unknown>): HttpParams {
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return httpParams;
  }
}
