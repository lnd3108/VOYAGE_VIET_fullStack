import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs';

import { AdminTourApiService } from '../../../../core/api/admin-tour-api.service';
import {
  AdminTourSchedule,
  AdminTourScheduleCreateRequest,
  AdminTourScheduleUpdateRequest,
  TourScheduleStatus,
} from '../../../../core/models/admin-tour.model';
import { AdminUiFeedbackService } from '../../../../core/services/admin-ui-feedback.service';

interface ScheduleFormValue {
  departureDate: string;
  returnDate: string;
  priceAdult: number;
  priceChild: number;
  priceInfant: number;
  maxSeats: number;
  status: TourScheduleStatus;
  notes: string;
}

interface ScheduleStatusOption {
  label: string;
  value: TourScheduleStatus;
}

@Component({
  selector: 'app-admin-tour-schedules',
  imports: [NgClass, NgFor, NgIf, FormsModule],
  templateUrl: './tour-schedules.html',
  styleUrl: './tour-schedules.scss',
})
export class TourSchedules implements OnInit, OnChanges {
  private readonly adminTourApiService = inject(AdminTourApiService);
  private readonly feedback = inject(AdminUiFeedbackService);

  @Input() tourId: number | null = null;
  @Input() isEditMode = false;

  readonly statusOptions: ScheduleStatusOption[] = [
    { label: 'Đang mở bán', value: 'OPEN' },
    { label: 'Đã đóng', value: 'CLOSED' },
    { label: 'Hết chỗ', value: 'FULL' },
    { label: 'Đã hủy', value: 'CANCELLED' },
  ];

  schedulesLoading = false;
  schedulesSaving = false;
  schedulesDeletingId: number | null = null;
  schedulesUpdatingStatusId: number | null = null;
  schedulesErrorMessage = '';
  schedulesSuccessMessage = '';
  schedules: AdminTourSchedule[] = [];
  editingScheduleId: number | null = null;
  isScheduleFormOpen = false;

  form: ScheduleFormValue = this.emptyForm();

