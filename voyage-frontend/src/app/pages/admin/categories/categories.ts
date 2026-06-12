import { NgIf } from '@angular/common';
import {
  Component,
  DestroyRef,
  HostListener,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  inject,
  isDevMode,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import { AdminCategoryApiService } from '../../../core/api/admin-category-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AdminCategory, CategoryStatus } from '../../../core/models/category.model';
import { AdminUiFeedbackService } from '../../../core/services/admin-ui-feedback.service';
import { AdminCategoryBulkActionsComponent } from './components/category-bulk-actions/category-bulk-actions';
import { AdminCategoryDetailPanelComponent } from './components/category-detail-panel/category-detail-panel';
import { AdminCategoryFilterComponent } from './components/category-filter/category-filter';
import { AdminCategoryFormComponent, AdminCategoryFormMode } from './components/category-form/category-form';
import { AdminCategoryTableComponent } from './components/category-table/category-table';
import { CategoryTableContext } from './components/category-table/category-table-columns';
import {
  errorText,
  extractCategoryList,
  getCategoryOrder,
  canEditCategory,
  normalizeCategoryOrders,
  parseCategoryStatus,
  sortCategory,
} from './category-utils';

type CategoryStatusFilter = 'ALL' | CategoryStatus;

interface StatusFilterOption {
  label: string;
  value: CategoryStatusFilter;
}

@Component({
  selector: 'app-admin-categories',
  imports: [
    NgIf,
    AdminCategoryFilterComponent,
    AdminCategoryTableComponent,
    AdminCategoryFormComponent,
    AdminCategoryBulkActionsComponent,
    AdminCategoryDetailPanelComponent,
  ],
  templateUrl: './categories.html',
  styleUrls: ['./categories.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AdminCategories implements OnInit {
  @ViewChild(AdminCategoryTableComponent) private table?: AdminCategoryTableComponent;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly categoryApi = inject(AdminCategoryApiService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly feedback = inject(AdminUiFeedbackService);

  readonly statusFilters: StatusFilterOption[] = [
    { label: 'Tất cả', value: 'ALL' },
    { label: 'Nháp', value: 'DRAFT' },
    { label: 'Chờ duyệt', value: 'PENDING' },
    { label: 'Đã duyệt', value: 'APPROVED' },
    { label: 'Từ chối', value: 'REJECTED' },
    { label: 'Hủy duyệt', value: 'CANCEL_APPROVE' },
  ];

  loading = false;
  errorMessage = '';
  successMessage = '';
  categories: AdminCategory[] = [];
  filteredCategories: AdminCategory[] = [];
  filterKeywordDraft = '';
  filterStatusDraft: CategoryStatusFilter = 'ALL';
  keyword = '';
  statusFilter: CategoryStatusFilter = 'ALL';
  selectedCategory: AdminCategory | null = null;
  reviewCategory: AdminCategory | null = null;
  formMode: AdminCategoryFormMode = 'create';
  isFormOpen = false;
  selectedBatchCategories: AdminCategory[] = [];
  reorderingCategoryIds = new Set<number>();
  reorderBlockedByFilter = false;
  gridSortBlocksReorder = false;

  readonly tableContext: CategoryTableContext = {
    openEdit: (category) => this.openEditForm(category),
    openCopy: (category) => this.openCopyForm(category),
    openDetail: (category) => this.openDetail(category),
    openPending: (category) => this.openPendingChangesPanel(category),
    openDelete: (category) => this.openDelete(category),
    reload: () => this.reloadCategories(),
    move: (category, index, direction) => this.moveCategory(category, index, direction),
  };

  ngOnInit(): void {
    this.watchCategoryViewFromUrl();
    this.loadCategories();
  }

  get selectedBatchCount(): number {
    return this.selectedBatchCategories.length;
  }

  get pageTrailLabel(): string {
    if (!this.isFormOpen) {
      return 'Danh mục';
    }

    if (this.formMode === 'edit') {
      return 'Chỉnh sửa';
    }

    if (this.formMode === 'copy') {
      return 'Sao chép';
    }

    return 'Thêm mới';
  }

  get pageDescription(): string {
    if (!this.isFormOpen) {
      return 'Quản lý danh mục theo nhóm';
    }

    if (this.formMode === 'edit') {
      return 'Chỉnh sửa thông tin danh mục';
    }

    if (this.formMode === 'copy') {
      return 'Tạo danh mục mới từ dữ liệu đã có';
    }

    return 'Thêm mới danh mục theo nhóm';
  }

  get nextDisplayOrder(): number {
    const maxOrder = this.categories.reduce(
      (max, category) => Math.max(max, getCategoryOrder(category)),
      0,
    );

    return maxOrder + 1 || 1;
  }

  canCreateCategory(): boolean {
    return this.auth.hasRole('STAFF', 'ADMIN', 'SUPER_ADMIN');
  }

  canOpenMedia(): boolean {
    return this.auth.hasRole('ADMIN', 'SUPER_ADMIN');
  }

  loadCategories(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.categoryApi
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.categories = normalizeCategoryOrders(extractCategoryList(response));
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = errorText(
            error,
            'Không thể tải danh sách danh mục. Vui lòng thử lại sau.',
          );
          this.loading = false;
        },
      });
  }

  reloadCategories(): void {
    this.loadCategories();
  }

  openCreateForm(): void {
    if (!this.canCreateCategory()) {
      this.denyCategoryAction();
      return;
    }

    this.setFormViewUrl();
    this.isFormOpen = true;
    this.formMode = 'create';
    this.selectedCategory = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  openEditForm(category: AdminCategory): void {
    if (isDevMode()) {
      console.debug('[AdminCategories] openEditForm', category.id);
    }

    if (!canEditCategory(category, this.auth.currentRole())) {
      this.denyCategoryAction();
      return;
    }

    this.setFormViewUrl();
    this.isFormOpen = true;
    this.formMode = 'edit';
    this.selectedCategory = category;
    this.errorMessage = '';
    this.successMessage = '';
  }

  openCopyForm(category: AdminCategory): void {
    if (isDevMode()) {
      console.debug('[AdminCategories] openCopyForm', category.id);
    }

    if (!this.canCreateCategory()) {
      this.denyCategoryAction();
      return;
    }

    this.setFormViewUrl();
    this.isFormOpen = true;
    this.formMode = 'copy';
    this.selectedCategory = category;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeForm(updateUrl = true): void {
    this.isFormOpen = false;
    this.selectedCategory = null;
    this.formMode = 'create';

    if (updateUrl) {
      this.setListViewUrl();
    }
  }

  handleFormSaved(): void {
    this.loadCategories();
  }

  onFilterKeywordDraftChange(keyword: string): void {
    this.filterKeywordDraft = keyword;
  }

  onFilterStatusDraftChange(status: CategoryStatusFilter): void {
    this.filterStatusDraft = status;
  }

  searchCategories(): void {
    const keyword = this.filterKeywordDraft.trim();

    this.filterKeywordDraft = keyword;
    this.keyword = keyword;
    this.statusFilter = this.filterStatusDraft;
    this.applyFilters();
    this.clearBatchSelection();
  }

  clearFilters(): void {
    this.filterKeywordDraft = '';
    this.filterStatusDraft = 'ALL';
    this.keyword = '';
    this.statusFilter = 'ALL';
    this.applyFilters();
    this.clearBatchSelection();
  }

  onTableSelectionChanged(categories: AdminCategory[]): void {
    this.selectedBatchCategories = categories;
  }

  onSortBlockedChange(blocked: boolean): void {
    this.gridSortBlocksReorder = blocked;
  }

  clearBatchSelection(): void {
    this.selectedBatchCategories = [];
    this.table?.clearSelection();
  }

  handleChildCompleted(): void {
    this.loadCategories();
  }

  openPendingChangesPanel(category: AdminCategory): void {
    if (isDevMode()) {
      console.debug('[AdminCategories] openPendingChangesPanel', category.id);
    }

    this.reviewCategory = category;
  }

  openDetail(category: AdminCategory): void {
    this.reviewCategory = category;
  }

  openDelete(category: AdminCategory): void {
    if (isDevMode()) {
      console.debug('[AdminCategories] openDelete', category.id);
    }

    this.feedback.warning('Chức năng xóa sẽ được nối ở bước tiếp theo.');
  }

  closePendingChangesPanel(): void {
    this.reviewCategory = null;
  }

  applyFilters(): void {
    const keyword = this.keyword.trim().toLowerCase();
    this.reorderBlockedByFilter = !!keyword || this.statusFilter !== 'ALL';

    this.filteredCategories = this.categories
      .filter((category) => {
        const matchesKeyword =
          !keyword ||
          [category.name, category.slug].some((value) =>
            (value || '').toLowerCase().includes(keyword),
          );
        const status = parseCategoryStatus(category.status);
        const matchesStatus = this.statusFilter === 'ALL' || status === this.statusFilter;

        return matchesKeyword && matchesStatus;
      })
      .sort((a, b) => sortCategory(a, b));
  }

  moveCategory(_category: AdminCategory, _currentIndex: number, _direction: 'up' | 'down'): void {
    this.feedback.warning(
      'Sắp xếp thứ tự cần endpoint backend riêng, không thể dùng API cập nhật category sau workflow mới.',
    );
  }

  @HostListener('document:keydown.escape')
  closeOverlayByEscape(): void {
    if (this.reviewCategory) {
      this.closePendingChangesPanel();
    }
  }

  private denyCategoryAction(): void {
    this.feedback.warning('Bạn không có quyền thực hiện thao tác này.');
  }

  private watchCategoryViewFromUrl(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const view = params.get('view');

      if (view !== 'form' && this.isFormOpen) {
        this.closeForm(false);
      }
    });
  }

  private setFormViewUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view: 'form' },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private setListViewUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
