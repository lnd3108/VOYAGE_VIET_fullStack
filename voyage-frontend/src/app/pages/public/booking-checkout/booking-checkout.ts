import { NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';

import { BookingApiService } from '../../../core/api/booking-api.service';
import { PublicApiService } from '../../../core/api/public-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { BookingCreateRequest, BookingResponse } from '../../../core/models/booking.model';
import { TourDetailResponse, TourScheduleResponse } from '../../../core/models/tour.model';

interface CheckoutQuery {
  tourSlug: string;
  tourId?: number;
  scheduleId?: number;
  adultCount: number;
  childCount: number;
  infantCount: number;
}

@Component({
  selector: 'app-booking-checkout',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterLink],
  templateUrl: './booking-checkout.html',
  styleUrl: './booking-checkout.scss',
})
export class BookingCheckout implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly publicApiService = inject(PublicApiService);
  private readonly bookingApiService = inject(BookingApiService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly fallbackImage = '/hero/bg-home.png';

  loading = false;
  submitting = false;
  errorMessage = '';
  submitErrorMessage = '';
  scheduleWarning = '';
  query: CheckoutQuery | null = null;
  tour: TourDetailResponse | null = null;
  selectedSchedule: TourScheduleResponse | null = null;

  readonly form = this.formBuilder.nonNullable.group({
    contactName: ['', [Validators.required]],
    contactEmail: ['', [Validators.required, Validators.email]],
    contactPhone: ['', [Validators.required]],
    note: [''],
  });

  ngOnInit(): void {
    this.prefillContactForm();

    this.activatedRoute.queryParamMap
      .pipe(
        map((params) => this.parseQueryParams(params)),
        tap((query) => {
          this.query = query;
          this.loading = true;
          this.errorMessage = '';
          this.submitErrorMessage = '';
          this.scheduleWarning = '';
          this.tour = null;
          this.selectedSchedule = null;
        }),
        switchMap((query) => {
          if (!query.tourSlug || !query.scheduleId) {
            this.errorMessage = 'Thiếu thông tin tour hoặc lịch khởi hành. Vui lòng chọn lại tour.';
            return of(null);
          }

          return forkJoin({
            tour: this.publicApiService.getTourBySlug(query.tourSlug),
            schedules: this.publicApiService.getTourSchedules(query.tourSlug),
          }).pipe(
            catchError(() => {
              this.errorMessage = 'Không thể tải dữ liệu checkout. Vui lòng thử lại sau.';
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => {
        if (response && this.query) {
          this.tour = this.extractData<TourDetailResponse>(response.tour);
          const schedules = this.extractList<TourScheduleResponse>(response.schedules);

          this.selectedSchedule =
            schedules.find((schedule) => this.getScheduleId(schedule) === this.query?.scheduleId) || null;

          if (!this.selectedSchedule) {
            this.scheduleWarning = 'Lịch khởi hành đã chọn không còn khả dụng. Vui lòng quay lại chi tiết tour.';
          }
        }

        this.loading = false;
      });
  }

  get durationText(): string {
    if (!this.tour) {
      return 'Đang cập nhật';
    }

    return `${this.tour.durationDays} Ngày ${this.tour.durationNights} Đêm`;
  }

  get adultCount(): number {
    return this.query?.adultCount || 0;
  }

  get childCount(): number {
    return this.query?.childCount || 0;
  }

  get infantCount(): number {
    return this.query?.infantCount || 0;
  }

  get adultPrice(): number {
    return this.selectedSchedule?.priceAdult || this.tour?.salePrice || this.tour?.originalPrice || 0;
  }

  get childPrice(): number {
    // Backend may omit child price; use adult price so the summary does not undercharge silently.
    return this.selectedSchedule?.priceChild ?? this.adultPrice;
  }

  get infantPrice(): number {
    // Infant price defaults to 0 if the schedule does not provide a snapshot.
    return this.selectedSchedule?.priceInfant ?? 0;
  }

  get totalPrice(): number {
    return this.adultCount * this.adultPrice + this.childCount * this.childPrice + this.infantCount * this.infantPrice;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.query?.scheduleId || !this.selectedSchedule) {
      this.submitErrorMessage = 'Vui lòng chọn lại lịch khởi hành trước khi xác nhận booking.';
      return;
    }

    this.submitting = true;
    this.submitErrorMessage = '';

    const payload: BookingCreateRequest = {
      scheduleId: this.query.scheduleId,
      adultCount: this.adultCount,
      childCount: this.childCount,
      infantCount: this.infantCount,
      ...this.form.getRawValue(),
    };

    this.bookingApiService.createBooking(payload).subscribe({
      next: (response) => {
        const booking = this.extractData<BookingResponse>(response);

        this.router.navigate(['/booking-success'], {
          queryParams: {
            bookingCode: booking?.bookingCode || null,
            bookingId: booking?.id || null,
          },
        });
      },
      error: (error) => {
        this.submitErrorMessage =
          error?.error?.message || error?.error?.error?.details || 'Không thể tạo booking. Vui lòng thử lại sau.';
        this.submitting = false;
      },
    });
  }

  backToTour(): void {
    if (this.query?.tourSlug) {
      this.router.navigate(['/tours', this.query.tourSlug]);
      return;
    }

    this.router.navigate(['/tours']);
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

  private prefillContactForm(): void {
    const user = this.authService.currentUser();

    if (!user) {
      return;
    }

    this.form.patchValue({
      contactName: user.fullName || '',
      contactEmail: user.email || '',
      contactPhone: user.phone || '',
    });
  }

  private parseQueryParams(params: ParamMap): CheckoutQuery {
    return {
      tourSlug: params.get('tourSlug') || '',
      tourId: this.parseNumber(params.get('tourId')),
      scheduleId: this.parseNumber(params.get('scheduleId')),
      adultCount: Math.max(0, this.parseNumber(params.get('adultCount')) ?? 1),
      childCount: Math.max(0, this.parseNumber(params.get('childCount')) ?? 0),
      infantCount: Math.max(0, this.parseNumber(params.get('infantCount')) ?? 0),
    };
  }

  private getScheduleId(schedule: TourScheduleResponse | null): number | undefined {
    return schedule?.id ?? schedule?.scheduleId;
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
