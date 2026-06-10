import { NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';

import { AdminCategoryApiService } from '../../../../../core/api/admin-category-api.service';
import { AuthService } from '../../../../../core/auth/auth.service';
import { AdminCategory, CategoryNewData } from '../../../../../core/models/category.model';
import { AdminUiFeedbackService } from '../../../../../core/services/admin-ui-feedback.service';
import {
  displayClass,
  displayLabel,
  errorText,
  getCategoryOrder,
  handleCategoryImageError,
  isCategoryDisplayEnabled,
  isRecord,
  normalizeDisplayOrder,
  normalizeText,
  parseCategoryStatus,
  workflowClass,
  workflowLabel,
} from '../../category-utils';

export type AdminCategoryPendingFieldType = 'text' | 'image' | 'status' | 'display' | 'order';
type CategoryPendingDataKey = keyof CategoryNewData;

export interface AdminCategoryPendingComparisonRow {
  key: string;
  label: string;
  currentValue: string;
  pendingValue: string;
  changed: boolean;
  type: AdminCategoryPendingFieldType;
  currentImageUrl: string;
  pendingImageUrl: string;
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
    this.rejectMode = false;
    this.rejectReason = '';
    this.errorMessage = '';
  }

  updateRejectReason(event: Event): void {
    this.rejectReason = (event.target as HTMLTextAreaElement).value;
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

  rejectPendingReview(): void {
    const review = this.review;
    const category = review?.category;

    if (!category || !review.canApproveReject || !this.canRejectCategory()) {
      if (category && !this.canRejectCategory()) {
        this.denyCategoryAction();
      }
      return;
    }

    this.runWorkflowAction(
      (id) => this.api.rejectCategory(id, { reason: this.rejectReason.trim() || null }),
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
        'Bạn có chắc muốn hủy trình duyệt và xóa dữ liệu thay đổi chờ duyệt không?',
        'Xác nhận thao tác',
        'Hủy trình duyệt',
      )
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.runWorkflowAction(
            (id) => this.api.cancelApproveCategory(id),
            'Đã hủy trình duyệt danh mục.',
            'Không thể hủy trình duyệt danh mục. Vui lòng thử lại sau.',
          );
        }
      });
  }

  handleImageError(event: Event): void {
    handleCategoryImageError(event);
  }

  private runWorkflowAction(
    action: (id: number) => ReturnType<AdminCategoryApiService['approveCategory']>,
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
    const rows = pendingData ? this.buildPendingComparisonRows(category, pendingData) : [];
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
      canApproveReject: status === 'PENDING' && !hasParseError && this.canApproveCategory() && this.canRejectCategory(),
      canCancelApprove: status === 'PENDING' && this.canCancelApproveCategory(),
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
    pendingData: Partial<Record<CategoryPendingDataKey, unknown>>,
  ): AdminCategoryPendingComparisonRow[] {
    const currentOrder = getCategoryOrder(category);
    const pendingOrder = this.pendingValue(
      pendingData,
      ['displayOrder', 'sortOrder', 'orderIndex', 'order', 'position'],
      currentOrder,
    );
    const currentImageUrl = normalizeText(category.imageUrl);
    const pendingImageUrl = normalizeText(this.pendingValue(pendingData, ['imageUrl'], currentImageUrl));

    return [
      this.textComparisonRow('name', 'Tên danh mục', category.name, pendingData),
      this.textComparisonRow('slug', 'Slug', category.slug, pendingData),
      this.textComparisonRow('description', 'Mô tả', category.description, pendingData),
      {
        key: 'imageUrl',
        label: 'Ảnh danh mục',
        currentValue: currentImageUrl ? this.shortText(currentImageUrl, 56) : 'Chưa có ảnh',
        pendingValue: pendingImageUrl ? this.shortText(pendingImageUrl, 56) : 'Chưa có ảnh',
        changed: normalizeText(currentImageUrl) !== normalizeText(pendingImageUrl),
        type: 'image',
        currentImageUrl,
        pendingImageUrl,
      },
      {
        key: 'status',
        label: 'Trạng thái workflow',
        currentValue: workflowLabel(category.status),
        pendingValue: workflowLabel(normalizeText(this.pendingValue(pendingData, ['status'], category.status))),
        changed:
          parseCategoryStatus(category.status) !==
          parseCategoryStatus(normalizeText(this.pendingValue(pendingData, ['status'], category.status))),
        type: 'status',
        currentImageUrl: '',
        pendingImageUrl: '',
      },
      {
        key: 'isDisplay',
        label: 'Hiển thị public',
        currentValue: this.displayValueLabel(category.isDisplay),
        pendingValue: this.displayValueLabel(this.pendingValue(pendingData, ['isDisplay'], category.isDisplay)),
        changed:
          isCategoryDisplayEnabled(category.isDisplay) !==
          isCategoryDisplayEnabled(this.pendingValue(pendingData, ['isDisplay'], category.isDisplay)),
        type: 'display',
        currentImageUrl: '',
        pendingImageUrl: '',
      },
      {
        key: 'displayOrder',
        label: 'Thứ tự hiển thị',
        currentValue: this.orderValueLabel(currentOrder),
        pendingValue: this.orderValueLabel(pendingOrder),
        changed: normalizeDisplayOrder(currentOrder) !== normalizeDisplayOrder(pendingOrder),
        type: 'order',
        currentImageUrl: '',
        pendingImageUrl: '',
      },
    ];
  }

  private textComparisonRow(
    key: CategoryPendingDataKey,
    label: string,
    currentRawValue: unknown,
    pendingData: Partial<Record<CategoryPendingDataKey, unknown>>,
  ): AdminCategoryPendingComparisonRow {
    const currentValue = normalizeText(currentRawValue);
    const pendingValue = normalizeText(this.pendingValue(pendingData, [key], currentValue));

    return {
      key,
      label,
      currentValue: currentValue || '-',
      pendingValue: pendingValue || '-',
      changed: currentValue !== pendingValue,
      type: 'text',
      currentImageUrl: '',
      pendingImageUrl: '',
    };
  }

  private pendingValue(
    data: Partial<Record<CategoryPendingDataKey, unknown>>,
    keys: CategoryPendingDataKey[],
    fallback: unknown,
  ): unknown {
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        return data[key];
      }
    }

    return fallback;
  }

  private displayValueLabel(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return 'Chưa xác định';
    }

    return isCategoryDisplayEnabled(value) ? 'Hiển thị public' : 'Ẩn public';
  }

  private orderValueLabel(value: unknown): string {
    return `${normalizeDisplayOrder(value)}`;
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
