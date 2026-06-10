import { NgIf } from '@angular/common';
import { Component, DestroyRef, HostListener, OnInit, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { take } from 'rxjs';

import { AdminCategoryApiService } from '../../../core/api/admin-category-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AdminCategory, AdminCategoryUpdateRequest, CategoryStatus } from '../../../core/models/category.model';
import { AdminUiFeedbackService } from '../../../core/services/admin-ui-feedback.service';
import { AdminCategoryBulkActionsComponent } from './components/category-bulk-actions/category-bulk-actions';
import { AdminCategoryDetailPanelComponent } from './components/category-detail-panel/category-detail-panel';
import { AdminCategoryFilterComponent } from './components/category-filter/category-filter';
import { AdminCategoryFormComponent } from './components/category-form/category-form';
import { AdminCategoryTableComponent } from './components/category-table/category-table';
import { CategoryTableContext } from './components/category-table/category-table-columns';
import {
  errorText,
  extractCategoryList,
  generateCategorySlug,
  getCategoryOrder,
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
    RouterLink,
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
    { label: 'Hủy trình duyệt', value: 'CANCEL_APPROVE' },
  ];

  loading = false;
  errorMessage = '';
  successMessage = '';
  categories: AdminCategory[] = [];
  filteredCategories: AdminCategory[] = [];
  keyword = '';
  statusFilter: CategoryStatusFilter = 'ALL';
  selectedCategory: AdminCategory | null = null;
  pendingCategory: AdminCategory | null = null;
  isFormOpen = false;
  selectedBatchCategories: AdminCategory[] = [];
  reorderingCategoryIds = new Set<number>();
  reorderBlockedByFilter = false;
  gridSortBlocksReorder = false;

  readonly tableContext: CategoryTableContext = {
    openEdit: (category) => this.openEditForm(category),
    openPending: (category) => this.openPendingChangesPanel(category),
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
    this.selectedCategory = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  openEditForm(category: AdminCategory): void {
    if (!this.canCreateCategory()) {
      this.denyCategoryAction();
      return;
    }

    this.setFormViewUrl();
    this.isFormOpen = true;
    this.selectedCategory = category;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeForm(updateUrl = true): void {
    this.isFormOpen = false;
    this.selectedCategory = null;

    if (updateUrl) {
      this.setListViewUrl();
    }
  }

  handleFormSaved(): void {
    this.loadCategories();
  }

  onFilterKeywordChange(keyword: string): void {
    this.keyword = keyword;
    this.applyFilters();
  }

  onFilterStatusChange(status: CategoryStatusFilter): void {
    this.statusFilter = status;
    this.applyFilters();
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
    this.pendingCategory = category;
  }

  closePendingChangesPanel(): void {
    this.pendingCategory = null;
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

  moveCategory(category: AdminCategory, currentIndex: number, direction: 'up' | 'down'): void {
    if (
      this.reorderBlockedByFilter ||
      this.gridSortBlocksReorder ||
      this.reorderingCategoryIds.size > 0 ||
      this.isCategoryReordering(category)
    ) {
      return;
    }

    if (!this.canCreateCategory()) {
      this.denyCategoryAction();
      return;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetCategory = this.filteredCategories[targetIndex];

    if (
      !category.id ||
      !targetCategory?.id ||
      targetIndex < 0 ||
      targetIndex >= this.filteredCategories.length
    ) {
      return;
    }

    const categoryName = category.name || 'danh mục này';
    const directionText = direction === 'up' ? 'lên trên' : 'xuống dưới';

    this.feedback
      .confirmWarning(
        `Bạn có chắc muốn chuyển danh mục "${categoryName}" ${directionText} không?`,
        'Xác nhận đổi thứ tự',
        'Xác nhận',
      )
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.swapCategoryOrder(category, targetCategory);
        }
      });
  }

  @HostListener('document:keydown.escape')
  closeOverlayByEscape(): void {
    if (this.pendingCategory) {
      this.closePendingChangesPanel();
    }
  }

  private isCategoryReordering(category: AdminCategory): boolean {
    return !!category.id && this.reorderingCategoryIds.has(category.id);
  }

  private swapCategoryOrder(category: AdminCategory, targetCategory: AdminCategory): void {
    if (!category.id || !targetCategory.id) {
      return;
    }

    const categoryOrder = getCategoryOrder(category);
    const targetOrder = getCategoryOrder(targetCategory);
    const firstPayload = this.buildCategoryUpdatePayload(category, targetOrder);
    const secondPayload = this.buildCategoryUpdatePayload(targetCategory, categoryOrder);

    this.reorderingCategoryIds = new Set([category.id, targetCategory.id]);
    this.errorMessage = '';
    this.successMessage = '';

    this.categoryApi
      .swapCategoryOrder(
        { id: category.id, payload: firstPayload },
        { id: targetCategory.id, payload: secondPayload },
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.feedback.success('Đã cập nhật thứ tự danh mục.');
          this.reorderingCategoryIds = new Set<number>();
          this.loadCategories();
        },
        error: (error) => {
          this.errorMessage = errorText(
            error,
            'Không thể cập nhật thứ tự danh mục. Danh sách sẽ được tải lại.',
          );
          this.feedback.error(this.errorMessage);
          this.reorderingCategoryIds = new Set<number>();
          this.loadCategories();
        },
      });
  }

  private buildCategoryUpdatePayload(
    category: AdminCategory,
    displayOrder: number,
  ): AdminCategoryUpdateRequest {
    const name = (category.name || '').trim();
    const slugSource = (category.slug || name).trim();

    return {
      name,
      slug: generateCategorySlug(slugSource) || slugSource,
      description: category.description?.trim() || undefined,
      imageUrl: category.imageUrl?.trim() || undefined,
      displayOrder: Math.max(1, Math.trunc(displayOrder)),
      status: parseCategoryStatus(category.status) || 'DRAFT',
    };
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
