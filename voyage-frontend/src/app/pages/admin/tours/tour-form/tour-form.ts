import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AdminCategoryApiService } from '../../../../core/api/admin-category-api.service';
import { AdminDestinationApiService } from '../../../../core/api/admin-destination-api.service';
import { AdminTourApiService } from '../../../../core/api/admin-tour-api.service';
import { AdminCategory } from '../../../../core/models/category.model';
import { AdminDestination } from '../../../../core/models/destination.model';
import { AdminTour, AdminTourCreateRequest, AdminTourUpdateRequest, TourStatus } from '../../../../core/models/admin-tour.model';
import { TourGallery } from '../tour-gallery/tour-gallery';
import { TourItinerary } from '../tour-itinerary/tour-itinerary';
import { TourSchedules } from '../tour-schedules/tour-schedules';

interface StatusOption {
  label: string;
  value: TourStatus;
}

@Component({
  selector: 'app-admin-tour-form',
  imports: [NgClass, NgFor, NgIf, ReactiveFormsModule, RouterLink, TourGallery, TourItinerary, TourSchedules],
  templateUrl: './tour-form.html',
  styleUrl: './tour-form.scss',
})
export class TourForm implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly adminTourApiService = inject(AdminTourApiService);
  private readonly adminCategoryApiService = inject(AdminCategoryApiService);
  private readonly adminDestinationApiService = inject(AdminDestinationApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly fallbackImage = '/hero/bg-home.png';
  readonly statusOptions: StatusOption[] = [
    { label: 'Nháp', value: 'DRAFT' },
    { label: 'Đã xuất bản', value: 'PUBLISHED' },
    { label: 'Tạm ẩn', value: 'INACTIVE' },
    { label: 'Hết chỗ', value: 'SOLD_OUT' },
  ];

  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';
  isEditMode = false;
  tourId: number | null = null;
  categories: AdminCategory[] = [];
  destinations: AdminDestination[] = [];
  selectedThumbnailUrl = '';
  private slugManuallyEdited = false;

  readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    slug: ['', [Validators.required]],
    shortDescription: ['', [Validators.required]],
    description: [''],
    thumbnailUrl: [''],
    originalPrice: [0, [Validators.required, Validators.min(0)]],
    salePrice: [0, [Validators.required, Validators.min(0)]],
    durationDays: [1, [Validators.required, Validators.min(1)]],
    durationNights: [0, [Validators.required, Validators.min(0)]],
    departureLocation: ['', [Validators.required]],
    maxParticipants: [1, [Validators.required, Validators.min(1)]],
    availableSeats: [0, [Validators.required, Validators.min(0)]],
    featured: [false],
    status: ['DRAFT' as TourStatus, [Validators.required]],
    categoryId: [0, [Validators.required, Validators.min(1)]],
    destinationId: [0, [Validators.required, Validators.min(1)]],
  }, { validators: [this.tourRulesValidator()] });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const parsedId = this.parseNumber(idParam);

    this.isEditMode = parsedId !== undefined;
    this.tourId = parsedId ?? null;

    if (idParam && this.tourId === null) {
      this.errorMessage = 'ID tour không hợp lệ.';
      return;
    }

    this.loadInitialData();
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Cập nhật tour' : 'Thêm tour mới';
  }

  get breadcrumbTail(): string {
    return this.isEditMode ? 'Chỉnh sửa' : 'Thêm mới';
  }

  loadInitialData(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request = this.isEditMode && this.tourId
      ? forkJoin({
          categories: this.adminCategoryApiService.getCategories(),
          destinations: this.adminDestinationApiService.getDestinations(),
          tour: this.adminTourApiService.getTour(this.tourId),
        })
      : forkJoin({
          categories: this.adminCategoryApiService.getCategories(),
          destinations: this.adminDestinationApiService.getDestinations(),
        });

    request
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.categories = this.extractList<AdminCategory>(response.categories).filter((item) => !!item.id);
          this.destinations = this.extractList<AdminDestination>(response.destinations).filter((item) => !!item.id);

          if ('tour' in response) {
            const tour = this.extractItem<AdminTour>(response.tour);

            if (!tour) {
              this.errorMessage = 'Không tìm thấy dữ liệu tour cần chỉnh sửa.';
            } else {
              this.patchTour(tour);
            }
          }

          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = this.errorText(error, 'Không thể tải dữ liệu form tour. Vui lòng thử lại sau.');
          this.loading = false;
        },
      });
  }

  handleTitleInput(): void {
    if (this.isEditMode || this.slugManuallyEdited) {
      return;
    }

    this.form.controls.slug.setValue(this.generateSlug(this.form.controls.title.value));
  }

  markSlugEdited(): void {
    this.slugManuallyEdited = true;
  }

  updateThumbnail(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.form.controls.thumbnailUrl.setValue(value);
    this.selectedThumbnailUrl = value.trim();
  }

  handleGalleryThumbnailSelected(imageUrl: string): void {
    this.form.controls.thumbnailUrl.setValue(imageUrl);
    this.selectedThumbnailUrl = imageUrl;
    this.successMessage = 'Đã cập nhật preview thumbnail từ gallery. Bấm Lưu thay đổi để lưu vào tour.';
  }

  thumbnailPreviewUrl(): string {
    return this.form.controls.thumbnailUrl.value.trim();
  }

  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Vui lòng kiểm tra lại các trường đang báo lỗi.';
      return;
    }

    if (this.isEditMode && !this.tourId) {
      this.errorMessage = 'Không xác định được tour cần cập nhật.';
      return;
    }

    const payload = this.buildPayload();
    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request = this.isEditMode && this.tourId
      ? this.adminTourApiService.updateTour(this.tourId, payload as AdminTourUpdateRequest)
      : this.adminTourApiService.createTour(payload);

    request
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const savedTour = this.extractItem<AdminTour>(response);
          this.successMessage = this.isEditMode ? 'Đã lưu thay đổi tour.' : 'Đã tạo tour mới. Đang quay lại danh sách.';
          this.saving = false;

          if (!this.isEditMode && savedTour?.id) {
            this.tourId = savedTour.id;
          }

          if (this.isEditMode) {
            if (savedTour) {
              this.patchTour(savedTour);
            }
            return;
          }

          window.setTimeout(() => {
            this.router.navigate(['/admin/tours']);
          }, 700);
        },
        error: (error) => {
          this.errorMessage = this.errorText(error, 'Không thể lưu tour. Vui lòng thử lại sau.');
          this.saving = false;
        },
      });
  }

  backToList(): void {
    this.router.navigate(['/admin/tours']);
  }

  previewCategoryName(): string {
    const categoryId = this.form.controls.categoryId.value;
    return this.categories.find((category) => category.id === categoryId)?.name || 'Chưa chọn danh mục';
  }

  previewDestinationName(): string {
    const destinationId = this.form.controls.destinationId.value;
    return this.destinations.find((destination) => destination.id === destinationId)?.name || 'Chưa chọn điểm đến';
  }

  previewPriceText(): string {
    const salePrice = this.parseNumber(this.form.controls.salePrice.value) ?? 0;
    const originalPrice = this.parseNumber(this.form.controls.originalPrice.value) ?? 0;
    const price = salePrice > 0 ? salePrice : originalPrice;

    return this.formatMoney(price);
  }

  previewOriginalPriceText(): string {
    const salePrice = this.parseNumber(this.form.controls.salePrice.value) ?? 0;
    const originalPrice = this.parseNumber(this.form.controls.originalPrice.value) ?? 0;

    if (!originalPrice || !salePrice || salePrice >= originalPrice) {
      return '';
    }

    return this.formatMoney(originalPrice);
  }

  previewDurationText(): string {
    return `${this.form.controls.durationDays.value || 0} ngày ${this.form.controls.durationNights.value || 0} đêm`;
  }

  statusLabel(status?: string): string {
    switch (this.parseStatus(status)) {
      case 'PUBLISHED':
        return 'Đã xuất bản';
      case 'INACTIVE':
        return 'Tạm ẩn';
      case 'SOLD_OUT':
        return 'Hết chỗ';
      case 'DRAFT':
      default:
        return 'Nháp';
    }
  }

  statusClass(status?: string): string {
    return `admin-tour-form__status--${(this.parseStatus(status) || 'draft').toLowerCase().replace('_', '-')}`;
  }

  hasFieldError(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  hasFormError(errorKey: string): boolean {
    return !!this.form.errors?.[errorKey] && (this.form.touched || this.form.dirty);
  }

  handleImageError(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (image.src.endsWith(this.fallbackImage)) {
      return;
    }

    image.src = this.fallbackImage;
  }

  private patchTour(tour: AdminTour): void {
    this.slugManuallyEdited = true;
    this.form.reset({
      title: tour.title || '',
      slug: tour.slug || '',
      shortDescription: tour.shortDescription || '',
      description: tour.description || '',
      thumbnailUrl: tour.thumbnailUrl || '',
      originalPrice: this.parseNumber(tour.originalPrice) ?? 0,
      salePrice: this.parseNumber(tour.salePrice) ?? 0,
      durationDays: this.parseNumber(tour.durationDays) ?? 1,
      durationNights: this.parseNumber(tour.durationNights) ?? 0,
      departureLocation: tour.departureLocation || '',
      maxParticipants: this.parseNumber(tour.maxParticipants) ?? 1,
      availableSeats: this.parseNumber(tour.availableSeats) ?? 0,
      featured: !!tour.featured,
      status: this.parseStatus(tour.status) || 'DRAFT',
      categoryId: this.parseNumber(tour.categoryId) ?? 0,
      destinationId: this.parseNumber(tour.destinationId) ?? 0,
    });
    this.selectedThumbnailUrl = tour.thumbnailUrl || '';
  }

  private buildPayload(): AdminTourCreateRequest | AdminTourUpdateRequest {
    const rawValue = this.form.getRawValue();

    return {
      title: rawValue.title.trim(),
      slug: this.generateSlug(rawValue.slug) || rawValue.slug.trim(),
      shortDescription: rawValue.shortDescription.trim(),
      description: rawValue.description.trim() || undefined,
      thumbnailUrl: rawValue.thumbnailUrl.trim() || undefined,
      originalPrice: Number(rawValue.originalPrice) || 0,
      salePrice: Number(rawValue.salePrice) || 0,
      durationDays: Number(rawValue.durationDays) || 1,
      durationNights: Number(rawValue.durationNights) || 0,
      departureLocation: rawValue.departureLocation.trim(),
      maxParticipants: Number(rawValue.maxParticipants) || 1,
      availableSeats: Number(rawValue.availableSeats) || 0,
      featured: !!rawValue.featured,
      status: this.parseStatus(rawValue.status) || 'DRAFT',
      categoryId: Number(rawValue.categoryId),
      destinationId: Number(rawValue.destinationId),
    };
  }

  private tourRulesValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const originalPrice = this.parseNumber(control.get('originalPrice')?.value);
      const salePrice = this.parseNumber(control.get('salePrice')?.value);
      const maxParticipants = this.parseNumber(control.get('maxParticipants')?.value);
      const availableSeats = this.parseNumber(control.get('availableSeats')?.value);
      const durationDays = this.parseNumber(control.get('durationDays')?.value);
      const durationNights = this.parseNumber(control.get('durationNights')?.value);
      const errors: ValidationErrors = {};

      if (originalPrice !== undefined && salePrice !== undefined && salePrice > originalPrice) {
        errors['salePriceTooHigh'] = true;
      }

      if (maxParticipants !== undefined && availableSeats !== undefined && availableSeats > maxParticipants) {
        errors['availableSeatsTooHigh'] = true;
      }

      if (durationDays !== undefined && durationNights !== undefined && durationNights > durationDays) {
        errors['durationNightsTooHigh'] = true;
      }

      return Object.keys(errors).length ? errors : null;
    };
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

  private extractItem<T>(response: unknown): T | null {
    if (this.isRecord(response) && this.isRecord(response['data'])) {
      return response['data'] as T;
    }

    return this.isRecord(response) ? response as T : null;
  }

  private generateSlug(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private formatMoney(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  }

  private parseStatus(status?: string): TourStatus | null {
    return status === 'DRAFT' || status === 'PUBLISHED' || status === 'INACTIVE' || status === 'SOLD_OUT' ? status : null;
  }

  private errorText(error: unknown, fallback: string): string {
    if (this.isRecord(error)) {
      const status = this.parseNumber(error['status']);

      if (status === 401 || status === 403) {
        return 'Phiên đăng nhập admin không hợp lệ hoặc không đủ quyền quản lý tour.';
      }

      const errorBody = error['error'];

      if (this.isRecord(errorBody) && typeof errorBody['message'] === 'string') {
        return errorBody['message'];
      }
    }

    return fallback;
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
