import { NgFor, NgIf } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TuiIcon } from '@taiga-ui/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  AllCommunityModule,
  ColDef,
  GridApi,
  GridReadyEvent,
  GetRowIdParams,
  ICellRendererParams,
  ModuleRegistry,
  RowSelectionOptions,
  Theme,
  themeQuartz,
} from 'ag-grid-community';
import { Observable, take } from 'rxjs';

import { CategoryActionCellRendererComponent } from './category-action-cell-renderer.component';
import {
  AdminCategoryApiService,
  AdminCategoryPatchRequest,
} from '../../../core/api/admin-category-api.service';
import { AdminMediaApiService } from '../../../core/api/admin-media-api.service';
import {
  AdminCategory,
  AdminCategoryCreateRequest,
  AdminCategoryUpdateRequest,
  CategoryBatchActionResponse,
  CategoryNewData,
  CategoryStatus,
} from '../../../core/models/category.model';
import { RoleCode } from '../../../core/models/user.model';
import { AuthService } from '../../../core/auth/auth.service';
import { AdminMediaItem } from '../../../core/models/media.model';
import { PageResponse } from '../../../core/models/page-response.model';
import { AdminUiFeedbackService } from '../../../core/services/admin-ui-feedback.service';

type CategoryStatusFilter = 'ALL' | CategoryStatus;
type CategoryBatchAction = 'submit' | 'approve' | 'reject' | 'cancelApprove' | 'show' | 'hide';

ModuleRegistry.registerModules([AllCommunityModule]);

interface StatusFilterOption {
  label: string;
  value: CategoryStatusFilter;
}

interface CategoryMediaModuleOption {
  label: string;
  value: string;
}

interface CategoryMediaCard {
  item: AdminMediaItem;
  url: string;
  title: string;
  moduleLabel: string;
  createdAt: string;
}

interface CategoryGridRow {
  category: AdminCategory;
  id?: number;
  rowIndex: number;
  imageUrl: string;
  name: string;
  description: string;
  slug: string;
  workflowLabel: string;
  workflowClassName: string;
  displayLabel: string;
  displayClassName: string;
  hasPendingChange: boolean;
  pendingChangeLabel: string;
  order: number;
  createdDisplay: string;
  createdTimestamp: number;
  updatedDisplay: string;
  updatedTimestamp: number;
}

interface CategoryEditSnapshot {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
}

type CategoryPendingFieldType = 'text' | 'image' | 'status' | 'display' | 'order';

type CategoryPendingDataKey = keyof CategoryNewData;

interface CategoryPendingComparisonRow {
  key: string;
  label: string;
  currentValue: string;
  pendingValue: string;
  changed: boolean;
  type: CategoryPendingFieldType;
  currentImageUrl: string;
  pendingImageUrl: string;
}

interface CategoryPendingReviewViewModel {
  category: AdminCategory;
  title: string;
  slug: string;
  workflowLabel: string;
  workflowClassName: string;
  displayLabel: string;
  displayClassName: string;
  hasPendingData: boolean;
  parseError: string;
  rows: CategoryPendingComparisonRow[];
  canApproveReject: boolean;
  canCancelApprove: boolean;
}

interface CategoryNewDataParseResult {
  data: Partial<Record<CategoryPendingDataKey, unknown>> | null;
  errorMessage: string;
}

interface CategoryBatchActionConfig {
  label: string;
  confirmLabel: string;
  successVerb: string;
}

