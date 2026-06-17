import { NgIf } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Input, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, take } from 'rxjs';

import { AdminDestinationApiService } from '../../../../../core/api/admin-destination-api.service';
import { AuthService } from '../../../../../core/auth/auth.service';
import {
  AdminDestination,
  DestinationBatchActionResponse,
} from '../../../../../core/models/destination.model';
import { AdminUiFeedbackService } from '../../../../../core/services/admin-ui-feedback.service';
import { isDisplayEnabled, parseStatus } from '../../destination-utils';

type DestinationBatchAction = 'submit' | 'approve' | 'reject' | 'cancelApprove' | 'show' | 'hide';

interface DestinationBatchActionConfig {
  label: string;
  confirmLabel: string;
  successVerb: string;
}

@Component({
  selector: 'app-admin-destination-bulk-actions',
  standalone: true,
  imports: [NgIf],
  templateUrl: './destination-bulk-actions.html',
  styleUrl: './destination-bulk-actions.scss',
})
export class AdminDestinationBulkActionsComponent {
  private readonly destinationApi = inject(AdminDestinationApiService);
  private readonly feedback = inject(AdminUiFeedbackService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  @Input() selectedDestinations: AdminDestination[] = [];
  @Input() disabled = false;

  @Output() completed = new EventEmitter<void>();
  @Output() clearSelection = new EventEmitter<void>();

  batchProcessing = false;
  batchErrorMessage = '';
  batchRejectMode = false;
  batchRejectReason = '';

  get selectedCount(): number {
    return this.selectedDestinations.length;
  }

  get shouldRender(): boolean {
    return this.selectedCount > 0 && this.canUseBatchWorkflow();
  }

  canUseBatchWorkflow(): boolean {
    return this.auth.hasRole('ADMIN', 'SUPER_ADMIN');
  }

  canRunBatchAction(action: DestinationBatchAction): boolean {
    return !this.disabled && !this.batchProcessing && this.getEligibleDestinations(action).length > 0;
  }

  updateBatchRejectReason(event: Event): void {
    this.batchRejectReason = (event.target as HTMLTextAreaElement).value;
  }

  cancelBatchReject(): void {
    this.batchRejectMode = false;
    this.batchRejectReason = '';
    this.batchErrorMessage = '';
  }

  requestClearSelection(): void {
    this.cancelBatchReject();
    this.clearSelection.emit();
  }

  runBatchAction(action: DestinationBatchAction): void {
    if (!this.selectedCount || this.batchProcessing || this.disabled) {
      return;
    }

    if (action === 'reject' && !this.batchRejectMode) {
      this.batchRejectMode = true;
      this.batchErrorMessage = '';
      return;
    }

    const rejectReason = this.batchRejectReason.trim();
    if (action === 'reject' && !rejectReason) {
      this.batchErrorMessage = 'Vui lòng nhập lý do từ chối.';
      this.feedback.warning(this.batchErrorMessage);
      return;
    }

    const eligibleDestinations = this.getEligibleDestinations(action);
    if (!eligibleDestinations.length) {
      this.batchErrorMessage = 'Không có điểm đến hợp lệ để thực hiện thao tác này.';
      this.feedback.warning(this.batchErrorMessage);
      return;
    }

    const skippedCount = Math.max(0, this.selectedCount - eligibleDestinations.length);
    const config = this.batchActionConfig(action);
    const confirmMessage = `Bạn đã chọn ${this.selectedCount} điểm đến. Có ${eligibleDestinations.length} điểm đến hợp lệ để ${config.confirmLabel}${skippedCount ? `, ${skippedCount} điểm đến sẽ bị bỏ qua` : ''}. Bạn có chắc muốn tiếp tục không?`;
    const confirm$ = action === 'submit' || action === 'approve' || action === 'show'
      ? this.feedback.confirmInfo(confirmMessage, 'Xác nhận thao tác hàng loạt', config.label)
      : this.feedback.confirmWarning(confirmMessage, 'Xác nhận thao tác hàng loạt', config.label);

    confirm$
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.executeBatchAction(action, eligibleDestinations, rejectReason);
        }
      });
  }

  getEligibleDestinations(action: DestinationBatchAction): AdminDestination[] {
    return this.selectedDestinations.filter(
      (destination) => typeof destination.id === 'number' && this.isDestinationEligibleForBatchAction(action, destination),
    );
  }

  private executeBatchAction(
    action: DestinationBatchAction,
    destinations: AdminDestination[],
    rejectReason: string,
  ): void {
    const ids = destinations
      .filter((destination): destination is AdminDestination & { id: number } => typeof destination.id === 'number')
      .map((destination) => destination.id);

    if (!ids.length) {
      this.batchErrorMessage = 'Không có điểm đến hợp lệ để thực hiện thao tác này.';
      this.feedback.warning(this.batchErrorMessage);
      return;
    }

    this.batchProcessing = true;
    this.batchErrorMessage = '';

    this.batchActionRequest(action, ids, rejectReason)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const result = this.extractBatchActionResponse(response) || this.fallbackBatchResponse(ids.length);
          const config = this.batchActionConfig(action);

          this.batchProcessing = false;
          this.batchRejectMode = false;
          this.batchRejectReason = '';
          this.clearSelection.emit();
          this.completed.emit();

          if (result.failedCount > 0) {
            const failedMessages = result.failedItems.map((item) => item.message).filter(Boolean).join('; ');
            this.batchErrorMessage = failedMessages
              ? `${result.successCount}/${result.total} điểm đến thành công, ${result.failedCount} điểm đến lỗi. ${failedMessages}`
              : `${result.successCount}/${result.total} điểm đến thành công, ${result.failedCount} điểm đến lỗi.`;
            this.feedback.warning(this.batchErrorMessage);
            return;
          }

          this.feedback.success(`${config.successVerb} ${result.successCount}/${result.total} điểm đến.`);
        },
        error: (error) => {
          this.batchProcessing = false;
          this.batchErrorMessage = this.errorText(error, 'Không thể xử lý batch điểm đến.');
          this.feedback.error(this.batchErrorMessage);
          this.batchRejectMode = false;
          this.batchRejectReason = '';
          this.clearSelection.emit();
          this.completed.emit();
        },
      });
  }

  private batchActionRequest(action: DestinationBatchAction, ids: number[], reason: string): Observable<unknown> {
    switch (action) {
      case 'submit':
        return this.destinationApi.submitDestinations(ids);
      case 'approve':
        return this.destinationApi.approveDestinations(ids);
      case 'reject':
        return this.destinationApi.rejectDestinations(ids, reason);
      case 'cancelApprove':
        return this.destinationApi.cancelApproveDestinations(ids);
      case 'show':
        return this.destinationApi.updateDestinationsDisplay(ids, 1);
      case 'hide':
        return this.destinationApi.updateDestinationsDisplay(ids, 0);
    }
  }

  private isDestinationEligibleForBatchAction(action: DestinationBatchAction, destination: AdminDestination): boolean {
    if (!this.canUseBatchWorkflow()) {
      return false;
    }

    const status = parseStatus(destination.status);
    const isDisplay = isDisplayEnabled(destination);

    switch (action) {
      case 'submit':
        return status === 'DRAFT' || status === 'REJECTED' || status === 'CANCEL_APPROVE';
      case 'approve':
      case 'reject':
      case 'cancelApprove':
        return status === 'PENDING';
      case 'show':
        return status === 'APPROVED' && !isDisplay;
      case 'hide':
        return status === 'APPROVED' && isDisplay;
    }
  }

  private batchActionConfig(action: DestinationBatchAction): DestinationBatchActionConfig {
    switch (action) {
      case 'submit':
        return { label: 'Gửi duyệt', confirmLabel: 'gửi duyệt', successVerb: 'Đã gửi duyệt' };
      case 'approve':
        return { label: 'Duyệt', confirmLabel: 'duyệt', successVerb: 'Đã duyệt' };
      case 'reject':
        return { label: 'Từ chối', confirmLabel: 'từ chối', successVerb: 'Đã từ chối' };
      case 'cancelApprove':
        return { label: 'Hủy trình duyệt', confirmLabel: 'hủy trình duyệt', successVerb: 'Đã hủy trình duyệt' };
      case 'show':
        return { label: 'Hiển thị public', confirmLabel: 'hiển thị public', successVerb: 'Đã bật hiển thị' };
      case 'hide':
        return { label: 'Ẩn public', confirmLabel: 'ẩn public', successVerb: 'Đã ẩn' };
    }
  }

  private extractBatchActionResponse(response: unknown): DestinationBatchActionResponse | null {
    const source = this.isRecord(response) && this.isRecord(response['data']) ? response['data'] : response;

    if (!this.isRecord(source)) {
      return null;
    }

    const total = this.parseNumber(source['total']);
    const successCount = this.parseNumber(source['successCount']);
    const failedCount = this.parseNumber(source['failedCount']);

    if (total === undefined || successCount === undefined || failedCount === undefined) {
      return null;
    }

    return {
      total,
      successCount,
      failedCount,
      successItems: Array.isArray(source['successItems'])
        ? source['successItems'].map((item) => this.normalizeBatchActionItem(item))
        : [],
      failedItems: Array.isArray(source['failedItems'])
        ? source['failedItems'].map((item) => this.normalizeBatchActionItem(item))
        : [],
    };
  }

  private normalizeBatchActionItem(value: unknown) {
    const record = this.isRecord(value) ? value : {};

    return {
      id: this.parseNumber(record['id']) ?? null,
      name: typeof record['name'] === 'string' ? record['name'] : null,
      success: Boolean(record['success']),
      message: typeof record['message'] === 'string' ? record['message'] : null,
    };
  }

  private fallbackBatchResponse(total: number): DestinationBatchActionResponse {
    return {
      total,
      successCount: total,
      failedCount: 0,
      successItems: [],
      failedItems: [],
    };
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
