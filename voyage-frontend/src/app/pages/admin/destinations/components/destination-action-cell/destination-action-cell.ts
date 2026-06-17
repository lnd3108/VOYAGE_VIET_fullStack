import { NgIf } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Input, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, take } from 'rxjs';

import { AdminDestinationApiService } from '../../../../../core/api/admin-destination-api.service';
import { AuthService } from '../../../../../core/auth/auth.service';
import { AdminDestination } from '../../../../../core/models/destination.model';
import { AdminUiFeedbackService } from '../../../../../core/services/admin-ui-feedback.service';
import { isDisplayEnabled, parseStatus } from '../../destination-utils';

type DestinationRowAction = 'submit' | 'approve' | 'cancelApprove' | 'show' | 'hide' | 'copy' | 'delete';

@Component({
  selector: 'app-admin-destination-action-cell',
  standalone: true,
  imports: [NgIf],
  templateUrl: './destination-action-cell.html',
  styleUrl: './destination-action-cell.scss',
})
export class AdminDestinationActionCellComponent {
  private readonly destinationApi = inject(AdminDestinationApiService);
  private readonly feedback = inject(AdminUiFeedbackService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  @Input({ required: true }) destination!: AdminDestination;

  @Output() completed = new EventEmitter<void>();
  @Output() editRequested = new EventEmitter<AdminDestination>();
  @Output() reviewRequested = new EventEmitter<AdminDestination>();

  actionLoading: DestinationRowAction | null = null;

  stopActionEvent(event: Event): void {
    event.stopPropagation();
  }

  edit(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.editRequested.emit(this.destination);
  }

  openReview(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.reviewRequested.emit(this.destination);
  }

  submit(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.canSubmit()) {
      this.denyDestinationAction();
      return;
    }

    this.runAction(
      'submit',
      (id) => this.destinationApi.submitDestination(id),
      'Đã gửi duyệt điểm đến.',
      'Không thể gửi duyệt điểm đến. Vui lòng thử lại sau.',
    );
  }

  approve(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.canApprove()) {
      this.denyDestinationAction();
      return;
    }

    this.runAction(
      'approve',
      (id) => this.destinationApi.approveDestination(id),
      'Đã duyệt điểm đến.',
      'Không thể duyệt điểm đến. Vui lòng thử lại sau.',
    );
  }

  cancelApprove(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.canCancelApprove()) {
      this.denyDestinationAction();
      return;
    }

    this.runAction(
      'cancelApprove',
      (id) => this.destinationApi.cancelApproveDestination(id),
      'Đã hủy trình duyệt điểm đến.',
      'Không thể hủy trình duyệt điểm đến. Vui lòng thử lại sau.',
    );
  }

  show(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.canShow()) {
      this.denyDestinationAction();
      return;
    }

    this.runAction(
      'show',
      (id) => this.destinationApi.updateDestinationDisplay(id, 1),
      'Đã bật hiển thị public.',
      'Không thể cập nhật hiển thị điểm đến. Vui lòng thử lại sau.',
    );
  }

  hide(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.canHide()) {
      this.denyDestinationAction();
      return;
    }

    this.runAction(
      'hide',
      (id) => this.destinationApi.updateDestinationDisplay(id, 0),
      'Đã ẩn khỏi public.',
      'Không thể cập nhật hiển thị điểm đến. Vui lòng thử lại sau.',
    );
  }

  copy(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.canCopy()) {
      this.denyDestinationAction();
      return;
    }

    this.runAction(
      'copy',
      (id) => this.destinationApi.copyDestination(id),
      'Đã sao chép điểm đến.',
      'Không thể sao chép điểm đến. Vui lòng thử lại sau.',
    );
  }

  delete(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.canDelete()) {
      this.denyDestinationAction();
      return;
    }

    this.feedback
      .confirmDanger(
        'Thao tác này không thể hoàn tác. Bạn có chắc muốn xóa điểm đến này? Nếu điểm đến đang được tour sử dụng, backend có thể từ chối xóa.',
      )
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.runAction(
            'delete',
            (id) => this.destinationApi.deleteDestination(id),
            'Đã xóa điểm đến.',
            'Không thể xóa điểm đến. Vui lòng thử lại sau.',
          );
        }
      });
  }

  canEdit(): boolean {
    return this.hasStaffRole() && parseStatus(this.destination.status) !== 'PENDING';
  }

  canCopy(): boolean {
    return this.hasStaffRole();
  }

  canSubmit(): boolean {
    const status = parseStatus(this.destination.status);
    return this.hasStaffRole() && (status === 'DRAFT' || status === 'REJECTED' || status === 'CANCEL_APPROVE');
  }

  canApprove(): boolean {
    return this.hasAdminRole() && parseStatus(this.destination.status) === 'PENDING';
  }

  canReject(): boolean {
    return this.hasAdminRole() && parseStatus(this.destination.status) === 'PENDING';
  }

  canCancelApprove(): boolean {
    return this.hasAdminRole() && parseStatus(this.destination.status) === 'PENDING';
  }

  canShow(): boolean {
    return this.hasAdminRole() && parseStatus(this.destination.status) === 'APPROVED' && !this.isDisplayed();
  }

  canHide(): boolean {
    return this.hasAdminRole() && parseStatus(this.destination.status) === 'APPROVED' && this.isDisplayed();
  }

  canDelete(): boolean {
    return this.auth.hasRole('SUPER_ADMIN');
  }

  isDisplayed(): boolean {
    return isDisplayEnabled(this.destination);
  }

  private runAction(
    action: DestinationRowAction,
    request: (id: number) => Observable<unknown>,
    successMessage: string,
    fallbackErrorMessage: string,
  ): void {
    const destinationId = this.destination.id;

    if (!destinationId || this.actionLoading) {
      return;
    }

    this.actionLoading = action;

    request(destinationId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actionLoading = null;
          this.feedback.success(successMessage);
          this.completed.emit();
        },
        error: (error) => {
          this.actionLoading = null;
          this.feedback.error(this.errorText(error, fallbackErrorMessage));
        },
      });
  }

  private hasStaffRole(): boolean {
    return this.auth.hasRole('STAFF', 'ADMIN', 'SUPER_ADMIN');
  }

  private hasAdminRole(): boolean {
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
