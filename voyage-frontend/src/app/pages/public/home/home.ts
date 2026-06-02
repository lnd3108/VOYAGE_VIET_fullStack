import { NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';

import { PublicApiService } from '../../../core/api/public-api.service';
import { PublicFeatureMap } from '../../../core/models/feature.model';
import { TourCardResponse } from '../../../core/models/tour.model';
import { HomeHero } from './components/home-hero/home-hero';
import { HomeFloatingSocialComponent } from './components/home-floating-social/home-floating-social';
import { HomeTourSection } from './components/home-tour-section/home-tour-section';

type TourSummary = TourCardResponse;

@Component({
  selector: 'app-home',
  imports: [NgIf, HomeHero, HomeFloatingSocialComponent, HomeTourSection],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly publicApiService = inject(PublicApiService);

  loading = false;
  errorMessage = '';
  featuredTours: TourSummary[] = [];
  domesticTours: TourSummary[] = [];
  internationalTours: TourSummary[] = [];
  featureFlags: PublicFeatureMap = {};

  ngOnInit(): void {
    this.loadHomeData();
  }

  private loadHomeData(): void {
    this.loading = true;
    this.errorMessage = '';

    const allTours$ = this.publicApiService.getTours({ page: 0, size: 8 }).pipe(
      catchError(() => of(null)),
    );
    const domesticTours$ = this.publicApiService
      .getTours({ page: 0, size: 8, region: 'DOMESTIC' })
      .pipe(catchError(() => of(null)));
    const internationalTours$ = this.publicApiService
      .getTours({ page: 0, size: 8, region: 'INTERNATIONAL' })
      .pipe(catchError(() => of(null)));

    forkJoin({
      featured: this.publicApiService.getFeaturedTours().pipe(catchError(() => of(null))),
      all: allTours$,
      domestic: domesticTours$,
      international: internationalTours$,
      features: this.publicApiService.getPublicFeatures().pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ featured, all, domestic, international, features }) => {
        const hasPartialError = [featured, all, domestic, international, features].some(
          (response) => response === null,
        );
        const allTours = this.extractTourList(all);
        const featuredTours = this.extractTourList(featured);
        const domesticTours = this.extractTourList(domestic);
        const internationalTours = this.extractTourList(international);

        this.featuredTours = featuredTours.length ? featuredTours : allTours;
        this.domesticTours = this.resolveRegionTours(domesticTours, allTours, 'DOMESTIC');
        this.internationalTours = this.resolveRegionTours(
          internationalTours,
          allTours,
          'INTERNATIONAL',
        );
        this.featureFlags = this.extractFeatureFlags(features);
        this.errorMessage = hasPartialError
          ? 'Một phần dữ liệu trang chủ chưa tải được. Đang hiển thị dữ liệu khả dụng.'
          : '';
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Không thể tải dữ liệu trang chủ. Vui lòng thử lại sau.';
        this.loading = false;
      },
    });
  }

  private extractTourList(response: unknown): TourSummary[] {
    if (Array.isArray(response)) {
      return response.filter(this.isTourSummary);
    }

    if (!this.isRecord(response)) {
      return [];
    }

    const data = response['data'];

    if (Array.isArray(data)) {
      return data.filter(this.isTourSummary);
    }

    if (this.isRecord(data) && Array.isArray(data['content'])) {
      return data['content'].filter(this.isTourSummary);
    }

    if (Array.isArray(response['content'])) {
      return response['content'].filter(this.isTourSummary);
    }

    return [];
  }

  private resolveRegionTours(
    regionTours: TourSummary[],
    fallbackTours: TourSummary[],
    region: 'DOMESTIC' | 'INTERNATIONAL',
  ): TourSummary[] {
    if (regionTours.length) {
      return regionTours;
    }

    const filteredTours = fallbackTours.filter(
      (tour) => tour.destinationRegion?.toUpperCase() === region,
    );

    return filteredTours.length ? filteredTours : fallbackTours;
  }

  private extractFeatureFlags(response: unknown): PublicFeatureMap {
    if (this.isRecord(response) && this.isRecord(response['data'])) {
      return response['data'] as PublicFeatureMap;
    }

    return this.isRecord(response) ? (response as PublicFeatureMap) : {};
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private isTourSummary(value: unknown): value is TourSummary {
    return (
      typeof value === 'object' &&
      value !== null &&
      'id' in value &&
      'title' in value &&
      'slug' in value
    );
  }
}
