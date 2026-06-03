import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';

import { PublicApiService } from '../../../core/api/public-api.service';
import { WishlistApiService } from '../../../core/api/wishlist-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { PageResponse } from '../../../core/models/page-response.model';
import { ReviewResponse } from '../../../core/models/review.model';
import {
  TourCardResponse,
  TourDetailResponse,
  TourItineraryResponse,
  TourScheduleResponse,
  TourSearchParams,
} from '../../../core/models/tour.model';
import { WishlistItem } from '../../../core/models/wishlist.model';
import { TourCard } from '../home/components/tour-card/tour-card';

type PriceTabId = 'included' | 'excluded' | 'surcharge' | 'policy' | 'note';

@Component({
  selector: 'app-tour-detail',
  imports: [NgClass, NgFor, NgIf, RouterLink, TourCard],
  templateUrl: './tour-detail.html',
  styleUrl: './tour-detail.scss',
})
export class TourDetail implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly publicApiService = inject(PublicApiService);
  private readonly wishlistApiService = inject(WishlistApiService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly fallbackImage = '/hero/bg-home.png';
  readonly priceTabs: Array<{ id: PriceTabId; label: string }> = [
    { id: 'included', label: 'Giá bao gồm' },
    { id: 'excluded', label: 'Giá không bao gồm' },
    { id: 'surcharge', label: 'Phụ thu' },
    { id: 'policy', label: 'Huỷ đổi' },
    { id: 'note', label: 'Lưu ý' },
  ];

  loading = false;
  errorMessage = '';
  bookingMessage = '';
  tour: TourDetailResponse | null = null;
  reviews: ReviewResponse[] = [];
  schedules: TourScheduleResponse[] = [];
  itinerary: TourItineraryResponse[] = [];
  relatedTours: TourCardResponse[] = [];
  selectedSchedule: TourScheduleResponse | null = null;
  selectedImage = this.fallbackImage;
  galleryImages: string[] = [this.fallbackImage];
  activePriceTab: PriceTabId = 'included';
  adultCount = 1;
  childCount = 0;
  infantCount = 0;
  showFullDescription = false;
  isWishlisted = false;
  wishlistLoading = false;
  wishlistMessage = '';

  ngOnInit(): void {
    this.activatedRoute.paramMap
      .pipe(
        map((params) => params.get('slug') || ''),
        tap(() => {
          this.loading = true;
          this.errorMessage = '';
          this.bookingMessage = '';
          this.tour = null;
          this.reviews = [];
          this.schedules = [];
          this.itinerary = [];
          this.relatedTours = [];
          this.selectedSchedule = null;
          this.isWishlisted = false;
          this.wishlistMessage = '';
        }),
        switchMap((slug) => {
          if (!slug) {
            this.errorMessage = 'Không tìm thấy tour.';
            return of(null);
          }

          return forkJoin({
            tourResponse: this.publicApiService.getTourBySlug(slug),
            reviews: this.publicApiService.getTourReviews(slug).pipe(catchError(() => of(null))),
            schedules: this.publicApiService.getTourSchedules(slug).pipe(catchError(() => of(null))),
            itinerary: this.publicApiService.getTourItinerary(slug).pipe(catchError(() => of(null))),
          }).pipe(
            switchMap((detailResponse) => {
              const tour = this.extractData<TourDetailResponse>(detailResponse.tourResponse);

              if (!tour) {
                throw new Error('Tour not found');
              }

              this.tour = tour;
              this.setupGallery(tour);

              return this.publicApiService.getTours(this.buildRelatedParams(tour)).pipe(
                catchError(() => of(null)),
                map((related) => ({
                  tour,
                  reviews: detailResponse.reviews,
                  schedules: detailResponse.schedules,
                  itinerary: detailResponse.itinerary,
                  related,
                })),
              );
            }),
            catchError(() => {
              this.errorMessage = 'Không thể tải chi tiết tour. Vui lòng quay lại danh sách tour.';
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => {
        if (response) {
          this.reviews = this.extractList<ReviewResponse>(response.reviews);
          this.schedules = this.extractList<TourScheduleResponse>(response.schedules);
          this.itinerary = this.extractList<TourItineraryResponse>(response.itinerary).sort(
            (first, second) => (first.dayNumber || 0) - (second.dayNumber || 0),
          );
          this.relatedTours = this.extractList<TourCardResponse>(response.related)
            .filter((tour) => tour.slug !== response.tour.slug)
            .slice(0, 4);
          this.loadWishlistState(response.tour.id);
        }

        this.loading = false;
      });
  }

  get durationText(): string {
    if (!this.tour) {
      return '';
    }

    return `${this.tour.durationDays} Ngày ${this.tour.durationNights} Đêm`;
  }

  get averageRating(): number {
    if (this.reviews.length) {
      const total = this.reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
      return Math.round((total / this.reviews.length) * 10) / 10;
    }

    return this.tour?.averageRating || 0;
  }

  get reviewTotal(): number {
    return this.reviews.length || this.tour?.reviewCount || 0;
  }

  get displaySchedule(): TourScheduleResponse | null {
    return this.selectedSchedule || this.schedules[0] || null;
  }

  get totalPrice(): number {
    if (!this.tour) {
      return 0;
    }

    const schedule = this.selectedSchedule;
    const adultPrice = schedule?.priceAdult || this.tour.salePrice || this.tour.originalPrice || 0;
    const childPrice = schedule?.priceChild ?? adultPrice;
    const infantPrice = schedule?.priceInfant ?? 0;

    return adultPrice * this.adultCount + childPrice * this.childCount + infantPrice * this.infantCount;
  }

  get basePrice(): number {
    if (!this.tour) {
      return 0;
    }

    return this.displaySchedule?.priceAdult || this.tour.salePrice || this.tour.originalPrice || 0;
  }

  get activePriceText(): string {
    const fallback =
      this.tour?.description ||
      this.tour?.shortDescription ||
      'Thông tin chi tiết sẽ được VoyageViet cập nhật theo chính sách của từng tour.';

    const content: Record<PriceTabId, string> = {
      included: fallback,
      excluded: 'Chi phí cá nhân, đồ uống ngoài chương trình và các dịch vụ không được ghi rõ trong phần mô tả tour.',
      surcharge: 'Phụ thu có thể áp dụng theo độ tuổi, phòng đơn, mùa cao điểm hoặc yêu cầu dịch vụ riêng.',
      policy: 'Chính sách huỷ đổi phụ thuộc lịch khởi hành và điều kiện của nhà cung cấp dịch vụ.',
      note: 'Quý khách vui lòng kiểm tra giấy tờ tuỳ thân, lịch khởi hành và điều kiện sức khoẻ trước chuyến đi.',
    };

    return content[this.activePriceTab];
  }

  backToTours(): void {
    this.router.navigate(['/tours']);
  }

  selectImage(image: string): void {
    this.selectedImage = image || this.fallbackImage;
  }

  selectSchedule(schedule: TourScheduleResponse | undefined): void {
    if (!schedule) {
      this.selectedSchedule = null;
      return;
    }

    this.selectedSchedule = schedule;
    this.bookingMessage = '';
  }

  setActivePriceTab(tab: PriceTabId): void {
    this.activePriceTab = tab;
  }

  changeCount(type: 'adult' | 'child' | 'infant', delta: number): void {
    if (type === 'adult') {
      this.adultCount = Math.max(1, this.adultCount + delta);
      return;
    }

    if (type === 'child') {
      this.childCount = Math.max(0, this.childCount + delta);
      return;
    }

    this.infantCount = Math.max(0, this.infantCount + delta);
  }

  bookNow(): void {
    if (this.schedules.length && !this.selectedSchedule) {
      this.bookingMessage = 'Vui lòng chọn lịch khởi hành trước khi đặt tour.';
      return;
    }

    const scheduleId = this.getScheduleId(this.selectedSchedule);

    if (!this.tour || !scheduleId) {
      this.bookingMessage = 'Chưa có lịch khởi hành khả dụng để đặt tour.';
      return;
    }

    if (this.adultCount + this.childCount + this.infantCount <= 0) {
      this.bookingMessage = 'Vui lòng chọn số khách trước khi đặt tour.';
      return;
    }

    this.router.navigate(['/booking/checkout'], {
      queryParams: {
        tourSlug: this.tour.slug,
        tourId: this.tour.id,
        scheduleId,
        adultCount: this.adultCount,
        childCount: this.childCount,
        infantCount: this.infantCount,
      },
    });
  }

  toggleWishlist(): void {
    if (!this.tour) {
      return;
    }

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: this.router.url,
        },
      });
      return;
    }

    this.wishlistLoading = true;
    this.wishlistMessage = '';

    this.wishlistApiService.toggleWishlist(this.tour.id).subscribe({
      next: () => {
        this.isWishlisted = !this.isWishlisted;
        this.wishlistMessage = this.isWishlisted ? 'Đã thêm vào yêu thích.' : 'Đã bỏ khỏi yêu thích.';
        this.wishlistLoading = false;
      },
      error: (error) => {
        this.wishlistMessage = error?.error?.message || 'Không thể cập nhật yêu thích. Vui lòng thử lại sau.';
        this.wishlistLoading = false;
      },
    });
  }

  scrollTo(sectionId: string): void {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  getRatingCount(star: number): number {
    return this.reviews.filter((review) => Math.round(review.rating || 0) === star).length;
  }

  getRatingPercent(star: number): number {
    if (!this.reviews.length) {
      return 0;
    }

    return (this.getRatingCount(star) / this.reviews.length) * 100;
  }

  formatCurrency(value?: number): string {
    if (!value) {
      return 'Liên hệ';
    }

    return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
  }

  formatDate(value?: string): string {
    if (!value) {
      return 'Đang cập nhật';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('vi-VN').format(date);
  }

  formatScheduleStatus(schedule: TourScheduleResponse): string {
    const status = (schedule.status || '').toUpperCase();

    if (status === 'FULL' || status === 'SOLD_OUT') {
      return 'Hết chỗ';
    }

    if (status === 'CLOSED' || status === 'INACTIVE') {
      return 'Đã đóng';
    }

    const remainingSeats = schedule.remainingSeats ?? schedule.availableSeats;
    return typeof remainingSeats === 'number' ? `Còn ${remainingSeats} chỗ` : 'Còn nhận khách';
  }

  isScheduleSelected(schedule: TourScheduleResponse): boolean {
    const selectedId = this.getScheduleId(this.selectedSchedule);
    const scheduleId = this.getScheduleId(schedule);

    return selectedId !== undefined && scheduleId !== undefined && selectedId === scheduleId;
  }

  getScheduleId(schedule: TourScheduleResponse | null): number | undefined {
    return schedule?.id ?? schedule?.scheduleId;
  }

  asTextList(value: string[] | string | undefined): string[] {
    if (!value) {
      return [];
    }

    return Array.isArray(value) ? value : value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  handleImageError(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (image.src.endsWith(this.fallbackImage)) {
      return;
    }

    image.src = this.fallbackImage;
  }

  private setupGallery(tour: TourDetailResponse): void {
    const image = tour.thumbnailUrl || this.fallbackImage;

    // Fallback gallery until the public gallery API is available.
    this.galleryImages = [image, image, image, image];
    this.selectedImage = image;
  }

  private buildRelatedParams(tour: TourDetailResponse): TourSearchParams {
    return {
      page: 0,
      size: 4,
      categorySlug: tour.categorySlug || undefined,
      destinationSlug: tour.destinationSlug || undefined,
    };
  }

  private loadWishlistState(tourId: number): void {
    if (!this.authService.isLoggedIn()) {
      return;
    }

    this.wishlistApiService
      .getMyWishlist({ page: 0, size: 100, sortBy: 'createdAt', sortDir: 'desc' })
      .pipe(
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => {
        const items = this.extractList<WishlistItem>(response);

        this.isWishlisted = items.some((item) => {
          const itemTourId = item.tourId ?? item.tour?.id ?? (this.isRecord(item) ? this.parseNumber(item['id']) : undefined);
          return itemTourId === tourId;
        });
      });
  }

  private extractData<T>(response: unknown): T | null {
    if (!this.isRecord(response)) {
      return null;
    }

    const data = response['data'];
    return this.isRecord(data) ? (data as T) : (response as T);
  }

  private extractList<T>(response: unknown): T[] {
    if (Array.isArray(response)) {
      return response as T[];
    }

    if (!this.isRecord(response)) {
      return [];
    }

    const data = response['data'];

    if (Array.isArray(data)) {
      return data as T[];
    }

    if (this.isRecord(data) && Array.isArray(data['content'])) {
      return data['content'] as T[];
    }

    if (Array.isArray(response['content'])) {
      return response['content'] as T[];
    }

    return [];
  }

  private extractPage<T>(response: unknown): PageResponse<T> {
    const content = this.extractList<T>(response);
    const source = this.isRecord(response) && this.isRecord(response['data']) ? response['data'] : response;
    const record = this.isRecord(source) ? source : {};

    return {
      content,
      page: this.parseNumber(record['page']) ?? 0,
      size: this.parseNumber(record['size']) ?? content.length,
      totalElements: this.parseNumber(record['totalElements']) ?? content.length,
      totalPages: this.parseNumber(record['totalPages']) ?? (content.length ? 1 : 0),
      first: Boolean(record['first'] ?? true),
      last: Boolean(record['last'] ?? true),
      empty: Boolean(record['empty'] ?? content.length === 0),
      sortBy: typeof record['sortBy'] === 'string' ? record['sortBy'] : undefined,
      sortDir: typeof record['sortDir'] === 'string' ? record['sortDir'] : undefined,
    };
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
}
