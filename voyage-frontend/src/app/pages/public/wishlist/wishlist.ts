import { NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

import { WishlistApiService } from '../../../core/api/wishlist-api.service';
import { PageResponse } from '../../../core/models/page-response.model';
import { TourCardResponse } from '../../../core/models/tour.model';
import { WishlistItem } from '../../../core/models/wishlist.model';
import { TourCard } from '../home/components/tour-card/tour-card';

@Component({
  selector: 'app-wishlist',
  imports: [NgFor, NgIf, RouterLink, TourCard],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss',
})
export class Wishlist implements OnInit {
  private readonly wishlistApiService = inject(WishlistApiService);
  private readonly destroyRef = inject(DestroyRef);

  loading = false;
  loadingMore = false;
  errorMessage = '';
  successMessage = '';
  wishlistItems: WishlistItem[] = [];
  tours: TourCardResponse[] = [];
  page = 0;
  size = 8;
  totalElements = 0;
  totalPages = 0;
  removingTourId: number | null = null;

  ngOnInit(): void {
    this.loadWishlist(0, false);
  }

  get hasMore(): boolean {
    return this.page + 1 < this.totalPages;
  }

  loadWishlist(page: number, append: boolean): void {
    this.loading = !append;
    this.loadingMore = append;
    this.errorMessage = '';
    this.successMessage = '';

    this.wishlistApiService
      .getMyWishlist({
        page,
        size: this.size,
        sortBy: 'createdAt',
        sortDir: 'desc',
      })
      .pipe(
        catchError((error) => {
          this.errorMessage = error?.error?.message || 'Không thể tải danh sách yêu thích. Vui lòng thử lại sau.';
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => {
        const pageResponse = this.extractPage(response);
        const nextItems = pageResponse.content;
        const nextTours = nextItems.map((item) => this.mapWishlistToTour(item)).filter(this.isTourCard);

        this.wishlistItems = append ? [...this.wishlistItems, ...nextItems] : nextItems;
        this.tours = append ? [...this.tours, ...nextTours] : nextTours;
        this.page = pageResponse.page;
        this.size = pageResponse.size;
        this.totalElements = pageResponse.totalElements;
        this.totalPages = pageResponse.totalPages;
        this.loading = false;
        this.loadingMore = false;
      });
  }

  loadMore(): void {
    if (!this.hasMore || this.loadingMore) {
      return;
    }

    this.loadWishlist(this.page + 1, true);
  }

  removeFromWishlist(tour: TourCardResponse): void {
    if (this.removingTourId) {
      return;
    }

    this.removingTourId = tour.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.wishlistApiService.toggleWishlist(tour.id).subscribe({
      next: () => {
        this.tours = this.tours.filter((item) => item.id !== tour.id);
        this.wishlistItems = this.wishlistItems.filter((item) => (item.tourId ?? item.tour?.id) !== tour.id);
        this.totalElements = Math.max(0, this.totalElements - 1);
        this.successMessage = 'Đã bỏ tour khỏi danh sách yêu thích.';
        this.removingTourId = null;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Không thể cập nhật danh sách yêu thích. Vui lòng thử lại sau.';
        this.removingTourId = null;
      },
    });
  }

  retry(): void {
    this.loadWishlist(0, false);
  }

  private extractPage(response: unknown): PageResponse<WishlistItem> {
    const content = this.extractWishlistItems(response);
    const source = this.isRecord(response) && this.isRecord(response['data']) ? response['data'] : response;
    const record = this.isRecord(source) ? source : {};

    return {
      content,
      page: this.parseNumber(record['page']) ?? this.page,
      size: this.parseNumber(record['size']) ?? this.size,
      totalElements: this.parseNumber(record['totalElements']) ?? content.length,
      totalPages: this.parseNumber(record['totalPages']) ?? (content.length ? 1 : 0),
      first: Boolean(record['first'] ?? this.page === 0),
      last: Boolean(record['last'] ?? true),
      empty: Boolean(record['empty'] ?? content.length === 0),
      sortBy: typeof record['sortBy'] === 'string' ? record['sortBy'] : undefined,
      sortDir: typeof record['sortDir'] === 'string' ? record['sortDir'] : undefined,
    };
  }

  private extractWishlistItems(response: unknown): WishlistItem[] {
    if (Array.isArray(response)) {
      return response.map((item) => this.normalizeWishlistItem(item)).filter(this.isWishlistItem);
    }

    if (!this.isRecord(response)) {
      return [];
    }

    const data = response['data'];

    if (Array.isArray(data)) {
      return data.map((item) => this.normalizeWishlistItem(item)).filter(this.isWishlistItem);
    }

    if (this.isRecord(data) && Array.isArray(data['content'])) {
      return data['content'].map((item) => this.normalizeWishlistItem(item)).filter(this.isWishlistItem);
    }

    if (Array.isArray(response['content'])) {
      return response['content'].map((item) => this.normalizeWishlistItem(item)).filter(this.isWishlistItem);
    }

    return [];
  }

  private normalizeWishlistItem(value: unknown): WishlistItem | null {
    if (!this.isRecord(value)) {
      return null;
    }

    if ('tour' in value || 'tourId' in value || 'tourTitle' in value) {
      return value as WishlistItem;
    }

    if ('id' in value && 'title' in value && 'slug' in value) {
      const tour = value as Partial<TourCardResponse>;
      return {
        tour,
        tourId: tour.id,
        tourTitle: tour.title,
        tourSlug: tour.slug,
        thumbnailUrl: tour.thumbnailUrl,
      };
    }

    return null;
  }

  private mapWishlistToTour(item: WishlistItem): TourCardResponse | null {
    const tour = item.tour || {};
    const id = tour.id ?? item.tourId;
    const title = tour.title ?? item.tourTitle;
    const slug = tour.slug ?? item.tourSlug;

    if (!id || !title || !slug) {
      return null;
    }

    return {
      id,
      title,
      slug,
      shortDescription: tour.shortDescription,
      thumbnailUrl: tour.thumbnailUrl ?? item.thumbnailUrl,
      originalPrice: tour.originalPrice ?? item.originalPrice ?? 0,
      salePrice: tour.salePrice ?? item.salePrice,
      durationDays: tour.durationDays ?? item.durationDays ?? 0,
      durationNights: tour.durationNights ?? item.durationNights ?? 0,
      departureLocation: tour.departureLocation ?? item.departureLocation,
      availableSeats: tour.availableSeats ?? item.availableSeats ?? 0,
      featured: tour.featured ?? false,
      status: tour.status ?? 'PUBLISHED',
      categoryName: tour.categoryName ?? item.categoryName ?? '',
      categorySlug: tour.categorySlug ?? item.categorySlug ?? '',
      destinationName: tour.destinationName ?? item.destinationName ?? '',
      destinationSlug: tour.destinationSlug ?? item.destinationSlug ?? '',
      destinationRegion: tour.destinationRegion ?? item.destinationRegion,
      averageRating: tour.averageRating ?? item.averageRating ?? 0,
      reviewCount: tour.reviewCount ?? item.reviewCount ?? 0,
    };
  }

  private parseNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private isWishlistItem(value: WishlistItem | null): value is WishlistItem {
    return !!value;
  }

  private isTourCard(value: TourCardResponse | null): value is TourCardResponse {
    return !!value;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
