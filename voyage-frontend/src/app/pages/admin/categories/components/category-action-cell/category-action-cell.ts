import { NgIf, NgStyle } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TuiIcon } from '@taiga-ui/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { Observable, take } from 'rxjs';

import { AdminCategoryApiService } from '../../../../../core/api/admin-category-api.service';
import { AuthService } from '../../../../../core/auth/auth.service';
import type { AdminCategory } from '../../../../../core/models/category.model';
import { AdminUiFeedbackService } from '../../../../../core/services/admin-ui-feedback.service';
import { CategoryGridRow, CategoryTableContext } from '../category-table/category-table-columns';
import { errorText, isCategoryDisplayEnabled, parseCategoryStatus } from '../../category-utils';

interface CategoryActionCellParams extends ICellRendererParams<CategoryGridRow> {
  context: CategoryTableContext;
}

@Component({
  selector: 'app-category-action-cell-renderer',
  standalone: true,
  imports: [NgIf, TuiIcon, NgStyle],
  templateUrl: './category-action-cell.html',
  styleUrl: './category-action-cell.scss',
})
export class CategoryActionCellRendererComponent implements ICellRendererAngularComp, OnDestroy {
  private static activeMenu: CategoryActionCellRendererComponent | null = null;

  @ViewChild('actionMenu') private actionMenu?: ElementRef<HTMLElement>;

