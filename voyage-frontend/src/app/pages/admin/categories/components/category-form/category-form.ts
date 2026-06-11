import { NgFor, NgIf } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiIcon } from '@taiga-ui/core';
import { Observable, switchMap } from 'rxjs';

import {
  AdminCategoryApiService,
  AdminCategoryPatchRequest,
} from '../../../../../core/api/admin-category-api.service';
import { AdminMediaApiService } from '../../../../../core/api/admin-media-api.service';
import { AuthService } from '../../../../../core/auth/auth.service';
import {
  AdminCategory,
  AdminCategoryCreateRequest,
  AdminCategoryUpdateRequest,
} from '../../../../../core/models/category.model';
import { AdminMediaItem } from '../../../../../core/models/media.model';
import { PageResponse } from '../../../../../core/models/page-response.model';
import { AdminUiFeedbackService } from '../../../../../core/services/admin-ui-feedback.service';
import {
  errorText,
  extractCategoryItem,
  formatDate,
  generateCategorySlug,
  getCategoryOrder,
  handleCategoryImageError,
  canEditCategory,
  isCategoryActive,
  isRecord,
  mediaErrorText,
  normalizeDisplayOrder,
  normalizeSlugValue,
  normalizeText,
  parseNumber,
  parseCategoryStatus,
} from '../../category-utils';

export type AdminCategoryFormMode = 'create' | 'edit' | 'copy';

export interface AdminCategoryFormMediaModuleOption {
  label: string;
  value: string;
}

export interface AdminCategoryFormMediaCard {
  item: AdminMediaItem;
  url: string;
  title: string;
  moduleLabel: string;
  createdAt: string;
}

interface CategoryEditSnapshot {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
  isActive?: boolean;
}

@Component({
  selector: 'app-admin-category-form',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, TuiIcon],
  templateUrl: './category-form.html',
  styleUrl: './category-form.scss',
})
export class AdminCategoryFormComponent implements OnChanges {
  @ViewChild('categoryUploadInput') private categoryUploadInput?: ElementRef<HTMLInputElement>;

  private readonly categoryApi = inject(AdminCategoryApiService);
  private readonly mediaApi = inject(AdminMediaApiService);
  private readonly auth = inject(AuthService);
  private readonly feedback = inject(AdminUiFeedbackService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);

