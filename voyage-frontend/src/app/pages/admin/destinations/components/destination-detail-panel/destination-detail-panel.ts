import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, take } from 'rxjs';

import { AdminDestinationApiService } from '../../../../../core/api/admin-destination-api.service';
import { AuthService } from '../../../../../core/auth/auth.service';
import {
  AdminDestination,
  DestinationNewData,
  DestinationStatus,
  isDestinationDisplayEnabled,
} from '../../../../../core/models/destination.model';
import { AdminUiFeedbackService } from '../../../../../core/services/admin-ui-feedback.service';
import {
  DESTINATION_FALLBACK_IMAGE,
  displayClass,
  displayLabel,
  formatRegion,
  hasPendingData,
  parseStatus,
  workflowClass,
  workflowLabel,
} from '../../destination-utils';

type DestinationPendingFieldType = 'text' | 'image' | 'status' | 'display' | 'number';
type DestinationPendingDataKey = keyof DestinationNewData;

interface DestinationPendingComparisonRow {
  key: string;
  label: string;
  currentValue: string;
  pendingValue: string;
  changed: boolean;
  type: DestinationPendingFieldType;
  currentImageUrl: string;
  pendingImageUrl: string;
}

interface DestinationPendingReviewViewModel {
  destination: AdminDestination;
  title: string;
  slug: string;
  workflowLabel: string;
  workflowClassName: string;
  displayLabel: string;
  displayClassName: string;
  hasPendingData: boolean;
  parseError: string;
  rows: DestinationPendingComparisonRow[];
  canApproveReject: boolean;
  canCancelApprove: boolean;
}

interface DestinationNewDataParseResult {
  data: Partial<Record<DestinationPendingDataKey, unknown>> | null;
  errorMessage: string;
}

