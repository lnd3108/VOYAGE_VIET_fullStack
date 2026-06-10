import { NgIf } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Input, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, take } from 'rxjs';

import { AdminCategoryApiService } from '../../../../../core/api/admin-category-api.service';
import { AuthService } from '../../../../../core/auth/auth.service';
import {
  AdminCategory,
  CategoryBatchActionResponse,
} from '../../../../../core/models/category.model';
import { AdminUiFeedbackService } from '../../../../../core/services/admin-ui-feedback.service';
import { errorText, isCategoryDisplayEnabled, isRecord, parseCategoryStatus, parseNumber } from '../../category-utils';

type CategoryBatchAction = 'submit' | 'approve' | 'reject' | 'cancelApprove' | 'show' | 'hide';

interface CategoryBatchActionConfig {
  label: string;
  confirmLabel: string;
  successVerb: string;
}

@Component({
  selector: 'app-admin-category-bulk-actions',
  standalone: true,
  imports: [NgIf],
  templateUrl: './category-bulk-actions.html',
  styleUrl: './category-bulk-actions.scss',
})
export class AdminCategoryBulkActionsComponent {
  private readonly api = inject(AdminCategoryApiService);
  private readonly auth = inject(AuthService);
  private readonly feedback = inject(AdminUiFeedbackService);
  private readonly destroyRef = inject(DestroyRef);

  @Input() selectedCategories: AdminCategory[] = [];

  @Output() completed = new EventEmitter<void>();
  @Output() clearSelectionRequested = new EventEmitter<void>();

  processing = false;
  rejectMode = false;
  rejectReason = '';
  errorMessage = '';

  get selectedCount(): number {
    return this.selectedCategories.length;
  }

  get canSubmit(): boolean {
    return this.hasAdminAccess;
  }

  get canApprove(): boolean {
    return this.hasAdminAccess;
  }

  get canReject(): boolean {
    return this.hasAdminAccess;
  }

  get canCancelApprove(): boolean {
    return this.hasAdminAccess;
  }

  get canShow(): boolean {
    return this.hasAdminAccess;
  }

  get canHide(): boolean {
    return this.hasAdminAccess;
  }

  runBatchSubmit(): void {
    this.confirmAndRunBatchAction('submit');
  }

  runBatchApprove(): void {
    this.confirmAndRunBatchAction('approve');
  }

  startBatchReject(): void {
    if (!this.hasAdminAccess) {
      this.denyCategoryAction();
      return;
    }

    if (!this.getBatchEligibleCategories('reject').length) {
      this.feedback.warning('Không có danh mục hợp lệ để thực hiện thao tác này.');
      return;
    }

    this.rejectMode = true;
    this.errorMessage = '';
  }

  cancelBatchReject(): void {
    this.rejectMode = false;
    this.rejectReason = '';
    this.errorMessage = '';
  }

  updateRejectReason(event: Event): void {
    this.rejectReason = (event.target as HTMLTextAreaElement).value;
  }

  confirmBatchReject(): void {
    this.confirmAndRunBatchAction('reject', this.rejectReason.trim() || null);
  }

  runBatchCancelApprove(): void {
    this.confirmAndRunBatchAction('cancelApprove');
  }

  runBatchShowPublic(): void {
    this.confirmAndRunBatchAction('show');
  }

  runBatchHidePublic(): void {
    this.confirmAndRunBatchAction('hide');
  }

  clearSelection(): void {
    this.cancelBatchReject();
    this.clearSelectionRequested.emit();
  }

  private get hasAdminAccess(): boolean {
    return this.auth.hasRole('ADMIN', 'SUPER_ADMIN');
  }

  private confirmAndRunBatchAction(action: CategoryBatchAction, reason: string | null = null): void {
    if (this.processing) {
      return;
    }

    if (!this.hasAdminAccess) {
      this.denyCategoryAction();
      return;
    }

    const selectedCount = this.selectedCategories.length;
    const eligibleCategories = this.getBatchEligibleCategories(action);
    const skippedCount = Math.max(0, selectedCount - eligibleCategories.length);
    const config = this.batchActionConfig(action);

    if (!eligibleCategories.length) {
      this.feedback.warning('Không có danh mục hợp lệ để thực hiện thao tác này.');
      return;
    }

    const confirmMessage = `Bạn đã chọn ${selectedCount} danh mục. Có ${eligibleCategories.length} danh mục hợp lệ để ${config.confirmLabel}, ${skippedCount} danh mục sẽ bị bỏ qua. Bạn có chắc muốn tiếp tục không?`;
    const confirm$ =
      action === 'approve' || action === 'show' || action === 'submit'
        ? this.feedback.confirmInfo(confirmMessage, 'Xác nhận thao tác hàng loạt', config.label)
        : this.feedback.confirmWarning(confirmMessage, 'Xác nhận thao tác hàng loạt', config.label);

    confirm$.pipe(take(1)).subscribe((confirmed) => {
      if (confirmed) {
        this.executeBatchAction(action, eligibleCategories, reason);
      }
    });
  }

