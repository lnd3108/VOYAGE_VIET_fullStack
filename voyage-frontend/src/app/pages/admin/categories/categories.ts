import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, HostListener, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TuiIcon } from '@taiga-ui/core';
import { take } from 'rxjs';

import { AdminCategoryApiService } from '../../../core/api/admin-category-api.service';
import {
  AdminCategory,
  AdminCategoryCreateRequest,
  AdminCategoryUpdateRequest,
  CategoryStatus,
} from '../../../core/models/category.model';
import { PageResponse } from '../../../core/models/page-response.model';
import { AdminUiFeedbackService } from '../../../core/services/admin-ui-feedback.service';

type CategoryStatusFilter = 'ALL' | CategoryStatus;

interface StatusFilterOption {
  label: string;
  value: CategoryStatusFilter;
}

@Component({
  selector: 'app-admin-categories',
  imports: [NgClass, NgFor, NgIf, ReactiveFormsModule, RouterLink, TuiIcon],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class AdminCategories implements OnInit {
  private readonly adminCategoryApiService = inject(AdminCategoryApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly feedback = inject(AdminUiFeedbackService);

  readonly fallbackImage = '/hero/bg-home.png';
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
  private slugManuallyEdited = false;

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
    slug: ['', [Validators.required]],
    description: [''],
    imageUrl: [''],
    displayOrder: [0],
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
          this.categories = this.extractList(response).sort((a, b) => this.sortCategory(a, b));
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
      displayOrder: 0,
      status: 'ACTIVE',
    });
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
      displayOrder: category.displayOrder ?? 0,
      status: this.parseStatus(category.status) || 'ACTIVE',
    });
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
      displayOrder: 0,
      status: 'ACTIVE',
    });
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

    this.filteredCategories = this.categories.filter((category) => {
      const matchesKeyword = !keyword || [category.name, category.slug]
        .some((value) => (value || '').toLowerCase().includes(keyword));
      const status = this.parseStatus(category.status);
      const matchesStatus = this.statusFilter === 'ALL' || status === this.statusFilter;

      return matchesKeyword && matchesStatus;
    });
  }

  imagePreviewUrl(): string {
    return this.form.controls.imageUrl.value.trim();
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

  private buildPayload(): AdminCategoryCreateRequest | AdminCategoryUpdateRequest {
    const rawValue = this.form.getRawValue();
    const payload: AdminCategoryCreateRequest | AdminCategoryUpdateRequest = {
      name: rawValue.name.trim(),
      slug: this.generateSlug(rawValue.slug) || rawValue.slug.trim(),
      description: rawValue.description.trim() || undefined,
      imageUrl: rawValue.imageUrl.trim() || undefined,
      displayOrder: Number(rawValue.displayOrder) || 0,
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
    this.categories = [
      category,
      ...this.categories.filter((item) => item.id !== category.id),
    ].sort((a, b) => this.sortCategory(a, b));
    this.applyFilters();
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

    return value as AdminCategory;
  }

  private sortCategory(a: AdminCategory, b: AdminCategory): number {
    const orderA = a.displayOrder ?? 0;
    const orderB = b.displayOrder ?? 0;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return (a.id ?? 0) - (b.id ?? 0);
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

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