  private readonly api = inject(AdminCategoryApiService);
  private readonly auth = inject(AuthService);
  private readonly feedback = inject(AdminUiFeedbackService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  row: CategoryGridRow | null = null;
  private context: CategoryTableContext | null = null;

  workflowBusy = false;
  displayBusy = false;
  deleteBusy = false;

  isMenuOpen = false;
  menuPosition: Record<string, string> = {};

  readonly moveUp = (): void => this.move('up');
  readonly moveDown = (): void => this.move('down');
  readonly edit = (): void => this.withRow((row) => this.context?.openEdit(row.category));
  readonly viewChanges = (): void => this.withRow((row) => this.context?.openPending(row.category));
  readonly submit = (): void =>
    this.runWorkflowAction(
      (id) => this.api.submitCategory(id),
      'Đã gửi danh mục chờ duyệt.',
      'Không thể gửi duyệt danh mục. Vui lòng thử lại sau.',
    );
  readonly approve = (): void =>
    this.confirmThenRun(
      'Bạn có chắc muốn duyệt danh mục này không?',
      'Duyệt',
      () =>
        this.runWorkflowAction(
          (id) => this.api.approveCategory(id),
          'Đã duyệt danh mục.',
          'Không thể duyệt danh mục. Vui lòng thử lại sau.',
        ),
      'info',
    );
  readonly reject = (): void =>
    this.confirmThenRun(
      'Bạn có chắc muốn từ chối danh mục này không?',
      'Từ chối',
      () =>
        this.runWorkflowAction(
          (id) => this.api.rejectCategory(id),
          'Đã từ chối danh mục.',
          'Không thể từ chối danh mục. Vui lòng thử lại sau.',
        ),
      'warning',
    );
  readonly cancelApprove = (): void =>
    this.confirmThenRun(
      'Bạn có chắc muốn hủy trình duyệt danh mục này không?',
      'Hủy trình duyệt',
      () =>
        this.runWorkflowAction(
          (id) => this.api.cancelApproveCategory(id),
          'Đã hủy trình duyệt danh mục.',
          'Không thể hủy trình duyệt danh mục. Vui lòng thử lại sau.',
        ),
      'warning',
    );
  readonly toggleDisplay = (): void => this.toggleCategoryDisplay();
  readonly remove = (): void => this.deleteCategory();

  ngOnDestroy(): void {
    if (CategoryActionCellRendererComponent.activeMenu === this) {
      CategoryActionCellRendererComponent.activeMenu = null;
    }

    this.actionMenu?.nativeElement.remove();
  }

  agInit(params: CategoryActionCellParams): void {
    this.row = params.data || null;
    this.context = params.context;
  }

  refresh(params: CategoryActionCellParams): boolean {
    this.agInit(params);
    return true;
  }

  get canMoveUp(): boolean {
    return !!this.row && this.canReorder && this.row.canMoveUp;
  }

  get canMoveDown(): boolean {
    return !!this.row && this.canReorder && this.row.canMoveDown;
  }

  get isReorderBusy(): boolean {
    return !!this.row?.reorderBusy;
  }

  get canSubmit(): boolean {
    return this.canStaff && ['DRAFT', 'REJECTED', 'CANCEL_APPROVE'].includes(this.status);
  }

  get canApprove(): boolean {
    return this.canAdmin && this.status === 'PENDING';
  }

  get canReject(): boolean {
    return this.canAdmin && this.status === 'PENDING';
  }

  get canCancelApprove(): boolean {
    return this.canAdmin && this.status === 'PENDING';
  }

  get canViewChanges(): boolean {
    return this.status === 'PENDING' || this.hasNewData;
  }

  get canToggleDisplay(): boolean {
    return this.canAdmin && this.status === 'APPROVED';
  }

  get canEdit(): boolean {
    return this.canStaff;
  }

  get canDelete(): boolean {
    return this.auth.currentRole() === 'SUPER_ADMIN';
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

  @HostListener('document:mousedown', ['$event'])
  closeOnOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;

    if (
      !target?.closest('.admin-categories__action-wrap') &&
      !target?.closest('.admin-categories__action-menu')
    ) {
      this.closeMenu();
    }
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    this.closeMenu();
  }

  stopGridEvent(event: Event): void {
    event.stopPropagation();
  }

  toggleMenu(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const trigger = event.currentTarget as HTMLElement;

    if (this.isMenuOpen) {
      this.closeMenu();
      return;
    }

    CategoryActionCellRendererComponent.activeMenu?.closeMenu();
    CategoryActionCellRendererComponent.activeMenu = this;

    this.setMenuPosition(trigger);
    this.isMenuOpen = true;
    this.changeDetectorRef.detectChanges();
    this.appendMenuToBody();
  }

  closeMenu(): void {
    if (!this.isMenuOpen && !Object.keys(this.menuPosition).length) {
      return;
    }

    this.isMenuOpen = false;
    this.menuPosition = {};

    if (CategoryActionCellRendererComponent.activeMenu === this) {
      CategoryActionCellRendererComponent.activeMenu = null;
    }

    this.changeDetectorRef.detectChanges();
  }

  runAction(event: MouseEvent, action: () => void): void {
    event.preventDefault();
    event.stopPropagation();

    this.closeMenu();
    action();
  }

  private get status(): string {
    return parseCategoryStatus(this.row?.category.status) || 'DRAFT';
  }

  private get isDisplayEnabled(): boolean {
    return isCategoryDisplayEnabled(this.row?.category.isDisplay);
  }

  private get hasNewData(): boolean {
    return (
      typeof this.row?.category.newData === 'string' && this.row.category.newData.trim().length > 0
    );
  }

  private get canStaff(): boolean {
    return this.auth.hasRole('STAFF', 'ADMIN', 'SUPER_ADMIN');
  }

  private get canAdmin(): boolean {
    return this.auth.hasRole('ADMIN', 'SUPER_ADMIN');
  }

  private get canReorder(): boolean {
    return this.canStaff;
  }

  private move(direction: 'up' | 'down'): void {
    this.withRow((row) => this.context?.move(row.category, row.rowIndex, direction));
  }

  private withRow(action: (row: CategoryGridRow) => void): void {
    if (!this.row) {
      return;
    }

    action(this.row);
  }

  private runWorkflowAction(
    action: (id: number) => Observable<unknown>,
    successMessage: string,
    fallbackErrorMessage: string,
  ): void {
    const category = this.row?.category;

    if (!category?.id || this.workflowBusy) {
      return;
    }

    this.workflowBusy = true;

    action(category.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.workflowBusy = false;
          this.feedback.success(successMessage);
          this.context?.reload();
        },
        error: (error) => {
          this.workflowBusy = false;
          this.feedback.error(errorText(error, fallbackErrorMessage));
        },
      });
  }

  private toggleCategoryDisplay(): void {
    const category = this.row?.category;

    if (!category?.id || this.displayBusy || !this.canToggleDisplay) {
      return;
    }

    const nextDisplay = this.isDisplayEnabled ? 0 : 1;
    const actionText = nextDisplay ? 'hiển thị public' : 'ẩn public';

    this.feedback
      .confirmInfo(
        `Bạn có chắc muốn ${actionText} danh mục này không?`,
        'Xác nhận thao tác',
        nextDisplay ? 'Hiển thị' : 'Ẩn',
      )
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (!confirmed || !category.id) {
          return;
        }

        this.displayBusy = true;
        this.api
          .updateCategoryDisplay(category.id, nextDisplay)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.displayBusy = false;
              this.feedback.success('Đã cập nhật trạng thái hiển thị danh mục.');
              this.context?.reload();
            },
            error: (error) => {
              this.displayBusy = false;
              this.feedback.error(errorText(error, 'Không thể cập nhật trạng thái hiển thị.'));
            },
          });
      });
  }

  private deleteCategory(): void {
    const category = this.row?.category;

    if (!category?.id || this.deleteBusy || !this.canDelete) {
      return;
    }

    this.feedback
      .confirmDanger(
        'Thao tác này không thể hoàn tác. Bạn có chắc muốn xóa danh mục này? Thao tác này có thể ảnh hưởng tour đang dùng danh mục.',
      )
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (!confirmed || !category.id) {
          return;
        }

        this.deleteBusy = true;
        this.api
          .deleteCategory(category.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.deleteBusy = false;
              this.feedback.success('Đã xóa danh mục.');
              this.context?.reload();
            },
            error: (error) => {
              this.deleteBusy = false;
              this.feedback.error(
                errorText(error, 'Không thể xóa danh mục. Vui lòng thử lại sau.'),
              );
            },
          });
      });
  }

  private confirmThenRun(
    message: string,
    confirmText: string,
    action: () => void,
    level: 'info' | 'warning',
  ): void {
    const confirm$ =
      level === 'info'
        ? this.feedback.confirmInfo(message, 'Xác nhận thao tác', confirmText)
        : this.feedback.confirmWarning(message, 'Xác nhận thao tác', confirmText);

    confirm$.pipe(take(1)).subscribe((confirmed) => {
      if (confirmed) {
        action();
      }
    });
  }

  private setMenuPosition(trigger: HTMLElement): void {
    const rect = trigger.getBoundingClientRect();

    const menuWidth = 220;
    const menuHeight = 360;
    const gap = 10;
    const viewportPadding = 12;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const shouldOpenTop = spaceBelow < menuHeight && spaceAbove > spaceBelow;

    const availableHeight = shouldOpenTop
      ? Math.max(180, spaceAbove - viewportPadding - gap)
      : Math.max(180, window.innerHeight - rect.bottom - viewportPadding - gap);

    const top = shouldOpenTop
      ? Math.max(viewportPadding, rect.bottom - Math.min(menuHeight, availableHeight))
      : Math.min(
          rect.bottom + gap,
          window.innerHeight - viewportPadding - Math.min(menuHeight, availableHeight),
        );

    const left = Math.min(
      Math.max(viewportPadding, rect.right - menuWidth),
      window.innerWidth - menuWidth - viewportPadding,
    );

    this.menuPosition = {
      top: `${top}px`,
      left: `${left}px`,
      width: `${menuWidth}px`,
      maxHeight: `${Math.min(menuHeight, availableHeight)}px`,
    };
  }

  private appendMenuToBody(): void {
    window.requestAnimationFrame(() => {
      const menu = this.actionMenu?.nativeElement;

      if (!this.isMenuOpen || !menu || menu.parentElement === document.body) {
        return;
      }

      document.body.appendChild(menu);
    });
  }
}
