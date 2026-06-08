import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Input, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AdminTourApiService } from '../../../core/api/admin-tour-api.service';
import { AdminTour, AdminTourImage, AdminTourItinerary, AdminTourSchedule, TourScheduleStatus, TourStatus } from '../../../core/models/admin-tour.model';

interface PreviewSchedule {
  date: string;
  seats: string;
  status: string;
  statusClass: string;
}

interface PreviewItinerary {
  id: string;
  title: string;
  body: string;
}

@Component({
  selector: 'app-tour-preview-panel',
  standalone: true,
  imports: [NgClass, NgFor, NgIf],
  templateUrl: './tour-preview-panel.component.html',
  styleUrl: './tour-preview-panel.component.scss',
})
export class TourPreviewPanelComponent {
  private readonly adminTourApiService = inject(AdminTourApiService);
  private readonly destroyRef = inject(DestroyRef);
  private currentTourId: number | null = null;
  private fallbackTour: AdminTour | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() editTour = new EventEmitter<AdminTour>();
  @Output() publishTour = new EventEmitter<AdminTour>();
  @Output() suspendTour = new EventEmitter<AdminTour>();

  loading = false;
  detailLoading = false;
  error = '';
  detailWarning = '';
  tour: AdminTour | null = null;
  title = 'Xem trước tour';
  statusLabel = 'Nháp';
  statusClass = 'tour-preview-panel__status--draft';
  mainImageUrl = '';
  priceText = 'Chưa có giá';
  originalPriceText = '';
  durationText = 'Chưa cập nhật';
  seatsText = 'Chưa cập nhật';
  destinationText = 'Chưa có điểm đến';
  descriptionText = 'Tour chưa có mô tả.';
  descriptionExpanded = false;
  descriptionLong = false;
  scheduleCount = 0;
  imageCount = 0;
  itineraryCount = 0;
  scheduleItems: PreviewSchedule[] = [];
  visibleScheduleItems: PreviewSchedule[] = [];
  itineraryItems: PreviewItinerary[] = [];
  visibleItineraryItems: PreviewItinerary[] = [];
  expandedItineraryIds = new Set<string>();
  showAllSchedules = false;
  showAllItinerary = false;

  @Input() set tourFallback(value: AdminTour | null) {
    this.fallbackTour = value;

    if (value && this.currentTourId && !this.tour) {
      this.tour = value;
      this.prepareView(value);
    }
  }

  @Input() set tourId(value: number | null) {
    if (value === this.currentTourId) {
      return;
    }

    this.currentTourId = value;

    if (!value) {
      this.reset();
      return;
    }

    this.loadTour(value);
  }

  retry(): void {
    if (this.currentTourId) {
      this.loadTour(this.currentTourId);
    }
  }

  close(): void {
    this.closed.emit();
  }

  requestEdit(): void {
    if (this.tour) {
      this.editTour.emit(this.tour);
    }
  }

  requestPublish(): void {
    if (this.tour) {
      this.publishTour.emit(this.tour);
    }
  }

  requestSuspend(): void {
    if (this.tour) {
      this.suspendTour.emit(this.tour);
    }
  }

  toggleDescription(): void {
    this.descriptionExpanded = !this.descriptionExpanded;
  }

  toggleSchedules(): void {
    this.showAllSchedules = !this.showAllSchedules;
    this.visibleScheduleItems = this.showAllSchedules ? this.scheduleItems : this.scheduleItems.slice(0, 3);
  }

  toggleItineraryList(): void {
    this.showAllItinerary = !this.showAllItinerary;
    this.visibleItineraryItems = this.showAllItinerary ? this.itineraryItems : this.itineraryItems.slice(0, 3);
  }

  toggleItinerary(id: string): void {
    if (this.expandedItineraryIds.has(id)) {
      this.expandedItineraryIds.delete(id);
      return;
    }

    this.expandedItineraryIds.add(id);
  }

  isItineraryOpen(id: string): boolean {
    return this.expandedItineraryIds.has(id);
  }

  canPublish(): boolean {
    return this.statusValue(this.statusRaw(this.tour)) === 'DRAFT';
  }

  canSuspend(): boolean {
    return this.statusValue(this.statusRaw(this.tour)) === 'PUBLISHED';
  }

  handleImageError(): void {
    this.mainImageUrl = '';
  }

