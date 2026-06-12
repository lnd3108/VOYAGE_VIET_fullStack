import { NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, take } from 'rxjs';

import { AdminCategoryApiService } from '../../../../../core/api/admin-category-api.service';
import { AuthService } from '../../../../../core/auth/auth.service';
import { AdminCategory, CategoryNewData } from '../../../../../core/models/category.model';
import { AdminUiFeedbackService } from '../../../../../core/services/admin-ui-feedback.service';
import {
  displayClass,
  displayLabel,
  errorText,
  handleCategoryImageError,
  canDeleteCategory,
  canSubmitCategory,
  canToggleDisplayCategory,
  isCategoryDisplayEnabled,
  isRecord,
  normalizeText,
  parseCategoryStatus,
  workflowClass,
  workflowLabel,
} from '../../category-utils';

export type AdminCategoryPendingFieldType = 'text' | 'image' | 'status' | 'active' | 'display' | 'order';
type CategoryPendingDataKey = keyof CategoryNewData;

export interface AdminCategoryPendingComparisonRow {
  key: string;
  label: string;
  oldValue: string;
  newValue: string;
  changed: boolean;
  type: AdminCategoryPendingFieldType;
  oldImageUrl?: string;
  newImageUrl?: string;
  oldClassName?: string;
  newClassName?: string;
}

export interface AdminCategoryPendingReviewViewModel {
  category: AdminCategory;
  title: string;
  slug: string;
  workflowLabel: string;
  workflowClassName: string;
  displayLabel: string;
  displayClassName: string;
  hasPendingData: boolean;
  parseError: string;
  rows: AdminCategoryPendingComparisonRow[];
  canSubmit: boolean;
  canDelete: boolean;
  canToggleDisplay: boolean;
  displayToggleLabel: string;
  canApproveReject: boolean;
  canCancelApprove: boolean;
}

interface CategoryNewDataParseResult {
  data: Partial<Record<CategoryPendingDataKey, unknown>> | null;
  errorMessage: string;
}

@Component({
  selector: 'app-admin-category-detail-panel',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './category-detail-panel.html',
  styleUrl: './category-detail-panel.scss',
})
export class AdminCategoryDetailPanelComponent implements OnChanges {
  private readonly api = inject(AdminCategoryApiService);
  private readonly auth = inject(AuthService);
  private readonly feedback = inject(AdminUiFeedbackService);
  private readonly destroyRef = inject(DestroyRef);

  @Input() category: AdminCategory | null = null;

