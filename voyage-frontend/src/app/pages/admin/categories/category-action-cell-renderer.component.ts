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
            (click)="runAction($event, edit)"
          >
            <tui-icon class="admin-categories__action-item-icon" icon="@tui.pencil" />
            <span>Sửa</span>
          </button>

          <div class="admin-categories__action-separator" aria-hidden="true"></div>

          <button
            type="button"
            class="admin-categories__action-item admin-categories__action-item--status"
            [disabled]="statusBusy"
            (click)="runAction($event, toggleStatus)"
          >
            <tui-icon class="admin-categories__action-item-icon" [icon]="statusIcon" />
            <span>{{ statusBusy ? 'Đang đổi...' : nextStatusLabel }}</span>
          </button>

          <div class="admin-categories__action-separator" aria-hidden="true"></div>

          <button
            type="button"
            class="admin-categories__action-item admin-categories__action-item--danger"
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
  readonly toggleStatus = (): void =>
    this.withContext((parent, row) => parent.toggleStatus(row.category));
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
    return !!this.row && !!this.parent?.canMoveCategoryUp(this.row.rowIndex);
  }

  get canMoveDown(): boolean {
    return !!this.row && !!this.parent?.canMoveCategoryDown(this.row.rowIndex);
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

  get statusBusy(): boolean {
    return !!this.row?.category.id && this.parent?.updatingStatusId === this.row.category.id;
  }

  get deleteBusy(): boolean {
    return !!this.row?.category.id && this.parent?.deletingId === this.row.category.id;
  }

  get nextStatusLabel(): string {
    if (!this.row || !this.parent) {
      return 'Tạm ẩn';
    }

    return this.parent.nextStatusLabel(this.row.category);
  }

  get statusIcon(): string {
    return this.nextStatusLabel === 'Bật' ? '@tui.eye' : '@tui.eye-off';
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
