import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, ElementRef, HostListener, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TuiIcon } from '@taiga-ui/core';
import { take } from 'rxjs';

import { AdminCategoryApiService } from '../../../core/api/admin-category-api.service';
import { AdminMediaApiService } from '../../../core/api/admin-media-api.service';
import {
  AdminCategory,
  AdminCategoryCreateRequest,
  AdminCategoryUpdateRequest,
  CategoryStatus,
} from '../../../core/models/category.model';
import { AdminMediaItem } from '../../../core/models/media.model';
import { PageResponse } from '../../../core/models/page-response.model';
import { AdminUiFeedbackService } from '../../../core/services/admin-ui-feedback.service';

type CategoryStatusFilter = 'ALL' | CategoryStatus;

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

@Component({
  selector: 'app-admin-categories',
  imports: [NgClass, NgFor, NgIf, ReactiveFormsModule, RouterLink, TuiIcon],
  templateUrl: './categories.html',
  styleUrls: ['./categories.scss', './categories-media.scss'],
})
export class AdminCategories implements OnInit {
  @ViewChild('categoryUploadInput') private categoryUploadInput?: ElementRef<HTMLInputElement>;

  private readonly adminCategoryApiService = inject(AdminCategoryApiService);
  private readonly adminMediaApiService = inject(AdminMediaApiService);
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
  readonly mediaSkeletonCards = Array.from({ length: 6 });
  readonly statusFilters: StatusFilterOption[] = [
    { label: 'Tất cả', value: 'ALL' },
    { label: 'Đang hiển thị', value: 'ACTIVE' },
    { label: 'Tạm ẩn', value: 'INACTIVE' },
  ];

