import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, HostListener, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { take } from 'rxjs';

import { AdminTourApiService } from '../../../core/api/admin-tour-api.service';
import { AdminTour, TourPublishChecklist, TourStatus } from '../../../core/models/admin-tour.model';
import { AdminUiFeedbackService } from '../../../core/services/admin-ui-feedback.service';

type TourStatusFilter = 'ALL' | TourStatus;
type FeaturedFilter = 'ALL' | 'FEATURED' | 'NORMAL';
type TourSortOption = 'UPDATED_DESC' | 'TITLE_ASC' | 'PRICE_ASC' | 'PRICE_DESC' | 'SEATS_ASC';

interface FilterOption<T> {
  label: string;
  value: T;
}

interface EntityFilterOption {
  label: string;
  value: string;
}

interface TourStats {
  total: number;
  published: number;
  draft: number;
  soldOut: number;
}

@Component({
  selector: 'app-admin-tours',
  imports: [NgClass, NgFor, NgIf, RouterLink],
  templateUrl: './tours.html',
  styleUrl: './tours.scss',
})
export class AdminTours implements OnInit {
  private readonly adminTourApiService = inject(AdminTourApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly feedback = inject(AdminUiFeedbackService);

  readonly fallbackImage = '/hero/bg-home.png';
  readonly statusOptions: FilterOption<TourStatus>[] = [
    { label: 'Nháp', value: 'DRAFT' },
    { label: 'Đã xuất bản', value: 'PUBLISHED' },
    { label: 'Tạm ẩn', value: 'INACTIVE' },
    { label: 'Hết chỗ', value: 'SOLD_OUT' },
  ];
  readonly statusFilters: FilterOption<TourStatusFilter>[] = [
    { label: 'Tất cả trạng thái', value: 'ALL' },
    ...this.statusOptions,
  ];
  readonly featuredFilters: FilterOption<FeaturedFilter>[] = [
    { label: 'Tất cả loại tour', value: 'ALL' },
    { label: 'Nổi bật', value: 'FEATURED' },
    { label: 'Thường', value: 'NORMAL' },
  ];
  readonly sortOptions: FilterOption<TourSortOption>[] = [
    { label: 'Mới cập nhật', value: 'UPDATED_DESC' },
    { label: 'Tên A-Z', value: 'TITLE_ASC' },
    { label: 'Giá thấp đến cao', value: 'PRICE_ASC' },
    { label: 'Giá cao đến thấp', value: 'PRICE_DESC' },
    { label: 'Ít chỗ trước', value: 'SEATS_ASC' },
  ];

  loading = false;
  saving = false;
  deletingId: number | null = null;
  updatingStatusId: number | null = null;
  publishingId: number | null = null;
  checklistLoadingId: number | null = null;
  errorMessage = '';
  successMessage = '';
  tours: AdminTour[] = [];
  filteredTours: AdminTour[] = [];
  categoryOptions: EntityFilterOption[] = [];
  destinationOptions: EntityFilterOption[] = [];
  keyword = '';
  statusFilter: TourStatusFilter = 'ALL';
  categoryFilter = 'ALL';
  destinationFilter = 'ALL';
  featuredFilter: FeaturedFilter = 'ALL';
  sortOption: TourSortOption = 'UPDATED_DESC';
  selectedTour: AdminTour | null = null;
  thumbnailTour: AdminTour | null = null;
  thumbnailUrlInput = '';
  checklistTourId: number | null = null;
  checklistMessage = '';
  checklistItems: string[] = [];
  openedActionTourId: number | null = null;

  ngOnInit(): void {
    this.loadTours();
  }

  @HostListener('document:click')
  closeActionMenu(): void {
    this.openedActionTourId = null;
  }

  get stats(): TourStats {
    return {
      total: this.tours.length,
      published: this.tours.filter((tour) => this.parseStatus(tour.status) === 'PUBLISHED').length,
      draft: this.tours.filter((tour) => this.parseStatus(tour.status) === 'DRAFT').length,
      soldOut: this.tours.filter((tour) => this.parseStatus(tour.status) === 'SOLD_OUT').length,
    };
  }

  loadTours(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminTourApiService
      .getTours()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.tours = this.extractList(response).sort((a, b) => this.sortTour(a, b));
          this.rebuildEntityOptions();
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = this.errorText(error, 'Không thể tải danh sách tour. Vui lòng thử lại sau.');
          this.loading = false;
        },
      });
  }

  showCreateTodo(): void {
    this.errorMessage = '';
    this.successMessage = 'Wizard tạo tour tại /admin/tours/new sẽ được làm ở bước tiếp theo.';
  }

  showEditTodo(tour: AdminTour): void {
    if (!tour.id) {
      this.errorMessage = 'Không xác định được tour cần sửa.';
      return;
    }

    this.errorMessage = '';
    this.successMessage = `Màn sửa tour /admin/tours/${tour.id}/edit sẽ được làm ở bước tiếp theo.`;
  }

  updateKeyword(event: Event): void {
    this.keyword = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  updateStatusFilter(event: Event): void {
    this.statusFilter = (event.target as HTMLSelectElement).value as TourStatusFilter;
    this.applyFilters();
  }

  updateFeaturedFilter(event: Event): void {
    this.featuredFilter = (event.target as HTMLSelectElement).value as FeaturedFilter;
    this.applyFilters();
  }

  updateCategoryFilter(event: Event): void {
    this.categoryFilter = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  updateDestinationFilter(event: Event): void {
    this.destinationFilter = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  updateSortOption(event: Event): void {
    this.sortOption = (event.target as HTMLSelectElement).value as TourSortOption;
    this.applyFilters();
  }

  openTourSummary(tour: AdminTour): void {
    this.selectedTour = this.selectedTour?.id === tour.id ? null : tour;
  }

  toggleActionMenu(tour: AdminTour, event?: Event): void {
    event?.stopPropagation();
    this.openedActionTourId = this.isActionMenuOpen(tour) ? null : tour.id ?? null;
  }

  isActionMenuOpen(tour: AdminTour): boolean {
    return !!tour.id && this.openedActionTourId === tour.id;
  }

  openPublicTour(tour: AdminTour): void {
    if (!tour.slug) {
      this.errorMessage = 'Tour chưa có slug nên không thể mở trang public.';
      return;
    }

    window.open(`/tours/${tour.slug}`, '_blank', 'noopener,noreferrer');
  }

  changeStatus(tour: AdminTour, event: Event): void {
    const nextStatus = (event.target as HTMLSelectElement).value as TourStatus;
    const currentStatus = this.parseStatus(tour.status) || 'DRAFT';

    this.updateTourStatus(tour, nextStatus, () => {
      (event.target as HTMLSelectElement).value = currentStatus;
    });
  }

  changeStatusFromMenu(tour: AdminTour, nextStatus: TourStatus): void {
    this.closeActionMenu();
    this.updateTourStatus(tour, nextStatus);
  }

  publishTour(tour: AdminTour): void {
    if (!tour.id || this.publishingId || this.checklistLoadingId) {
      return;
    }

    this.checklistLoadingId = tour.id;
    this.checklistTourId = tour.id;
    this.checklistMessage = '';
    this.checklistItems = [];
    this.errorMessage = '';
    this.successMessage = '';

    this.adminTourApiService
      .getPublishChecklist(tour.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const checklist = this.extractChecklist(response);
          const canPublish = this.canPublishFromChecklist(checklist);
          const missingItems = this.extractChecklistItems(checklist);

          this.checklistItems = missingItems;
          this.checklistMessage = this.checklistSummary(checklist, canPublish, missingItems);
          this.checklistLoadingId = null;

          if (!canPublish) {
            this.errorMessage = 'Tour chưa đủ điều kiện publish. Kiểm tra checklist bên dưới.';
            return;
          }

          this.runPublish(tour);
        },
        error: (error) => {
          this.errorMessage = this.errorText(error, 'Không thể kiểm tra checklist publish. Vui lòng thử lại sau.');
          this.checklistLoadingId = null;
        },
      });
  }

  openThumbnailPanel(tour: AdminTour): void {
    this.thumbnailTour = this.thumbnailTour?.id === tour.id ? null : tour;
    this.thumbnailUrlInput = this.thumbnailTour ? tour.thumbnailUrl || '' : '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  updateThumbnailInput(event: Event): void {
    this.thumbnailUrlInput = (event.target as HTMLInputElement).value;
  }

  saveThumbnail(): void {
    const tour = this.thumbnailTour;
    const imageUrl = this.thumbnailUrlInput.trim();

    if (!tour?.id) {
      this.errorMessage = 'Không xác định được tour cần cập nhật thumbnail.';
      return;
    }

    if (!imageUrl) {
      this.errorMessage = 'Vui lòng paste URL ảnh Cloudinary trước khi lưu thumbnail.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminTourApiService
      .updateTourThumbnail(tour.id, imageUrl)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const updatedTour = this.extractItem(response) || { ...tour, thumbnailUrl: imageUrl };
          this.upsertTour(updatedTour);
          this.thumbnailTour = null;
          this.thumbnailUrlInput = '';
          this.successMessage = 'Đã cập nhật thumbnail tour.';
          this.saving = false;
        },
        error: (error) => {
          this.errorMessage = this.errorText(error, 'Không thể cập nhật thumbnail tour. Vui lòng thử lại sau.');
          this.saving = false;
        },
      });
  }

  deleteTour(tour: AdminTour): void {
    if (!tour.id || this.deletingId) {
      return;
    }

    this.feedback
      .confirmDanger(
        'Thao t\u00e1c n\u00e0y kh\u00f4ng th\u1ec3 ho\u00e0n t\u00e1c. B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n x\u00f3a tour n\u00e0y? N\u1ebfu tour c\u00f3 booking/schedule li\u00ean quan, backend c\u00f3 th\u1ec3 t\u1eeb ch\u1ed1i x\u00f3a.',
      )
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (!confirmed || !tour.id) {
          return;
        }

        this.deletingId = tour.id;
        this.errorMessage = '';
        this.successMessage = '';

        this.adminTourApiService
          .deleteTour(tour.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.tours = this.tours.filter((item) => item.id !== tour.id);
              this.rebuildEntityOptions();
              this.applyFilters();
              this.successMessage = '\u0110\u00e3 x\u00f3a tour.';
              this.feedback.success(this.successMessage);
              this.deletingId = null;

              if (this.selectedTour?.id === tour.id) {
                this.selectedTour = null;
              }

              if (this.thumbnailTour?.id === tour.id) {
                this.thumbnailTour = null;
                this.thumbnailUrlInput = '';
              }
            },
            error: (error) => {
              this.errorMessage = this.errorText(error, 'Kh\u00f4ng th\u1ec3 x\u00f3a tour. Vui l\u00f2ng th\u1eed l\u1ea1i sau.');
              this.feedback.error(this.errorMessage);
              this.deletingId = null;
            },
          });
      });
  }

  applyFilters(): void {
    const keyword = this.normalizeText(this.keyword.trim());

    this.filteredTours = this.tours.filter((tour) => {
      const haystack = [tour.title, tour.slug, tour.categoryName, tour.destinationName, tour.departureLocation]
        .map((value) => this.normalizeText(value || ''));
      const matchesKeyword = !keyword || haystack.some((value) => value.includes(keyword));
      const status = this.parseStatus(tour.status);
      const matchesStatus = this.statusFilter === 'ALL' || status === this.statusFilter;
      const matchesFeatured = this.featuredFilter === 'ALL'
        || (this.featuredFilter === 'FEATURED' && !!tour.featured)
        || (this.featuredFilter === 'NORMAL' && !tour.featured);
      const matchesCategory = this.categoryFilter === 'ALL' || this.entityKey(tour.categoryId, tour.categoryName) === this.categoryFilter;
      const matchesDestination = this.destinationFilter === 'ALL' || this.entityKey(tour.destinationId, tour.destinationName) === this.destinationFilter;

      return matchesKeyword && matchesStatus && matchesFeatured && matchesCategory && matchesDestination;
    }).sort((a, b) => this.sortFilteredTour(a, b));
  }

  getThumbnail(tour: AdminTour): string {
    return tour.thumbnailUrl || this.fallbackImage;
  }

  thumbnailPreviewUrl(): string {
    return this.thumbnailUrlInput.trim();
  }

  priceText(tour: AdminTour): string {
    const salePrice = this.parseNumber(tour.salePrice);
    const originalPrice = this.parseNumber(tour.originalPrice);
    const currentPrice = salePrice ?? originalPrice;

    if (currentPrice === undefined) {
      return 'Chưa có giá';
    }

    return this.formatMoney(currentPrice);
  }

  originalPriceText(tour: AdminTour): string {
    const salePrice = this.parseNumber(tour.salePrice);
    const originalPrice = this.parseNumber(tour.originalPrice);

    if (salePrice === undefined || originalPrice === undefined || salePrice >= originalPrice) {
      return '';
    }

    return this.formatMoney(originalPrice);
  }

  durationText(tour: AdminTour): string {
    const days = this.parseNumber(tour.durationDays) ?? 0;
    const nights = this.parseNumber(tour.durationNights) ?? 0;

    if (!days && !nights) {
      return 'Chưa cập nhật';
    }

    return `${days} ngày ${nights} đêm`;
  }

  seatsText(tour: AdminTour): string {
    const availableSeats = this.parseNumber(tour.availableSeats);
    const maxParticipants = this.parseNumber(tour.maxParticipants);

    if (availableSeats === undefined && maxParticipants === undefined) {
      return 'Chưa cập nhật';
    }

    if (maxParticipants === undefined) {
      return `${availableSeats ?? 0} chỗ`;
    }

    return `${availableSeats ?? 0}/${maxParticipants} chỗ`;
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
    return `admin-tours__status--${(this.parseStatus(status) || 'draft').toLowerCase().replace('_', '-')}`;
  }

  statusValue(tour: AdminTour): TourStatus {
    return this.parseStatus(tour.status) || 'DRAFT';
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

  private runPublish(tour: AdminTour): void {
    if (!tour.id) {
      return;
    }

    this.publishingId = tour.id;

    this.adminTourApiService
      .publishTour(tour.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const publishedTour = this.extractItem(response) || { ...tour, status: 'PUBLISHED' as TourStatus };
          this.upsertTour(publishedTour);
          this.successMessage = 'Đã publish tour.';
          this.publishingId = null;
        },
        error: (error) => {
          this.errorMessage = this.errorText(error, 'Không thể publish tour. Vui lòng kiểm tra checklist và thử lại.');
          this.publishingId = null;
        },
      });
  }

  private updateTourStatus(tour: AdminTour, nextStatus: TourStatus, onError?: () => void): void {
    const currentStatus = this.parseStatus(tour.status) || 'DRAFT';

    if (nextStatus === currentStatus) {
      return;
    }

    if (nextStatus === 'PUBLISHED') {
      this.publishTour(tour);
      return;
    }

    if (nextStatus === 'INACTIVE') {
      this.feedback
        .confirmWarning(
          'B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n t\u1ea1m \u1ea9n tour n\u00e0y? Tour inactive s\u1ebd kh\u00f4ng hi\u1ec3n th\u1ecb tr\u00ean public.',
          'X\u00e1c nh\u1eadn thao t\u00e1c',
          'T\u1ea1m \u1ea9n',
        )
        .pipe(take(1))
        .subscribe((confirmed) => {
          if (confirmed) {
            this.runStatusUpdate(tour, nextStatus, onError);
            return;
          }

          onError?.();
        });
      return;
    }

    this.runStatusUpdate(tour, nextStatus, onError);
  }

  private runStatusUpdate(tour: AdminTour, nextStatus: TourStatus, onError?: () => void): void {
    if (!tour.id || this.updatingStatusId) {
      return;
    }

    this.updatingStatusId = tour.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminTourApiService
      .updateTourStatus(tour.id, nextStatus)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const updatedTour = this.extractItem(response) || { ...tour, status: nextStatus };
          this.upsertTour(updatedTour);
          this.successMessage = '\u0110\u00e3 c\u1eadp nh\u1eadt tr\u1ea1ng th\u00e1i tour sang ' + this.statusLabel(nextStatus) + '.';
          this.feedback.success(this.successMessage);
          this.updatingStatusId = null;
        },
        error: (error) => {
          this.errorMessage = this.errorText(error, 'Kh\u00f4ng th\u1ec3 c\u1eadp nh\u1eadt tr\u1ea1ng th\u00e1i tour. Vui l\u00f2ng th\u1eed l\u1ea1i sau.');
          this.feedback.error(this.errorMessage);
          this.updatingStatusId = null;
          onError?.();
        },
      });
  }

  private rebuildEntityOptions(): void {
    this.categoryOptions = this.buildEntityOptions('category');
    this.destinationOptions = this.buildEntityOptions('destination');
  }

  private buildEntityOptions(type: 'category' | 'destination'): EntityFilterOption[] {
    const map = new Map<string, string>();

    this.tours.forEach((tour) => {
      const id = type === 'category' ? tour.categoryId : tour.destinationId;
      const name = type === 'category' ? tour.categoryName : tour.destinationName;
      const key = this.entityKey(id, name);

      if (key !== 'UNKNOWN') {
        map.set(key, name || `#${id}`);
      }
    });

    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'vi'));
  }

  private upsertTour(tour: AdminTour): void {
    this.tours = [
      tour,
      ...this.tours.filter((item) => item.id !== tour.id),
    ].sort((a, b) => this.sortTour(a, b));
    this.rebuildEntityOptions();
    this.applyFilters();
  }

  private extractList(response: unknown): AdminTour[] {
    if (Array.isArray(response)) {
      return response.map((item) => this.normalizeTour(item)).filter(this.isTour);
    }

    if (!this.isRecord(response)) {
      return [];
    }

    const data = response['data'];

    if (Array.isArray(data)) {
      return data.map((item) => this.normalizeTour(item)).filter(this.isTour);
    }

    if (this.isRecord(data) && Array.isArray(data['content'])) {
      return data['content'].map((item) => this.normalizeTour(item)).filter(this.isTour);
    }

    if (Array.isArray(response['content'])) {
      return response['content'].map((item) => this.normalizeTour(item)).filter(this.isTour);
    }

    return [];
  }

  private extractItem(response: unknown): AdminTour | null {
    if (this.isRecord(response) && this.isRecord(response['data'])) {
      return this.normalizeTour(response['data']);
    }

    return this.normalizeTour(response);
  }

  private normalizeTour(value: unknown): AdminTour | null {
    if (!this.isRecord(value)) {
      return null;
    }

    return value as AdminTour;
  }

  private extractChecklist(response: unknown): TourPublishChecklist {
    if (this.isRecord(response) && this.isRecord(response['data'])) {
      return response['data'] as TourPublishChecklist;
    }

    if (this.isRecord(response)) {
      return response as TourPublishChecklist;
    }

    return { canPublish: false, missingItems: ['Backend trả checklist không đúng định dạng.'] };
  }

  private canPublishFromChecklist(checklist: TourPublishChecklist): boolean {
    if (typeof checklist.canPublish === 'boolean') {
      return checklist.canPublish;
    }

    const missingItems = this.extractChecklistItems(checklist);

    if (missingItems.length) {
      return false;
    }

    if (typeof checklist['valid'] === 'boolean') {
      return checklist['valid'] as boolean;
    }

    if (typeof checklist['publishable'] === 'boolean') {
      return checklist['publishable'] as boolean;
    }

    return true;
  }

  private extractChecklistItems(checklist: TourPublishChecklist): string[] {
    if (Array.isArray(checklist.missingItems)) {
      return checklist.missingItems.map((item) => String(item));
    }

    const missing = checklist['missing'];

    if (Array.isArray(missing)) {
      return missing.map((item) => String(item));
    }

    if (Array.isArray(checklist.items)) {
      return checklist.items
        .filter((item) => this.isRecord(item) && (item['passed'] === false || item['valid'] === false || item['ok'] === false))
        .map((item) => {
          const record = item as Record<string, unknown>;
          return String(record['label'] || record['name'] || record['message'] || JSON.stringify(record));
        });
    }

    return [];
  }

  private checklistSummary(checklist: TourPublishChecklist, canPublish: boolean, missingItems: string[]): string {
    if (typeof checklist.message === 'string' && checklist.message.trim()) {
      return checklist.message;
    }

    if (missingItems.length) {
      return 'Checklist còn thiếu dữ liệu trước khi publish.';
    }

    return canPublish ? 'Checklist hợp lệ. Đang publish tour...' : 'Tour chưa đủ điều kiện publish.';
  }

  private entityKey(id?: number, name?: string): string {
    if (id !== undefined && id !== null) {
      return `id:${id}`;
    }

    if (name) {
      return `name:${this.normalizeText(name)}`;
    }

    return 'UNKNOWN';
  }

  private sortTour(a: AdminTour, b: AdminTour): number {
    const updatedA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const updatedB = new Date(b.updatedAt || b.createdAt || 0).getTime();

    if (Number.isFinite(updatedA) && Number.isFinite(updatedB) && updatedA !== updatedB) {
      return updatedB - updatedA;
    }

    return (a.title || '').localeCompare(b.title || '', 'vi') || (a.id ?? 0) - (b.id ?? 0);
  }

  private sortFilteredTour(a: AdminTour, b: AdminTour): number {
    switch (this.sortOption) {
      case 'TITLE_ASC':
        return (a.title || '').localeCompare(b.title || '', 'vi');
      case 'PRICE_ASC':
        return this.currentPrice(a) - this.currentPrice(b);
      case 'PRICE_DESC':
        return this.currentPrice(b) - this.currentPrice(a);
      case 'SEATS_ASC':
        return (this.parseNumber(a.availableSeats) ?? 0) - (this.parseNumber(b.availableSeats) ?? 0);
      case 'UPDATED_DESC':
      default:
        return this.sortTour(a, b);
    }
  }

  private currentPrice(tour: AdminTour): number {
    return this.parseNumber(tour.salePrice) ?? this.parseNumber(tour.originalPrice) ?? 0;
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

  private isTour(value: AdminTour | null): value is AdminTour {
    return !!value;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
