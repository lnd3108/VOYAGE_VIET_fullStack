import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { catchError, of, switchMap, tap } from 'rxjs';

import { BookingApiService } from '../../../core/api/booking-api.service';
import { BookingListParams, BookingResponse, BookingStatus } from '../../../core/models/booking.model';
import { PageResponse } from '../../../core/models/page-response.model';

interface StatusFilter {
  label: string;
  value: BookingStatus | '';
}

@Component({
  selector: 'app-my-bookings',
  imports: [NgClass, NgFor, NgIf, RouterLink],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.scss',
})
export class MyBookings implements OnInit {
  private readonly bookingApiService = inject(BookingApiService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly fallbackImage = '/hero/bg-home.png';
  readonly statusFilters: StatusFilter[] = [
    { label: 'Tất cả', value: '' },
    { label: 'Chờ xác nhận', value: 'PENDING' },
    { label: 'Đã xác nhận', value: 'CONFIRMED' },
    { label: 'Đã hủy', value: 'CANCELLED' },
    { label: 'Hoàn thành', value: 'COMPLETED' },
  ];

  loading = false;
  loadingMore = false;
  errorMessage = '';
  successMessage = '';
  bookings: BookingResponse[] = [];
  selectedStatus: BookingStatus | '' = '';
  page = 0;
  size = 8;
  totalElements = 0;
  totalPages = 0;
  cancellingId: number | null = null;

  ngOnInit(): void {
    this.activatedRoute.queryParamMap
      .pipe(
        tap((params) => {
          this.selectedStatus = this.parseStatus(params.get('status'));
          this.page = this.parseNumber(params.get('page')) ?? 0;
          this.size = this.parseNumber(params.get('size')) ?? 8;
          this.loading = true;
          this.errorMessage = '';
          this.successMessage = '';
        }),
        switchMap(() =>
          this.bookingApiService.getMyBookings(this.buildParams(this.page)).pipe(
            catchError((error) => {
              this.errorMessage = error?.error?.message || 'Không thể tải danh sách booking. Vui lòng thử lại sau.';
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => {
        const pageResponse = this.extractPage(response);

        this.bookings = pageResponse.content;
        this.page = pageResponse.page;
        this.size = pageResponse.size;
        this.totalElements = pageResponse.totalElements;
        this.totalPages = pageResponse.totalPages;
        this.loading = false;
      });
  }

  get hasMore(): boolean {
    return this.page + 1 < this.totalPages;
  }

  applyStatus(status: BookingStatus | ''): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        status: status || null,
        page: 0,
        size: this.size,
      },
      queryParamsHandling: 'merge',
    });
  }

  retry(): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        status: this.selectedStatus || null,
        page: this.page,
        size: this.size,
      },
      queryParamsHandling: 'merge',
    });
  }

  loadMore(): void {
    if (!this.hasMore || this.loadingMore) {
      return;
    }

    const nextPage = this.page + 1;

    this.loadingMore = true;
    this.errorMessage = '';

    this.bookingApiService
      .getMyBookings(this.buildParams(nextPage))
      .pipe(
        catchError((error) => {
          this.errorMessage = error?.error?.message || 'Không thể tải thêm booking. Vui lòng thử lại sau.';
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => {
        const pageResponse = this.extractPage(response);

        this.bookings = [...this.bookings, ...pageResponse.content];
        this.page = pageResponse.page;
        this.size = pageResponse.size;
        this.totalElements = pageResponse.totalElements;
        this.totalPages = pageResponse.totalPages;
        this.loadingMore = false;
      });
  }

  cancelBooking(booking: BookingResponse): void {
    if (!this.canCancel(booking) || this.cancellingId) {
      return;
    }

    const confirmed = window.confirm('Bạn có chắc muốn hủy booking này?');

    if (!confirmed) {
      return;
    }

    this.cancellingId = booking.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.bookingApiService.cancelBooking(booking.id).subscribe({
      next: (response) => {
        const cancelledBooking = this.extractData<BookingResponse>(response);

        this.bookings = this.bookings.map((item) =>
          item.id === booking.id ? { ...item, ...(cancelledBooking || {}), status: 'CANCELLED' } : item,
        );
        this.successMessage = 'Đã hủy booking thành công.';
        this.cancellingId = null;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Không thể hủy booking này. Vui lòng thử lại sau.';
        this.cancellingId = null;
      },
    });
  }

  canCancel(booking: BookingResponse): boolean {
    return booking.status === 'PENDING' || booking.status === 'CONFIRMED';
  }

  getTourLink(booking: BookingResponse): string[] | null {
    return booking.tourSlug ? ['/tours', booking.tourSlug] : null;
  }

  getImage(booking: BookingResponse): string {
    return booking.thumbnailUrl || booking.tourThumbnailUrl || this.fallbackImage;
  }

  getPeopleText(booking: BookingResponse): string {
    const adultCount = booking.adultCount || 0;
    const childCount = booking.childCount || 0;
    const infantCount = booking.infantCount || 0;
    const passengerCount = adultCount + childCount + infantCount;
    const totalPeople = booking.totalPeople ?? (passengerCount || booking.numberOfPeople || 0);

    return `${totalPeople} khách (${adultCount} NL, ${childCount} TE, ${infantCount} EB)`;
  }

  getAmount(booking: BookingResponse): number {
    return booking.totalAmount ?? booking.totalPrice ?? 0;
  }

  statusLabel(status?: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      CANCELLED: 'Đã hủy',
      COMPLETED: 'Hoàn thành',
    };

    return status ? labels[status] || status : 'Đang cập nhật';
  }

  statusClass(status?: string): string {
    return `my-bookings__status--${(status || 'unknown').toLowerCase()}`;
  }

  formatCurrency(value?: number): string {
    if (!value) {
      return '0đ';
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

  handleImageError(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (image.src.endsWith(this.fallbackImage)) {
      return;
    }

    image.src = this.fallbackImage;
  }

  private buildParams(page: number): BookingListParams {
    return {
      status: this.selectedStatus || undefined,
      page,
      size: this.size,
      sortBy: 'createdAt',
      sortDir: 'desc',
    };
  }

  private extractPage(response: unknown): PageResponse<BookingResponse> {
    const content = this.extractBookingList(response);
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

  private extractBookingList(response: unknown): BookingResponse[] {
    if (Array.isArray(response)) {
      return response.filter(this.isBooking);
    }

    if (!this.isRecord(response)) {
      return [];
    }

    const data = response['data'];

    if (Array.isArray(data)) {
      return data.filter(this.isBooking);
    }

    if (this.isRecord(data) && Array.isArray(data['content'])) {
      return data['content'].filter(this.isBooking);
    }

    if (Array.isArray(response['content'])) {
      return response['content'].filter(this.isBooking);
    }

    return [];
  }

  private extractData<T>(response: unknown): T | null {
    if (!this.isRecord(response)) {
      return null;
    }

    const data = response['data'];
    return this.isRecord(data) ? (data as T) : (response as T);
  }

  private parseStatus(value: string | null): BookingStatus | '' {
    const statuses: BookingStatus[] = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];

    return statuses.includes(value as BookingStatus) ? (value as BookingStatus) : '';
  }

  private parseNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private isBooking(value: unknown): value is BookingResponse {
    return this.isRecord(value) && typeof value['id'] === 'number';
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
