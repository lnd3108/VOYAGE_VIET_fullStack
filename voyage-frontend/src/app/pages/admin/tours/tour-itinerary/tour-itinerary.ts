import { NgFor, NgIf } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs';

import { AdminTourApiService } from '../../../../core/api/admin-tour-api.service';
import { AdminTourItinerary, AdminTourItineraryUpdateRequest } from '../../../../core/models/admin-tour.model';
import { AdminUiFeedbackService } from '../../../../core/services/admin-ui-feedback.service';

interface ItineraryFormValue {
  dayNumber: number;
  title: string;
  description: string;
  hotelName: string;
  meals: string;
  transportModes: string;
  activities: string;
  placeNames: string;
}

@Component({
  selector: 'app-admin-tour-itinerary',
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './tour-itinerary.html',
  styleUrl: './tour-itinerary.scss',
})
export class TourItinerary implements OnInit, OnChanges {
  private readonly adminTourApiService = inject(AdminTourApiService);
  private readonly feedback = inject(AdminUiFeedbackService);

  @Input() tourId: number | null = null;
  @Input() isEditMode = false;

  itineraryLoading = false;
  itinerarySaving = false;
  itineraryDeletingId: number | null = null;
  itineraryErrorMessage = '';
  itinerarySuccessMessage = '';
  itineraries: AdminTourItinerary[] = [];
  editingItineraryId: number | null = null;
  isItineraryFormOpen = false;
  reorderSaving = false;

  form: ItineraryFormValue = this.emptyForm();