  @Input() selectedCategory: AdminCategory | null = null;
  @Input() nextDisplayOrder = 1;
  @Input() mode: AdminCategoryFormMode = 'create';

  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  readonly maxUploadSize = 5 * 1024 * 1024;
  readonly allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  readonly mediaModuleOptions: AdminCategoryFormMediaModuleOption[] = [
    { label: 'Categories', value: 'categories' },
    { label: 'General', value: 'general' },
    { label: 'Tất cả', value: 'all' },
  ];
  readonly categoryOnlyMediaModuleOptions: AdminCategoryFormMediaModuleOption[] = [
    { label: 'Categories', value: 'categories' },
  ];
  readonly mediaSkeletonCards = Array.from({ length: 6 });

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
    slug: ['', [Validators.required]],
    description: [''],
    imageUrl: [''],
    isActive: [1],
  });

  selectedImageUrl = '';
  selectedUploadFileName = '';
  uploadingImage = false;
  saving = false;
  updatingImage = false;
  imageErrorMessage = '';

  isMediaPickerOpen = false;
  mediaLoading = false;
  mediaErrorMessage = '';
  mediaCards: AdminCategoryFormMediaCard[] = [];
  visibleMediaModuleOptions: AdminCategoryFormMediaModuleOption[] = this.categoryOnlyMediaModuleOptions;
  selectedMediaModule = 'categories';
  mediaPage = 0;
  mediaSize = 18;
  mediaTotalPages = 0;

  private slugManuallyEdited = false;
  private originalEditSnapshot: CategoryEditSnapshot | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedCategory']) {
      this.resetForCategory();
    }

    if (changes['mode'] && !changes['selectedCategory']) {
      this.resetForCategory();
    }
  }

  get isEditMode(): boolean {
    return this.mode === 'edit';
  }

  get isCopyMode(): boolean {
    return this.mode === 'copy';
  }

  get isReadonly(): boolean {
    return this.isEditMode && !!this.selectedCategory && !canEditCategory(this.selectedCategory, this.auth.currentRole());
  }

  get showActiveField(): boolean {
    return this.isEditMode && parseCategoryStatus(this.selectedCategory?.status) === 'APPROVED';
  }

  get canUpdateImage(): boolean {
    return this.auth.hasRole('STAFF', 'ADMIN', 'SUPER_ADMIN');
  }

  get canPickMedia(): boolean {
    return this.auth.hasRole('STAFF', 'ADMIN', 'SUPER_ADMIN');
  }

  get isMediaLimited(): boolean {
    return this.auth.hasRole('STAFF') && !this.auth.hasRole('ADMIN', 'SUPER_ADMIN');
  }

  get headerEyebrow(): string {
    if (this.isCopyMode) {
      return 'Sao chép danh mục';
    }

    return this.isEditMode ? 'Cập nhật danh mục' : 'Tạo danh mục mới';
  }

  get headerTitle(): string {
    if (this.isCopyMode) {
      return 'Nhập tên và slug cho bản sao';
    }

    return this.isEditMode ? this.selectedCategory?.name || 'Danh mục' : 'Thông tin danh mục';
  }

  get submitText(): string {
    if (this.saving) {
      return 'Đang lưu...';
    }

    if (this.isReadonly) {
      return 'Chỉ xem';
    }

    return 'Lưu';
  }

  get imageStatusText(): string {
    return this.selectedImageUrl
      ? this.selectedUploadFileName || 'Đã chọn ảnh'
      : 'Chưa có ảnh danh mục';
  }

  close(): void {
    if (this.saving || this.updatingImage || this.uploadingImage) {
      return;
    }

    this.closed.emit();
  }

  submitForm(saveAndSubmit = false): void {
    if (!this.canUpdateImage) {
      this.denyCategoryAction();
      return;
    }

    if (this.isReadonly) {
      this.feedback.warning('Danh mục ở trạng thái này không thể chỉnh sửa.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.isEditMode && !this.selectedCategory?.id) {
      this.feedback.error('Không xác định được danh mục cần cập nhật.');
      return;
    }

    const payload = this.buildPayload();

    if (this.isEditMode && !saveAndSubmit && !this.hasEditChanges(payload as AdminCategoryUpdateRequest)) {
      this.feedback.info('Chưa có dữ liệu thay đổi.');
      return;
    }

    this.saving = true;

    const request$ = this.buildSaveRequest(payload, saveAndSubmit);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving = false;
        this.feedback.success(saveAndSubmit ? 'Đã lưu và gửi duyệt danh mục.' : this.isEditMode ? 'Đã lưu dữ liệu thay đổi chờ duyệt.' : 'Đã tạo danh mục mới.');
        this.saved.emit();
        this.closed.emit();
      },
      error: (error) => {
        this.saving = false;
        this.feedback.error(errorText(error, 'Không thể lưu danh mục. Vui lòng thử lại sau.'));
      },
    });
  }

  handleNameInput(): void {
    if (this.isEditMode || this.slugManuallyEdited) {
      return;
    }

    this.form.controls.slug.setValue(generateCategorySlug(this.form.controls.name.value));
  }

  markSlugEdited(): void {
    this.slugManuallyEdited = true;
  }

  shortImageUrl(): string {
    if (!this.selectedImageUrl) {
      return '';
    }

    return this.selectedImageUrl.length <= 56
      ? this.selectedImageUrl
      : `${this.selectedImageUrl.slice(0, 28)}...${this.selectedImageUrl.slice(-20)}`;
  }

  openUploadPicker(): void {
    if (!this.uploadingImage && !this.saving) {
      this.categoryUploadInput?.nativeElement.click();
    }
  }

  handleUploadSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!this.canUpdateImage) {
      this.denyCategoryAction();
      input.value = '';
      return;
    }

    this.selectedUploadFileName = file.name;

    if (!this.allowedImageTypes.includes(file.type)) {
      this.imageErrorMessage = 'Chỉ hỗ trợ ảnh PNG, JPG, JPEG hoặc WEBP.';
      this.feedback.warning(this.imageErrorMessage);
      input.value = '';
      return;
    }

    if (file.size > this.maxUploadSize) {
      this.imageErrorMessage = 'Ảnh danh mục không được vượt quá 5MB.';
      this.feedback.warning(this.imageErrorMessage);
      input.value = '';
      return;
    }

    this.uploadImageFile(file, input);
  }

  clearImage(): void {
    if (this.categoryUploadInput) {
      this.categoryUploadInput.nativeElement.value = '';
    }

    this.setImageUrl('');
    this.selectedUploadFileName = '';
    this.imageErrorMessage = '';
  }

  updateImageOnly(): void {
    const categoryId = this.selectedCategory?.id;

    if (!this.isEditMode || !categoryId || this.updatingImage || this.isReadonly) {
      return;
    }

    if (!this.canUpdateImage) {
      this.denyCategoryAction();
      return;
    }

    const imageUrl = this.form.controls.imageUrl.value.trim();

    if (!imageUrl) {
      this.feedback.warning('Vui lòng nhập URL ảnh Cloudinary trước khi cập nhật ảnh.');
      return;
    }

    this.updatingImage = true;

    this.categoryApi
      .updateCategoryImage(categoryId, imageUrl)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const updatedCategory = extractCategoryItem(response) || { ...this.selectedCategory, imageUrl };
          this.selectedCategory = updatedCategory;
          this.originalEditSnapshot = this.buildSnapshotFromCategory(updatedCategory);
          this.updatingImage = false;
          this.feedback.success('Đã cập nhật ảnh danh mục.');
          this.saved.emit();
        },
        error: (error) => {
          this.updatingImage = false;
          this.feedback.error(errorText(error, 'Không thể cập nhật ảnh danh mục. Vui lòng thử lại sau.'));
        },
      });
  }

  openMediaPicker(): void {
    if (!this.canPickMedia) {
      this.denyCategoryAction();
      return;
    }

    this.configureMediaAccess();
    this.isMediaPickerOpen = true;

    if (!this.mediaCards.length) {
      this.loadMedia(0);
    }
  }

  closeMediaPicker(): void {
    this.isMediaPickerOpen = false;
  }

  selectMediaModule(module: string): void {
    if (this.isMediaLimited && module !== 'categories') {
      this.feedback.warning('Tài khoản STAFF chỉ được chọn ảnh module Categories.');
      return;
    }

    if (this.selectedMediaModule === module && this.mediaCards.length) {
      return;
    }

    this.selectedMediaModule = module;
    this.loadMedia(0);
  }

  loadMedia(page: number = 0): void {
    if (!this.canPickMedia) {
      this.denyCategoryAction();
      return;
    }

    this.mediaLoading = true;
    this.mediaErrorMessage = '';
    this.mediaPage = page;

    this.mediaApi
      .getMedia({ page, size: this.mediaSize, module: this.resolveMediaListModule() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const mediaPage = this.extractMediaPage(response);
          this.mediaCards = mediaPage.content
            .map((item) => this.normalizeMediaCard(item))
            .filter((item): item is AdminCategoryFormMediaCard => !!item);
          this.mediaTotalPages = mediaPage.totalPages;
          this.mediaLoading = false;
        },
        error: (error) => {
          this.mediaErrorMessage = mediaErrorText(error, 'Không thể tải danh sách ảnh Media.');
          this.feedback.error(this.mediaErrorMessage);
          this.mediaCards = [];
          this.mediaLoading = false;
        },
      });
  }

  selectMediaImage(card: AdminCategoryFormMediaCard): void {
    if (!this.canPickMedia) {
      this.denyCategoryAction();
      return;
    }

    this.setImageUrl(card.url);
    this.selectedUploadFileName = card.title;
    this.imageErrorMessage = '';
    this.closeMediaPicker();
    this.feedback.success('Đã chọn ảnh từ Media cho danh mục.');
  }

  isSelectedMedia(card: AdminCategoryFormMediaCard): boolean {
    return !!card.url && card.url === this.selectedImageUrl;
  }

  handleImageError(event: Event): void {
    handleCategoryImageError(event);
  }

  private resetForCategory(): void {
    const category = this.selectedCategory;
    this.slugManuallyEdited = this.isEditMode && !!category;
    this.originalEditSnapshot = this.isEditMode && category ? this.buildSnapshotFromCategory(category) : null;
    this.form.reset({
      name: this.isCopyMode ? '' : category?.name || '',
      slug: this.isCopyMode ? '' : category?.slug || '',
      description: category?.description || '',
      imageUrl: category?.imageUrl || '',
      isActive: category && this.showActiveField && isCategoryActive(category.isActive) ? 1 : 0,
    });
    this.selectedImageUrl = category?.imageUrl || '';
    this.selectedUploadFileName = '';
    this.uploadingImage = false;
    this.saving = false;
    this.updatingImage = false;
    this.imageErrorMessage = '';
    this.configureMediaAccess();
    this.closeMediaPicker();

    if (this.isReadonly) {
      this.form.disable({ emitEvent: false });
    } else {
      this.form.enable({ emitEvent: false });
    }
  }

  private buildPayload(): AdminCategoryCreateRequest | AdminCategoryUpdateRequest {
    const rawValue = this.form.getRawValue();

    const payload: AdminCategoryCreateRequest | AdminCategoryUpdateRequest = {
      name: rawValue.name.trim(),
      slug: generateCategorySlug(rawValue.slug) || rawValue.slug.trim(),
      description: rawValue.description.trim() || undefined,
      imageUrl: rawValue.imageUrl.trim() || undefined,
      displayOrder: this.isEditMode && this.selectedCategory
        ? getCategoryOrder(this.selectedCategory)
        : this.nextDisplayOrder,
    };

    if (this.showActiveField) {
      payload.isActive = isCategoryActive(rawValue.isActive) ? 1 : 0;
    }

    return payload;
  }

  private buildSaveRequest(
    payload: AdminCategoryCreateRequest | AdminCategoryUpdateRequest,
    saveAndSubmit: boolean,
  ): Observable<unknown> {
    if (!this.isEditMode) {
      return saveAndSubmit
        ? this.categoryApi.createAndSubmitCategory(payload as AdminCategoryCreateRequest)
        : this.categoryApi.createCategory(payload as AdminCategoryCreateRequest);
    }

    const categoryId = this.selectedCategory?.id;

    if (!categoryId) {
      throw new Error('Missing category id');
    }

    const hasChanges = this.hasEditChanges(payload as AdminCategoryUpdateRequest);

    if (!hasChanges && saveAndSubmit) {
      return this.categoryApi.submitCategory(categoryId);
    }

    const update$ = this.categoryApi.patchCategory(categoryId, payload as AdminCategoryPatchRequest);

    return saveAndSubmit ? update$.pipe(switchMap(() => this.categoryApi.submitCategory(categoryId))) : update$;
  }

  private buildSnapshotFromCategory(category: AdminCategory): CategoryEditSnapshot {
    const snapshot: CategoryEditSnapshot = {
      name: normalizeText(category.name),
      slug: normalizeSlugValue(category.slug || category.name || ''),
      description: normalizeText(category.description),
      imageUrl: normalizeText(category.imageUrl),
      displayOrder: normalizeDisplayOrder(getCategoryOrder(category)),
    };

    if (parseCategoryStatus(category.status) === 'APPROVED') {
      snapshot.isActive = isCategoryActive(category.isActive);
    }

    return snapshot;
  }

  private buildSnapshotFromPayload(payload: AdminCategoryUpdateRequest): CategoryEditSnapshot {
    const snapshot: CategoryEditSnapshot = {
      name: normalizeText(payload.name),
      slug: normalizeSlugValue(payload.slug || payload.name || ''),
      description: normalizeText(payload.description),
      imageUrl: normalizeText(payload.imageUrl),
      displayOrder: normalizeDisplayOrder(payload.displayOrder),
    };

    if (this.showActiveField) {
      snapshot.isActive = isCategoryActive(payload.isActive);
    }

    return snapshot;
  }

  private hasEditChanges(payload: AdminCategoryUpdateRequest): boolean {
    if (!this.originalEditSnapshot) {
      return true;
    }

    return JSON.stringify(this.buildSnapshotFromPayload(payload)) !== JSON.stringify(this.originalEditSnapshot);
  }

  private uploadImageFile(file: File, input: HTMLInputElement): void {
    this.uploadingImage = true;
    this.imageErrorMessage = '';

    this.mediaApi
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
          this.imageErrorMessage = mediaErrorText(error, 'Không thể upload ảnh danh mục. Vui lòng thử lại.');
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

  private configureMediaAccess(): void {
    if (this.isMediaLimited) {
      this.visibleMediaModuleOptions = this.categoryOnlyMediaModuleOptions;
      this.selectedMediaModule = 'categories';
      return;
    }

    this.visibleMediaModuleOptions = this.mediaModuleOptions;
  }

  private resolveMediaListModule(): string | undefined {
    if (this.isMediaLimited) {
      return 'categories';
    }

    return this.selectedMediaModule === 'all' ? undefined : this.selectedMediaModule;
  }

  private extractMediaPage(response: unknown): PageResponse<AdminMediaItem> {
    const content = this.extractMediaList(response);
    const source = isRecord(response) && isRecord(response['data']) ? response['data'] : response;
    const record = isRecord(source) ? source : {};

    return {
      content,
      page: parseNumber(record['page']) ?? 0,
      size: parseNumber(record['size']) ?? this.mediaSize,
      totalElements: parseNumber(record['totalElements']) ?? content.length,
      totalPages: parseNumber(record['totalPages']) ?? (content.length ? 1 : 0),
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

    if (!isRecord(response)) {
      return [];
    }

    const data = response['data'];

    if (Array.isArray(data)) {
      return data.map((item) => this.normalizeMediaItem(item)).filter(this.isMediaItem);
    }

    if (isRecord(data) && Array.isArray(data['content'])) {
      return data['content'].map((item) => this.normalizeMediaItem(item)).filter(this.isMediaItem);
    }

    if (Array.isArray(response['content'])) {
      return response['content'].map((item) => this.normalizeMediaItem(item)).filter(this.isMediaItem);
    }

    return [];
  }

  private extractUploadItem(response: unknown): AdminMediaItem | null {
    if (isRecord(response)) {
      const data = response['data'];

      if (isRecord(data)) {
        if (isRecord(data['media'])) {
          return this.normalizeMediaItem(data['media']);
        }

        return this.normalizeMediaItem(data);
      }

      if (isRecord(response['media'])) {
        return this.normalizeMediaItem(response['media']);
      }
    }

    return this.normalizeMediaItem(response);
  }

  private normalizeMediaItem(value: unknown): AdminMediaItem | null {
    if (!isRecord(value)) {
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

  private normalizeMediaCard(item: AdminMediaItem): AdminCategoryFormMediaCard | null {
    const url = this.extractMediaUrl(item);

    if (!url || !this.isImageMedia(item)) {
      return null;
    }

    return {
      item,
      url,
      title: item.originalFilename || item.publicId || 'Ảnh chưa đặt tên',
      moduleLabel: this.moduleLabel(item.module || item.folder),
      createdAt: formatDate(item.createdAt),
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

  private isMediaItem(value: AdminMediaItem | null): value is AdminMediaItem {
    return !!value;
  }

  private denyCategoryAction(): void {
    this.feedback.warning('Bạn không có quyền thực hiện thao tác này.');
  }
}