  @Output() completed = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  review: AdminCategoryPendingReviewViewModel | null = null;
  rejectMode = false;
  rejectReason = '';
  errorMessage = '';
  submitting = false;
  readonly rejectReasonMaxLength = 500;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['category']) {
      this.review = this.category ? this.buildPendingReview(this.category) : null;
      this.rejectMode = false;
      this.rejectReason = '';
      this.errorMessage = '';
      this.submitting = false;
    }
  }

  close(): void {
    if (!this.submitting) {
      this.closed.emit();
    }
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
    this.rejectReason = '';
    this.errorMessage = '';
  }

  updateRejectReason(event: Event): void {
    this.rejectReason = (event.target as HTMLTextAreaElement).value.slice(0, this.rejectReasonMaxLength);
  }

  get rejectReasonLength(): number {
    return this.rejectReason.length;
  }

  get canConfirmReject(): boolean {
    return !!this.rejectReason.trim() && !this.submitting;
  }

  approvePendingReview(): void {
    const review = this.review;
    const category = review?.category;

    if (!category || !review.canApproveReject || !this.canApproveCategory()) {
      if (category && !this.canApproveCategory()) {
        this.denyCategoryAction();
      }
      return;
    }

    this.feedback
      .confirmInfo(
        'Bạn có chắc muốn duyệt dữ liệu thay đổi chờ duyệt của danh mục này không?',
        'Xác nhận thao tác',
        'Duyệt',
      )
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.runWorkflowAction(
            (id) => this.api.approveCategory(id),
            'Đã duyệt thay đổi danh mục.',
            'Không thể duyệt danh mục. Vui lòng thử lại sau.',
          );
        }
      });
  }

  submitPendingReview(): void {
    const review = this.review;
    const category = review?.category;

    if (!category || !review.canSubmit || !category.id) {
      if (category && !review?.canSubmit) {
        this.denyCategoryAction();
      }
      return;
    }

    this.feedback
      .confirmInfo(
        'Bạn có chắc muốn gửi duyệt danh mục này không?',
        'Xác nhận thao tác',
        'Gửi duyệt',
      )
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.runWorkflowAction(
            (id) => this.api.submitCategory(id),
            'Đã gửi duyệt danh mục.',
            'Không thể gửi duyệt danh mục. Vui lòng thử lại sau.',
          );
        }
      });
  }

  rejectPendingReview(): void {
    const review = this.review;
    const category = review?.category;
    const reason = this.rejectReason.trim();

    if (!category || !review.canApproveReject || !this.canRejectCategory()) {
      if (category && !this.canRejectCategory()) {
        this.denyCategoryAction();
      }
      return;
    }

    if (!reason) {
      this.errorMessage = 'Vui lòng nhập lý do từ chối.';
      this.feedback.warning(this.errorMessage);
      return;
    }

    this.runWorkflowAction(
      (id) => this.api.rejectCategory(id, { reason }),
      'Đã từ chối thay đổi danh mục.',
      'Không thể từ chối danh mục. Vui lòng thử lại sau.',
    );
  }

  cancelApprovePendingReview(): void {
    const review = this.review;
    const category = review?.category;

    if (!category || !review.canCancelApprove || !this.canCancelApproveCategory()) {
      if (category && !this.canCancelApproveCategory()) {
        this.denyCategoryAction();
      }
      return;
    }

    this.feedback
      .confirmWarning(
        'Bạn có chắc muốn hủy duyệt danh mục này không?',
        'Xác nhận thao tác',
        'Hủy duyệt',
      )
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.runWorkflowAction(
            (id) => this.api.cancelApproveCategory(id),
            'Đã hủy duyệt danh mục.',
            'Không thể hủy duyệt danh mục. Vui lòng thử lại sau.',
          );
        }
      });
  }

  deleteCategory(): void {
    const review = this.review;
    const category = review?.category;

    if (!category || !review.canDelete || !category.id || this.submitting) {
      if (category && !review?.canDelete) {
        this.denyCategoryAction();
      }
      return;
    }

    this.feedback
      .confirmDanger('Thao tác này không thể hoàn tác. Bạn có chắc muốn xóa danh mục này?')
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.runWorkflowAction(
            (id) => this.api.deleteCategory(id),
            'Đã xóa danh mục.',
            'Không thể xóa danh mục. Vui lòng thử lại sau.',
          );
        }
      });
  }

  toggleDisplay(): void {
    const review = this.review;
    const category = review?.category;

    if (!category || !review.canToggleDisplay || !category.id || this.submitting) {
      if (category && !review?.canToggleDisplay) {
        this.denyCategoryAction();
      }
      return;
    }

    const nextDisplay = isCategoryDisplayEnabled(category.isDisplay) ? 0 : 1;
    const actionLabel = nextDisplay ? 'hiển thị public' : 'ẩn public';

    this.feedback
      .confirmWarning(
        `Bạn có chắc muốn ${actionLabel} danh mục này không?`,
        'Xác nhận thao tác',
        nextDisplay ? 'Hiển thị' : 'Ẩn',
      )
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.runWorkflowAction(
            (id) => this.api.updateCategoryDisplay(id, nextDisplay),
            nextDisplay ? 'Đã hiển thị public danh mục.' : 'Đã ẩn public danh mục.',
            'Không thể cập nhật hiển thị danh mục. Vui lòng thử lại sau.',
          );
        }
      });
  }

  handleImageError(event: Event): void {
    handleCategoryImageError(event);
  }

  private runWorkflowAction(
    action: (id: number) => Observable<unknown>,
    successMessage: string,
    fallbackErrorMessage: string,
  ): void {
    const category = this.review?.category;

    if (!category?.id || this.submitting) {
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    action(category.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting = false;
          this.feedback.success(successMessage);
          this.completed.emit();
          this.closed.emit();
        },
        error: (error) => {
          this.errorMessage = errorText(error, fallbackErrorMessage);
          this.feedback.error(this.errorMessage);
          this.submitting = false;
        },
      });
  }

  private buildPendingReview(category: AdminCategory): AdminCategoryPendingReviewViewModel {
    const parseResult = this.parseCategoryNewData(category.newData);
    const pendingData = parseResult.data;
    const rows = this.buildPendingComparisonRows(category, pendingData);
    const status = parseCategoryStatus(category.status);
    const hasParseError = !!parseResult.errorMessage;

    return {
      category,
      title: category.name || 'Danh mục chưa đặt tên',
      slug: category.slug || 'dang-cap-nhat',
      workflowLabel: workflowLabel(category.status),
      workflowClassName: workflowClass(category.status),
      displayLabel: displayLabel(category),
      displayClassName: displayClass(category),
      hasPendingData: !!pendingData,
      parseError: parseResult.errorMessage,
      rows,
      canSubmit: canSubmitCategory(category, this.auth.currentRole()),
      canDelete: canDeleteCategory(category, this.auth.currentRole()),
      canToggleDisplay: canToggleDisplayCategory(category, this.auth.currentRole()),
      displayToggleLabel: isCategoryDisplayEnabled(category.isDisplay) ? 'Ẩn' : 'Hiển thị',
      canApproveReject: status === 'PENDING' && !hasParseError && this.canApproveCategory() && this.canRejectCategory(),
      canCancelApprove: status === 'APPROVED' && this.canCancelApproveCategory(),
    };
  }

  private parseCategoryNewData(newData: AdminCategory['newData']): CategoryNewDataParseResult {
    if (newData === null || newData === undefined || newData === '') {
      return { data: null, errorMessage: '' };
    }

    if (isRecord(newData)) {
      return { data: newData as Partial<Record<CategoryPendingDataKey, unknown>>, errorMessage: '' };
    }

    if (typeof newData !== 'string' || !newData.trim()) {
      return { data: null, errorMessage: '' };
    }

    try {
      const parsed = JSON.parse(newData);

      if (!isRecord(parsed)) {
        return { data: null, errorMessage: 'Không thể đọc dữ liệu thay đổi.' };
      }

      return { data: parsed as Partial<Record<CategoryPendingDataKey, unknown>>, errorMessage: '' };
    } catch {
      return { data: null, errorMessage: 'Không thể đọc dữ liệu thay đổi.' };
    }
  }

  private buildPendingComparisonRows(
    category: AdminCategory,
    pendingData: Partial<Record<CategoryPendingDataKey, unknown>> | null,
  ): AdminCategoryPendingComparisonRow[] {
    const currentImageUrl = normalizeText(category.imageUrl);
    const pendingImageUrl = normalizeText(this.pendingValue(pendingData, ['imageUrl'], currentImageUrl));
    const hasPendingData = !!pendingData;
    const pendingDisplayCategory: AdminCategory = {
      ...category,
      status: this.pendingValue(pendingData, ['status'], category.status) as AdminCategory['status'],
      isActive: this.pendingValue(pendingData, ['isActive'], category.isActive) as AdminCategory['isActive'],
      isDisplay: this.pendingValue(pendingData, ['isDisplay'], category.isDisplay) as AdminCategory['isDisplay'],
    };

    const rows: AdminCategoryPendingComparisonRow[] = [
      this.textComparisonRow('name', 'Tên danh mục', category.name, pendingData),
      this.textComparisonRow('slug', 'Đường dẫn', category.slug, pendingData),
      this.textComparisonRow('description', 'Mô tả', category.description, pendingData),
      {
        key: 'isDisplay',
        label: 'Hiển thị',
        oldValue: hasPendingData ? displayLabel(category) : '-',
        newValue: displayLabel(pendingDisplayCategory),
        changed: hasPendingData && displayLabel(category) !== displayLabel(pendingDisplayCategory),
        type: 'display',
        oldClassName: hasPendingData ? displayClass(category) : '',
        newClassName: displayClass(pendingDisplayCategory),
      },
      {
        key: 'imageUrl',
        label: 'Ảnh danh mục',
        oldValue: hasPendingData ? (currentImageUrl ? this.shortText(currentImageUrl, 56) : 'Chưa có ảnh') : '-',
        newValue: pendingImageUrl ? this.shortText(pendingImageUrl, 56) : 'Chưa có ảnh',
        changed: hasPendingData && normalizeText(currentImageUrl) !== normalizeText(pendingImageUrl),
        type: 'image',
        oldImageUrl: hasPendingData ? currentImageUrl : '',
        newImageUrl: pendingImageUrl,
      },
    ];

    return rows;
  }

  private textComparisonRow(
    key: CategoryPendingDataKey,
    label: string,
    currentRawValue: unknown,
    pendingData: Partial<Record<CategoryPendingDataKey, unknown>> | null,
  ): AdminCategoryPendingComparisonRow {
    const currentValue = normalizeText(currentRawValue);
    const pendingValue = normalizeText(this.pendingValue(pendingData, [key], currentValue));
    const hasPendingData = !!pendingData;

    return {
      key,
      label,
      oldValue: hasPendingData ? currentValue || '-' : '-',
      newValue: pendingValue || '-',
      changed: hasPendingData && currentValue !== pendingValue,
      type: 'text',
    };
  }

  private pendingValue(
    data: Partial<Record<CategoryPendingDataKey, unknown>> | null,
    keys: CategoryPendingDataKey[],
    fallback: unknown,
  ): unknown {
    if (!data) {
      return fallback;
    }

    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        return data[key];
      }
    }

    return fallback;
  }

  private shortText(value: string, maxLength: number): string {
    return value.length <= maxLength ? value : `${value.slice(0, 28)}...${value.slice(-20)}`;
  }

  private canApproveCategory(): boolean {
    return this.auth.hasRole('ADMIN', 'SUPER_ADMIN');
  }

  private canRejectCategory(): boolean {
    return this.auth.hasRole('ADMIN', 'SUPER_ADMIN');
  }

  private canCancelApproveCategory(): boolean {
    return this.auth.hasRole('ADMIN', 'SUPER_ADMIN');
  }

  private denyCategoryAction(): void {
    this.feedback.warning('Bạn không có quyền thực hiện thao tác này.');
  }
}
