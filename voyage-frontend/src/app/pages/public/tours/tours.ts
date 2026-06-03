import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { catchError, of, switchMap, tap } from 'rxjs';

import { PublicApiService } from '../../../core/api/public-api.service';
import { WishlistApiService } from '../../../core/api/wishlist-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { PageResponse } from '../../../core/models/page-response.model';
import { TourCardResponse, TourSearchParams } from '../../../core/models/tour.model';
import { TourCard } from '../home/components/tour-card/tour-card';

type TourSummary = TourCardResponse;

interface FilterChip {
  label: string;
  queryParams: Record<string, string | number | null>;
}

interface ToursQuery extends TourSearchParams {
  departureDate?: string;
}

@Component({
  selector: 'app-tours',
  imports: [NgClass, NgFor, NgIf, TourCard],
  templateUrl: './tours.html',
  styleUrl: './tours.scss',
})
export class Tours implements OnInit {
  private readonly publicApiService = inject(PublicApiService);
  private readonly wishlistApiService = inject(WishlistApiService);
  private readonly authService = inject(AuthService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  loading = false;
  errorMessage = '';
  tours: TourSummary[] = [];
  page = 0;
  size = 12;
  totalElements = 0;
  totalPages = 0;
  currentFilters: ToursQuery = {};
  wishlistedTourIds = new Set<number>();
  wishlistLoading = false;
  wishlistLoaded = false;
  wishlistUpdatingTourId: number | null = null;

  readonly destinationChips: FilterChip[] = [
    { label: 'Hạ Long', queryParams: { keyword: 'Hạ Long' } },
    { label: 'Đà Nẵng', queryParams: { keyword: 'Đà Nẵng' } },
    { label: 'Phú Quốc', queryParams: { keyword: 'Phú Quốc' } },
    { label: 'Quy Nhơn', queryParams: { keyword: 'Quy Nhơn' } },
  ];

  readonly regionChips: FilterChip[] = [
    { label: 'Tour Miền Bắc', queryParams: { region: 'DOMESTIC', keyword: 'miền bắc' } },
    { label: 'Tour Miền Trung', queryParams: { region: 'DOMESTIC', keyword: 'miền trung' } },
    { label: 'Tour Miền Nam', queryParams: { region: 'DOMESTIC', keyword: 'miền nam' } },
    { label: 'Tour Tây Nguyên', queryParams: { region: 'DOMESTIC', keyword: 'tây nguyên' } },
  ];

  readonly tourTypeOptions: FilterChip[] = [
    { label: 'Tour trong nước', queryParams: { region: 'DOMESTIC' } },
    { label: 'Tour nước ngoài', queryParams: { region: 'INTERNATIONAL' } },
  ];

  readonly priceOptions: FilterChip[] = [
    { label: 'Dưới 3 triệu', queryParams: { minPrice: null, maxPrice: 3000000 } },
    { label: '3 - 7 triệu', queryParams: { minPrice: 3000000, maxPrice: 7000000 } },
    { label: 'Trên 7 triệu', queryParams: { minPrice: 7000000, maxPrice: null } },
  ];

  readonly departureOptions: FilterChip[] = [
    { label: 'Hà Nội', queryParams: { departureLocation: 'Hà Nội' } },
    { label: 'Đà Nẵng', queryParams: { departureLocation: 'Đà Nẵng' } },
    { label: 'TP. Hồ Chí Minh', queryParams: { departureLocation: 'TP. Hồ Chí Minh' } },
  ];

  readonly destinationOptions: FilterChip[] = [
    { label: 'Hạ Long', queryParams: { keyword: 'Hạ Long' } },
    { label: 'Đà Nẵng', queryParams: { keyword: 'Đà Nẵng' } },
    { label: 'Phú Quốc', queryParams: { keyword: 'Phú Quốc' } },
    { label: 'Quy Nhơn', queryParams: { keyword: 'Quy Nhơn' } },
  ];

  readonly durationOptions: FilterChip[] = [
    { label: '1 - 3 ngày', queryParams: { minDurationDays: 1, maxDurationDays: 3 } },
    { label: '4 - 7 ngày', queryParams: { minDurationDays: 4, maxDurationDays: 7 } },
    { label: 'Trên 7 ngày', queryParams: { minDurationDays: 8, maxDurationDays: null } },
  ];

  readonly peopleOptions: FilterChip[] = [
    { label: '1 người', queryParams: { people: 1 } },
    { label: '2 người', queryParams: { people: 2 } },
    { label: '3 - 4 người', queryParams: { people: 4 } },
    { label: '5+ người', queryParams: { people: 5 } },
  ];

  readonly sortOptions: FilterChip[] = [
    { label: 'Mới nhất', queryParams: { sortBy: 'createdAt', sortDir: 'desc' } },
    { label: 'Giá thấp đến cao', queryParams: { sortBy: 'salePrice', sortDir: 'asc' } },
    { label: 'Giá cao đến thấp', queryParams: { sortBy: 'salePrice', sortDir: 'desc' } },
  ];

  ngOnInit(): void {
    this.loadWishlistState();

    this.activatedRoute.queryParamMap
      .pipe(
        tap((paramMap) => {
          this.currentFilters = this.parseQueryParams(paramMap);
          this.loading = true;
          this.errorMessage = '';
        }),
        switchMap(() =>
          this.publicApiService.getTours(this.toApiParams(this.currentFilters)).pipe(
            catchError(() => {
              this.errorMessage = 'Không thể tải danh sách tour. Vui lòng thử lại sau.';
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => {
        const pageResponse = this.extractPage(response);

        this.tours = pageResponse.content;
        this.page = pageResponse.page;
        this.size = pageResponse.size;
        this.totalElements = pageResponse.totalElements;
        this.totalPages = pageResponse.totalPages;
        this.loading = false;
      });
  }

  isTourWishlisted(tour: TourSummary): boolean {
    return this.wishlistedTourIds.has(tour.id);
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

  get pageTitle(): string {
    if (this.currentFilters.keyword) {
      return `Kết quả tìm kiếm: "${this.currentFilters.keyword}"`;
    }

    if (this.currentFilters.region === 'DOMESTIC') {
      return 'Tour Trong Nước';
    }

    if (this.currentFilters.region === 'INTERNATIONAL') {
      return 'Tour Nước Ngoài';
    }

    return 'Danh sách Tour';
  }

  get hasMore(): boolean {
    return this.page + 1 < this.totalPages;
  }

  applyFilter(queryParams: Record<string, string | number | null>): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.cleanQueryParams({ ...queryParams, page: 0 }),
      queryParamsHandling: 'merge',
    });
  }

  clearFilters(): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { page: 0, size: this.size },
    });
  }