  ngOnInit(): void {
    this.loadItineraryIfReady();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tourId'] || changes['isEditMode']) {
      this.loadItineraryIfReady();
    }
  }

  loadItineraryIfReady(): void {
    if (!this.isEditMode || !this.tourId) {
      this.itineraries = [];
      this.closeForm();
      return;
    }

    this.loadItineraries();
  }

  loadItineraries(): void {
    if (!this.tourId) {
      return;
    }

    this.itineraryLoading = true;
    this.itineraryErrorMessage = '';
    this.itinerarySuccessMessage = '';

    this.adminTourApiService.getTourItineraries(this.tourId).subscribe({
      next: (response) => {
        this.itineraries = this.extractList(response).sort((a, b) => this.sortItinerary(a, b));
        this.itineraryLoading = false;
      },
      error: (error) => {
        this.itineraryErrorMessage = this.errorText(error, 'Không thể tải lịch trình tour. Vui lòng thử lại sau.');
        this.itineraryLoading = false;
      },
    });
  }

  openCreateForm(): void {
    this.editingItineraryId = null;
    this.form = this.emptyForm(this.getNextDayNumber());
    this.isItineraryFormOpen = true;
    this.itineraryErrorMessage = '';
    this.itinerarySuccessMessage = '';
  }

  openEditForm(item: AdminTourItinerary): void {
    this.editingItineraryId = item.id ?? null;
    this.form = {
      dayNumber: Number(item.dayNumber ?? this.getNextDayNumber()),
      title: item.title || '',
      description: item.description || '',
      hotelName: item.hotelName || '',
      meals: this.valueToText(item.meals),
      transportModes: this.valueToText(item.transportModes),
      activities: this.valueToText(item.activities),
      placeNames: this.valueToText(item.placeNames),
    };
    this.isItineraryFormOpen = true;
    this.itineraryErrorMessage = '';
    this.itinerarySuccessMessage = '';
  }

  closeForm(): void {
    this.isItineraryFormOpen = false;
    this.editingItineraryId = null;
    this.form = this.emptyForm();
  }

  saveForm(): void {
    const validationMessage = this.validateForm();

    if (validationMessage) {
      this.itineraryErrorMessage = validationMessage;
      return;
    }

    const normalizedItem = this.buildFormItem();
    const nextItems = this.editingItineraryId
      ? this.itineraries.map((item) => item.id === this.editingItineraryId ? { ...item, ...normalizedItem, id: item.id } : item)
      : [...this.itineraries, normalizedItem];

    this.saveAll(nextItems, this.editingItineraryId ? 'Đã cập nhật ngày lịch trình.' : 'Đã thêm ngày lịch trình.');
  }

  deleteItinerary(item: AdminTourItinerary): void {
    const label = item.dayNumber ? `Ngày ${item.dayNumber}` : 'ng\u00e0y l\u1ecbch tr\u00ecnh n\u00e0y';

    this.feedback
      .confirmDanger(
        'Thao t\u00e1c n\u00e0y kh\u00f4ng th\u1ec3 ho\u00e0n t\u00e1c. B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n x\u00f3a ' + label + '?',
      )
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.itineraryDeletingId = item.id ?? item.dayNumber ?? null;
        const nextItems = this.itineraries.filter((current) => current !== item && current.id !== item.id);
        this.saveAll(nextItems, '\u0110\u00e3 x\u00f3a ng\u00e0y l\u1ecbch tr\u00ecnh.');
      });
  }

  moveItinerary(item: AdminTourItinerary, direction: -1 | 1): void {
    const sortedItems = [...this.itineraries].sort((a, b) => this.sortItinerary(a, b));
    const currentIndex = sortedItems.findIndex((current) => current === item || current.id === item.id);
    const nextIndex = currentIndex + direction;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= sortedItems.length) {
      return;
    }

    const currentDay = sortedItems[currentIndex].dayNumber ?? currentIndex + 1;
    const nextDay = sortedItems[nextIndex].dayNumber ?? nextIndex + 1;
    sortedItems[currentIndex] = { ...sortedItems[currentIndex], dayNumber: nextDay, sortOrder: nextIndex };
    sortedItems[nextIndex] = { ...sortedItems[nextIndex], dayNumber: currentDay, sortOrder: currentIndex };
    this.saveAll(sortedItems, 'Đã cập nhật thứ tự lịch trình.', true);
  }

  getNextDayNumber(): number {
    const maxDay = this.itineraries.reduce((max, item) => Math.max(max, Number(item.dayNumber ?? 0)), 0);
    return maxDay + 1;
  }

  hasDuplicatedDayNumber(dayNumber: number, currentId?: number | null): boolean {
    return this.itineraries.some((item) => {
      const isCurrentItem = currentId && item.id === currentId;
      return !isCurrentItem && Number(item.dayNumber) === Number(dayNumber);
    });
  }

  trackItinerary(index: number, item: AdminTourItinerary): number | string {
    return item.id ?? `${item.dayNumber}-${item.title}-${index}`;
  }

  private saveAll(items: AdminTourItinerary[], successMessage: string, alsoCallReorder = false): void {
    if (!this.tourId) {
      this.itineraryErrorMessage = 'Vui lòng lưu tour trước khi quản lý lịch trình.';
      return;
    }

    this.itinerarySaving = true;
    this.itineraryErrorMessage = '';
    this.itinerarySuccessMessage = '';

    const payload = { items: items.sort((a, b) => this.sortItinerary(a, b)).map((item, index) => this.toRequestItem(item, index)) };

    this.adminTourApiService.saveTourItineraries(this.tourId, payload).subscribe({
      next: (response) => {
        const savedItems = this.extractList(response);
        const fallbackItems: AdminTourItinerary[] = payload.items.map((item) => ({ ...item }));
        this.itineraries = (savedItems.length ? savedItems : fallbackItems).sort((a, b) => this.sortItinerary(a, b));
        this.itinerarySuccessMessage = successMessage;
        this.feedback.success(this.itinerarySuccessMessage);
        this.itinerarySaving = false;
        this.itineraryDeletingId = null;
        this.closeForm();

        if (alsoCallReorder) {
          this.reorderItineraries();
        }
      },
      error: (error) => {
        this.itineraryErrorMessage = this.errorText(error, 'Không thể lưu lịch trình tour. Vui lòng thử lại sau.');
        this.feedback.error(this.itineraryErrorMessage);
        this.itinerarySaving = false;
        this.itineraryDeletingId = null;
      },
    });
  }

  private reorderItineraries(): void {
    if (!this.tourId) {
      return;
    }

    const items = this.itineraries
      .filter((item) => !!item.id)
      .map((item, index) => ({ id: item.id, sortOrder: item.sortOrder ?? index }));

    if (!items.length) {
      return;
    }

    this.reorderSaving = true;

    this.adminTourApiService.reorderTourItineraries(this.tourId, { items }).subscribe({
      next: () => {
        this.reorderSaving = false;
      },
      error: (error) => {
        this.itineraryErrorMessage = this.errorText(error, 'Đã lưu ngày lịch trình, nhưng không thể gọi reorder endpoint.');
        this.reorderSaving = false;
      },
    });
  }

  private validateForm(): string {
    const dayNumber = Number(this.form.dayNumber);

    if (!Number.isFinite(dayNumber) || dayNumber < 1) {
      return 'Số ngày phải là số lớn hơn hoặc bằng 1.';
    }

    if (!this.form.title.trim()) {
      return 'Tiêu đề ngày lịch trình là bắt buộc.';
    }

    if (!this.form.description.trim()) {
      return 'Nên nhập mô tả cho ngày lịch trình.';
    }

    if (this.hasDuplicatedDayNumber(dayNumber, this.editingItineraryId)) {
      return 'Số ngày đang bị trùng với ngày khác trong tour.';
    }

    return '';
  }

  private buildFormItem(): AdminTourItinerary {
    return {
      id: this.editingItineraryId ?? undefined,
      dayNumber: Number(this.form.dayNumber),
      title: this.form.title.trim(),
      description: this.form.description.trim(),
      hotelName: this.form.hotelName.trim() || undefined,
      meals: this.form.meals.trim() || undefined,
      transportModes: this.form.transportModes.trim() || undefined,
      activities: this.form.activities.trim() || undefined,
      placeNames: this.form.placeNames.trim() || undefined,
      sortOrder: Number(this.form.dayNumber) - 1,
    };
  }

  private toRequestItem(item: AdminTourItinerary, index: number): AdminTourItineraryUpdateRequest {
    return {
      id: item.id,
      dayNumber: Number(item.dayNumber ?? index + 1),
      title: item.title || '',
      description: item.description || '',
      hotelName: item.hotelName || undefined,
      meals: this.valueToText(item.meals) || undefined,
      transportModes: this.valueToText(item.transportModes) || undefined,
      activities: this.valueToText(item.activities) || undefined,
      placeNames: this.valueToText(item.placeNames) || undefined,
      sortOrder: Number(item.sortOrder ?? index),
    };
  }

  private extractList(response: unknown): AdminTourItinerary[] {
    if (Array.isArray(response)) {
      return response.map((item) => this.normalizeItinerary(item)).filter(this.isItinerary);
    }

    if (!this.isRecord(response)) {
      return [];
    }

    const data = response['data'];

    if (Array.isArray(data)) {
      return data.map((item) => this.normalizeItinerary(item)).filter(this.isItinerary);
    }

    if (this.isRecord(data) && Array.isArray(data['content'])) {
      return data['content'].map((item) => this.normalizeItinerary(item)).filter(this.isItinerary);
    }

    if (this.isRecord(data) && Array.isArray(data['items'])) {
      return data['items'].map((item) => this.normalizeItinerary(item)).filter(this.isItinerary);
    }

    if (Array.isArray(response['content'])) {
      return response['content'].map((item) => this.normalizeItinerary(item)).filter(this.isItinerary);
    }

    if (Array.isArray(response['items'])) {
      return response['items'].map((item) => this.normalizeItinerary(item)).filter(this.isItinerary);
    }

    return [];
  }

  private normalizeItinerary(raw: unknown): AdminTourItinerary | null {
    if (!this.isRecord(raw)) {
      return null;
    }

    return raw as AdminTourItinerary;
  }

  private sortItinerary(a: AdminTourItinerary, b: AdminTourItinerary): number {
    const dayCompare = Number(a.dayNumber ?? 0) - Number(b.dayNumber ?? 0);

    if (dayCompare !== 0) {
      return dayCompare;
    }

    return Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0);
  }

  private emptyForm(dayNumber = 1): ItineraryFormValue {
    return {
      dayNumber,
      title: '',
      description: '',
      hotelName: '',
      meals: '',
      transportModes: '',
      activities: '',
      placeNames: '',
    };
  }

  private valueToText(value: unknown): string {
    if (Array.isArray(value)) {
      return value.join(', ');
    }

    return typeof value === 'string' ? value : '';
  }

  private errorText(error: unknown, fallback: string): string {
    if (this.isRecord(error)) {
      const status = Number(error['status']);

      if (status === 401 || status === 403) {
        return 'Phiên đăng nhập admin không hợp lệ hoặc không đủ quyền quản lý lịch trình tour.';
      }

      const errorBody = error['error'];

      if (this.isRecord(errorBody) && typeof errorBody['message'] === 'string') {
        return errorBody['message'];
      }
    }

    return fallback;
  }

  private isItinerary(value: AdminTourItinerary | null): value is AdminTourItinerary {
    return !!value;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