@Component({
  selector: 'app-admin-destination-detail-panel',
  standalone: true,
  imports: [NgClass, NgFor, NgIf],
  templateUrl: './destination-detail-panel.html',
  styleUrl: './destination-detail-panel.scss',
})
export class AdminDestinationDetailPanelComponent implements OnChanges {
  private readonly destinationApi = inject(AdminDestinationApiService);
  private readonly feedback = inject(AdminUiFeedbackService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  @Input() destination: AdminDestination | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() completed = new EventEmitter<void>();

  review: DestinationPendingReviewViewModel | null = null;
  rejectMode = false;
  rejectReason = '';
  submitting = false;
  errorMessage = '';
  readonly rejectReasonMaxLength = 500;
  readonly fallbackImage = DESTINATION_FALLBACK_IMAGE;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['destination']) {
      this.review = this.destination ? this.buildPendingReview(this.destination) : null;
      this.rejectMode = false;
      this.rejectReason = this.destination?.rejectReason || '';
      this.submitting = false;
      this.errorMessage = '';
    }
  }

  close(): void {
    if (!this.submitting) {
      this.closed.emit();
    }
  }

  approve(): void {
    const review = this.review;

    if (!review?.destination.id || !review.canApproveReject) {
      this.denyDestinationAction();
      return;
    }

    this.feedback
      .confirmInfo(
        'Bạn có chắc muốn duyệt dữ liệu thay đổi chờ duyệt của điểm đến này không?',
        'Xác nhận thao tác',
        'Duyệt',
      )
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.runWorkflowAction(
            (id) => this.destinationApi.approveDestination(id),
            'Đã duyệt điểm đến.',
            'Không thể duyệt điểm đến. Vui lòng thử lại sau.',
          );
        }
      });
  }

  startReject(): void {
    this.rejectMode = true;
    this.errorMessage = '';
  }

  cancelReject(): void {
    if (this.submitting) {
      return;
    }

    this.rejectMode = false;
    this.rejectReason = this.review?.destination.rejectReason || '';
    this.errorMessage = '';
  }

  confirmReject(): void {
    const review = this.review;
    const reason = this.rejectReason.trim();

    if (!review?.destination.id || !review.canApproveReject) {
      this.denyDestinationAction();
      return;
    }

    if (!reason) {
      this.errorMessage = 'Vui lòng nhập lý do từ chối.';
      this.feedback.warning(this.errorMessage);
      return;
    }

    this.runWorkflowAction(
      (id) => this.destinationApi.rejectDestination(id, { reason }),
      'Đã từ chối điểm đến.',
      'Không thể từ chối điểm đến. Vui lòng thử lại sau.',
    );
  }

  cancelApprove(): void {
    const review = this.review;

    if (!review?.destination.id || !review.canCancelApprove) {
      this.denyDestinationAction();
      return;
    }

    this.feedback
      .confirmWarning(
        'Bạn có chắc muốn hủy trình duyệt điểm đến này không?',
        'Xác nhận thao tác',
        'Hủy trình duyệt',
      )
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.runWorkflowAction(
            (id) => this.destinationApi.cancelApproveDestination(id),
            'Đã hủy trình duyệt điểm đến.',
            'Không thể hủy trình duyệt điểm đến. Vui lòng thử lại sau.',
          );
        }
      });
  }

  updateRejectReason(event: Event): void {
    this.rejectReason = (event.target as HTMLTextAreaElement).value.slice(0, this.rejectReasonMaxLength);
  }

  handleImageError(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (image.src.endsWith(this.fallbackImage)) {
      return;
    }

    image.src = this.fallbackImage;
  }

  private runWorkflowAction(
    action: (id: number) => Observable<unknown>,
    successMessage: string,
    fallbackErrorMessage: string,
  ): void {
    const destination = this.review?.destination;

    if (!destination?.id || this.submitting) {
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    action(destination.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting = false;
          this.rejectMode = false;
          this.rejectReason = '';
          this.feedback.success(successMessage);
          this.completed.emit();
          this.closed.emit();
        },
        error: (error) => {
          this.errorMessage = this.errorText(error, fallbackErrorMessage);
          this.feedback.error(this.errorMessage);
          this.submitting = false;
        },
      });
  }

  private buildPendingReview(destination: AdminDestination): DestinationPendingReviewViewModel {
    const parseResult = this.parseDestinationNewData(destination.newData);
    const pendingData = parseResult.data;
    const rows = pendingData ? this.buildPendingComparisonRows(destination, pendingData) : [];
    const status = parseStatus(destination.status);
    const hasParseError = !!parseResult.errorMessage;

    return {
      destination,
      title: destination.name || 'Điểm đến chưa đặt tên',
      slug: destination.slug || 'dang-cap-nhat',
      workflowLabel: workflowLabel(destination.status),
      workflowClassName: workflowClass(destination.status),
      displayLabel: displayLabel(destination),
      displayClassName: displayClass(destination),
      hasPendingData: !!pendingData || hasPendingData(destination),
      parseError: parseResult.errorMessage,
      rows,
      canApproveReject: status === 'PENDING' && !hasParseError && this.canApproveReject(),
      canCancelApprove: status === 'PENDING' && this.canCancelApprove(),
    };
  }

  private parseDestinationNewData(newData: AdminDestination['newData']): DestinationNewDataParseResult {
    if (newData === null || newData === undefined || newData === '') {
      return { data: null, errorMessage: '' };
    }

    if (this.isRecord(newData)) {
      return {
        data: Object.keys(newData).length
          ? newData as Partial<Record<DestinationPendingDataKey, unknown>>
          : null,
        errorMessage: '',
      };
    }

    if (typeof newData !== 'string' || !newData.trim()) {
      return { data: null, errorMessage: '' };
    }

    try {
      const parsed = JSON.parse(newData);

      if (!this.isRecord(parsed)) {
        return { data: null, errorMessage: 'Không thể đọc dữ liệu thay đổi.' };
      }

      return {
        data: Object.keys(parsed).length
          ? parsed as Partial<Record<DestinationPendingDataKey, unknown>>
          : null,
        errorMessage: '',
      };
    } catch {
      return { data: null, errorMessage: 'Không thể đọc dữ liệu thay đổi.' };
    }
  }

  private buildPendingComparisonRows(
    destination: AdminDestination,
    pendingData: Partial<Record<DestinationPendingDataKey, unknown>>,
  ): DestinationPendingComparisonRow[] {
    const fields: Array<{ key: DestinationPendingDataKey; label: string; type: DestinationPendingFieldType }> = [
      { key: 'name', label: 'Tên điểm đến', type: 'text' },
      { key: 'slug', label: 'Slug', type: 'text' },
      { key: 'region', label: 'Khu vực', type: 'text' },
      { key: 'country', label: 'Quốc gia', type: 'text' },
      { key: 'description', label: 'Mô tả', type: 'text' },
      { key: 'imageUrl', label: 'Ảnh', type: 'image' },
      { key: 'latitude', label: 'Vĩ độ', type: 'number' },
      { key: 'longitude', label: 'Kinh độ', type: 'number' },
      { key: 'status', label: 'Workflow', type: 'status' },
      { key: 'isDisplay', label: 'Hiển thị public', type: 'display' },
    ];

    return fields.map((field) => {
      const currentRawValue = this.destinationFieldValue(destination, field.key);
      const pendingRawValue = Object.prototype.hasOwnProperty.call(pendingData, field.key)
        ? pendingData[field.key]
        : currentRawValue;
      const currentValue = this.formatPendingValue(field.type, currentRawValue);
      const pendingValue = this.formatPendingValue(field.type, pendingRawValue);

      return {
        key: field.key,
        label: field.label,
        currentValue,
        pendingValue,
        changed: currentValue !== pendingValue,
        type: field.type,
        currentImageUrl: field.type === 'image' ? String(currentRawValue || '') : '',
        pendingImageUrl: field.type === 'image' ? String(pendingRawValue || '') : '',
      };
    });
  }

  private destinationFieldValue(destination: AdminDestination, key: DestinationPendingDataKey): unknown {
    return destination[key as keyof AdminDestination];
  }

  private formatPendingValue(type: DestinationPendingFieldType, value: unknown): string {
    if (type === 'status') {
      return workflowLabel(typeof value === 'string' ? value : undefined);
    }

    if (type === 'text' && (value === 'DOMESTIC' || value === 'INTERNATIONAL')) {
      return formatRegion(value);
    }

    if (type === 'display') {
      return isDestinationDisplayEnabled(value as string | number | boolean | null | undefined)
        ? 'Đang hiển thị'
        : 'Đang ẩn';
    }

    if (value === null || value === undefined || value === '') {
      return 'Chưa có';
    }

    return String(value);
  }

  private canApproveReject(): boolean {
    return this.auth.hasRole('ADMIN', 'SUPER_ADMIN');
  }

  private canCancelApprove(): boolean {
    return this.auth.hasRole('ADMIN', 'SUPER_ADMIN');
  }

  private denyDestinationAction(): void {
    this.feedback.warning('Bạn không có quyền thực hiện thao tác này.');
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

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