  loadMore(): void {
    if (!this.hasMore) {
      return;
    }

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { page: this.page + 1 },
      queryParamsHandling: 'merge',
    });
  }

  isChipActive(chip: FilterChip): boolean {
    return Object.entries(chip.queryParams).every(([key, value]) => {
      if (value === null) {
        return true;
      }

      return String(this.currentFilters[key as keyof ToursQuery] ?? '') === String(value);
    });
  }

  private parseQueryParams(paramMap: ParamMap): ToursQuery {
    const page = this.parseNumber(paramMap.get('page')) ?? 0;
    const size = this.parseNumber(paramMap.get('size')) ?? 12;

    return {
      keyword: paramMap.get('keyword') || undefined,
      categorySlug: paramMap.get('categorySlug') || undefined,
      destinationSlug: paramMap.get('destinationSlug') || undefined,
      region: paramMap.get('region') || undefined,
      departureLocation: paramMap.get('departureLocation') || undefined,
      minPrice: this.parseNumber(paramMap.get('minPrice')),
      maxPrice: this.parseNumber(paramMap.get('maxPrice')),
      minDurationDays: this.parseNumber(paramMap.get('minDurationDays')),
      maxDurationDays: this.parseNumber(paramMap.get('maxDurationDays')),
      people: this.parseNumber(paramMap.get('people')),
      departureDate: paramMap.get('departureDate') || undefined,
      sortBy: paramMap.get('sortBy') || 'createdAt',
      sortDir: (paramMap.get('sortDir') as 'asc' | 'desc' | null) || 'desc',
      page,
      size,
    };
  }

  private toApiParams(filters: ToursQuery): TourSearchParams {
    return this.cleanQueryParams({
      keyword: filters.keyword,
      categorySlug: filters.categorySlug,
      destinationSlug: filters.destinationSlug,
      region: filters.region,
      departureLocation: filters.departureLocation,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minDurationDays: filters.minDurationDays,
      maxDurationDays: filters.maxDurationDays,
      people: filters.people,
      sortBy: filters.sortBy,
      sortDir: filters.sortDir,
      page: filters.page,
      size: filters.size,
    }) as TourSearchParams;
  }

  private loadWishlistState(): void {
    if (!this.authService.isLoggedIn() || this.wishlistLoading || this.wishlistLoaded) {
      return;
    }

    this.wishlistLoading = true;

    this.wishlistApiService
      .getMyWishlist({ page: 0, size: 100, sortBy: 'createdAt', sortDir: 'desc' })
      .pipe(catchError(() => of(null)))
      .subscribe((response) => {
        this.wishlistedTourIds = this.extractWishlistTourIds(response);
        this.wishlistLoading = false;
        this.wishlistLoaded = true;
      });
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

  private extractPage(response: unknown): PageResponse<TourSummary> {
    const content = this.extractTourList(response);

    if (this.isRecord(response) && this.isRecord(response['data'])) {
      return this.normalizePage(response['data'], content);
    }

    return this.normalizePage(response, content);
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

  private normalizePage(source: unknown, content: TourSummary[]): PageResponse<TourSummary> {
    const record = this.isRecord(source) ? source : {};
    const page = this.parseNumber(record['page']) ?? this.currentFilters.page ?? 0;
    const size = this.parseNumber(record['size']) ?? this.currentFilters.size ?? 12;
    const totalElements = this.parseNumber(record['totalElements']) ?? content.length;
    const totalPages = this.parseNumber(record['totalPages']) ?? (content.length ? 1 : 0);

    return {
      content,
      page,
      size,
      totalElements,
      totalPages,
      first: page === 0,
      last: totalPages === 0 || page + 1 >= totalPages,
      empty: content.length === 0,
      sortBy: typeof record['sortBy'] === 'string' ? record['sortBy'] : undefined,
      sortDir: typeof record['sortDir'] === 'string' ? record['sortDir'] : undefined,
    };
  }

  private cleanQueryParams(
    params: Record<string, string | number | null | undefined>,
  ): Record<string, string | number | null> {
    return Object.entries(params).reduce<Record<string, string | number | null>>(
      (queryParams, [key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams[key] = value;
        }

        return queryParams;
      },
      {},
    );
  }

  private parseNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
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