@Component({
  selector: 'app-admin-categories',
  imports: [AgGridAngular, NgFor, NgIf, ReactiveFormsModule, RouterLink, TuiIcon],
  templateUrl: './categories.html',
  styleUrls: ['./categories.scss', './categories-grid.scss', './categories-media.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AdminCategories implements OnInit {
  @ViewChild('categoryUploadInput') private categoryUploadInput?: ElementRef<HTMLInputElement>;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly adminCategoryApiService = inject(AdminCategoryApiService);
  private readonly adminMediaApiService = inject(AdminMediaApiService);
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly feedback = inject(AdminUiFeedbackService);

  readonly fallbackImage = '/hero/bg-home.png';
  readonly maxUploadSize = 5 * 1024 * 1024;
  readonly allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  readonly mediaModuleOptions: CategoryMediaModuleOption[] = [
    { label: 'Categories', value: 'categories' },
    { label: 'General', value: 'general' },
    { label: 'Tất cả', value: 'all' },
  ];
  readonly categoryOnlyMediaModuleOptions: CategoryMediaModuleOption[] = [
    { label: 'Categories', value: 'categories' },
  ];
  readonly mediaSkeletonCards = Array.from({ length: 6 });
  readonly gridLoadingOverlay =
    '<span class="admin-categories__grid-overlay">Đang tải danh sách danh mục...</span>';
  readonly gridNoRowsOverlay =
    '<span class="admin-categories__grid-overlay">Chưa có danh mục nào.</span>';
  readonly gridTheme: Theme = themeQuartz;
  readonly defaultColDef: ColDef<CategoryGridRow> = {
    sortable: true,
    resizable: true,
    suppressMovable: true,
  };
  readonly rowSelection: RowSelectionOptions<CategoryGridRow> = {
    mode: 'multiRow',
    checkboxes: true,
    headerCheckbox: true,
    enableClickSelection: false,
  };
  readonly getRowId = (params: GetRowIdParams<CategoryGridRow>) =>
    `${params.data.id ?? params.data.rowIndex}`;
  readonly columnDefs: ColDef<CategoryGridRow>[] = [
    {
      headerName: 'Ảnh',
      field: 'imageUrl',
      width: 92,
      minWidth: 84,
      sortable: false,
      cellRenderer: (params: ICellRendererParams<CategoryGridRow, string>) =>
        this.renderImageCell(params.data),
    },
    {
      headerName: 'Tên danh mục',
      field: 'name',
      minWidth: 220,
      flex: 1.35,
      cellRenderer: (params: ICellRendererParams<CategoryGridRow, string>) =>
        this.renderNameCell(params.data),
    },
    {
      headerName: 'Slug',
      field: 'slug',
      minWidth: 150,
      flex: 0.85,
      cellRenderer: (params: ICellRendererParams<CategoryGridRow, string>) => {
        const slug = this.escapeHtml(params.data?.slug || 'dang-cap-nhat');
        return `<code class="admin-categories__grid-slug">${slug}</code>`;
      },
    },
    {
      headerName: 'Workflow',
      field: 'workflowLabel',
      width: 148,
      minWidth: 138,
      cellRenderer: (params: ICellRendererParams<CategoryGridRow, string>) =>
        this.renderWorkflowCell(params.data),
    },
    {
      headerName: 'Hiển thị',
      field: 'displayLabel',
      width: 154,
      minWidth: 144,
      cellRenderer: (params: ICellRendererParams<CategoryGridRow, string>) =>
        this.renderDisplayCell(params.data),
    },
    {
      headerName: 'Phê duyệt',
      field: 'pendingChangeLabel',
      width: 186,
      minWidth: 176,
      cellRenderer: (params: ICellRendererParams<CategoryGridRow, string>) =>
        this.renderApprovalCell(params.data),
    },
    {
      headerName: 'Thứ tự',
      field: 'order',
      width: 104,
      minWidth: 92,
      sort: 'asc',
      comparator: (valueA, valueB) => Number(valueA || 0) - Number(valueB || 0),
    },
    {
      headerName: 'Ngày tạo',
      field: 'createdDisplay',
      width: 152,
      minWidth: 142,
      comparator: (_valueA, _valueB, nodeA, nodeB) => {
        return (nodeA.data?.createdTimestamp || 0) - (nodeB.data?.createdTimestamp || 0);
      },
    },
    {
      headerName: 'Cập nhật',
      field: 'updatedDisplay',
      width: 152,
      minWidth: 142,
      comparator: (_valueA, _valueB, nodeA, nodeB) => {
        return (nodeA.data?.updatedTimestamp || 0) - (nodeB.data?.updatedTimestamp || 0);
      },
    },
    {
      headerName: 'Hành động',
      colId: 'actions',
      width: 106,
      minWidth: 96,
      sortable: false,
      resizable: false,
      pinned: 'right',
      cellRenderer: CategoryActionCellRendererComponent,
    },
  ];
  readonly statusFilters: StatusFilterOption[] = [
    { label: 'Tất cả', value: 'ALL' },
    { label: 'Nháp', value: 'DRAFT' },
    { label: 'Chờ duyệt', value: 'PENDING' },
    { label: 'Đã duyệt', value: 'APPROVED' },
    { label: 'Từ chối', value: 'REJECTED' },
    { label: 'Hủy trình duyệt', value: 'CANCEL_APPROVE' },
  ];

  loading = false;
  saving = false;
  deletingId: number | null = null;
  updatingWorkflowId: number | null = null;
  updatingDisplayId: number | null = null;
  updatingImage = false;
  errorMessage = '';
  successMessage = '';
  categories: AdminCategory[] = [];
  filteredCategories: AdminCategory[] = [];
  gridRows: CategoryGridRow[] = [];
  keyword = '';
  statusFilter: CategoryStatusFilter = 'ALL';
  selectedCategory: AdminCategory | null = null;
  private originalEditSnapshot: CategoryEditSnapshot | null = null;
  isFormOpen = false;
  isEditMode = false;
  focusedSelect: 'statusFilter' | null = null;
  openedActionCategoryId: number | null = null;
  actionMenuPlacement: 'bottom' | 'top' = 'bottom';
  selectedImageUrl = '';
  selectedUploadFileName = '';
  uploadingImage = false;
  imageErrorMessage = '';
  isMediaPickerOpen = false;
  mediaLoading = false;
  mediaErrorMessage = '';
  mediaCards: CategoryMediaCard[] = [];
  visibleMediaModuleOptions: CategoryMediaModuleOption[] = this.categoryOnlyMediaModuleOptions;
  selectedMediaModule = 'categories';
  mediaPage = 0;
  mediaSize = 18;
  mediaTotalPages = 0;
  reorderingCategoryIds = new Set<number>();
  reorderBlockedByFilter = false;
  gridSortBlocksReorder = false;
  pendingReview: CategoryPendingReviewViewModel | null = null;
  pendingRejectMode = false;
  pendingRejectReason = '';
  pendingReviewErrorMessage = '';
  pendingReviewSubmitting = false;
  selectedBatchCategories: AdminCategory[] = [];
  selectedBatchCount = 0;
  batchProcessing = false;
  batchRejectMode = false;
  batchRejectReason = '';
  batchErrorMessage = '';

  private gridApi?: GridApi<CategoryGridRow>;
  private slugManuallyEdited = false;

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
    slug: ['', [Validators.required]],
    description: [''],
    imageUrl: [''],
  });

  readonly gridContext = {
    componentParent: this,
  };

  ngOnInit(): void {
    this.configureMediaAccess();
    this.watchCategoryViewFromUrl();
    this.loadCategories();
  }

  onGridReady(event: GridReadyEvent<CategoryGridRow>): void {
    this.gridApi = event.api;
    this.updateGridSortState();
    this.updateGridOverlay();
  }

  handleGridSortChanged(): void {
    this.updateGridSortState();
    this.refreshGridActions();
  }

  handleGridSelectionChanged(): void {
    this.syncBatchSelection();
  }

  loadCategories(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminCategoryApiService
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.categories = this.normalizeCategoryOrders(this.extractList(response));
          this.applyFilters();
          this.loading = false;
          this.updateGridOverlay();
        },
        error: (error) => {
          this.errorMessage = this.errorText(
            error,
            'Không thể tải danh sách danh mục. Vui lòng thử lại sau.',
          );
          this.loading = false;
          this.updateGridOverlay();
        },
      });
  }

  openCreateForm(): void {
    if (!this.canCreateCategory()) {
      this.denyCategoryAction();
      return;
    }

    this.setFormViewUrl();
    this.isFormOpen = true;
    this.isEditMode = false;
    this.selectedCategory = null;
    this.originalEditSnapshot = null;
    this.slugManuallyEdited = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.form.reset({
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
    });
    this.resetImageState();
  }

  openEditForm(category: AdminCategory): void {
    if (!this.canEditCategory(category)) {
      this.denyCategoryAction();
      return;
    }

    this.setFormViewUrl();
    this.isFormOpen = true;
    this.isEditMode = true;
    this.selectedCategory = category;
    this.originalEditSnapshot = this.buildSnapshotFromCategory(category);
    this.slugManuallyEdited = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.form.reset({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      imageUrl: category.imageUrl || '',
    });
    this.selectedImageUrl = category.imageUrl || '';
    this.selectedUploadFileName = '';
    this.imageErrorMessage = '';
    this.closeMediaPicker();
  }

  closeForm(updateUrl = true): void {
    this.isFormOpen = false;
    this.isEditMode = false;
    this.selectedCategory = null;
    this.originalEditSnapshot = null;
    this.slugManuallyEdited = false;
    this.saving = false;
    this.updatingImage = false;
    this.form.reset({
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
    });
    this.resetImageState();

    if (updateUrl) {
      this.setListViewUrl();
    }
  }

  handleNameInput(): void {
    if (this.isEditMode || this.slugManuallyEdited) {
      return;
    }

    const slug = this.generateSlug(this.form.controls.name.value);
    this.form.controls.slug.setValue(slug);
  }

  markSlugEdited(): void {
    this.slugManuallyEdited = true;
  }

  updateKeyword(event: Event): void {
    this.keyword = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  toggleSelect(selectName: 'statusFilter'): void {
    this.focusedSelect = this.focusedSelect === selectName ? null : selectName;
  }

  selectStatusFilter(status: CategoryStatusFilter): void {
    this.statusFilter = status;
    this.focusedSelect = null;
    this.applyFilters();
  }

  statusFilterLabel(status: CategoryStatusFilter): string {
    return this.statusFilters.find((option) => option.value === status)?.label || 'Tất cả';
  }

  canCreateCategory(): boolean {
    return this.hasCategoryStaffAccess();
  }

  canEditCategory(_category?: AdminCategory): boolean {
    return this.hasCategoryStaffAccess();
  }

  canSubmitCategory(_category?: AdminCategory): boolean {
    return this.hasCategoryStaffAccess();
  }

  canApproveCategory(_category?: AdminCategory): boolean {
    return this.hasCategoryAdminAccess();
  }

  canRejectCategory(_category?: AdminCategory): boolean {
    return this.hasCategoryAdminAccess();
  }

  canCancelApproveCategory(_category?: AdminCategory): boolean {
    return this.hasCategoryAdminAccess();
  }

  canDisplayCategory(_category?: AdminCategory): boolean {
    return this.hasCategoryAdminAccess();
  }

  canDeleteCategory(_category?: AdminCategory): boolean {
    return this.currentRole() === 'SUPER_ADMIN';
  }

  canBatchCategoryWorkflow(_action?: CategoryBatchAction): boolean {
    return this.hasCategoryAdminAccess();
  }

  canReorderCategory(_category?: AdminCategory): boolean {
    return this.hasCategoryStaffAccess();
  }

  canUpdateCategoryImage(_category?: AdminCategory): boolean {
    return this.hasCategoryStaffAccess();
  }

  canPickCategoryMedia(): boolean {
    return this.hasCategoryStaffAccess();
  }

  isCategoryMediaLimited(): boolean {
    return this.authService.hasRole('STAFF') && !this.hasCategoryAdminAccess();
  }

  @HostListener('document:mousedown', ['$event'])
  closeSelectOnOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;

    if (!target?.closest('.admin-categories__control-wrap--select')) {
      this.focusedSelect = null;
    }

    if (!target?.closest('.admin-categories__action-wrap')) {
      this.closeActionMenu();
    }
  }

  @HostListener('document:keydown.escape')
  closeOverlayMenusByEscape(): void {
    this.focusedSelect = null;
    this.closeActionMenu();

    if (this.pendingReview && !this.pendingReviewSubmitting) {
      this.closePendingChangesPanel();
    }

    if (this.batchRejectMode && !this.batchProcessing) {
      this.cancelBatchReject();
    }
  }

  toggleActionMenu(category: AdminCategory, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (!category.id) {
      return;
    }

    if (this.openedActionCategoryId === category.id) {
      this.closeActionMenu();
      return;
    }

    const trigger = event.currentTarget as HTMLElement;
    const rect = trigger.getBoundingClientRect();

    const estimatedMenuHeight = 320;
    const spaceBelow = window.innerHeight - rect.bottom;

    this.focusedSelect = null;
    this.actionMenuPlacement = spaceBelow < estimatedMenuHeight ? 'top' : 'bottom';
    this.openedActionCategoryId = category.id;
    this.refreshGridActions();
  }

  closeActionMenu(): void {
    const wasOpen = this.openedActionCategoryId !== null;
    this.openedActionCategoryId = null;
    this.actionMenuPlacement = 'bottom';

    if (wasOpen) {
      this.refreshGridActions();
    }
  }

  isActionMenuOpen(category: AdminCategory): boolean {
    return !!category.id && this.openedActionCategoryId === category.id;
  }

  isActionMenuTop(category: AdminCategory): boolean {
    return this.isActionMenuOpen(category) && this.actionMenuPlacement === 'top';
  }

  clearBatchSelection(): void {
    this.gridApi?.deselectAll();
    this.selectedBatchCategories = [];
    this.selectedBatchCount = 0;
    this.batchRejectMode = false;
    this.batchRejectReason = '';
    this.batchErrorMessage = '';
  }

  runBatchSubmit(): void {
    if (!this.canBatchCategoryWorkflow('submit')) {
      this.denyCategoryAction();
      return;
    }

    this.confirmAndRunBatchAction('submit');
  }

  runBatchApprove(): void {
    if (!this.canBatchCategoryWorkflow('approve')) {
      this.denyCategoryAction();
      return;
    }

    this.confirmAndRunBatchAction('approve');
  }

  startBatchReject(): void {
    if (!this.canBatchCategoryWorkflow('reject')) {
      this.denyCategoryAction();
      return;
    }

    if (!this.getBatchEligibleCategories('reject').length) {
      this.feedback.warning('Không có danh mục hợp lệ để thực hiện thao tác này.');
      return;
    }

    this.batchRejectMode = true;
    this.batchErrorMessage = '';
  }

  cancelBatchReject(): void {
    this.batchRejectMode = false;
    this.batchRejectReason = '';
    this.batchErrorMessage = '';
  }

  updateBatchRejectReason(event: Event): void {
    this.batchRejectReason = (event.target as HTMLTextAreaElement).value;
  }

  confirmBatchReject(): void {
    if (!this.canBatchCategoryWorkflow('reject')) {
      this.denyCategoryAction();
      return;
    }

    this.confirmAndRunBatchAction('reject', this.batchRejectReason.trim() || null);
  }

  runBatchCancelApprove(): void {
    if (!this.canBatchCategoryWorkflow('cancelApprove')) {
      this.denyCategoryAction();
      return;
    }

    this.confirmAndRunBatchAction('cancelApprove');
  }

  runBatchShowPublic(): void {
    if (!this.canBatchCategoryWorkflow('show')) {
      this.denyCategoryAction();
      return;
    }

    this.confirmAndRunBatchAction('show');
  }

  runBatchHidePublic(): void {
    if (!this.canBatchCategoryWorkflow('hide')) {
      this.denyCategoryAction();
      return;
    }

    this.confirmAndRunBatchAction('hide');
  }

  openPendingChangesPanel(category: AdminCategory): void {
    this.closeActionMenu();
    this.pendingReview = this.buildPendingReview(category);
    this.pendingRejectMode = false;
    this.pendingRejectReason = '';
    this.pendingReviewErrorMessage = '';
  }

  closePendingChangesPanel(): void {
    if (this.pendingReviewSubmitting) {
      return;
    }

    this.pendingReview = null;
    this.pendingRejectMode = false;
    this.pendingRejectReason = '';
    this.pendingReviewErrorMessage = '';
  }

  startPendingReject(): void {
    this.pendingRejectMode = true;
    this.pendingReviewErrorMessage = '';
  }

  cancelPendingReject(): void {
    this.pendingRejectMode = false;
    this.pendingRejectReason = '';
    this.pendingReviewErrorMessage = '';
  }

  updatePendingRejectReason(event: Event): void {
    this.pendingRejectReason = (event.target as HTMLTextAreaElement).value;
  }

  approvePendingReview(): void {
    const review = this.pendingReview;
    const category = review?.category;

    if (!category || !review.canApproveReject || !this.canApproveCategory(category)) {
      if (category && !this.canApproveCategory(category)) {
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
          this.runPendingReviewWorkflowAction(
            category,
            (id) => this.adminCategoryApiService.approveCategory(id),
            'Đã duyệt thay đổi danh mục.',
            'Không thể duyệt danh mục. Vui lòng thử lại sau.',
          );
        }
      });
  }

  rejectPendingReview(): void {
    const review = this.pendingReview;
    const category = review?.category;

    if (!category || !review.canApproveReject || !this.canRejectCategory(category)) {
      if (category && !this.canRejectCategory(category)) {
        this.denyCategoryAction();
      }
      return;
    }

    this.runPendingReviewWorkflowAction(
      category,
      (id) =>
        this.adminCategoryApiService.rejectCategory(id, {
          reason: this.pendingRejectReason.trim() || null,
        }),
      'Đã từ chối thay đổi danh mục.',
      'Không thể từ chối danh mục. Vui lòng thử lại sau.',
    );
  }

  cancelApprovePendingReview(): void {
    const review = this.pendingReview;
    const category = review?.category;

    if (!category || !review.canCancelApprove || !this.canCancelApproveCategory(category)) {
      if (category && !this.canCancelApproveCategory(category)) {
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
          this.runPendingReviewWorkflowAction(
            category,
            (id) => this.adminCategoryApiService.cancelApproveCategory(id),
            'Đã hủy trình duyệt danh mục.',
            'Không thể hủy trình duyệt danh mục. Vui lòng thử lại sau.',
          );
        }
      });
  }

  submitForm(): void {
    if (this.isEditMode && !this.canEditCategory(this.selectedCategory || undefined)) {
      this.denyCategoryAction();
      return;
    }

    if (!this.isEditMode && !this.canCreateCategory()) {
      this.denyCategoryAction();
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.isEditMode && !this.selectedCategory?.id) {
      this.errorMessage = 'Không xác định được danh mục cần cập nhật.';
      return;
    }

    const payload = this.buildPayload();

    if (this.isEditMode && !this.hasEditChanges(payload as AdminCategoryUpdateRequest)) {
      this.successMessage = '';
      this.errorMessage = 'Chưa có dữ liệu thay đổi.';
      this.feedback.info(this.errorMessage);
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request$ =
      this.isEditMode && this.selectedCategory?.id
        ? this.adminCategoryApiService.patchCategory(
            this.selectedCategory.id,
            payload as AdminCategoryPatchRequest,
          )
        : this.adminCategoryApiService.createCategory(payload);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        const savedCategory = this.extractItem(response);
        this.successMessage = this.isEditMode
          ? 'Đã lưu dữ liệu thay đổi chờ duyệt.'
          : 'Đã tạo danh mục mới.';
        this.saving = false;

        if (this.isEditMode) {
          this.loadCategories();
        } else if (savedCategory?.id) {
          this.upsertCategory(savedCategory);
        } else {
          this.loadCategories();
        }

        this.closeForm();
      },
      error: (error) => {
        this.errorMessage = this.errorText(error, 'Không thể lưu danh mục. Vui lòng thử lại sau.');
        this.saving = false;
      },
    });
  }

  updateImageOnly(): void {
    const categoryId = this.selectedCategory?.id;

    if (!this.isEditMode || !categoryId) {
      return;
    }

    if (!this.canUpdateCategoryImage(this.selectedCategory || undefined)) {
      this.denyCategoryAction();
      return;
    }

    const imageUrl = this.form.controls.imageUrl.value.trim();

    if (!imageUrl) {
      this.errorMessage = 'Vui lòng nhập URL ảnh Cloudinary trước khi cập nhật ảnh.';
      return;
    }

    this.updatingImage = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminCategoryApiService
      .updateCategoryImage(categoryId, imageUrl)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const updatedCategory = this.extractItem(response) || {
            ...this.selectedCategory,
            imageUrl,
          };
          this.upsertCategory(updatedCategory);
          this.selectedCategory = updatedCategory;
          this.successMessage = 'Đã cập nhật ảnh danh mục.';
          this.updatingImage = false;
        },
        error: (error) => {
          this.errorMessage = this.errorText(
            error,
            'Không thể cập nhật ảnh danh mục. Vui lòng thử lại sau.',
          );
          this.updatingImage = false;
        },
      });
  }

  openUploadPicker(): void {
    if (!this.uploadingImage) {
      this.categoryUploadInput?.nativeElement.click();
    }
  }

  onCategoryUploadSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    this.imageErrorMessage = '';
    this.errorMessage = '';

    if (!file) {
      return;
    }

    if (!this.allowedImageTypes.includes(file.type)) {
      this.imageErrorMessage = 'Chỉ hỗ trợ ảnh PNG, JPG, JPEG hoặc WEBP.';
      this.feedback.warning(this.imageErrorMessage);
      input.value = '';
      return;
    }

    if (file.size > this.maxUploadSize) {
      this.imageErrorMessage = 'Ảnh tải lên tối đa 5MB.';
      this.feedback.warning(this.imageErrorMessage);
      input.value = '';
      return;
    }

    this.selectedUploadFileName = file.name;
    this.uploadImageFile(file, input);
  }

  openMediaPicker(): void {
    if (!this.canPickCategoryMedia()) {
      this.denyCategoryAction();
      return;
    }

    if (this.isCategoryMediaLimited()) {
      this.selectedMediaModule = 'categories';
    }

    this.isMediaPickerOpen = true;

    if (!this.mediaCards.length && !this.mediaLoading) {
      this.loadMedia(0);
    }
  }

  closeMediaPicker(): void {
    this.isMediaPickerOpen = false;
    this.mediaErrorMessage = '';
  }

  loadMedia(page: number = 0): void {
    this.mediaLoading = true;
    this.mediaErrorMessage = '';
    const module = this.resolveMediaListModule();

    this.adminMediaApiService
      .getMedia({
        module,
        page,
        size: this.mediaSize,
        sortBy: 'createdAt',
        sortDir: 'desc',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const pageResponse = this.extractMediaPage(response);
          this.mediaCards = pageResponse.content
            .map((item) => this.normalizeMediaCard(item))
            .filter((item): item is CategoryMediaCard => !!item);
          this.mediaPage = pageResponse.page;
          this.mediaSize = pageResponse.size;
          this.mediaTotalPages = pageResponse.totalPages;
          this.mediaLoading = false;
        },
        error: (error) => {
          this.mediaErrorMessage = this.mediaErrorText(
            error,
            'Không thể tải danh sách ảnh Media.',
          );
          this.mediaLoading = false;
        },
      });
  }

  selectMediaModule(module: string): void {
    if (!this.visibleMediaModuleOptions.some((option) => option.value === module)) {
      this.feedback.warning('Bạn không có quyền xem module Media này.');
      return;
    }

    if (this.selectedMediaModule === module || this.mediaLoading) {
      return;
    }

    this.selectedMediaModule = module;
    this.loadMedia(0);
  }

  selectMediaImage(card: CategoryMediaCard): void {
    if (!card.url) {
      this.imageErrorMessage = 'Ảnh Media này chưa có URL hợp lệ.';
      this.feedback.warning(this.imageErrorMessage);
      return;
    }

    this.setImageUrl(card.url);
    this.selectedUploadFileName = '';
    this.closeMediaPicker();
    this.feedback.success('Đã chọn ảnh danh mục từ Media.');
  }

  clearCategoryImage(): void {
    this.setImageUrl('');
    this.selectedUploadFileName = '';
    this.imageErrorMessage = '';

    if (this.categoryUploadInput) {
      this.categoryUploadInput.nativeElement.value = '';
    }
  }

  imageStatusText(): string {
    return this.selectedImageUrl
      ? this.selectedUploadFileName || 'Đã chọn ảnh'
      : 'Chưa có ảnh danh mục';
  }

  shortImageUrl(): string {
    if (!this.selectedImageUrl) {
      return '';
    }

    return this.selectedImageUrl.length <= 56
      ? this.selectedImageUrl
      : `${this.selectedImageUrl.slice(0, 28)}...${this.selectedImageUrl.slice(-20)}`;
  }

  isSelectedMedia(card: CategoryMediaCard): boolean {
    return !!card.url && card.url === this.selectedImageUrl;
  }

  submitCategory(category: AdminCategory): void {
    if (!this.canSubmitCategory(category)) {
      this.denyCategoryAction();
      return;
    }

    this.feedback
      .confirmInfo(
        'Bạn có chắc muốn gửi danh mục này để duyệt không?',
        'Xác nhận thao tác',
        'Gửi duyệt',
      )
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.runWorkflowAction(
            category,
            (id) => this.adminCategoryApiService.submitCategory(id),
            'Đã gửi danh mục vào trạng thái chờ duyệt.',
            'Không thể gửi duyệt danh mục. Vui lòng thử lại sau.',
          );
        }
      });
  }

  approveCategory(category: AdminCategory): void {
    if (!this.canApproveCategory(category)) {
      this.denyCategoryAction();
      return;
    }

    this.feedback
      .confirmInfo(
        'Bạn có chắc muốn duyệt thay đổi của danh mục này không?',
        'Xác nhận thao tác',
        'Duyệt',
      )
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.runWorkflowAction(
            category,
            (id) => this.adminCategoryApiService.approveCategory(id),
            'Đã duyệt thay đổi danh mục.',
            'Không thể duyệt danh mục. Vui lòng thử lại sau.',
          );
        }
      });
  }

  rejectCategory(category: AdminCategory): void {
    if (!this.canRejectCategory(category)) {
      this.denyCategoryAction();
      return;
    }

    this.feedback
      .confirmWarning(
        'Bạn có chắc muốn từ chối thay đổi của danh mục này không?',
        'Xác nhận thao tác',
        'Từ chối',
      )
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.runWorkflowAction(
            category,
            (id) => this.adminCategoryApiService.rejectCategory(id, { reason: null }),
            'Đã từ chối thay đổi danh mục.',
            'Không thể từ chối danh mục. Vui lòng thử lại sau.',
          );
        }
      });
  }

  cancelApproveCategory(category: AdminCategory): void {
    if (!this.canCancelApproveCategory(category)) {
      this.denyCategoryAction();
      return;
    }

    this.feedback
      .confirmWarning(
        'Bạn có chắc muốn hủy trình duyệt danh mục này không?',
        'Xác nhận thao tác',
        'Hủy trình duyệt',
      )
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.runWorkflowAction(
            category,
            (id) => this.adminCategoryApiService.cancelApproveCategory(id),
            'Đã hủy trình duyệt danh mục.',
            'Không thể hủy trình duyệt danh mục. Vui lòng thử lại sau.',
          );
        }
      });
  }

  toggleCategoryDisplay(category: AdminCategory): void {
    if (!category.id || this.updatingDisplayId) {
      return;
    }

    if (!this.canDisplayCategory(category)) {
      this.denyCategoryAction();
      return;
    }

    if (this.parseStatus(category.status) !== 'APPROVED') {
      this.feedback.warning('Chỉ danh mục đã duyệt mới có thể bật hiển thị public.');
      return;
    }

    const nextDisplay: 0 | 1 = this.isCategoryDisplayEnabled(category) ? 0 : 1;
    const confirmMessage =
      nextDisplay === 1
        ? 'Bạn có chắc muốn hiển thị danh mục này ngoài public không?'
        : 'Bạn có chắc muốn ẩn danh mục này khỏi public không?';
    const confirmText = nextDisplay === 1 ? 'Hiển thị public' : 'Ẩn public';

    this.feedback
      .confirmWarning(confirmMessage, 'Xác nhận thao tác', confirmText)
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (!confirmed || !category.id) {
          return;
        }

        this.updatingDisplayId = category.id;
        this.errorMessage = '';
        this.successMessage = '';

        this.adminCategoryApiService
          .updateCategoryDisplay(category.id, nextDisplay)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (response) => {
              const updatedCategory =
                this.extractItem(response) || { ...category, isDisplay: nextDisplay };
              this.upsertCategory(updatedCategory);
              this.successMessage =
                nextDisplay === 1
                  ? 'Đã bật hiển thị public cho danh mục.'
                  : 'Đã ẩn danh mục khỏi public.';
              this.feedback.success(this.successMessage);
              this.updatingDisplayId = null;
            },
            error: (error) => {
              this.errorMessage = this.errorText(
                error,
                'Không thể cập nhật hiển thị public. Vui lòng thử lại sau.',
              );
              this.feedback.error(this.errorMessage);
              this.updatingDisplayId = null;
            },
          });
      });
  }

  private runWorkflowAction(
    category: AdminCategory,
    action: (id: number) => Observable<unknown>,
    successMessage: string,
    errorMessage: string,
  ): void {
    if (!category.id || this.updatingWorkflowId) {
      return;
    }

    this.updatingWorkflowId = category.id;
    this.errorMessage = '';
    this.successMessage = '';

    action(category.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const updatedCategory = this.extractItem(response);

          if (updatedCategory?.id) {
            this.upsertCategory(updatedCategory);
          } else {
            this.loadCategories();
          }

          this.successMessage = successMessage;
          this.feedback.success(this.successMessage);
          this.updatingWorkflowId = null;
        },
        error: (error) => {
          this.errorMessage = this.errorText(error, errorMessage);
          this.feedback.error(this.errorMessage);
          this.updatingWorkflowId = null;
        },
      });
  }

  private runPendingReviewWorkflowAction(
    category: AdminCategory,
    action: (id: number) => Observable<unknown>,
    successMessage: string,
    errorMessage: string,
  ): void {
    if (!category.id || this.updatingWorkflowId || this.pendingReviewSubmitting) {
      return;
    }

    this.updatingWorkflowId = category.id;
    this.pendingReviewSubmitting = true;
    this.pendingReviewErrorMessage = '';
    this.errorMessage = '';
    this.successMessage = '';

    action(category.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const updatedCategory = this.extractItem(response);

          if (updatedCategory?.id) {
            this.upsertCategory(updatedCategory);
          } else {
            this.loadCategories();
          }

          this.successMessage = successMessage;
          this.feedback.success(this.successMessage);
          this.updatingWorkflowId = null;
          this.pendingReviewSubmitting = false;
          this.closePendingChangesPanel();
        },
        error: (error) => {
          this.pendingReviewErrorMessage = this.errorText(error, errorMessage);
          this.feedback.error(this.pendingReviewErrorMessage);
          this.updatingWorkflowId = null;
          this.pendingReviewSubmitting = false;
        },
      });
  }

  private confirmAndRunBatchAction(action: CategoryBatchAction, reason: string | null = null): void {
    if (this.batchProcessing) {
      return;
    }

    if (!this.canBatchCategoryWorkflow(action)) {
      this.denyCategoryAction();
      return;
    }

    const selectedCount = this.selectedBatchCategories.length;
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

    this.batchProcessing = true;
    this.batchErrorMessage = '';
    this.errorMessage = '';
    this.successMessage = '';

    this.batchActionRequest(action, ids, reason)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const batchResponse =
            this.extractBatchActionResponse(response) || this.fallbackBatchResponse(ids.length);
          const config = this.batchActionConfig(action);

          this.batchProcessing = false;
          this.batchRejectMode = false;
          this.batchRejectReason = '';
          this.clearBatchSelection();
          this.loadCategories();

          this.successMessage = `Đã xử lý thành công ${batchResponse.successCount}/${batchResponse.total} danh mục.`;

          if (batchResponse.failedCount > 0) {
            const firstFailedMessage = batchResponse.failedItems[0]?.message;
            this.batchErrorMessage = firstFailedMessage
              ? `Có ${batchResponse.failedCount} danh mục xử lý thất bại. Ví dụ: ${firstFailedMessage}`
              : `Có ${batchResponse.failedCount} danh mục xử lý thất bại. Vui lòng kiểm tra lại.`;
            this.feedback.warning(this.batchErrorMessage);
            return;
          }

          this.feedback.success(`${config.successVerb}: ${this.successMessage}`);
        },
        error: (error) => {
          this.batchProcessing = false;
          this.batchErrorMessage = this.errorText(
            error,
            'Không thể xử lý thao tác hàng loạt. Vui lòng thử lại sau.',
          );
          this.feedback.error(this.batchErrorMessage);
          this.loadCategories();
        },
      });
  }

  private batchActionRequest(
    action: CategoryBatchAction,
    ids: number[],
    reason: string | null,
  ): Observable<unknown> {
    switch (action) {
      case 'submit':
        return this.adminCategoryApiService.submitCategories(ids);
      case 'approve':
        return this.adminCategoryApiService.approveCategories(ids);
      case 'reject':
        return this.adminCategoryApiService.rejectCategories(ids, reason);
      case 'cancelApprove':
        return this.adminCategoryApiService.cancelApproveCategories(ids);
      case 'show':
        return this.adminCategoryApiService.updateCategoriesDisplay(ids, 1);
      case 'hide':
        return this.adminCategoryApiService.updateCategoriesDisplay(ids, 0);
    }
  }

  private getBatchEligibleCategories(action: CategoryBatchAction): AdminCategory[] {
    return this.selectedBatchCategories.filter(
      (category) => typeof category.id === 'number' && this.isCategoryEligibleForBatchAction(action, category),
    );
  }

  private isCategoryEligibleForBatchAction(
    action: CategoryBatchAction,
    category: AdminCategory,
  ): boolean {
    if (!this.canBatchCategoryWorkflow(action)) {
      return false;
    }

    const status = this.parseStatus(category.status);
    const isDisplay = this.isCategoryDisplayEnabled(category);

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
        return {
          label: 'Ẩn public',
          confirmLabel: 'ẩn public',
          successVerb: 'Ẩn public hàng loạt',
        };
    }
  }

  deleteCategory(category: AdminCategory): void {
    if (!category.id || this.deletingId) {
      return;
    }

    if (!this.canDeleteCategory(category)) {
      this.denyCategoryAction();
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

        this.deletingId = category.id;
        this.errorMessage = '';
        this.successMessage = '';

        this.adminCategoryApiService
          .deleteCategory(category.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.categories = this.categories.filter((item) => item.id !== category.id);
              this.applyFilters();
              this.successMessage = 'Đã xóa danh mục.';
              this.feedback.success(this.successMessage);
              this.deletingId = null;

              if (this.selectedCategory?.id === category.id) {
                this.closeForm();
              }
            },
            error: (error) => {
              this.errorMessage = this.errorText(
                error,
                'Không thể xóa danh mục. Vui lòng thử lại sau.',
              );
              this.feedback.error(this.errorMessage);
              this.deletingId = null;
            },
          });
      });
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
        const status = this.parseStatus(category.status);
        const matchesStatus = this.statusFilter === 'ALL' || status === this.statusFilter;

        return matchesKeyword && matchesStatus;
      })
      .sort((a, b) => this.sortCategory(a, b));
    this.gridRows = this.buildGridRows(this.filteredCategories);
    this.updateGridOverlay();
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

    if (!this.canReorderCategory(category)) {
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
        if (!confirmed) {
          return;
        }

        this.swapCategoryOrder(category, targetCategory);
      });
  }

  canMoveCategoryUp(index: number): boolean {
    return (
      !this.reorderBlockedByFilter &&
      !this.gridSortBlocksReorder &&
      this.filteredCategories.length > 1 &&
      index > 0
    );
  }

  canMoveCategoryDown(index: number): boolean {
    return (
      !this.reorderBlockedByFilter &&
      !this.gridSortBlocksReorder &&
      this.filteredCategories.length > 1 &&
      index < this.filteredCategories.length - 1
    );
  }

  isCategoryReordering(category: AdminCategory): boolean {
    return !!category.id && this.reorderingCategoryIds.has(category.id);
  }

  categoryOrder(category: AdminCategory): number {
    return this.getCategoryOrder(category);
  }

  getCategoryImage(category: AdminCategory): string {
    return category.imageUrl || this.fallbackImage;
  }

  workflowLabel(status?: string): string {
    switch (this.parseStatus(status)) {
      case 'PENDING':
        return 'Chờ duyệt';
      case 'APPROVED':
        return 'Đã duyệt';
      case 'REJECTED':
        return 'Từ chối';
      case 'CANCEL_APPROVE':
        return 'Hủy trình duyệt';
      case 'DRAFT':
      default:
        return 'Nháp';
    }
  }

  workflowClass(status?: string): string {
    return `admin-categories__workflow--${(this.parseStatus(status) || 'DRAFT').toLowerCase().replace('_', '-')}`;
  }

  displayLabel(category: AdminCategory): string {
    if (this.parseStatus(category.status) !== 'APPROVED' && this.isCategoryDisplayEnabled(category)) {
      return 'Chưa thể hiển thị';
    }

    return this.isCategoryDisplayEnabled(category) ? 'Đang hiển thị' : 'Đang ẩn';
  }

  displayClass(category: AdminCategory): string {
    if (this.parseStatus(category.status) !== 'APPROVED' && this.isCategoryDisplayEnabled(category)) {
      return 'admin-categories__display--blocked';
    }

    return this.isCategoryDisplayEnabled(category)
      ? 'admin-categories__display--visible'
      : 'admin-categories__display--hidden';
  }

  isCategoryDisplayEnabled(category: AdminCategory): boolean {
    return this.isDisplayValueEnabled(category.isDisplay);
  }

  formatDate(value?: string): string {
    return this.formatDateTime(this.parseDate(value));
  }

  handleImageError(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (image.src.endsWith(this.fallbackImage)) {
      return;
    }

    image.src = this.fallbackImage;
  }

  private currentRole(): RoleCode | null {
    return this.authService.currentRole();
  }

  private hasCategoryStaffAccess(): boolean {
    return this.authService.hasRole('STAFF', 'ADMIN', 'SUPER_ADMIN');
  }

  private hasCategoryAdminAccess(): boolean {
    return this.authService.hasRole('ADMIN', 'SUPER_ADMIN');
  }

  private configureMediaAccess(): void {
    this.visibleMediaModuleOptions = this.isCategoryMediaLimited()
      ? this.categoryOnlyMediaModuleOptions
      : this.mediaModuleOptions;

    if (!this.visibleMediaModuleOptions.some((option) => option.value === this.selectedMediaModule)) {
      this.selectedMediaModule = 'categories';
    }
  }

  private resolveMediaListModule(): string | undefined {
    if (this.isCategoryMediaLimited()) {
      this.selectedMediaModule = 'categories';
      return 'categories';
    }

    return this.selectedMediaModule === 'all' ? undefined : this.selectedMediaModule;
  }

  private denyCategoryAction(): void {
    this.errorMessage = 'Bạn không có quyền thực hiện thao tác này.';
    this.feedback.warning(this.errorMessage);
  }

  private buildPendingReview(category: AdminCategory): CategoryPendingReviewViewModel {
    const parseResult = this.parseCategoryNewData(category.newData);
    const pendingData = parseResult.data;
    const rows = pendingData ? this.buildPendingComparisonRows(category, pendingData) : [];
    const status = this.parseStatus(category.status);
    const hasParseError = !!parseResult.errorMessage;

    return {
      category,
      title: category.name || 'Danh mục chưa đặt tên',
      slug: category.slug || 'dang-cap-nhat',
      workflowLabel: this.workflowLabel(category.status),
      workflowClassName: this.workflowClass(category.status),
      displayLabel: this.displayLabel(category),
      displayClassName: this.displayClass(category),
      hasPendingData: !!pendingData,
      parseError: parseResult.errorMessage,
      rows,
      canApproveReject:
        status === 'PENDING' &&
        !hasParseError &&
        this.canApproveCategory(category) &&
        this.canRejectCategory(category),
      canCancelApprove: status === 'PENDING' && this.canCancelApproveCategory(category),
    };
  }

  private parseCategoryNewData(newData: AdminCategory['newData']): CategoryNewDataParseResult {
    if (newData === null || newData === undefined || newData === '') {
      return { data: null, errorMessage: '' };
    }

    if (this.isRecord(newData)) {
      return { data: newData as Partial<Record<CategoryPendingDataKey, unknown>>, errorMessage: '' };
    }

    if (typeof newData !== 'string' || !newData.trim()) {
      return { data: null, errorMessage: '' };
    }

    try {
      const parsed = JSON.parse(newData);

      if (!this.isRecord(parsed)) {
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
  ): CategoryPendingComparisonRow[] {
    const currentOrder = this.getCategoryOrder(category);
    const pendingOrder = this.pendingValue(
      pendingData,
      ['displayOrder', 'sortOrder', 'orderIndex', 'order', 'position'],
      currentOrder,
    );
    const currentImageUrl = this.normalizeOptionalText(category.imageUrl);
    const pendingImageUrl = this.normalizeOptionalText(
      this.pendingValue(pendingData, ['imageUrl'], currentImageUrl),
    );

    return [
      this.textComparisonRow('name', 'Tên danh mục', category.name, pendingData),
      this.textComparisonRow('slug', 'Slug', category.slug, pendingData),
      this.textComparisonRow('description', 'Mô tả', category.description, pendingData),
      {
        key: 'imageUrl',
        label: 'Ảnh danh mục',
        currentValue: currentImageUrl ? this.shortText(currentImageUrl, 56) : 'Chưa có ảnh',
        pendingValue: pendingImageUrl ? this.shortText(pendingImageUrl, 56) : 'Chưa có ảnh',
        changed: this.normalizeOptionalText(currentImageUrl) !== this.normalizeOptionalText(pendingImageUrl),
        type: 'image',
        currentImageUrl,
        pendingImageUrl,
      },
      {
        key: 'status',
        label: 'Trạng thái workflow',
        currentValue: this.workflowLabel(category.status),
        pendingValue: this.workflowLabel(
          this.normalizeOptionalText(this.pendingValue(pendingData, ['status'], category.status)),
        ),
        changed:
          this.parseStatus(category.status) !==
          this.parseStatus(
            this.normalizeOptionalText(this.pendingValue(pendingData, ['status'], category.status)),
          ),
        type: 'status',
        currentImageUrl: '',
        pendingImageUrl: '',
      },
      {
        key: 'isDisplay',
        label: 'Hiển thị public',
        currentValue: this.displayValueLabel(category.isDisplay),
        pendingValue: this.displayValueLabel(
          this.pendingValue(pendingData, ['isDisplay'], category.isDisplay),
        ),
        changed:
          this.isDisplayValueEnabled(category.isDisplay) !==
          this.isDisplayValueEnabled(this.pendingValue(pendingData, ['isDisplay'], category.isDisplay)),
        type: 'display',
        currentImageUrl: '',
        pendingImageUrl: '',
      },
      {
        key: 'displayOrder',
        label: 'Thứ tự hiển thị',
        currentValue: this.orderValueLabel(currentOrder),
        pendingValue: this.orderValueLabel(pendingOrder),
        changed: this.normalizeDisplayOrder(currentOrder) !== this.normalizeDisplayOrder(pendingOrder),
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
  ): CategoryPendingComparisonRow {
    const currentValue = this.normalizeOptionalText(currentRawValue);
    const pendingValue = this.normalizeOptionalText(
      this.pendingValue(pendingData, [key], currentValue),
    );

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

    return this.isDisplayValueEnabled(value) ? 'Hiển thị public' : 'Ẩn public';
  }

  private orderValueLabel(value: unknown): string {
    const order = this.normalizeDisplayOrder(value);
    return order === Number.MAX_SAFE_INTEGER ? '-' : `${order}`;
  }

  private isDisplayValueEnabled(value: unknown): boolean {
    return value === true || value === 1 || value === '1' || value === 'true';
  }

  private shortText(value: string, maxLength: number): string {
    return value.length <= maxLength
      ? value
      : `${value.slice(0, Math.floor(maxLength / 2))}...${value.slice(-Math.floor(maxLength / 3))}`;
  }

  private buildGridRows(categories: AdminCategory[]): CategoryGridRow[] {
    return categories.map((category, index) => {
      const createdDate = this.parseDate(this.getCreatedDateValue(category));
      const updatedDate = this.parseDate(this.getUpdatedDateValue(category));
      const updatedTimestamp = this.shouldShowUpdatedDate(createdDate, updatedDate)
        ? updatedDate?.getTime() || 0
        : 0;
      const hasPendingChange = this.hasPendingCategoryChange(category);

      return {
        category,
        id: category.id,
        rowIndex: index,
        imageUrl: this.getCategoryImage(category),
        name: category.name || 'Chưa đặt tên',
        description: category.description || 'Chưa có mô tả',
        slug: category.slug || 'dang-cap-nhat',
        workflowLabel: this.workflowLabel(category.status),
        workflowClassName: this.workflowClass(category.status),
        displayLabel: this.displayLabel(category),
        displayClassName: this.displayClass(category),
        hasPendingChange,
        pendingChangeLabel: hasPendingChange ? 'Có thay đổi chờ duyệt' : 'Không có',
        order: this.categoryOrder(category),
        createdDisplay: this.formatDateTime(createdDate),
        createdTimestamp: createdDate?.getTime() || 0,
        updatedDisplay: updatedTimestamp ? this.formatDateTime(updatedDate) : '-',
        updatedTimestamp,
      };
    });
  }

  private renderImageCell(row?: CategoryGridRow): string {
    if (!row) {
      return '';
    }

    const src = this.escapeHtml(row.imageUrl);
    const alt = this.escapeHtml(row.name);
    const fallback = this.escapeHtml(this.fallbackImage);

    return `<img class="admin-categories__grid-thumb" src="${src}" alt="${alt}" onerror="this.onerror=null;this.src='${fallback}'" />`;
  }

  private renderNameCell(row?: CategoryGridRow): string {
    if (!row) {
      return '';
    }

    return `
      <div class="admin-categories__grid-name">
        <strong>${this.escapeHtml(row.name)}</strong>
        <small>${this.escapeHtml(row.description)}</small>
      </div>
    `;
  }

  private renderWorkflowCell(row?: CategoryGridRow): string {
    if (!row) {
      return '';
    }

    return `<span class="admin-categories__workflow ${this.escapeHtml(row.workflowClassName)}">${this.escapeHtml(row.workflowLabel)}</span>`;
  }

  private renderDisplayCell(row?: CategoryGridRow): string {
    if (!row) {
      return '';
    }

    return `<span class="admin-categories__display ${this.escapeHtml(row.displayClassName)}">${this.escapeHtml(row.displayLabel)}</span>`;
  }

  private renderApprovalCell(row?: CategoryGridRow): string {
    if (!row) {
      return '';
    }

    const stateClass = row.hasPendingChange
      ? 'admin-categories__approval--pending'
      : 'admin-categories__approval--empty';

    return `<span class="admin-categories__approval ${stateClass}">${this.escapeHtml(row.pendingChangeLabel)}</span>`;
  }

  private hasPendingCategoryChange(category: AdminCategory): boolean {
    return (
      this.parseStatus(category.status) === 'PENDING' ||
      (typeof category.newData === 'string' && category.newData.trim().length > 0)
    );
  }

  private refreshGridActions(): void {
    this.gridApi?.refreshCells({ columns: ['actions'], force: true });
  }

  private syncBatchSelection(): void {
    this.selectedBatchCategories =
      this.gridApi?.getSelectedRows().map((row) => row.category).filter(this.isCategory) || [];
    this.selectedBatchCount = this.selectedBatchCategories.length;

    if (!this.selectedBatchCount) {
      this.batchRejectMode = false;
      this.batchRejectReason = '';
      this.batchErrorMessage = '';
    }
  }

  private updateGridOverlay(): void {
    if (!this.gridApi) {
      return;
    }

    if (this.loading) {
      this.gridApi.showLoadingOverlay();
      return;
    }

    if (!this.gridRows.length) {
      this.gridApi.showNoRowsOverlay();
      return;
    }

    this.gridApi.hideOverlay();
  }

  private updateGridSortState(): void {
    const sortedColumns = this.gridApi?.getColumnState().filter((column) => column.sort) || [];

    this.gridSortBlocksReorder =
      sortedColumns.length > 0 &&
      !(
        sortedColumns.length === 1 &&
        sortedColumns[0].colId === 'order' &&
        sortedColumns[0].sort === 'asc'
      );
  }

  private getCreatedDateValue(category: AdminCategory): string | undefined {
    return category.createdAt || category.createdDate || category.createdOn;
  }

  private getUpdatedDateValue(category: AdminCategory): string | undefined {
    return (
      category.updatedAt ||
      category.updatedDate ||
      category.updatedOn ||
      category.modifiedAt ||
      category.lastModifiedAt
    );
  }

  private parseDate(value?: string): Date | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private shouldShowUpdatedDate(createdDate: Date | null, updatedDate: Date | null): boolean {
    if (!updatedDate) {
      return false;
    }

    return !createdDate || createdDate.getTime() !== updatedDate.getTime();
  }

  private formatDateTime(date: Date | null): string {
    if (!date) {
      return '-';
    }

    const part = (value: number) => `${value}`.padStart(2, '0');

    return `${part(date.getDate())}/${part(date.getMonth() + 1)}/${date.getFullYear()} ${part(date.getHours())}:${part(date.getMinutes())}`;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private uploadImageFile(file: File, input: HTMLInputElement): void {
    this.uploadingImage = true;
    this.imageErrorMessage = '';

    this.adminMediaApiService
      .uploadMedia(file, 'categories')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const uploadedItem = this.extractUploadItem(response);
          const uploadedUrl = uploadedItem ? this.extractMediaUrl(uploadedItem) : '';

          this.uploadingImage = false;
          input.value = '';

          if (uploadedItem) {
            const card = this.normalizeMediaCard(uploadedItem);

            if (card) {
              this.mediaCards = [
                card,
                ...this.mediaCards.filter((item) => item.item.id !== card.item.id),
              ];
            }
          }

          if (!uploadedUrl) {
            this.imageErrorMessage = 'Upload thành công nhưng backend chưa trả URL ảnh.';
            this.feedback.warning(this.imageErrorMessage);
            return;
          }

          this.setImageUrl(uploadedUrl);
          this.feedback.success('Tải ảnh thành công và đã chọn làm ảnh danh mục.');
        },
        error: (error) => {
          this.imageErrorMessage = this.mediaErrorText(
            error,
            'Không thể upload ảnh danh mục. Vui lòng thử lại.',
          );
          this.feedback.error(this.imageErrorMessage);
          this.uploadingImage = false;
          input.value = '';
        },
      });
  }

  private setImageUrl(url: string): void {
    const normalizedUrl = url.trim();
    this.selectedImageUrl = normalizedUrl;
    this.form.controls.imageUrl.setValue(normalizedUrl);
    this.form.controls.imageUrl.markAsDirty();
    this.form.controls.imageUrl.markAsTouched();
  }

  private resetImageState(): void {
    this.selectedImageUrl = '';
    this.selectedUploadFileName = '';
    this.uploadingImage = false;
    this.imageErrorMessage = '';
    this.closeMediaPicker();

    if (this.categoryUploadInput) {
      this.categoryUploadInput.nativeElement.value = '';
    }
  }

  private swapCategoryOrder(category: AdminCategory, targetCategory: AdminCategory): void {
    if (!category.id || !targetCategory.id) {
      return;
    }

    const categoryOrder = this.getCategoryOrder(category);
    const targetOrder = this.getCategoryOrder(targetCategory);
    const firstPayload = this.buildCategoryUpdatePayload(category, targetOrder);
    const secondPayload = this.buildCategoryUpdatePayload(targetCategory, categoryOrder);

    this.reorderingCategoryIds = new Set([category.id, targetCategory.id]);
    this.errorMessage = '';
    this.successMessage = '';

    this.adminCategoryApiService
      .swapCategoryOrder(
        { id: category.id, payload: firstPayload },
        { id: targetCategory.id, payload: secondPayload },
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (responses) => {
          const firstUpdated = {
            ...(this.extractItem(responses[0]) || category),
            displayOrder: targetOrder,
          };
          const secondUpdated = {
            ...(this.extractItem(responses[1]) || targetCategory),
            displayOrder: categoryOrder,
          };
          const updatedIds = new Set([firstUpdated.id, secondUpdated.id]);

          this.categories = this.normalizeCategoryOrders([
            firstUpdated,
            secondUpdated,
            ...this.categories.filter((item) => !updatedIds.has(item.id)),
          ]);
          this.applyFilters();

          this.successMessage = 'Đã cập nhật thứ tự danh mục.';
          this.feedback.success(this.successMessage);
          this.reorderingCategoryIds = new Set<number>();
        },
        error: (error) => {
          this.errorMessage = this.errorText(
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
      slug: this.generateSlug(slugSource) || slugSource,
      description: category.description?.trim() || undefined,
      imageUrl: category.imageUrl?.trim() || undefined,
      displayOrder: Math.max(1, Math.trunc(displayOrder)),
      status: this.parseStatus(category.status) || 'DRAFT',
    };
  }

  private buildPayload(): AdminCategoryCreateRequest | AdminCategoryUpdateRequest {
    const rawValue = this.form.getRawValue();
    const payload: AdminCategoryCreateRequest | AdminCategoryUpdateRequest = {
      name: rawValue.name.trim(),
      slug: this.generateSlug(rawValue.slug) || rawValue.slug.trim(),
      description: rawValue.description.trim() || undefined,
      imageUrl: rawValue.imageUrl.trim() || undefined,
      displayOrder:
        this.isEditMode && this.selectedCategory
          ? this.getCategoryOrder(this.selectedCategory)
          : this.nextCategoryOrder(),
    };

    return payload;
  }

  private buildSnapshotFromCategory(category: AdminCategory): CategoryEditSnapshot {
    return {
      name: this.normalizeText(category.name),
      slug: this.normalizeSlugValue(category.slug || category.name || ''),
      description: this.normalizeOptionalText(category.description),
      imageUrl: this.normalizeOptionalText(category.imageUrl),
      displayOrder: this.normalizeDisplayOrder(this.getCategoryOrder(category)),
    };
  }

  private buildSnapshotFromPayload(payload: AdminCategoryUpdateRequest): CategoryEditSnapshot {
    return {
      name: this.normalizeText(payload.name),
      slug: this.normalizeSlugValue(payload.slug || payload.name || ''),
      description: this.normalizeOptionalText(payload.description),
      imageUrl: this.normalizeOptionalText(payload.imageUrl),
      displayOrder: this.normalizeDisplayOrder(payload.displayOrder),
    };
  }

  private hasEditChanges(payload: AdminCategoryUpdateRequest): boolean {
    if (!this.originalEditSnapshot) {
      return true;
    }

    const currentSnapshot = this.buildSnapshotFromPayload(payload);

    return JSON.stringify(currentSnapshot) !== JSON.stringify(this.originalEditSnapshot);
  }

  private normalizeText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private normalizeOptionalText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private normalizeSlugValue(value: unknown): string {
    const rawValue = typeof value === 'string' ? value.trim() : '';
    return this.generateSlug(rawValue) || rawValue;
  }

  private normalizeDisplayOrder(value: unknown): number {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? Math.max(1, Math.trunc(numericValue)) : 1;
  }

  private upsertCategory(category: AdminCategory): void {
    this.categories = this.normalizeCategoryOrders([
      category,
      ...this.categories.filter((item) => item.id !== category.id),
    ]);
    this.applyFilters();
  }

  private extractBatchActionResponse(response: unknown): CategoryBatchActionResponse | null {
    const source =
      this.isRecord(response) && this.isRecord(response['data']) ? response['data'] : response;

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

  private fallbackBatchResponse(total: number): CategoryBatchActionResponse {
    return {
      total,
      successCount: total,
      failedCount: 0,
      successItems: [],
      failedItems: [],
    };
  }

  private extractMediaPage(response: unknown): PageResponse<AdminMediaItem> {
    const content = this.extractMediaList(response);
    const source =
      this.isRecord(response) && this.isRecord(response['data']) ? response['data'] : response;
    const record = this.isRecord(source) ? source : {};

    return {
      content,
      page: this.parseNumber(record['page']) ?? 0,
      size: this.parseNumber(record['size']) ?? this.mediaSize,
      totalElements: this.parseNumber(record['totalElements']) ?? content.length,
      totalPages: this.parseNumber(record['totalPages']) ?? (content.length ? 1 : 0),
      first: Boolean(record['first'] ?? true),
      last: Boolean(record['last'] ?? true),
      empty: Boolean(record['empty'] ?? content.length === 0),
      sortBy: typeof record['sortBy'] === 'string' ? record['sortBy'] : undefined,
      sortDir: typeof record['sortDir'] === 'string' ? record['sortDir'] : undefined,
    };
  }

  private extractMediaList(response: unknown): AdminMediaItem[] {
    if (Array.isArray(response)) {
      return response.map((item) => this.normalizeMediaItem(item)).filter(this.isMediaItem);
    }

    if (!this.isRecord(response)) {
      return [];
    }

    const data = response['data'];

    if (Array.isArray(data)) {
      return data.map((item) => this.normalizeMediaItem(item)).filter(this.isMediaItem);
    }

    if (this.isRecord(data) && Array.isArray(data['content'])) {
      return data['content'].map((item) => this.normalizeMediaItem(item)).filter(this.isMediaItem);
    }

    if (Array.isArray(response['content'])) {
      return response['content']
        .map((item) => this.normalizeMediaItem(item))
        .filter(this.isMediaItem);
    }

    return [];
  }

  private extractUploadItem(response: unknown): AdminMediaItem | null {
    if (this.isRecord(response)) {
      const data = response['data'];

      if (this.isRecord(data)) {
        if (this.isRecord(data['media'])) {
          return this.normalizeMediaItem(data['media']);
        }

        return this.normalizeMediaItem(data);
      }

      if (this.isRecord(response['media'])) {
        return this.normalizeMediaItem(response['media']);
      }
    }

    return this.normalizeMediaItem(response);
  }

  private normalizeMediaItem(value: unknown): AdminMediaItem | null {
    if (!this.isRecord(value)) {
      return null;
    }

    const mediaItem = value as AdminMediaItem;
    const url = this.extractMediaUrl(mediaItem);

    return {
      ...mediaItem,
      url: mediaItem.url || url || undefined,
      sizeBytes: mediaItem.sizeBytes ?? mediaItem.bytes,
      type: mediaItem.type || mediaItem.mediaType || mediaItem.resourceType,
      module: mediaItem.module || mediaItem.folder,
    };
  }

  private normalizeMediaCard(item: AdminMediaItem): CategoryMediaCard | null {
    const url = this.extractMediaUrl(item);

    if (!url || !this.isImageMedia(item)) {
      return null;
    }

    return {
      item,
      url,
      title: item.originalFilename || item.publicId || 'Ảnh chưa đặt tên',
      moduleLabel: this.moduleLabel(item.module || item.folder),
      createdAt: this.formatDate(item.createdAt),
    };
  }

  private extractMediaUrl(item: AdminMediaItem): string {
    return (
      item.url ||
      item.secureUrl ||
      item.imageUrl ||
      item.fileUrl ||
      item.mediaUrl ||
      item.data?.url ||
      item.data?.secureUrl ||
      item.data?.imageUrl ||
      item.data?.fileUrl ||
      item.data?.mediaUrl ||
      ''
    );
  }

  private isImageMedia(item: AdminMediaItem): boolean {
    const type =
      `${item.contentType || item.type || item.mediaType || item.resourceType || ''}`.toLowerCase();
    const format = `${item.format || ''}`.toLowerCase();

    return (
      !type ||
      type.includes('image') ||
      ['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif'].includes(format)
    );
  }

  private moduleLabel(module?: string): string {
    if (module === 'categories') {
      return 'Categories';
    }

    if (module === 'general') {
      return 'General';
    }

    if (module === 'tours') {
      return 'Tours';
    }

    if (module === 'destinations') {
      return 'Destinations';
    }

    return module || 'Chưa phân loại';
  }

  private normalizeCategoryOrders(categories: AdminCategory[]): AdminCategory[] {
    return [...categories]
      .sort((a, b) => this.sortCategory(a, b))
      .map((category, index) => ({
        ...category,
        displayOrder: index + 1,
      }));
  }

  private nextCategoryOrder(): number {
    const maxOrder = this.categories.reduce(
      (max, category) => Math.max(max, this.getCategoryOrder(category)),
      0,
    );
    return maxOrder + 1 || 1;
  }

  private extractList(response: unknown): AdminCategory[] {
    if (Array.isArray(response)) {
      return response.map((item) => this.normalizeCategory(item)).filter(this.isCategory);
    }

    if (!this.isRecord(response)) {
      return [];
    }

    const data = response['data'];

    if (Array.isArray(data)) {
      return data.map((item) => this.normalizeCategory(item)).filter(this.isCategory);
    }

    if (this.isRecord(data) && Array.isArray(data['content'])) {
      return data['content'].map((item) => this.normalizeCategory(item)).filter(this.isCategory);
    }

    if (Array.isArray(response['content'])) {
      return response['content']
        .map((item) => this.normalizeCategory(item))
        .filter(this.isCategory);
    }

    return [];
  }

  private extractItem(response: unknown): AdminCategory | null {
    if (this.isRecord(response) && this.isRecord(response['data'])) {
      return this.normalizeCategory(response['data']);
    }

    return this.normalizeCategory(response);
  }

  private normalizeCategory(value: unknown): AdminCategory | null {
    if (!this.isRecord(value)) {
      return null;
    }

    const category = value as AdminCategory;

    return {
      ...category,
      displayOrder: this.getCategoryOrder(category),
    };
  }

  private sortCategory(a: AdminCategory, b: AdminCategory): number {
    const orderA = this.getCategoryOrder(a);
    const orderB = this.getCategoryOrder(b);

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return (a.id ?? 0) - (b.id ?? 0);
  }

  private getCategoryOrder(category: AdminCategory): number {
    const order =
      this.parseNumber(category.displayOrder) ??
      this.parseNumber(category.sortOrder) ??
      this.parseNumber(category.orderIndex) ??
      this.parseNumber(category.order) ??
      this.parseNumber(category.position);

    if (order === undefined || order < 1) {
      return Number.MAX_SAFE_INTEGER;
    }

    return Math.trunc(order);
  }

  private generateSlug(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private parseStatus(status?: string): CategoryStatus | null {
    return status === 'DRAFT' ||
      status === 'PENDING' ||
      status === 'APPROVED' ||
      status === 'REJECTED' ||
      status === 'CANCEL_APPROVE'
      ? status
      : null;
  }

  private errorText(error: unknown, fallback: string): string {
    if (this.isRecord(error)) {
      const status = this.parseNumber(error['status']);

      if (status === 403) {
        return 'Bạn không có quyền thực hiện thao tác này.';
      }

      if (status === 401) {
        return 'Phiên đăng nhập admin không hợp lệ hoặc đã hết hạn.';
      }

      const errorBody = error['error'];

      if (this.isRecord(errorBody) && typeof errorBody['message'] === 'string') {
        return errorBody['message'];
      }
    }

    return fallback;
  }

  private mediaErrorText(error: unknown, fallback: string): string {
    if (this.isRecord(error)) {
      const status = this.parseNumber(error['status']);

      if (status === 403) {
        return 'Bạn không có quyền thao tác với Media này.';
      }
    }

    return this.errorText(error, fallback);
  }

  private parseNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private isCategory(value: AdminCategory | null): value is AdminCategory {
    return !!value;
  }

  private isMediaItem(value: AdminMediaItem | null): value is AdminMediaItem {
    return !!value;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
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