  private loadTour(tourId: number): void {
    this.error = '';
    this.detailWarning = '';

    if (this.fallbackTour) {
      this.tour = this.fallbackTour;
      this.prepareView(this.fallbackTour);
      this.loading = false;
      this.detailLoading = true;
    } else {
      this.tour = null;
      this.prepareEmptyView();
      this.loading = true;
      this.detailLoading = false;
    }

    this.adminTourApiService
      .getTour(tourId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const detailTour = this.extractTour(response);
          const mergedTour = this.mergeTours(this.fallbackTour, detailTour);

          if (!mergedTour) {
            this.error = 'Không thể tải thông tin tour';
            this.loading = false;
            this.detailLoading = false;
            return;
          }

          this.tour = mergedTour;
          this.prepareView(mergedTour);
          this.loading = false;
          this.detailLoading = false;
        },
        error: () => {
          this.loading = false;
          this.detailLoading = false;

          if (this.fallbackTour) {
            this.tour = this.fallbackTour;
            this.prepareView(this.fallbackTour);
            this.detailWarning = 'Chưa tải được chi tiết đầy đủ, đang hiển thị dữ liệu từ bảng.';
            return;
          }

          this.error = 'Không thể tải thông tin tour';
        },
      });
  }

  private prepareView(tour: AdminTour): void {
    const schedules = this.extractArray<AdminTourSchedule>(tour, ['schedules', 'tourSchedules', 'departures']);
    const images = this.extractArray<AdminTourImage>(tour, ['images', 'tourImages', 'gallery', 'galleryImages']);
    const itineraries = this.extractArray<AdminTourItinerary>(tour, ['itinerary', 'itineraries', 'tourItinerary', 'tourItineraries']);
    const salePrice = this.numberFrom(tour, ['salePrice', 'currentPrice']);
    const basePrice = this.numberFrom(tour, ['price', 'originalPrice', 'adultPrice']);
    const mainPrice = salePrice ?? basePrice;
    const originalPrice = basePrice !== undefined && salePrice !== undefined && basePrice > salePrice ? basePrice : undefined;
    const status = this.statusRaw(tour);

    this.title = this.stringFrom(tour, ['title', 'name', 'tourName']) || 'Tour chưa đặt tên';
    this.statusLabel = this.statusText(status);
    this.statusClass = `tour-preview-panel__status--${this.statusValue(status).toLowerCase().replace('_', '-')}`;
    this.mainImageUrl = this.stringFrom(tour, ['imageUrl', 'thumbnailUrl', 'coverImageUrl', 'thumbnail']) || this.thumbnailFromImages(images);
    this.priceText = this.formatPrice(mainPrice);
    this.originalPriceText = originalPrice !== undefined ? this.formatPrice(originalPrice) : '';
    this.durationText = this.durationFrom(tour);
    this.seatsText = this.seatsFrom(tour);
    this.destinationText = this.destinationFrom(tour) || 'Chưa có điểm đến';
    this.descriptionText = this.stringFrom(tour, ['description', 'shortDescription']) || 'Tour chưa có mô tả.';
    this.descriptionLong = this.descriptionText.length > 220;
    this.descriptionExpanded = false;
    this.scheduleCount = schedules.length || this.numberFrom(tour, ['scheduleCount']) || 0;
    this.imageCount = images.length || this.numberFrom(tour, ['imageCount']) || 0;
    this.itineraryCount = itineraries.length || this.numberFrom(tour, ['itineraryCount']) || 0;
    this.scheduleItems = schedules.map((schedule) => this.toScheduleView(schedule));
    this.visibleScheduleItems = this.scheduleItems.slice(0, 3);
    this.showAllSchedules = false;
    this.itineraryItems = itineraries.map((item, index) => this.toItineraryView(item, index));
    this.visibleItineraryItems = this.itineraryItems.slice(0, 3);
    this.showAllItinerary = false;
    this.expandedItineraryIds = new Set(this.visibleItineraryItems.slice(0, 1).map((item) => item.id));
  }

  private prepareEmptyView(): void {
    this.title = 'Đang tải tour';
    this.statusLabel = 'Nháp';
    this.statusClass = 'tour-preview-panel__status--draft';
    this.mainImageUrl = '';
    this.priceText = 'Chưa có giá';
    this.originalPriceText = '';
    this.durationText = 'Chưa cập nhật';
    this.seatsText = 'Chưa cập nhật';
    this.destinationText = 'Chưa có điểm đến';
    this.descriptionText = 'Tour chưa có mô tả.';
    this.descriptionExpanded = false;
    this.descriptionLong = false;
    this.scheduleCount = 0;
    this.imageCount = 0;
    this.itineraryCount = 0;
    this.scheduleItems = [];
    this.visibleScheduleItems = [];
    this.itineraryItems = [];
    this.visibleItineraryItems = [];
    this.expandedItineraryIds.clear();
  }

  private reset(): void {
    this.loading = false;
    this.detailLoading = false;
    this.error = '';
    this.detailWarning = '';
    this.tour = null;
    this.prepareEmptyView();
  }

  private extractTour(response: unknown): AdminTour | null {
    const unwrapped = this.unwrapResponse(response);
    return this.isRecord(unwrapped) ? unwrapped as AdminTour : null;
  }

  private unwrapResponse(response: unknown): unknown {
    let current = response;

    for (let depth = 0; depth < 3; depth += 1) {
      if (!this.isRecord(current)) {
        return current;
      }

      const wrapperKey = ['data', 'result', 'content'].find((key) => this.isRecord((current as Record<string, unknown>)[key]));
      if (!wrapperKey) {
        return current;
      }

      current = (current as Record<string, unknown>)[wrapperKey];
    }

    return current;
  }

  private mergeTours(fallback: AdminTour | null, detail: AdminTour | null): AdminTour | null {
    if (!fallback && !detail) {
      return null;
    }

    if (!fallback) {
      return detail;
    }

    if (!detail) {
      return fallback;
    }

    const merged: Record<string, unknown> = { ...fallback };
    const detailRecord = detail as Record<string, unknown>;

    Object.keys(detailRecord).forEach((key) => {
      const value = detailRecord[key];
      if (this.hasValue(value)) {
        merged[key] = value;
      }
    });

    return merged as AdminTour;
  }

  private hasValue(value: unknown): boolean {
    if (value === null || value === undefined) {
      return false;
    }

    if (typeof value === 'string') {
      return value.trim().length > 0;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return true;
  }

  private extractArray<T>(tour: AdminTour, keys: string[]): T[] {
    const record = tour as Record<string, unknown>;

    for (const key of keys) {
      const value = record[key];
      if (Array.isArray(value)) {
        return value as T[];
      }
    }

    return [];
  }

  private toScheduleView(schedule: AdminTourSchedule): PreviewSchedule {
    const scheduleRecord = schedule as Record<string, unknown>;
    const maxSeats = this.numberFrom(scheduleRecord, ['maxSeats', 'totalSeats', 'seats']);
    const remainingSeats = this.numberFrom(scheduleRecord, ['remainingSeats', 'availableSeats'])
      ?? Math.max((maxSeats ?? 0) - (this.numberFrom(scheduleRecord, ['bookedSeats']) ?? 0), 0);
    const status = this.scheduleStatus(schedule, remainingSeats, maxSeats ?? 0);

    return {
      date: this.formatDate(this.stringFrom(scheduleRecord, ['departureDate', 'startDate', 'date'])),
      seats: maxSeats ? `${remainingSeats}/${maxSeats} chỗ` : `${remainingSeats} chỗ`,
      status: status.label,
      statusClass: status.className,
    };
  }

  private toItineraryView(item: AdminTourItinerary, index: number): PreviewItinerary {
    const itemRecord = item as Record<string, unknown>;
    const day = this.numberFrom(itemRecord, ['dayNumber', 'day']) || index + 1;
    const details = [item.description, item.activities, item.placeNames, item.meals, item.transportModes]
      .map((value) => typeof value === 'string' ? value.trim() : '')
      .filter(Boolean)
      .join(' - ');

    return {
      id: String(item.id ?? day),
      title: `Ngày ${day}: ${this.stringFrom(itemRecord, ['title', 'name']) || 'Lịch trình đang cập nhật'}`,
      body: details || 'Chưa có nội dung chi tiết.',
    };
  }

  private scheduleStatus(schedule: AdminTourSchedule, remainingSeats: number, maxSeats: number): { label: string; className: string } {
    const status = String(schedule.status || '').toUpperCase() as TourScheduleStatus;

    if (status === 'FULL' || status === 'CLOSED' || status === 'CANCELLED' || remainingSeats <= 0) {
      return { label: status === 'CANCELLED' ? 'Đã hủy' : 'Hết chỗ', className: 'tour-preview-panel__schedule-status--danger' };
    }

    if (maxSeats > 0 && remainingSeats / maxSeats <= 0.2) {
      return { label: 'Gần hết', className: 'tour-preview-panel__schedule-status--warning' };
    }

    return { label: 'Còn chỗ', className: 'tour-preview-panel__schedule-status--open' };
  }

  private statusRaw(tour: AdminTour | null): string | undefined {
    return tour ? this.stringFrom(tour, ['status', 'tourStatus']) : undefined;
  }

  private statusText(status?: string): string {
    switch (this.statusValue(status)) {
      case 'PUBLISHED':
        return 'Đã xuất bản';
      case 'INACTIVE':
      case 'SUSPENDED':
        return 'Tạm ẩn';
      case 'SOLD_OUT':
        return 'Hết chỗ';
      case 'DRAFT':
      default:
        return 'Nháp';
    }
  }

  private statusValue(status?: string): TourStatus | 'SUSPENDED' {
    const normalized = String(status || '').toUpperCase();
    return normalized === 'PUBLISHED' || normalized === 'INACTIVE' || normalized === 'SOLD_OUT' || normalized === 'DRAFT' || normalized === 'SUSPENDED'
      ? normalized as TourStatus | 'SUSPENDED'
      : 'DRAFT';
  }

  private formatPrice(value?: number): string {
    if (value === undefined || value === null) {
      return 'Chưa có giá';
    }

    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
  }

  private durationFrom(tour: AdminTour): string {
    const explicit = this.stringFrom(tour, ['durationText', 'duration']);
    if (explicit) {
      return explicit;
    }

    const days = this.numberFrom(tour, ['durationDays']);
    const nights = this.numberFrom(tour, ['durationNights']);

    if (days === undefined && nights === undefined) {
      return 'Chưa cập nhật';
    }

    return `${days ?? 0} ngày ${nights ?? 0} đêm`;
  }

  private seatsFrom(tour: AdminTour): string {
    const explicit = this.stringFrom(tour, ['seats']);
    if (explicit) {
      return explicit;
    }

    const available = this.numberFrom(tour, ['availableSeats']);
    const max = this.numberFrom(tour, ['maxParticipants', 'maxPeople', 'totalSeats', 'seats']);

    if (available !== undefined && max !== undefined) {
      return `${available}/${max} chỗ`;
    }

    if (max !== undefined) {
      return `${max} chỗ`;
    }

    if (available !== undefined) {
      return `${available} chỗ`;
    }

    return 'Chưa cập nhật';
  }

  private destinationFrom(tour: AdminTour): string {
    const direct = this.stringFrom(tour, ['destinationDisplayName', 'destinationName']);
    if (direct) {
      return direct;
    }

    const record = tour as Record<string, unknown>;
    const destination = record['destination'];
    if (this.isRecord(destination)) {
      const destinationName = this.stringFrom(destination, ['name', 'title', 'displayName']);
      if (destinationName) {
        return destinationName;
      }
    }

    if (Array.isArray(record['destinations'])) {
      const names = record['destinations']
        .map((item) => this.isRecord(item) ? this.stringFrom(item, ['name', 'title', 'displayName']) : '')
        .filter(Boolean);
      if (names.length) {
        return names.join(' - ');
      }
    }

    if (Array.isArray(tour.selectedDestinationNames) && tour.selectedDestinationNames.length) {
      return tour.selectedDestinationNames.join(' - ');
    }

    return this.stringFrom(tour, ['departureLocation']);
  }

  private formatDate(value?: string): string {
    if (!value) {
      return 'Chưa cập nhật';
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('vi-VN').format(date);
  }

  private thumbnailFromImages(images: AdminTourImage[]): string {
    const thumbnail = images.find((image) => image.isThumbnail) || images[0];
    return this.stringFrom(thumbnail || {}, ['secureUrl', 'imageUrl', 'url'])
      || this.stringFrom(thumbnail?.data || {}, ['secureUrl', 'imageUrl', 'url']);
  }

  private stringFrom(source: unknown, keys: string[]): string {
    if (!this.isRecord(source)) {
      return '';
    }

    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }

      if (typeof value === 'number' && Number.isFinite(value)) {
        return String(value);
      }
    }

    return '';
  }

  private numberFrom(source: unknown, keys: string[]): number | undefined {
    if (!this.isRecord(source)) {
      return undefined;
    }

    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
      }

      if (typeof value === 'string' && value.trim()) {
        const parsed = Number(value.replace(/[.,\s₫đVND]/gi, ''));
        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }
    }

    return undefined;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