  ngOnInit(): void {
    this.loadSchedulesIfReady();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tourId'] || changes['isEditMode']) {
      this.loadSchedulesIfReady();
    }
  }

  loadSchedulesIfReady(): void {
    if (!this.isEditMode || !this.tourId) {
      this.schedules = [];
      this.closeForm();
      return;
    }

    this.loadSchedules();
  }

  loadSchedules(): void {
    if (!this.tourId) {
      return;
    }

    this.schedulesLoading = true;
    this.schedulesErrorMessage = '';
    this.schedulesSuccessMessage = '';

    this.adminTourApiService.getTourSchedules(this.tourId).subscribe({
      next: (response) => {
        this.schedules = this.extractList(response).sort((a, b) => this.sortSchedulesByDate(a, b));
        this.schedulesLoading = false;
      },
      error: (error) => {
        this.schedulesErrorMessage = this.errorText(error, 'Không thể tải lịch khởi hành. Vui lòng thử lại sau.');
        this.schedulesLoading = false;
      },
    });
  }

  openCreateForm(): void {
    this.editingScheduleId = null;
    this.form = this.emptyForm();
    this.isScheduleFormOpen = true;
    this.schedulesErrorMessage = '';
    this.schedulesSuccessMessage = '';
  }

  openEditForm(schedule: AdminTourSchedule): void {
    if (!this.canEditSchedule(schedule)) {
      this.schedulesErrorMessage = 'Lịch đã hủy không nên chỉnh sửa trực tiếp. Hãy đổi trạng thái trước nếu cần.';
      return;
    }

    this.editingScheduleId = schedule.id ?? null;
    this.form = {
      departureDate: this.toDateInput(schedule.departureDate),
      returnDate: this.toDateInput(schedule.returnDate),
      priceAdult: this.parseNumber(schedule.priceAdult) ?? 0,
      priceChild: this.parseNumber(schedule.priceChild) ?? 0,
      priceInfant: this.parseNumber(schedule.priceInfant) ?? 0,
      maxSeats: this.parseNumber(schedule.maxSeats) ?? 1,
      status: this.parseScheduleStatus(schedule.status) || 'OPEN',
      notes: this.scheduleNotes(schedule),
    };
    this.isScheduleFormOpen = true;
    this.schedulesErrorMessage = '';
    this.schedulesSuccessMessage = '';
  }

  closeForm(): void {
    this.isScheduleFormOpen = false;
    this.editingScheduleId = null;
    this.form = this.emptyForm();
  }

  saveForm(): void {
    const validationMessage = this.validateForm();

    if (validationMessage) {
      this.schedulesErrorMessage = validationMessage;
      return;
    }

    if (!this.tourId) {
      this.schedulesErrorMessage = 'Vui lòng lưu tour trước khi quản lý lịch khởi hành.';
      return;
    }

    const payload = this.buildPayload();
    const request = this.editingScheduleId
      ? this.adminTourApiService.updateTourSchedule(this.tourId, this.editingScheduleId, payload as AdminTourScheduleUpdateRequest)
      : this.adminTourApiService.createTourSchedule(this.tourId, payload);

    this.schedulesSaving = true;
    this.schedulesErrorMessage = '';
    this.schedulesSuccessMessage = '';

    request.subscribe({
      next: (response) => {
        const savedSchedule = this.extractItem(response);
        this.schedulesSuccessMessage = this.editingScheduleId ? 'Đã cập nhật lịch khởi hành.' : 'Đã thêm lịch khởi hành.';
        this.schedulesSaving = false;
        this.closeForm();

        if (savedSchedule?.id || this.editingScheduleId) {
          this.upsertSchedule(savedSchedule || { ...payload, id: this.editingScheduleId ?? undefined, tourId: this.tourId ?? undefined });
        } else {
          this.loadSchedules();
        }
      },
      error: (error) => {
        this.schedulesErrorMessage = this.errorText(error, 'Không thể lưu lịch khởi hành. Vui lòng thử lại sau.');
        this.schedulesSaving = false;
      },
    });
  }

  updateStatusInput(schedule: AdminTourSchedule, event: Event): void {
    const nextStatus = this.parseScheduleStatus((event.target as HTMLSelectElement).value);

    if (!nextStatus) {
      return;
    }

    this.changeStatus(schedule, nextStatus);
  }

  changeStatus(schedule: AdminTourSchedule, nextStatus: TourScheduleStatus): void {
    if (!this.tourId || !schedule.id) {
      return;
    }

    const currentStatus = this.parseScheduleStatus(schedule.status);

    if (currentStatus === nextStatus) {
      return;
    }

    if (nextStatus === 'CLOSED' || nextStatus === 'CANCELLED') {
      this.feedback
        .confirmWarning(
          'B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n chuy\u1ec3n l\u1ecbch n\u00e0y sang "' + this.statusLabel(nextStatus) + '"?',
          'X\u00e1c nh\u1eadn thao t\u00e1c',
          '\u0110\u1ed3ng \u00fd',
        )
        .pipe(take(1))
        .subscribe((confirmed) => {
          if (confirmed) {
            this.runScheduleStatusUpdate(schedule, nextStatus);
          }
        });
      return;
    }

    this.runScheduleStatusUpdate(schedule, nextStatus);
  }

  private runScheduleStatusUpdate(schedule: AdminTourSchedule, nextStatus: TourScheduleStatus): void {
    if (!this.tourId || !schedule.id) {
      return;
    }

    this.schedulesUpdatingStatusId = schedule.id;
    this.schedulesErrorMessage = '';
    this.schedulesSuccessMessage = '';

    this.adminTourApiService.updateTourScheduleStatus(this.tourId, schedule.id, nextStatus).subscribe({
      next: (response) => {
        const updatedSchedule = this.extractItem(response) || { ...schedule, status: nextStatus };
        this.upsertSchedule(updatedSchedule);
        this.schedulesSuccessMessage = '\u0110\u00e3 c\u1eadp nh\u1eadt tr\u1ea1ng th\u00e1i l\u1ecbch sang ' + this.statusLabel(nextStatus) + '.';
        this.feedback.success(this.schedulesSuccessMessage);
        this.schedulesUpdatingStatusId = null;
      },
      error: (error) => {
        this.schedulesErrorMessage = this.errorText(error, 'Kh\u00f4ng th\u1ec3 c\u1eadp nh\u1eadt tr\u1ea1ng th\u00e1i l\u1ecbch. Vui l\u00f2ng th\u1eed l\u1ea1i sau.');
        this.feedback.error(this.schedulesErrorMessage);
        this.schedulesUpdatingStatusId = null;
      },
    });
  }

  deleteSchedule(schedule: AdminTourSchedule): void {
    if (!this.tourId || !schedule.id || this.schedulesDeletingId) {
      return;
    }

    const bookedSeats = this.parseNumber(schedule.bookedSeats) ?? 0;
    const message = bookedSeats > 0
      ? 'L\u1ecbch n\u00e0y \u0111\u00e3 c\u00f3 ' + bookedSeats + ' ch\u1ed7 \u0111\u01b0\u1ee3c booking. Backend c\u00f3 th\u1ec3 t\u1eeb ch\u1ed1i x\u00f3a. B\u1ea1n v\u1eabn mu\u1ed1n x\u00f3a?'
      : 'Thao t\u00e1c n\u00e0y kh\u00f4ng th\u1ec3 ho\u00e0n t\u00e1c. B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n x\u00f3a l\u1ecbch kh\u1edfi h\u00e0nh n\u00e0y?';

    this.feedback
      .confirmDanger(message)
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (!confirmed || !this.tourId || !schedule.id) {
          return;
        }

        this.schedulesDeletingId = schedule.id;
        this.schedulesErrorMessage = '';
        this.schedulesSuccessMessage = '';

        this.adminTourApiService.deleteTourSchedule(this.tourId, schedule.id).subscribe({
          next: () => {
            this.schedules = this.schedules.filter((item) => item.id !== schedule.id);
            this.schedulesSuccessMessage = '\u0110\u00e3 x\u00f3a l\u1ecbch kh\u1edfi h\u00e0nh.';
            this.feedback.success(this.schedulesSuccessMessage);
            this.schedulesDeletingId = null;
          },
          error: (error) => {
            this.schedulesErrorMessage = this.errorText(error, 'Kh\u00f4ng th\u1ec3 x\u00f3a l\u1ecbch kh\u1edfi h\u00e0nh. Vui l\u00f2ng th\u1eed l\u1ea1i sau.');
            this.feedback.error(this.schedulesErrorMessage);
            this.schedulesDeletingId = null;
          },
        });
      });
  }

  getRemainingSeats(schedule: AdminTourSchedule): number {
    const remainingSeats = this.parseNumber(schedule.remainingSeats);

    if (remainingSeats !== undefined) {
      return remainingSeats;
    }

    const maxSeats = this.parseNumber(schedule.maxSeats) ?? 0;
    const bookedSeats = this.parseNumber(schedule.bookedSeats) ?? 0;
    return Math.max(maxSeats - bookedSeats, 0);
  }

  canDeleteSchedule(schedule: AdminTourSchedule): boolean {
    return (this.parseNumber(schedule.bookedSeats) ?? 0) === 0;
  }

  canEditSchedule(schedule: AdminTourSchedule): boolean {
    return this.parseScheduleStatus(schedule.status) !== 'CANCELLED';
  }

  statusLabel(status?: string): string {
    switch (this.parseScheduleStatus(status)) {
      case 'OPEN':
        return 'Đang mở bán';
      case 'CLOSED':
        return 'Đã đóng';
      case 'FULL':
        return 'Hết chỗ';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status || 'Không rõ';
    }
  }

  statusClass(status?: string): string {
    return `admin-tour-schedules__status--${(this.parseScheduleStatus(status) || 'unknown').toLowerCase()}`;
  }

  formatMoney(value?: number): string {
    const amount = this.parseNumber(value) ?? 0;

    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  formatDate(value?: string): string {
    if (!value) {
      return 'Chưa có ngày';
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('vi-VN').format(parsed);
  }

  scheduleNotes(schedule: AdminTourSchedule): string {
    return String(schedule.notes || schedule.note || '');
  }

  trackSchedule(index: number, schedule: AdminTourSchedule): number | string {
    return schedule.id ?? `${schedule.departureDate}-${index}`;
  }

  private validateForm(): string {
    if (!this.form.departureDate) {
      return 'Vui lòng chọn ngày khởi hành.';
    }

    if (!this.form.returnDate) {
      return 'Vui lòng chọn ngày về.';
    }

    const departureTime = new Date(this.form.departureDate).getTime();
    const returnTime = new Date(this.form.returnDate).getTime();

    if (Number.isNaN(departureTime) || Number.isNaN(returnTime)) {
      return 'Ngày khởi hành hoặc ngày về không hợp lệ.';
    }

    if (returnTime < departureTime) {
      return 'Ngày về phải lớn hơn hoặc bằng ngày khởi hành.';
    }

    if (!Number.isFinite(Number(this.form.priceAdult)) || Number(this.form.priceAdult) < 0) {
      return 'Giá người lớn không hợp lệ.';
    }

    if (!Number.isFinite(Number(this.form.priceChild)) || Number(this.form.priceChild) < 0) {
      return 'Giá trẻ em không hợp lệ.';
    }

    if (!Number.isFinite(Number(this.form.priceInfant)) || Number(this.form.priceInfant) < 0) {
      return 'Giá em bé không hợp lệ.';
    }

    if (!Number.isFinite(Number(this.form.maxSeats)) || Number(this.form.maxSeats) < 1) {
      return 'Số chỗ tối đa phải lớn hơn hoặc bằng 1.';
    }

    const editingSchedule = this.schedules.find((schedule) => schedule.id === this.editingScheduleId);
    const bookedSeats = this.parseNumber(editingSchedule?.bookedSeats) ?? 0;

    if (bookedSeats > 0 && Number(this.form.maxSeats) < bookedSeats) {
      return `Số chỗ tối đa không được nhỏ hơn ${bookedSeats} chỗ đã booking.`;
    }

    return '';
  }

  private buildPayload(): AdminTourScheduleCreateRequest | AdminTourScheduleUpdateRequest {
    const notes = this.form.notes.trim();

    return {
      departureDate: this.form.departureDate,
      returnDate: this.form.returnDate,
      priceAdult: Number(this.form.priceAdult) || 0,
      priceChild: Number(this.form.priceChild) || 0,
      priceInfant: Number(this.form.priceInfant) || 0,
      singleSupplement: 0,
      maxSeats: Number(this.form.maxSeats) || 1,
      status: this.form.status,
      notes: notes || undefined,
    };
  }

  private extractList(response: unknown): AdminTourSchedule[] {
    if (Array.isArray(response)) {
      return response.map((item) => this.normalizeSchedule(item)).filter(this.isSchedule);
    }

    if (!this.isRecord(response)) {
      return [];
    }

    const data = response['data'];

    if (Array.isArray(data)) {
      return data.map((item) => this.normalizeSchedule(item)).filter(this.isSchedule);
    }

    if (this.isRecord(data) && Array.isArray(data['content'])) {
      return data['content'].map((item) => this.normalizeSchedule(item)).filter(this.isSchedule);
    }

    if (Array.isArray(response['content'])) {
      return response['content'].map((item) => this.normalizeSchedule(item)).filter(this.isSchedule);
    }

    return [];
  }

  private extractItem(response: unknown): AdminTourSchedule | null {
    if (this.isRecord(response) && this.isRecord(response['data'])) {
      return this.normalizeSchedule(response['data']);
    }

    return this.normalizeSchedule(response);
  }

  private normalizeSchedule(raw: unknown): AdminTourSchedule | null {
    if (!this.isRecord(raw)) {
      return null;
    }

    const schedule = raw as AdminTourSchedule;
    const maxSeats = this.parseNumber(schedule.maxSeats) ?? 0;
    const bookedSeats = this.parseNumber(schedule.bookedSeats) ?? 0;

    return {
      ...schedule,
      priceAdult: this.parseNumber(schedule.priceAdult) ?? 0,
      priceChild: this.parseNumber(schedule.priceChild) ?? 0,
      priceInfant: this.parseNumber(schedule.priceInfant) ?? 0,
      maxSeats,
      bookedSeats,
      remainingSeats: this.parseNumber(schedule.remainingSeats) ?? Math.max(maxSeats - bookedSeats, 0),
      status: this.parseScheduleStatus(schedule.status) || schedule.status,
      notes: schedule.notes || schedule.note,
    };
  }

  private upsertSchedule(schedule: AdminTourSchedule): void {
    this.schedules = [
      schedule,
      ...this.schedules.filter((item) => item.id !== schedule.id),
    ].sort((a, b) => this.sortSchedulesByDate(a, b));
  }

  private sortSchedulesByDate(a: AdminTourSchedule, b: AdminTourSchedule): number {
    const dateA = new Date(a.departureDate || '').getTime();
    const dateB = new Date(b.departureDate || '').getTime();

    if (Number.isNaN(dateA) && Number.isNaN(dateB)) {
      return (a.id ?? 0) - (b.id ?? 0);
    }

    if (Number.isNaN(dateA)) {
      return 1;
    }

    if (Number.isNaN(dateB)) {
      return -1;
    }

    return dateA - dateB;
  }

  private toDateInput(value?: string): string {
    if (!value) {
      return '';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    return parsed.toISOString().slice(0, 10);
  }

  private emptyForm(): ScheduleFormValue {
    return {
      departureDate: '',
      returnDate: '',
      priceAdult: 0,
      priceChild: 0,
      priceInfant: 0,
      maxSeats: 1,
      status: 'OPEN',
      notes: '',
    };
  }

  private parseScheduleStatus(status?: string): TourScheduleStatus | null {
    return status === 'OPEN' || status === 'CLOSED' || status === 'FULL' || status === 'CANCELLED' ? status : null;
  }

  private errorText(error: unknown, fallback: string): string {
    if (this.isRecord(error)) {
      const status = Number(error['status']);

      if (status === 401 || status === 403) {
        return 'Phiên đăng nhập admin không hợp lệ hoặc không đủ quyền quản lý lịch khởi hành.';
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

  private isSchedule(value: AdminTourSchedule | null): value is AdminTourSchedule {
    return !!value;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
