import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { take } from 'rxjs';

import { AdminDestinationApiService } from '../../../core/api/admin-destination-api.service';
import {
  AdminDestination,
  AdminDestinationCreateRequest,
  AdminDestinationUpdateRequest,
  DestinationStatus,
} from '../../../core/models/destination.model';
import { AdminUiFeedbackService } from '../../../core/services/admin-ui-feedback.service';

type DestinationStatusFilter = 'ALL' | DestinationStatus;
type DestinationRegionFilter = 'ALL' | 'DOMESTIC' | 'INTERNATIONAL';

interface FilterOption<T> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-admin-destinations',
  imports: [NgClass, NgFor, NgIf, ReactiveFormsModule, RouterLink],
  templateUrl: './destinations.html',
  styleUrl: './destinations.scss',
})
export class AdminDestinations implements OnInit {
  private readonly adminDestinationApiService = inject(AdminDestinationApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly feedback = inject(AdminUiFeedbackService);

  readonly fallbackImage = '/hero/bg-home.png';
  readonly statusFilters: FilterOption<DestinationStatusFilter>[] = [
    { label: 'Tất cả', value: 'ALL' },
    { label: 'Đang hiển thị', value: 'ACTIVE' },
    { label: 'Tạm ẩn', value: 'INACTIVE' },
  ];
  readonly regionFilters: FilterOption<DestinationRegionFilter>[] = [
    { label: 'Tất cả khu vực', value: 'ALL' },
    { label: 'Trong nước', value: 'DOMESTIC' },
    { label: 'Quốc tế', value: 'INTERNATIONAL' },
  ];
  readonly regionOptions = [
    { label: 'Trong nước', value: 'DOMESTIC' },
    { label: 'Quốc tế', value: 'INTERNATIONAL' },
  ];

  loading = false;
  saving = false;
  deletingId: number | null = null;
  updatingStatusId: number | null = null;
  updatingImage = false;
  errorMessage = '';
  successMessage = '';
  destinations: AdminDestination[] = [];
  filteredDestinations: AdminDestination[] = [];
  keyword = '';
  statusFilter: DestinationStatusFilter = 'ALL';
  regionFilter: DestinationRegionFilter = 'ALL';
  selectedDestination: AdminDestination | null = null;
  isFormOpen = false;
  isEditMode = false;
  private slugManuallyEdited = false;

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
    slug: ['', [Validators.required]],
    region: ['DOMESTIC', [Validators.required]],
    country: ['Việt Nam', [Validators.required]],
    description: [''],
    imageUrl: [''],
    latitude: [''],
    longitude: [''],
    status: ['ACTIVE' as DestinationStatus],
  });

  ngOnInit(): void {
    this.loadDestinations();
  }

  loadDestinations(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminDestinationApiService
      .getDestinations()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.destinations = this.extractList(response).sort((a, b) => this.sortDestination(a, b));
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = this.errorText(error, 'Không thể tải danh sách điểm đến. Vui lòng thử lại sau.');
          this.loading = false;
        },
      });
  }

  openCreateForm(): void {
    this.isFormOpen = true;
    this.isEditMode = false;
    this.selectedDestination = null;
    this.slugManuallyEdited = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.form.reset({
      name: '',
      slug: '',
      region: 'DOMESTIC',
      country: 'Việt Nam',
      description: '',
      imageUrl: '',
      latitude: '',
      longitude: '',
      status: 'ACTIVE',
    });
  }

  openEditForm(destination: AdminDestination): void {
    this.isFormOpen = true;
    this.isEditMode = true;
    this.selectedDestination = destination;
    this.slugManuallyEdited = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.form.reset({
      name: destination.name || '',
      slug: destination.slug || '',
      region: destination.region || 'DOMESTIC',
      country: destination.country || 'Việt Nam',
      description: destination.description || '',
      imageUrl: destination.imageUrl || '',
      latitude: this.numberToInput(destination.latitude),
      longitude: this.numberToInput(destination.longitude),
      status: this.parseStatus(destination.status) || 'ACTIVE',
    });
  }

  closeForm(): void {
    this.isFormOpen = false;
    this.isEditMode = false;
    this.selectedDestination = null;
    this.slugManuallyEdited = false;
    this.saving = false;
    this.updatingImage = false;
    this.form.reset({
      name: '',
      slug: '',
      region: 'DOMESTIC',
      country: 'Việt Nam',
      description: '',
      imageUrl: '',
      latitude: '',
      longitude: '',
      status: 'ACTIVE',
    });
  }

  handleNameInput(): void {
    if (this.isEditMode || this.slugManuallyEdited) {
      return;
    }

    const slug = this.generateSlug(this.form.controls.name.value);
    this.form.controls.slug.setValue(slug);
  }

  markSlugEdited(): void {
    this.slugManuallyEdited = true;
  }

  handleRegionChange(event: Event): void {
    const region = (event.target as HTMLSelectElement).value;
    this.form.controls.region.setValue(region);

    if (region === 'DOMESTIC' && !this.form.controls.country.value.trim()) {
      this.form.controls.country.setValue('Việt Nam');
    }
  }

  updateKeyword(event: Event): void {
    this.keyword = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  updateStatusFilter(event: Event): void {
    this.statusFilter = (event.target as HTMLSelectElement).value as DestinationStatusFilter;
    this.applyFilters();
  }

  updateRegionFilter(event: Event): void {
    this.regionFilter = (event.target as HTMLSelectElement).value as DestinationRegionFilter;
    this.applyFilters();
  }

  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.isEditMode && !this.selectedDestination?.id) {
      this.errorMessage = 'Không xác định được điểm đến cần cập nhật.';
      return;
    }

    const payload = this.buildPayload();
    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request$ = this.isEditMode && this.selectedDestination?.id
      ? this.adminDestinationApiService.updateDestination(this.selectedDestination.id, payload as AdminDestinationUpdateRequest)
      : this.adminDestinationApiService.createDestination(payload);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const savedDestination = this.extractItem(response);
          this.successMessage = this.isEditMode ? 'Đã cập nhật điểm đến.' : 'Đã tạo điểm đến mới.';
          this.saving = false;

          if (savedDestination?.id) {
            this.upsertDestination(savedDestination);
          } else {
            this.loadDestinations();
          }

          this.closeForm();
        },
        error: (error) => {
          this.errorMessage = this.errorText(error, 'Không thể lưu điểm đến. Vui lòng thử lại sau.');
          this.saving = false;
        },
      });
  }

  updateImageOnly(): void {
    const destinationId = this.selectedDestination?.id;

    if (!this.isEditMode || !destinationId) {
      return;
    }

    const imageUrl = this.form.controls.imageUrl.value.trim();

    if (!imageUrl) {
      this.errorMessage = 'Vui lòng nhập URL ảnh Cloudinary trước khi cập nhật ảnh.';
      return;
    }

    this.updatingImage = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminDestinationApiService
      .updateDestinationImage(destinationId, imageUrl)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const fallbackDestination: AdminDestination = {
            ...(this.selectedDestination || {}),
            id: destinationId,
            imageUrl,
          };
          const updatedDestination = this.extractItem(response) || fallbackDestination;
          this.upsertDestination(updatedDestination);
          this.selectedDestination = updatedDestination;
          this.successMessage = 'Đã cập nhật ảnh điểm đến.';
          this.updatingImage = false;
        },
        error: (error) => {
          this.errorMessage = this.errorText(error, 'Không thể cập nhật ảnh điểm đến. Vui lòng thử lại sau.');
          this.updatingImage = false;
        },
      });
  }

  toggleStatus(destination: AdminDestination): void {
    if (!destination.id || this.updatingStatusId) {
      return;
    }

    const currentStatus = this.parseStatus(destination.status) || 'ACTIVE';
    const nextStatus: DestinationStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    if (nextStatus === 'INACTIVE') {
      this.feedback
        .confirmWarning(
          'B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n t\u1ea1m \u1ea9n \u0111i\u1ec3m \u0111\u1ebfn n\u00e0y? \u0110i\u1ec3m \u0111\u1ebfn inactive s\u1ebd kh\u00f4ng hi\u1ec3n th\u1ecb tr\u00ean public.',
          'X\u00e1c nh\u1eadn thao t\u00e1c',
          'T\u1ea1m \u1ea9n',
        )
        .pipe(take(1))
        .subscribe((confirmed) => {
          if (confirmed) {
            this.updateDestinationStatus(destination, nextStatus);
          }
        });
      return;
    }

    this.updateDestinationStatus(destination, nextStatus);
  }

  private updateDestinationStatus(destination: AdminDestination, nextStatus: DestinationStatus): void {
    if (!destination.id || this.updatingStatusId) {
      return;
    }

    this.updatingStatusId = destination.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminDestinationApiService
      .updateDestinationStatus(destination.id, nextStatus)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const updatedDestination = this.extractItem(response) || { ...destination, status: nextStatus };
          this.upsertDestination(updatedDestination);
          this.successMessage = nextStatus === 'ACTIVE' ? '\u0110\u00e3 b\u1eadt hi\u1ec3n th\u1ecb \u0111i\u1ec3m \u0111\u1ebfn.' : '\u0110\u00e3 t\u1ea1m \u1ea9n \u0111i\u1ec3m \u0111\u1ebfn.';
          this.feedback.success(this.successMessage);
          this.updatingStatusId = null;
        },
        error: (error) => {
          this.errorMessage = this.errorText(error, 'Kh\u00f4ng th\u1ec3 c\u1eadp nh\u1eadt tr\u1ea1ng th\u00e1i \u0111i\u1ec3m \u0111\u1ebfn. Vui l\u00f2ng th\u1eed l\u1ea1i sau.');
          this.feedback.error(this.errorMessage);
          this.updatingStatusId = null;
        },
      });
  }

  deleteDestination(destination: AdminDestination): void {
    if (!destination.id || this.deletingId) {
      return;
    }

    this.feedback
      .confirmDanger(
        'Thao t\u00e1c n\u00e0y kh\u00f4ng th\u1ec3 ho\u00e0n t\u00e1c. B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n x\u00f3a \u0111i\u1ec3m \u0111\u1ebfn n\u00e0y? N\u1ebfu \u0111i\u1ec3m \u0111\u1ebfn \u0111ang \u0111\u01b0\u1ee3c tour s\u1eed d\u1ee5ng, backend c\u00f3 th\u1ec3 t\u1eeb ch\u1ed1i x\u00f3a.',
      )
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (!confirmed || !destination.id) {
          return;
        }

        this.deletingId = destination.id;
        this.errorMessage = '';
        this.successMessage = '';

        this.adminDestinationApiService
          .deleteDestination(destination.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.destinations = this.destinations.filter((item) => item.id !== destination.id);
              this.applyFilters();
              this.successMessage = '\u0110\u00e3 x\u00f3a \u0111i\u1ec3m \u0111\u1ebfn.';
              this.feedback.success(this.successMessage);
              this.deletingId = null;

              if (this.selectedDestination?.id === destination.id) {
                this.closeForm();
              }
            },
            error: (error) => {
              this.errorMessage = this.errorText(error, 'Kh\u00f4ng th\u1ec3 x\u00f3a \u0111i\u1ec3m \u0111\u1ebfn. Vui l\u00f2ng th\u1eed l\u1ea1i sau.');
              this.feedback.error(this.errorMessage);
              this.deletingId = null;
            },
          });
      });
  }

  applyFilters(): void {
    const keyword = this.normalizeText(this.keyword.trim());

    this.filteredDestinations = this.destinations.filter((destination) => {
      const haystack = [destination.name, destination.slug, destination.country, destination.region]
        .map((value) => this.normalizeText(value || ''));
      const matchesKeyword = !keyword || haystack.some((value) => value.includes(keyword));
      const status = this.parseStatus(destination.status);
      const matchesStatus = this.statusFilter === 'ALL' || status === this.statusFilter;
      const matchesRegion = this.matchesRegionFilter(destination);

      return matchesKeyword && matchesStatus && matchesRegion;
    });
  }

  imagePreviewUrl(): string {
    return this.form.controls.imageUrl.value.trim();
  }

  getDestinationImage(destination: AdminDestination): string {
    return destination.imageUrl || this.fallbackImage;
  }

  coordinatesText(destination: AdminDestination): string {
    const latitude = this.parseNumber(destination.latitude);
    const longitude = this.parseNumber(destination.longitude);

    if (latitude === undefined || longitude === undefined) {
      return 'Chưa có tọa độ';
    }

    return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  }

  statusLabel(status?: string): string {
    return this.parseStatus(status) === 'INACTIVE' ? 'Tạm ẩn' : 'Đang hiển thị';
  }

  statusClass(status?: string): string {
    return `admin-destinations__status--${(this.parseStatus(status) || 'active').toLowerCase()}`;
  }

  nextStatusLabel(destination: AdminDestination): string {
    return this.parseStatus(destination.status) === 'ACTIVE' ? 'Tạm ẩn' : 'Bật';
  }

  formatRegion(value?: string): string {
    if (value === 'DOMESTIC') {
      return 'Trong nước';
    }

    if (value === 'INTERNATIONAL') {
      return 'Quốc tế';
    }

    return value || 'Chưa phân vùng';
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

  private buildPayload(): AdminDestinationCreateRequest | AdminDestinationUpdateRequest {
    const rawValue = this.form.getRawValue();
    const payload: AdminDestinationCreateRequest | AdminDestinationUpdateRequest = {
      name: rawValue.name.trim(),
      slug: this.generateSlug(rawValue.slug) || rawValue.slug.trim(),
      region: rawValue.region.trim(),
      country: rawValue.country.trim(),
      description: rawValue.description.trim() || undefined,
      imageUrl: rawValue.imageUrl.trim() || undefined,
      latitude: this.parseNumber(rawValue.latitude) ?? null,
      longitude: this.parseNumber(rawValue.longitude) ?? null,
    };

    if (this.isEditMode) {
      return {
        ...payload,
        status: this.parseStatus(rawValue.status) || 'ACTIVE',
      };
    }

    return payload;
  }

  private upsertDestination(destination: AdminDestination): void {
    this.destinations = [
      destination,
      ...this.destinations.filter((item) => item.id !== destination.id),
    ].sort((a, b) => this.sortDestination(a, b));
    this.applyFilters();
  }

  private extractList(response: unknown): AdminDestination[] {
    if (Array.isArray(response)) {
      return response.map((item) => this.normalizeDestination(item)).filter(this.isDestination);
    }

    if (!this.isRecord(response)) {
      return [];
    }

    const data = response['data'];

    if (Array.isArray(data)) {
      return data.map((item) => this.normalizeDestination(item)).filter(this.isDestination);
    }

    if (this.isRecord(data) && Array.isArray(data['content'])) {
      return data['content'].map((item) => this.normalizeDestination(item)).filter(this.isDestination);
    }

    if (Array.isArray(response['content'])) {
      return response['content'].map((item) => this.normalizeDestination(item)).filter(this.isDestination);
    }

    return [];
  }

  private extractItem(response: unknown): AdminDestination | null {
    if (this.isRecord(response) && this.isRecord(response['data'])) {
      return this.normalizeDestination(response['data']);
    }

    return this.normalizeDestination(response);
  }

  private normalizeDestination(value: unknown): AdminDestination | null {
    if (!this.isRecord(value)) {
      return null;
    }

    return value as AdminDestination;
  }

  private matchesRegionFilter(destination: AdminDestination): boolean {
    if (this.regionFilter === 'ALL') {
      return true;
    }

    if (this.regionFilter === 'DOMESTIC') {
      return this.isDomesticDestination(destination);
    }

    return this.isInternationalDestination(destination);
  }

  private isDomesticDestination(destination: AdminDestination): boolean {
    const region = this.normalizeText(destination.region || '');
    const country = this.normalizeText(destination.country || '');

    return region === 'domestic'
      || region.includes('trong-nuoc')
      || region.includes('viet-nam')
      || country === 'viet-nam'
      || country === 'vn';
  }

  private isInternationalDestination(destination: AdminDestination): boolean {
    const region = this.normalizeText(destination.region || '');

    return region === 'international'
      || region.includes('quoc-te')
      || (!!destination.country && !this.isDomesticDestination(destination));
  }

  private sortDestination(a: AdminDestination, b: AdminDestination): number {
    const regionCompare = (a.region || '').localeCompare(b.region || '', 'vi');

    if (regionCompare !== 0) {
      return regionCompare;
    }

    return (a.name || '').localeCompare(b.name || '', 'vi') || (a.id ?? 0) - (b.id ?? 0);
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

  private parseStatus(status?: string): DestinationStatus | null {
    return status === 'ACTIVE' || status === 'INACTIVE' ? status : null;
  }

  private errorText(error: unknown, fallback: string): string {
    if (this.isRecord(error)) {
      const status = this.parseNumber(error['status']);

      if (status === 401 || status === 403) {
        return 'Phiên đăng nhập admin không hợp lệ hoặc không đủ quyền quản lý điểm đến.';
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

  private numberToInput(value: unknown): string {
    const parsed = this.parseNumber(value);
    return parsed === undefined ? '' : String(parsed);
  }

  private normalizeText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-');
  }

  private isDestination(value: AdminDestination | null): value is AdminDestination {
    return !!value;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
