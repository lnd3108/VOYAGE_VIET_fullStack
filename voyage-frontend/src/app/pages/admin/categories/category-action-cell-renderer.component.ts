import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

import type { AdminCategories } from './categories';
import type { AdminCategory } from '../../../core/models/category.model';

interface CategoryActionRow {
  category: AdminCategory;
  rowIndex: number;
}

interface CategoryActionCellParams extends ICellRendererParams<CategoryActionRow> {
  context: {
    componentParent: AdminCategories;
  };
}

@Component({
  selector: 'app-category-action-cell-renderer',
  standalone: true,
  imports: [NgIf, TuiIcon],
  template: `
    <div class="admin-categories__action-cell" *ngIf="row">
      <div
        class="admin-categories__action-wrap"
        (mousedown)="stopGridEvent($event)"
        (click)="stopGridEvent($event)"
      >
        <button
          type="button"
          class="admin-categories__action-trigger"
          aria-label="Mở menu thao tác danh mục"
          [attr.aria-expanded]="isOpen"
          [disabled]="!row.category.id"
          (mousedown)="stopGridEvent($event)"
          (click)="toggleMenu($event)"
        >
          <tui-icon icon="@tui.more-vertical" />
        </button>

        <div
          class="admin-categories__action-menu"
          *ngIf="isOpen"
          [class.admin-categories__action-menu--top]="isMenuTop"
          (mousedown)="stopGridEvent($event)"
          (click)="stopGridEvent($event)"
        >
          <button
            type="button"
            class="admin-categories__action-item admin-categories__action-item--pending"
            *ngIf="canViewChanges"
            [disabled]="workflowBusy"
            (click)="runAction($event, viewChanges)"
          >
            <tui-icon class="admin-categories__action-item-icon" icon="@tui.eye" />
            <span>Xem thay đổi</span>
          </button>

          <div
            class="admin-categories__action-separator"
            *ngIf="canViewChanges"
            aria-hidden="true"
          ></div>

          <button
            type="button"
            class="admin-categories__action-item admin-categories__action-item--order"
            *ngIf="canMoveUp"
            [disabled]="isReorderBusy"
            (click)="runAction($event, moveUp)"
          >
            <tui-icon class="admin-categories__action-item-icon" icon="@tui.arrow-up" />
            <span>Lên</span>
          </button>

          <button
            type="button"
            class="admin-categories__action-item admin-categories__action-item--order"
            *ngIf="canMoveDown"
            [disabled]="isReorderBusy"
            (click)="runAction($event, moveDown)"
          >
            <tui-icon class="admin-categories__action-item-icon" icon="@tui.arrow-down" />
            <span>Xuống</span>
          </button>

          <div
            class="admin-categories__action-separator"
            *ngIf="canMoveUp || canMoveDown"
            aria-hidden="true"
          ></div>

          <button
            type="button"
            class="admin-categories__action-item admin-categories__action-item--edit"
            *ngIf="canEdit"
            (click)="runAction($event, edit)"
          >
            <tui-icon class="admin-categories__action-item-icon" icon="@tui.pencil" />
            <span>Sửa</span>
          </button>

          <div class="admin-categories__action-separator" aria-hidden="true"></div>

          <button
            type="button"
            class="admin-categories__action-item admin-categories__action-item--edit"
            *ngIf="canSubmit"
            [disabled]="workflowBusy"
            (click)="runAction($event, submit)"
          >
            <tui-icon class="admin-categories__action-item-icon" icon="@tui.arrow-up" />
            <span>{{ workflowBusy ? 'Đang gửi...' : 'Gửi duyệt' }}</span>
          </button>

          <button
            type="button"
            class="admin-categories__action-item admin-categories__action-item--edit"
            *ngIf="canApprove"
            [disabled]="workflowBusy"
            (click)="runAction($event, approve)"
          >
            <tui-icon class="admin-categories__action-item-icon" icon="@tui.eye" />
            <span>{{ workflowBusy ? 'Đang duyệt...' : 'Duyệt' }}</span>
          </button>

          <button
            type="button"
            class="admin-categories__action-item admin-categories__action-item--status"
            *ngIf="canReject"
            [disabled]="workflowBusy"
            (click)="runAction($event, reject)"
          >
            <tui-icon class="admin-categories__action-item-icon" icon="@tui.eye-off" />
            <span>{{ workflowBusy ? 'Đang từ chối...' : 'Từ chối' }}</span>
          </button>

          <button
            type="button"
            class="admin-categories__action-item admin-categories__action-item--status"
            *ngIf="canCancelApprove"
            [disabled]="workflowBusy"
            (click)="runAction($event, cancelApprove)"
          >
            <tui-icon class="admin-categories__action-item-icon" icon="@tui.arrow-down" />
            <span>{{ workflowBusy ? 'Đang hủy...' : 'Hủy trình duyệt' }}</span>
          </button>

          <button
            type="button"
            class="admin-categories__action-item admin-categories__action-item--edit"
            *ngIf="canToggleDisplay"
            [disabled]="displayBusy"
            (click)="runAction($event, toggleDisplay)"
          >
            <tui-icon class="admin-categories__action-item-icon" [icon]="displayIcon" />
            <span>{{ displayBusy ? 'Đang cập nhật...' : displayLabel }}</span>
          </button>

          <div
            class="admin-categories__action-separator"
            *ngIf="hasWorkflowActions"
            aria-hidden="true"
          ></div>

          <button
            type="button"
            class="admin-categories__action-item admin-categories__action-item--danger"
            *ngIf="canDelete"
            [disabled]="deleteBusy"
            (click)="runAction($event, remove)"
          >
            <tui-icon class="admin-categories__action-item-icon" icon="@tui.trash-2" />
            <span>{{ deleteBusy ? 'Đang xóa...' : 'Xóa' }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class CategoryActionCellRendererComponent implements ICellRendererAngularComp {
  row: CategoryActionRow | null = null;
  private parent: AdminCategories | null = null;

  readonly moveUp = (): void => this.move('up');
  readonly moveDown = (): void => this.move('down');
  readonly edit = (): void => this.withContext((parent, row) => parent.openEditForm(row.category));
  readonly submit = (): void =>
    this.withContext((parent, row) => parent.submitCategory(row.category));
  readonly approve = (): void =>
    this.withContext((parent, row) => parent.approveCategory(row.category));
  readonly reject = (): void =>
    this.withContext((parent, row) => parent.rejectCategory(row.category));
  readonly cancelApprove = (): void =>
    this.withContext((parent, row) => parent.cancelApproveCategory(row.category));
  readonly viewChanges = (): void =>
    this.withContext((parent, row) => parent.openPendingChangesPanel(row.category));
  readonly toggleDisplay = (): void =>
    this.withContext((parent, row) => parent.toggleCategoryDisplay(row.category));
  readonly remove = (): void =>
    this.withContext((parent, row) => parent.deleteCategory(row.category));

  agInit(params: CategoryActionCellParams): void {
    this.row = params.data || null;
    this.parent = params.context.componentParent;
  }

  refresh(params: CategoryActionCellParams): boolean {
    this.agInit(params);
    return true;
  }

  get isOpen(): boolean {
    return !!this.row && !!this.parent?.isActionMenuOpen(this.row.category);
  }

  get isMenuTop(): boolean {
    return !!this.row && !!this.parent?.isActionMenuTop(this.row.category);
  }

  get canMoveUp(): boolean {
    return (
      !!this.row &&
      !!this.parent?.canReorderCategory(this.row.category) &&
      !!this.parent?.canMoveCategoryUp(this.row.rowIndex)
    );
  }

  get canMoveDown(): boolean {
    return (
      !!this.row &&
      !!this.parent?.canReorderCategory(this.row.category) &&
      !!this.parent?.canMoveCategoryDown(this.row.rowIndex)
    );
  }

  get isReorderBusy(): boolean {
    if (!this.row || !this.parent) {
      return false;
    }

    return (
      this.parent.isCategoryReordering(this.row.category) ||
      this.parent.reorderingCategoryIds.size > 0
    );
  }

  get workflowBusy(): boolean {
    return !!this.row?.category.id && this.parent?.updatingWorkflowId === this.row.category.id;
  }

  get displayBusy(): boolean {
    return !!this.row?.category.id && this.parent?.updatingDisplayId === this.row.category.id;
  }

  get deleteBusy(): boolean {
    return !!this.row?.category.id && this.parent?.deletingId === this.row.category.id;
  }

  get canSubmit(): boolean {
    return (
      !!this.row &&
      !!this.parent?.canSubmitCategory(this.row.category) &&
      ['DRAFT', 'REJECTED', 'CANCEL_APPROVE'].includes(this.status)
    );
  }

  get canApprove(): boolean {
    return !!this.row && !!this.parent?.canApproveCategory(this.row.category) && this.status === 'PENDING';
  }

  get canReject(): boolean {
    return !!this.row && !!this.parent?.canRejectCategory(this.row.category) && this.status === 'PENDING';
  }

  get canCancelApprove(): boolean {
    return !!this.row && !!this.parent?.canCancelApproveCategory(this.row.category) && this.status === 'PENDING';
  }

  get canViewChanges(): boolean {
    return this.status === 'PENDING' || this.hasNewData;
  }

  get canToggleDisplay(): boolean {
    return !!this.row && !!this.parent?.canDisplayCategory(this.row.category) && this.status === 'APPROVED';
  }

  get canEdit(): boolean {
    return !!this.row && !!this.parent?.canEditCategory(this.row.category);
  }

  get canDelete(): boolean {
    return !!this.row && !!this.parent?.canDeleteCategory(this.row.category);
  }

  get hasWorkflowActions(): boolean {
    return (
      this.canSubmit ||
      this.canApprove ||
      this.canReject ||
      this.canCancelApprove ||
      this.canToggleDisplay
    );
  }

  get displayLabel(): string {
    return this.isDisplayEnabled ? 'Ẩn public' : 'Hiển thị public';
  }

  get displayIcon(): string {
    return this.isDisplayEnabled ? '@tui.eye-off' : '@tui.eye';
  }

  stopGridEvent(event: Event): void {
    event.stopPropagation();
  }

  toggleMenu(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.withContext((parent, row) => parent.toggleActionMenu(row.category, event), false);
  }

  runAction(event: MouseEvent, action: () => void): void {
    event.preventDefault();
    event.stopPropagation();

    action();
  }

  private get status(): string {
    return `${this.row?.category.status || 'DRAFT'}`;
  }

  private get isDisplayEnabled(): boolean {
    return this.row?.category.isDisplay === true || this.row?.category.isDisplay === 1;
  }

  private get hasNewData(): boolean {
    return typeof this.row?.category.newData === 'string' && this.row.category.newData.trim().length > 0;
  }

  private move(direction: 'up' | 'down'): void {
    this.withContext((parent, row) => parent.moveCategory(row.category, row.rowIndex, direction));
  }

  private withContext(
    action: (parent: AdminCategories, row: CategoryActionRow) => void,
    closeMenu = true,
  ): void {
    if (!this.row || !this.parent) {
      return;
    }

    if (closeMenu) {
      this.parent.closeActionMenu();
    }

    action(this.parent, this.row);
  }
}