  private executeBatchAction(
    action: CategoryBatchAction,
    categories: AdminCategory[],
    reason: string | null,
  ): void {
    const ids = categories
      .filter((category): category is AdminCategory & { id: number } => typeof category.id === 'number')
      .map((category) => category.id);

    if (!ids.length) {
      this.feedback.warning('Không có danh mục hợp lệ để thực hiện thao tác này.');
      return;
    }

    this.processing = true;
    this.errorMessage = '';

    this.batchActionRequest(action, ids, reason)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const batchResponse = this.extractBatchActionResponse(response) || this.fallbackBatchResponse(ids.length);
          const config = this.batchActionConfig(action);

          this.processing = false;
          this.rejectMode = false;
          this.rejectReason = '';
          this.clearSelectionRequested.emit();
          this.completed.emit();

          const successMessage = `Đã xử lý thành công ${batchResponse.successCount}/${batchResponse.total} danh mục.`;

          if (batchResponse.failedCount > 0) {
            const firstFailedMessage = batchResponse.failedItems[0]?.message;
            this.errorMessage = firstFailedMessage
              ? `Có ${batchResponse.failedCount} danh mục xử lý thất bại. Ví dụ: ${firstFailedMessage}`
              : `Có ${batchResponse.failedCount} danh mục xử lý thất bại. Vui lòng kiểm tra lại.`;
            this.feedback.warning(this.errorMessage);
            return;
          }

          this.feedback.success(`${config.successVerb}: ${successMessage}`);
        },
        error: (error) => {
          this.processing = false;
          this.errorMessage = errorText(
            error,
            'Không thể xử lý thao tác hàng loạt. Vui lòng thử lại sau.',
          );
          this.feedback.error(this.errorMessage);
          this.completed.emit();
        },
      });
  }

  private batchActionRequest(action: CategoryBatchAction, ids: number[], reason: string | null): Observable<unknown> {
    switch (action) {
      case 'submit':
        return this.api.submitCategories(ids);
      case 'approve':
        return this.api.approveCategories(ids);
      case 'reject':
        return this.api.rejectCategories(ids, reason);
      case 'cancelApprove':
        return this.api.cancelApproveCategories(ids);
      case 'show':
        return this.api.updateCategoriesDisplay(ids, 1);
      case 'hide':
        return this.api.updateCategoriesDisplay(ids, 0);
    }
  }

  private getBatchEligibleCategories(action: CategoryBatchAction): AdminCategory[] {
    return this.selectedCategories.filter(
      (category) => typeof category.id === 'number' && this.isCategoryEligibleForBatchAction(action, category),
    );
  }

  private isCategoryEligibleForBatchAction(action: CategoryBatchAction, category: AdminCategory): boolean {
    if (!this.hasAdminAccess) {
      return false;
    }

    const status = parseCategoryStatus(category.status);
    const isDisplay = isCategoryDisplayEnabled(category.isDisplay);

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

  private batchActionConfig(action: CategoryBatchAction): CategoryBatchActionConfig {
    switch (action) {
      case 'submit':
        return { label: 'Gửi duyệt', confirmLabel: 'gửi duyệt', successVerb: 'Gửi duyệt hàng loạt' };
      case 'approve':
        return { label: 'Duyệt', confirmLabel: 'duyệt', successVerb: 'Duyệt hàng loạt' };
      case 'reject':
        return { label: 'Từ chối', confirmLabel: 'từ chối', successVerb: 'Từ chối hàng loạt' };
      case 'cancelApprove':
        return {
          label: 'Hủy trình duyệt',
          confirmLabel: 'hủy trình duyệt',
          successVerb: 'Hủy trình duyệt hàng loạt',
        };
      case 'show':
        return {
          label: 'Hiển thị public',
          confirmLabel: 'hiển thị public',
          successVerb: 'Hiển thị public hàng loạt',
        };
      case 'hide':
        return { label: 'Ẩn public', confirmLabel: 'ẩn public', successVerb: 'Ẩn public hàng loạt' };
    }
  }

  private extractBatchActionResponse(response: unknown): CategoryBatchActionResponse | null {
    const source = isRecord(response) && isRecord(response['data']) ? response['data'] : response;

    if (!isRecord(source)) {
      return null;
    }

    const total = parseNumber(source['total']);
    const successCount = parseNumber(source['successCount']);
    const failedCount = parseNumber(source['failedCount']);

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
    const record = isRecord(value) ? value : {};

    return {
      id: parseNumber(record['id']) ?? null,
      name: typeof record['name'] === 'string' ? record['name'] : null,
      success: Boolean(record['success']),
      message: typeof record['message'] === 'string' ? record['message'] : null,
    };
  }

  private fallbackBatchResponse(total: number): CategoryBatchActionResponse {
    return {
      total,
      successCount: total,
      failedCount: 0,
      successItems: [],
      failedItems: [],
    };
  }

  private denyCategoryAction(): void {
    this.feedback.warning('Bạn không có quyền thực hiện thao tác này.');
  }
}