  loading = false;
  saving = false;
  deletingId: number | null = null;
  updatingStatusId: number | null = null;
  updatingImage = false;
  errorMessage = '';
  successMessage = '';
  categories: AdminCategory[] = [];
  filteredCategories: AdminCategory[] = [];
  keyword = '';
  statusFilter: CategoryStatusFilter = 'ALL';
  selectedCategory: AdminCategory | null = null;
  isFormOpen = false;
  isEditMode = false;
  focusedSelect: 'status' | 'statusFilter' | null = null;
  selectedImageUrl = '';
  selectedUploadFileName = '';
  uploadingImage = false;
  imageErrorMessage = '';
  isMediaPickerOpen = false;
  mediaLoading = false;
  mediaErrorMessage = '';
  mediaCards: CategoryMediaCard[] = [];
  selectedMediaModule = 'categories';
  mediaPage = 0;
  mediaSize = 18;
  mediaTotalPages = 0;
  reorderingCategoryIds = new Set<number>();
  reorderBlockedByFilter = false;
  private slugManuallyEdited = false;

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
    slug: ['', [Validators.required]],
    description: [''],
    imageUrl: [''],
    status: ['ACTIVE' as CategoryStatus],
  });

  ngOnInit(): void {
    this.loadCategories();
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
        },
        error: (error) => {
          this.errorMessage = this.errorText(error, 'Không thể tải danh sách danh mục. Vui lòng thử lại sau.');
          this.loading = false;
        },
      });
  }

  openCreateForm(): void {
    this.isFormOpen = true;
    this.isEditMode = false;
    this.selectedCategory = null;
    this.slugManuallyEdited = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.form.reset({
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
      status: 'ACTIVE',
    });
    this.resetImageState();
  }

  openEditForm(category: AdminCategory): void {
    this.isFormOpen = true;
    this.isEditMode = true;
    this.selectedCategory = category;
    this.slugManuallyEdited = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.form.reset({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      imageUrl: category.imageUrl || '',
      status: this.parseStatus(category.status) || 'ACTIVE',
    });
    this.selectedImageUrl = category.imageUrl || '';
    this.selectedUploadFileName = '';
    this.imageErrorMessage = '';
    this.closeMediaPicker();
  }

  closeForm(): void {
    this.isFormOpen = false;
    this.isEditMode = false;
    this.selectedCategory = null;
    this.slugManuallyEdited = false;
    this.saving = false;
    this.updatingImage = false;
    this.form.reset({
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
      status: 'ACTIVE',
    });
    this.resetImageState();
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

  updateStatusFilter(event: Event): void {
    this.statusFilter = (event.target as HTMLSelectElement).value as CategoryStatusFilter;
    this.closeFocusedSelect(event);
    this.applyFilters();
  }

  toggleSelect(selectName: 'status' | 'statusFilter'): void {
    this.focusedSelect = this.focusedSelect === selectName ? null : selectName;
  }

  selectFormStatus(status: CategoryStatus): void {
    this.form.controls.status.setValue(status);
    this.focusedSelect = null;
  }

  selectStatusFilter(status: CategoryStatusFilter): void {
    this.statusFilter = status;
    this.focusedSelect = null;
    this.applyFilters();
  }

  closeFocusedSelect(event?: Event): void {
    this.focusedSelect = null;
    (event?.target as HTMLSelectElement | null)?.blur();
  }

  statusFilterLabel(status: CategoryStatusFilter): string {
    return this.statusFilters.find((option) => option.value === status)?.label || 'Tất cả';
  }

  @HostListener('document:mousedown', ['$event'])
  closeSelectOnOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;

    if (!target?.closest('.admin-categories__control-wrap--select')) {
      this.focusedSelect = null;
    }
  }

  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.isEditMode && !this.selectedCategory?.id) {
      this.errorMessage = 'Không xác định được danh mục cần cập nhật.';
      return;
    }

    const payload = this.buildPayload();
    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request$ = this.isEditMode && this.selectedCategory?.id
      ? this.adminCategoryApiService.updateCategory(this.selectedCategory.id, payload as AdminCategoryUpdateRequest)
      : this.adminCategoryApiService.createCategory(payload);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const savedCategory = this.extractItem(response);
          this.successMessage = this.isEditMode ? 'Đã cập nhật danh mục.' : 'Đã tạo danh mục mới.';
          this.saving = false;

          if (savedCategory?.id) {
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
          const updatedCategory = this.extractItem(response) || { ...this.selectedCategory, imageUrl };
          this.upsertCategory(updatedCategory);
          this.selectedCategory = updatedCategory;
          this.successMessage = 'Đã cập nhật ảnh danh mục.';
          this.updatingImage = false;
        },
        error: (error) => {
          this.errorMessage = this.errorText(error, 'Không thể cập nhật ảnh danh mục. Vui lòng thử lại sau.');
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

    this.adminMediaApiService
      .getMedia({
        module: this.selectedMediaModule === 'all' ? undefined : this.selectedMediaModule,
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
          this.mediaErrorMessage = this.errorText(error, 'Không thể tải danh sách ảnh Media.');
          this.mediaLoading = false;
        },
      });
  }

  selectMediaModule(module: string): void {
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
    return this.selectedImageUrl ? this.selectedUploadFileName || 'Đã chọn ảnh' : 'Chưa có ảnh danh mục';
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

  toggleStatus(category: AdminCategory): void {
    if (!category.id || this.updatingStatusId) {
      return;
    }

    const currentStatus = this.parseStatus(category.status) || 'ACTIVE';
    const nextStatus: CategoryStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    if (nextStatus === 'INACTIVE') {
      this.feedback
        .confirmWarning(
          'Bạn có chắc muốn tạm ẩn danh mục này? Danh mục inactive sẽ không hiển thị ở public.',
          'Xác nhận thao tác',
          'Tạm ẩn',
        )
        .pipe(take(1))
        .subscribe((confirmed) => {
          if (confirmed) {
            this.updateCategoryStatus(category, nextStatus);
          }
        });
      return;
    }

    this.updateCategoryStatus(category, nextStatus);
  }

  private updateCategoryStatus(category: AdminCategory, nextStatus: CategoryStatus): void {
    if (!category.id || this.updatingStatusId) {
      return;
    }

    this.updatingStatusId = category.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminCategoryApiService
      .updateCategoryStatus(category.id, nextStatus)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const updatedCategory = this.extractItem(response) || { ...category, status: nextStatus };
          this.upsertCategory(updatedCategory);
          this.successMessage = nextStatus === 'ACTIVE' ? 'Đã bật hiển thị danh mục.' : 'Đã tạm ẩn danh mục.';
          this.feedback.success(this.successMessage);
          this.updatingStatusId = null;
        },
        error: (error) => {
          this.errorMessage = this.errorText(error, 'Không thể cập nhật trạng thái danh mục. Vui lòng thử lại sau.');
          this.feedback.error(this.errorMessage);
          this.updatingStatusId = null;
        },
      });
  }

  deleteCategory(category: AdminCategory): void {
    if (!category.id || this.deletingId) {
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

        this.adminCategoryApiService.deleteCategory(category.id).subscribe({
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
            this.errorMessage = this.errorText(error, 'Không thể xóa danh mục. Vui lòng thử lại sau.');
            this.feedback.error(this.errorMessage);
            this.deletingId = null;
          },
        });
      });
  }

  applyFilters(): void {
    const keyword = this.keyword.trim().toLowerCase();
    this.reorderBlockedByFilter = !!keyword || this.statusFilter !== 'ALL';

    this.filteredCategories = this.categories.filter((category) => {
      const matchesKeyword = !keyword || [category.name, category.slug]
        .some((value) => (value || '').toLowerCase().includes(keyword));
      const status = this.parseStatus(category.status);
      const matchesStatus = this.statusFilter === 'ALL' || status === this.statusFilter;

      return matchesKeyword && matchesStatus;
    }).sort((a, b) => this.sortCategory(a, b));
  }

  moveCategory(category: AdminCategory, currentIndex: number, direction: 'up' | 'down'): void {
    if (this.reorderBlockedByFilter || this.reorderingCategoryIds.size > 0 || this.isCategoryReordering(category)) {
      return;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetCategory = this.filteredCategories[targetIndex];

    if (!category.id || !targetCategory?.id || targetIndex < 0 || targetIndex >= this.filteredCategories.length) {
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
    return !this.reorderBlockedByFilter && this.filteredCategories.length > 1 && index > 0;
  }

  canMoveCategoryDown(index: number): boolean {
    return !this.reorderBlockedByFilter && this.filteredCategories.length > 1 && index < this.filteredCategories.length - 1;
  }

  isCategoryReordering(category: AdminCategory): boolean {
    return !!category.id && this.reorderingCategoryIds.has(category.id);
  }

  categoryOrder(category: AdminCategory): number {
    return this.getCategoryOrder(category);
  }

  imagePreviewUrl(): string {
    return this.selectedImageUrl;
  }

  getCategoryImage(category: AdminCategory): string {
    return category.imageUrl || this.fallbackImage;
  }

  statusLabel(status?: string): string {
    return this.parseStatus(status) === 'INACTIVE' ? 'Tạm ẩn' : 'Đang hiển thị';
  }

  statusClass(status?: string): string {
    return `admin-categories__status--${(this.parseStatus(status) || 'active').toLowerCase()}`;
  }

  nextStatusLabel(category: AdminCategory): string {
    return this.parseStatus(category.status) === 'ACTIVE' ? 'Tạm ẩn' : 'Bật';
  }

  formatDate(value?: string): string {
    if (!value) {
      return 'Đang cập nhật';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('vi-VN').format(date);
  }

  handleImageError(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (image.src.endsWith(this.fallbackImage)) {
      return;
    }

    image.src = this.fallbackImage;
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
              this.mediaCards = [card, ...this.mediaCards.filter((item) => item.item.id !== card.item.id)];
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
          this.imageErrorMessage = this.errorText(error, 'Không thể upload ảnh danh mục. Vui lòng thử lại.');
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
          this.errorMessage = this.errorText(error, 'Không thể cập nhật thứ tự danh mục. Danh sách sẽ được tải lại.');
          this.feedback.error(this.errorMessage);
          this.reorderingCategoryIds = new Set<number>();
          this.loadCategories();
        },
      });
  }

  private buildCategoryUpdatePayload(category: AdminCategory, displayOrder: number): AdminCategoryUpdateRequest {
    const name = (category.name || '').trim();
    const slugSource = (category.slug || name).trim();

    return {
      name,
      slug: this.generateSlug(slugSource) || slugSource,
      description: category.description?.trim() || undefined,
      imageUrl: category.imageUrl?.trim() || undefined,
      displayOrder: Math.max(1, Math.trunc(displayOrder)),
      status: this.parseStatus(category.status) || 'ACTIVE',
    };
  }

  private buildPayload(): AdminCategoryCreateRequest | AdminCategoryUpdateRequest {
    const rawValue = this.form.getRawValue();
    const payload: AdminCategoryCreateRequest | AdminCategoryUpdateRequest = {
      name: rawValue.name.trim(),
      slug: this.generateSlug(rawValue.slug) || rawValue.slug.trim(),
      description: rawValue.description.trim() || undefined,
      imageUrl: rawValue.imageUrl.trim() || undefined,
      displayOrder: this.isEditMode && this.selectedCategory
        ? this.getCategoryOrder(this.selectedCategory)
        : this.nextCategoryOrder(),
    };

    if (this.isEditMode) {
      return {
        ...payload,
        status: this.parseStatus(rawValue.status) || 'ACTIVE',
      };
    }

    return payload;
  }

  private upsertCategory(category: AdminCategory): void {
    this.categories = this.normalizeCategoryOrders([
      category,
      ...this.categories.filter((item) => item.id !== category.id),
    ]);
    this.applyFilters();
  }

  private extractMediaPage(response: unknown): PageResponse<AdminMediaItem> {
    const content = this.extractMediaList(response);
    const source = this.isRecord(response) && this.isRecord(response['data']) ? response['data'] : response;
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
      return response['content'].map((item) => this.normalizeMediaItem(item)).filter(this.isMediaItem);
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
    return item.url
      || item.secureUrl
      || item.imageUrl
      || item.fileUrl
      || item.mediaUrl
      || item.data?.url
      || item.data?.secureUrl
      || item.data?.imageUrl
      || item.data?.fileUrl
      || item.data?.mediaUrl
      || '';
  }

  private isImageMedia(item: AdminMediaItem): boolean {
    const type = `${item.contentType || item.type || item.mediaType || item.resourceType || ''}`.toLowerCase();
    const format = `${item.format || ''}`.toLowerCase();

    return !type || type.includes('image') || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif'].includes(format);
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
    const maxOrder = this.categories.reduce((max, category) => Math.max(max, this.getCategoryOrder(category)), 0);
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
      return response['content'].map((item) => this.normalizeCategory(item)).filter(this.isCategory);
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
    const order = this.parseNumber(category.displayOrder)
      ?? this.parseNumber(category.sortOrder)
      ?? this.parseNumber(category.orderIndex)
      ?? this.parseNumber(category.order)
      ?? this.parseNumber(category.position);

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
    return status === 'ACTIVE' || status === 'INACTIVE' ? status : null;
  }

  private errorText(error: unknown, fallback: string): string {
    if (this.isRecord(error)) {
      const status = this.parseNumber(error['status']);

      if (status === 401 || status === 403) {
        return 'Phiên đăng nhập admin không hợp lệ hoặc không đủ quyền quản lý danh mục.';
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

  private isCategory(value: AdminCategory | null): value is AdminCategory {
    return !!value;
  }

  private isMediaItem(value: AdminMediaItem | null): value is AdminMediaItem {
    return !!value;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
