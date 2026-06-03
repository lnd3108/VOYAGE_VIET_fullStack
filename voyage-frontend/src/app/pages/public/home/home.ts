import { NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';

import { PublicApiService } from '../../../core/api/public-api.service';
import { WishlistApiService } from '../../../core/api/wishlist-api.service';
import { AuthService } from '../../../core/auth/auth.service';
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
  private readonly wishlistApiService = inject(WishlistApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  errorMessage = '';
  featuredTours: TourSummary[] = [];
  domesticTours: TourSummary[] = [];
  internationalTours: TourSummary[] = [];
  featureFlags: PublicFeatureMap = {};
  wishlistedTourIds = new Set<number>();
  wishlistLoading = false;
  wishlistUpdatingTourId: number | null = null;

  ngOnInit(): void {
    this.loadHomeData();
  }

  onWishlistToggle(tour: TourSummary): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: this.router.url,
        },
      });
      return;
    }

    if (this.wishlistUpdatingTourId) {
      return;
    }

    const wasWishlisted = this.wishlistedTourIds.has(tour.id);
    const nextIds = new Set(this.wishlistedTourIds);

    if (wasWishlisted) {
      nextIds.delete(tour.id);
    } else {
      nextIds.add(tour.id);
    }

    this.wishlistedTourIds = nextIds;
    this.wishlistUpdatingTourId = tour.id;

    this.wishlistApiService.toggleWishlist(tour.id).subscribe({
      next: () => {
        this.wishlistUpdatingTourId = null;
      },
      error: () => {
        const rollbackIds = new Set(this.wishlistedTourIds);

        if (wasWishlisted) {
          rollbackIds.add(tour.id);
        } else {
          rollbackIds.delete(tour.id);
        }

        this.wishlistedTourIds = rollbackIds;
        this.wishlistUpdatingTourId = null;
      },
    });
  }

  private loadHomeData(): void {
    this.loading = true;
    this.errorMessage = '';

    const allTours$ = this.publicApiService.getTours({ page: 0, size: 8 }).pipe(catchError(() => of(null)));
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
        const hasPartialError = [featured, all, domestic, international, features].some((response) => response === null);
        const allTours = this.extractTourList(all);
        const featuredTours = this.extractTourList(featured);
        const domesticTours = this.extractTourList(domestic);
        const internationalTours = this.extractTourList(international);

        this.featuredTours = featuredTours.length ? featuredTours : allTours;
        this.domesticTours = this.resolveRegionTours(domesticTours, allTours, 'DOMESTIC');
        this.internationalTours = this.resolveRegionTours(internationalTours, allTours, 'INTERNATIONAL');
        this.featureFlags = this.extractFeatureFlags(features);
        this.errorMessage = hasPartialError
          ? 'Một phần dữ liệu trang chủ chưa tải được. Đang hiển thị dữ liệu khả dụng.'
          : '';
        this.loading = false;
        this.loadWishlistState();
      },
      error: () => {
        this.errorMessage = 'Không thể tải dữ liệu trang chủ. Vui lòng thử lại sau.';
        this.loading = false;
      },
    });
  }

  private loadWishlistState(): void {
    if (!this.authService.isLoggedIn() || this.wishlistLoading) {
      return;
    }

    this.wishlistLoading = true;

    this.wishlistApiService
      .getMyWishlist({ page: 0, size: 100, sortBy: 'createdAt', sortDir: 'desc' })
      .pipe(catchError(() => of(null)))
      .subscribe((response) => {
        this.wishlistedTourIds = this.extractWishlistTourIds(response);
        this.wishlistLoading = false;
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

  private extractWishlistTourIds(response: unknown): Set<number> {
    const ids = this.extractWishlistItems(response)
      .map((item) => this.getWishlistTourId(item))
      .filter((id): id is number => typeof id === 'number');

    return new Set(ids);
  }

  private extractWishlistItems(response: unknown): unknown[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (!this.isRecord(response)) {
      return [];
    }

    const data = response['data'];

    if (Array.isArray(data)) {
      return data;
    }

    if (this.isRecord(data) && Array.isArray(data['content'])) {
      return data['content'];
    }

    if (Array.isArray(response['content'])) {
      return response['content'];
    }

    return [];
  }

  private getWishlistTourId(item: unknown): number | undefined {
    if (!this.isRecord(item)) {
      return undefined;
    }

    if (typeof item['tourId'] === 'number') {
      return item['tourId'];
    }

    if (this.isRecord(item['tour']) && typeof item['tour']['id'] === 'number') {
      return item['tour']['id'];
    }

    return typeof item['id'] === 'number' && typeof item['title'] === 'string' && typeof item['slug'] === 'string'
      ? item['id']
      : undefined;
  }

  private resolveRegionTours(
    regionTours: TourSummary[],
    fallbackTours: TourSummary[],
    region: 'DOMESTIC' | 'INTERNATIONAL',
  ): TourSummary[] {
    if (regionTours.length) {
      return regionTours;
    }

    const filteredTours = fallbackTours.filter((tour) => tour.destinationRegion?.toUpperCase() === region);

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
    return typeof value === 'object' && value !== null && 'id' in value && 'title' in value && 'slug' in value;
  }
}
