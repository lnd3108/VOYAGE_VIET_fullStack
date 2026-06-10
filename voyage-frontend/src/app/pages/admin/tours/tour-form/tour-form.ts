import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, forkJoin } from 'rxjs';

import { AdminCategoryApiService } from '../../../../core/api/admin-category-api.service';
import { AdminDestinationApiService } from '../../../../core/api/admin-destination-api.service';
import { AdminMediaApiService } from '../../../../core/api/admin-media-api.service';
import { AdminTourApiService } from '../../../../core/api/admin-tour-api.service';
import { AdminCategory, isCategorySelectableForTour } from '../../../../core/models/category.model';
import { AdminDestination, isDestinationSelectableForTour } from '../../../../core/models/destination.model';
import { AdminMediaItem } from '../../../../core/models/media.model';
import { PageResponse } from '../../../../core/models/page-response.model';
import { AdminTour, AdminTourCreateRequest, AdminTourUpdateRequest, TourStatus } from '../../../../core/models/admin-tour.model';
import { AdminUiFeedbackService } from '../../../../core/services/admin-ui-feedback.service';
import { TourGallery } from '../tour-gallery/tour-gallery';
import { TourItinerary } from '../tour-itinerary/tour-itinerary';
import { TourSchedules } from '../tour-schedules/tour-schedules';

interface StatusOption {
  label: string;
  value: TourStatus;
}

interface MediaModuleOption {
  label: string;
  value: string;
}

interface DepartureOption {
  label: string;
  value: string;
}

interface DestinationSelectOption {
  label: string;
  displayLabel: string;
  value: string;
  destinationId: number;
}

type MediaTab = 'library' | 'upload' | 'manual';
type TourFormDropdown = 'category' | 'departure' | 'status';

@Component({
  selector: 'app-admin-tour-form',
  imports: [NgClass, NgFor, NgIf, ReactiveFormsModule, RouterLink, TourGallery, TourItinerary, TourSchedules],
  templateUrl: './tour-form.html',
  styleUrls: ['./tour-form.scss', './tour-form-media.scss'],
})
export class TourForm implements OnInit, OnDestroy {
  @ViewChild('tourUploadInput') private tourUploadInput?: ElementRef<HTMLInputElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly adminTourApiService = inject(AdminTourApiService);
  private readonly adminCategoryApiService = inject(AdminCategoryApiService);
  private readonly adminDestinationApiService = inject(AdminDestinationApiService);
  private readonly adminMediaApiService = inject(AdminMediaApiService);
  private readonly feedback = inject(AdminUiFeedbackService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly draftStorageKey = 'vv_admin_tour_create_draft';

  readonly fallbackImage = '/hero/bg-home.png';
  readonly maxUploadSize = 5 * 1024 * 1024;
  readonly allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  readonly allowedImageExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
  readonly mediaTabs: Array<{ label: string; value: MediaTab }> = [
    { label: 'Chọn từ Media', value: 'library' },
    { label: 'Tải ảnh mới', value: 'upload' },
    { label: 'Nhập URL thủ công', value: 'manual' },
  ];
  readonly mediaModuleOptions: MediaModuleOption[] = [
    { label: 'Tour', value: 'tours' },
    { label: 'Banner', value: 'banners' },
    { label: 'Chung', value: 'general' },
    { label: 'Tất cả', value: 'all' },
  ];
  readonly standardDepartureOptions: DepartureOption[] = [
    { label: 'Hà Nội', value: 'Hà Nội' },
    { label: 'Đà Nẵng', value: 'Đà Nẵng' },
    { label: 'TP. Hồ Chí Minh', value: 'TP. Hồ Chí Minh' },
  ];
  readonly mediaSkeletonCards = Array.from({ length: 8 });
  readonly statusOptions: StatusOption[] = [
    { label: 'Nháp', value: 'DRAFT' },
    { label: 'Đã xuất bản', value: 'PUBLISHED' },
    { label: 'Tạm ẩn', value: 'INACTIVE' },
    { label: 'Hết chỗ', value: 'SOLD_OUT' },
  ];

  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';
  isEditMode = false;
  tourId: number | null = null;
  categories: AdminCategory[] = [];
  categoryOptions: AdminCategory[] = [];
  destinations: AdminDestination[] = [];
  destinationSelectOptions: DestinationSelectOption[] = [];
  departureSelectOptions: DepartureOption[] = [];
  selectedDestinationOptions: DestinationSelectOption[] = [];
  selectedDestinationIds: number[] = [];
  selectedDestinationLabel = 'Chọn điểm đến';
  isDestinationDropdownOpen = false;
  openDropdown: TourFormDropdown | null = null;
  selectedThumbnailUrl = '';
  showDraftBanner = false;
  draftRestored = false;

  activeMediaTab: MediaTab = 'library';
  mediaLoading = false;
  mediaLoadingMore = false;
  mediaErrorMessage = '';
  mediaItems: AdminMediaItem[] = [];
  selectedMediaModule = 'tours';
  mediaSearchTerm = '';
  mediaPage = 0;
  mediaSize = 12;
  mediaTotalPages = 0;
  selectedUploadFile: File | null = null;
  uploadPreviewUrl = '';
  uploadErrorMessage = '';
  uploading = false;

  private slugManuallyEdited = false;

  readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    slug: ['', [Validators.required]],
    shortDescription: ['', [Validators.required]],
    description: [''],
    thumbnailUrl: [''],
    originalPrice: [0, [Validators.required, Validators.min(0)]],
    salePrice: [0, [Validators.required, Validators.min(0)]],
    durationDays: [1, [Validators.required, Validators.min(1)]],
    durationNights: [0, [Validators.required, Validators.min(0)]],
    destinationSelectionKey: [''],
    destinationSelectionKeys: [[] as string[]],
    departureLocation: ['', [Validators.required]],
    maxParticipants: [1, [Validators.required, Validators.min(1)]],
    availableSeats: [0, [Validators.required, Validators.min(0)]],
    featured: [false],
    status: ['DRAFT' as TourStatus, [Validators.required]],
    categoryId: [0, [Validators.required, Validators.min(1)]],
    destinationId: [0, [Validators.required, Validators.min(1)]],
  }, { validators: [this.tourRulesValidator()] });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const parsedId = this.parseNumber(idParam);

    this.isEditMode = parsedId !== undefined;
    this.tourId = parsedId ?? null;

    if (idParam && this.tourId === null) {
      this.errorMessage = 'ID tour không hợp lệ.';
      return;
    }

    this.setupCreateDraftAutosave();
    this.setupStableOptionRecalculation();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.revokeUploadPreviewUrl();
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Cập nhật tour' : 'Thêm tour mới';
  }

  get breadcrumbTail(): string {
    return this.isEditMode ? 'Chỉnh sửa' : 'Thêm mới';
  }

  get hasMoreMedia(): boolean {
    return this.mediaPage + 1 < this.mediaTotalPages;
  }

  get filteredMediaItems(): AdminMediaItem[] {
    const keyword = this.mediaSearchTerm.trim().toLowerCase();

    if (!keyword) {
      return this.mediaItems;
    }

    return this.mediaItems.filter((item) => {
      const filename = (item.originalFilename || item.publicId || '').toLowerCase();
      const module = (item.module || item.folder || '').toLowerCase();
      return filename.includes(keyword) || module.includes(keyword);
    });
  }

  loadInitialData(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request = this.isEditMode && this.tourId
      ? forkJoin({
          categories: this.adminCategoryApiService.getCategories(),
          destinations: this.adminDestinationApiService.getDestinations(),
          tour: this.adminTourApiService.getTour(this.tourId),
        })
      : forkJoin({
          categories: this.adminCategoryApiService.getCategories(),
          destinations: this.adminDestinationApiService.getDestinations(),
        });

    request
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.categories = this.normalizeCategories(this.extractList<AdminCategory>(response.categories));
          this.destinations = this.extractList<AdminDestination>(response.destinations).filter((item) => !!item.id);

          if ('tour' in response) {
            const tour = this.extractItem<AdminTour>(response.tour);

            if (!tour) {
              this.errorMessage = 'Không tìm thấy dữ liệu tour cần chỉnh sửa.';
            } else {
              this.patchTour(tour);
            }
          } else {
            this.checkCreateDraft();
          }

          this.rebuildTourSelectOptions();
          this.loading = false;
          this.loadMedia(0, false);
        },
        error: (error) => {
          this.errorMessage = this.errorText(error, 'Không thể tải dữ liệu form tour. Vui lòng thử lại sau.');
          this.feedback.error(this.errorMessage);
          this.loading = false;
        },
      });
  }

  handleTitleInput(): void {
    if (this.isEditMode || this.slugManuallyEdited) {
      return;
    }

    this.form.controls.slug.setValue(this.generateSlug(this.form.controls.title.value));
  }

  markSlugEdited(): void {
    this.slugManuallyEdited = true;
  }

  updateThumbnail(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.setThumbnailUrl(value.trim(), false);
  }

  clearThumbnail(): void {
    this.setThumbnailUrl('', false);
    this.feedback.info('Đã xóa ảnh đại diện khỏi form.');
  }

  setActiveMediaTab(tab: MediaTab): void {
    this.activeMediaTab = tab;

    if (tab === 'library' && !this.mediaItems.length && !this.mediaLoading) {
      this.loadMedia(0, false);
    }
  }

  loadMedia(page: number = 0, append: boolean = false): void {
    this.mediaLoading = !append;
    this.mediaLoadingMore = append;
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
          this.mediaItems = append ? [...this.mediaItems, ...pageResponse.content] : pageResponse.content;
          this.mediaPage = pageResponse.page;
          this.mediaSize = pageResponse.size;
          this.mediaTotalPages = pageResponse.totalPages;
          this.mediaLoading = false;
          this.mediaLoadingMore = false;
        },
        error: (error) => {
          this.mediaErrorMessage = this.errorText(error, 'Không thể tải danh sách Media. Vui lòng thử lại sau.');
          this.mediaLoading = false;
          this.mediaLoadingMore = false;
        },
      });
  }

  loadMoreMedia(): void {
    if (!this.hasMoreMedia || this.mediaLoadingMore) {
      return;
    }

    this.loadMedia(this.mediaPage + 1, true);
  }

  applyMediaModuleFilter(module: string): void {
    if (this.selectedMediaModule === module || this.mediaLoading) {
      return;
    }

    this.selectedMediaModule = module;
    this.mediaSearchTerm = '';
    this.mediaPage = 0;
    this.loadMedia(0, false);
  }

  updateMediaSearch(event: Event): void {
    this.mediaSearchTerm = (event.target as HTMLInputElement).value;
  }

  selectMedia(item: AdminMediaItem): void {
    const url = this.getMediaUrl(item);

    if (!url) {
      return;
    }

    this.setThumbnailUrl(url, true);
    this.feedback.success('Đã chọn ảnh đại diện tour');
  }

  isSelectedMedia(item: AdminMediaItem): boolean {
    const url = this.getMediaUrl(item);
    return !!url && url === this.thumbnailPreviewUrl();
  }

  onUploadFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    this.uploadErrorMessage = '';

    if (!file) {
      this.clearSelectedUploadFile(false);
      return;
    }

    if (!this.isAllowedImage(file)) {
      this.uploadErrorMessage = 'Chỉ hỗ trợ ảnh PNG, JPG, JPEG hoặc WEBP.';
      this.feedback.warning(this.uploadErrorMessage);
      input.value = '';
      this.clearSelectedUploadFile(false);
      return;
    }

    if (file.size > this.maxUploadSize) {
      this.uploadErrorMessage = 'Ảnh tải lên tối đa 5MB.';
      this.feedback.warning(this.uploadErrorMessage);
      input.value = '';
      this.clearSelectedUploadFile(false);
      return;
    }

    this.revokeUploadPreviewUrl();
    this.selectedUploadFile = file;
    this.uploadPreviewUrl = URL.createObjectURL(file);
  }

  uploadTourImage(): void {
    if (this.uploading) {
      return;
    }

    if (!this.selectedUploadFile) {
      this.uploadErrorMessage = 'Vui lòng chọn ảnh trước khi tải lên.';
      this.feedback.warning(this.uploadErrorMessage);
      return;
    }

    this.uploading = true;
    this.uploadErrorMessage = '';

    this.adminMediaApiService
      .uploadMedia(this.selectedUploadFile, 'tours')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const uploadedItem = this.extractUploadItem(response);
          const uploadedUrl = uploadedItem ? this.getMediaUrl(uploadedItem) : '';

          this.uploading = false;
          this.clearSelectedUploadFile(true);

          if (uploadedItem) {
            this.mediaItems = [uploadedItem, ...this.mediaItems.filter((item) => item.id !== uploadedItem.id)];
            this.mediaPage = 0;
          }

          if (uploadedUrl) {
            this.setThumbnailUrl(uploadedUrl, true);
            this.feedback.success('Tải ảnh thành công và đã chọn làm ảnh đại diện tour.');
            return;
          }

          this.feedback.warning('Tải ảnh thành công nhưng backend chưa trả URL ảnh. Vui lòng kiểm tra Media.');
          this.loadMedia(0, false);
        },
        error: (error) => {
          this.uploadErrorMessage = this.errorText(error, 'Không thể tải ảnh. Vui lòng thử lại sau.');
          this.feedback.error(this.uploadErrorMessage);
          this.uploading = false;
        },
      });
  }

  clearSelectedUploadFile(resetInput: boolean = true): void {
    this.selectedUploadFile = null;
    this.revokeUploadPreviewUrl();

    if (resetInput && this.tourUploadInput) {
      this.tourUploadInput.nativeElement.value = '';
    }
  }

  restoreDraft(): void {
    const draft = this.readCreateDraft();

    if (!draft) {
      this.showDraftBanner = false;
      return;
    }

    this.form.patchValue(draft);
    const draftDestinationKeys = Array.isArray(draft.destinationSelectionKeys)
      ? draft.destinationSelectionKeys.filter((value): value is string => typeof value === 'string')
      : [];

    if (!draftDestinationKeys.length && this.form.controls.destinationSelectionKey.value) {
      this.form.controls.destinationSelectionKeys.setValue([this.form.controls.destinationSelectionKey.value]);
    }

    if (!this.form.controls.destinationSelectionKeys.value.length && this.form.controls.destinationId.value) {
      const destinationKey = this.destinationSelectionKeyFromId(this.form.controls.destinationId.value);
      this.form.controls.destinationSelectionKey.setValue(destinationKey);
      this.form.controls.destinationSelectionKeys.setValue(destinationKey ? [destinationKey] : []);
    }
    this.rebuildTourSelectOptions();
    this.selectedThumbnailUrl = String(draft.thumbnailUrl || '').trim();
    this.slugManuallyEdited = !!draft.slug;
    this.draftRestored = true;
    this.showDraftBanner = false;
    this.feedback.success('Đã khôi phục bản nháp chưa lưu.');
  }

  discardDraft(): void {
    this.removeCreateDraft();
    this.showDraftBanner = false;
    this.feedback.info('Đã bỏ qua bản nháp chưa lưu.');
  }

  handleGalleryThumbnailSelected(imageUrl: string): void {
    this.setThumbnailUrl(imageUrl, true);
    this.successMessage = 'Đã cập nhật ảnh đại diện từ thư viện ảnh. Bấm Lưu thay đổi để lưu vào tour.';
    this.feedback.success(this.successMessage);
  }

  thumbnailPreviewUrl(): string {
    return this.form.controls.thumbnailUrl.value.trim();
  }

  toggleDestinationDropdown(): void {
    this.isDestinationDropdownOpen = !this.isDestinationDropdownOpen;
    if (this.isDestinationDropdownOpen) {
      this.openDropdown = null;
    }
  }

  toggleDropdown(dropdown: TourFormDropdown): void {
    this.openDropdown = this.openDropdown === dropdown ? null : dropdown;
    if (this.openDropdown) {
      this.isDestinationDropdownOpen = false;
    }
  }

  closeDropdown(): void {
    this.openDropdown = null;
  }

  selectCategory(categoryId: number | undefined): void {
    if (categoryId === undefined) {
      return;
    }

    const control = this.form.controls.categoryId;
    control.setValue(categoryId);
    control.markAsDirty();
    control.markAsTouched();
    this.closeDropdown();
  }

  selectDepartureLocation(value: string): void {
    const control = this.form.controls.departureLocation;
    control.setValue(value);
    control.markAsDirty();
    control.markAsTouched();
    this.closeDropdown();
  }

  selectStatus(value: TourStatus): void {
    const control = this.form.controls.status;
    control.setValue(value);
    control.markAsDirty();
    control.markAsTouched();
    this.closeDropdown();
  }

  toggleDestinationOption(option: DestinationSelectOption): void {
    const selectedKeys = this.form.controls.destinationSelectionKeys.value;
    const nextKeys = selectedKeys.includes(option.value)
      ? selectedKeys.filter((key) => key !== option.value)
      : [...selectedKeys, option.value];

    this.applyDestinationSelection(nextKeys, true);
  }

  clearDestinationSelection(): void {
    this.applyDestinationSelection([], true);
    this.isDestinationDropdownOpen = false;
  }

  isDestinationOptionSelected(option: DestinationSelectOption): boolean {
    return this.form.controls.destinationSelectionKeys.value.includes(option.value);
  }

  hasInvalidCurrentCategory(): boolean {
    const category = this.selectedCategory();
    return !!category && !isCategorySelectableForTour(category);
  }

  currentCategoryWarning(): string {
    return this.hasInvalidCurrentCategory()
      ? 'Danh mục hiện tại chưa được duyệt hoặc đang bị ẩn. Tour có thể không đủ điều kiện xuất bản nếu danh mục chưa hợp lệ.'
      : '';
  }

  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Vui lòng kiểm tra lại các trường đang báo lỗi.';
      this.feedback.warning(this.errorMessage);
      return;
    }

    if (!this.isEditMode && !this.isSelectedCategoryValidForCreate()) {
      this.form.controls.categoryId.markAsDirty();
      this.form.controls.categoryId.markAsTouched();
      this.errorMessage = 'Vui lòng chọn danh mục đã duyệt và đang hiển thị trước khi tạo tour.';
      this.feedback.warning(this.errorMessage);
      return;
    }

    if (this.isEditMode && !this.tourId) {
      this.errorMessage = 'Không xác định được tour cần cập nhật.';
      this.feedback.error(this.errorMessage);
      return;
    }

    const payload = this.buildPayload();
    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request = this.isEditMode && this.tourId
      ? this.adminTourApiService.updateTour(this.tourId, payload as AdminTourUpdateRequest)
      : this.adminTourApiService.createTour(payload);

    request
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const savedTour = this.extractItem<AdminTour>(response);
          this.saving = false;

          if (this.isEditMode) {
            this.successMessage = 'Đã lưu thay đổi tour.';
            this.feedback.success(this.successMessage);
            if (savedTour) {
              this.patchTour(savedTour);
            }
            return;
          }

          this.removeCreateDraft();
          this.successMessage = 'Đã tạo tour mới.';
          this.feedback.success(this.successMessage);

          if (savedTour?.id) {
            this.tourId = savedTour.id;
            this.router.navigate(['/admin/tours', savedTour.id, 'edit']);
            return;
          }

          this.router.navigate(['/admin/tours']);
        },
        error: (error) => {
          this.errorMessage = this.errorText(error, 'Không thể lưu tour. Vui lòng thử lại sau.');
          this.feedback.error(this.errorMessage);
          this.saving = false;
        },
      });
  }

  backToList(): void {
    this.router.navigate(['/admin/tours']);
  }

  previewCategoryName(): string {
    const category = this.selectedCategory();
    return category ? this.categoryLabel(category, false) : 'Chưa chọn danh mục';
  }

  selectedCategoryLabel(): string {
    const category = this.selectedCategory();
    return category ? this.categoryLabel(category) : 'Chọn danh mục';
  }

  selectedDepartureLabel(): string {
    const value = this.form.controls.departureLocation.value;
    const option = this.departureSelectOptions.find((item) => item.value === value);
    return option?.label || value || 'Chọn điểm khởi hành';
  }

  selectedStatusLabel(): string {
    return this.statusLabel(this.form.controls.status.value);
  }

  previewDestinationName(): string {
    return this.selectedDestinationOptions.length ? this.selectedDestinationLabel : 'Chưa chọn điểm đến';
  }

  previewDepartureName(): string {
    return this.form.controls.departureLocation.value || 'Chưa chọn điểm khởi hành';
  }

  previewPriceText(): string {
    const salePrice = this.parseNumber(this.form.controls.salePrice.value) ?? 0;
    const originalPrice = this.parseNumber(this.form.controls.originalPrice.value) ?? 0;
    const price = salePrice > 0 ? salePrice : originalPrice;

    return this.formatMoney(price);
  }

  previewOriginalPriceText(): string {
    const salePrice = this.parseNumber(this.form.controls.salePrice.value) ?? 0;
    const originalPrice = this.parseNumber(this.form.controls.originalPrice.value) ?? 0;

    if (!originalPrice || !salePrice || salePrice >= originalPrice) {
      return '';
    }

    return this.formatMoney(originalPrice);
  }

  previewDurationText(): string {
    return `${this.form.controls.durationDays.value || 0} ngày ${this.form.controls.durationNights.value || 0} đêm`;
  }

  statusLabel(status?: string): string {
    switch (this.parseStatus(status)) {
      case 'PUBLISHED':
        return 'Đã xuất bản';
      case 'INACTIVE':
        return 'Tạm ẩn';
      case 'SOLD_OUT':
        return 'Hết chỗ';
      case 'DRAFT':
      default:
        return 'Nháp';
    }
  }

  statusClass(status?: string): string {
    return `admin-tour-form__status--${(this.parseStatus(status) || 'draft').toLowerCase().replace('_', '-')}`;
  }

  hasFieldError(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  hasFormError(errorKey: string): boolean {
    return !!this.form.errors?.[errorKey] && (this.form.touched || this.form.dirty);
  }

  handleImageError(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (image.src.endsWith(this.fallbackImage)) {
      return;
    }

    image.src = this.fallbackImage;
  }

  getMediaUrl(item: AdminMediaItem | null): string {
    if (!item) {
      return '';
    }

    return item.url
      || item.secureUrl
      || item.imageUrl
      || item.fileUrl
      || item.mediaUrl
      || item.data?.url
      || item.data?.secureUrl
      || item.data?.imageUrl
      || '';
  }

  mediaTitle(item: AdminMediaItem): string {
    return item.originalFilename || item.publicId || 'Ảnh chưa đặt tên';
  }

  moduleLabel(module?: string): string {
    return module || 'general';
  }

  categoryLabel(category: AdminCategory, includeStatus = true): string {
    const name = category.name?.trim() || this.categoryNameFromSlug(category.slug) || category.slug || `#${category.id}`;
    return includeStatus && !isCategorySelectableForTour(category)
      ? `${name} (${this.categoryUnavailableLabel(category)})`
      : name;
  }

  destinationLabel(destination: AdminDestination): string {
    const name = destination.name || destination.slug || `#${destination.id}`;
    const country = destination.country?.trim();
    const region = destination.region?.trim();
    const availability = this.destinationUnavailableLabel(destination);

    if (this.destinationMatchesRegion(destination, 'DOMESTIC')) {
      return [name, country || 'Việt Nam', region && region !== 'DOMESTIC' ? region : '', availability].filter(Boolean).join(' - ');
    }

    return [name, country, availability].filter(Boolean).join(' - ');
  }

  destinationShortLabel(destination: AdminDestination): string {
    const name = destination.name || destination.slug || `#${destination.id}`;
    const availability = this.destinationUnavailableLabel(destination);
    return availability ? `${name} ${availability}` : name;
  }

  hasInvalidCurrentDestination(): boolean {
    return this.selectedDestinationOptions.some((option) => {
      const destination = this.destinations.find((item) => item.id === option.destinationId);
      return !!destination && !isDestinationSelectableForTour(destination);
    });
  }

  currentDestinationWarning(): string {
    return this.hasInvalidCurrentDestination()
      ? 'Điểm đến hiện tại chưa duyệt hoặc không còn hiển thị. Tour cũ vẫn được giữ để tránh mất dữ liệu.'
      : '';
  }

  private applyDestinationSelection(selectedKeys: string[], markDirty: boolean): void {
    this.form.controls.destinationSelectionKeys.setValue(selectedKeys);
    this.updateSelectedDestinationState();

    if (markDirty) {
      this.form.controls.destinationSelectionKeys.markAsDirty();
      this.form.controls.destinationSelectionKeys.markAsTouched();
      this.form.controls.destinationSelectionKey.markAsDirty();
      this.form.controls.destinationSelectionKey.markAsTouched();
      this.form.controls.destinationId.markAsDirty();
      this.form.controls.destinationId.markAsTouched();
    }
  }

  private getSelectedDestinationLabel(): string {
    if (!this.selectedDestinationOptions.length) {
      return 'Chọn điểm đến';
    }

    const visibleOptions = this.selectedDestinationOptions.slice(0, 3);
    const label = visibleOptions.map((option) => option.displayLabel).join(' - ');
    const remainingCount = this.selectedDestinationOptions.length - visibleOptions.length;

    return remainingCount > 0 ? `${label} - +${remainingCount} điểm` : label;
  }

  private setThumbnailUrl(url: string, markDirty: boolean): void {
    this.form.controls.thumbnailUrl.setValue(url);
    this.selectedThumbnailUrl = url.trim();

    if (markDirty) {
      this.form.controls.thumbnailUrl.markAsDirty();
      this.form.controls.thumbnailUrl.markAsTouched();
    }
  }

  private patchTour(tour: AdminTour): void {
    this.slugManuallyEdited = true;
    const primaryDestinationId = this.parseNumber(tour.destinationId) ?? 0;
    const destinationKeys = (Array.isArray(tour.destinationIds) && tour.destinationIds.length ? tour.destinationIds : [primaryDestinationId])
      .map((destinationId) => this.destinationSelectionKeyFromId(destinationId))
      .filter((key): key is string => !!key);

    this.form.reset({
      title: tour.title || '',
      slug: tour.slug || '',
      shortDescription: tour.shortDescription || '',
      description: tour.description || '',
      thumbnailUrl: tour.thumbnailUrl || '',
      originalPrice: this.parseNumber(tour.originalPrice) ?? 0,
      salePrice: this.parseNumber(tour.salePrice) ?? 0,
      durationDays: this.parseNumber(tour.durationDays) ?? 1,
      durationNights: this.parseNumber(tour.durationNights) ?? 0,
      destinationSelectionKey: '',
      destinationSelectionKeys: [],
      departureLocation: tour.departureLocation || this.standardDepartureOptions[0].value,
      maxParticipants: this.parseNumber(tour.maxParticipants) ?? 1,
      availableSeats: this.parseNumber(tour.availableSeats) ?? 0,
      featured: !!tour.featured,
      status: this.parseStatus(tour.status) || 'DRAFT',
      categoryId: this.parseNumber(tour.categoryId) ?? 0,
      destinationId: primaryDestinationId,
    });
    const destinationKey = destinationKeys[0] || '';
    this.form.controls.destinationSelectionKey.setValue(destinationKey);
    this.form.controls.destinationSelectionKeys.setValue(destinationKeys);
    this.updateSelectedDestinationState();
    this.selectedThumbnailUrl = tour.thumbnailUrl || '';
  }

  private buildPayload(): AdminTourCreateRequest | AdminTourUpdateRequest {
    const rawValue = this.form.getRawValue();

    return {
      title: rawValue.title.trim(),
      slug: this.generateSlug(rawValue.slug) || rawValue.slug.trim(),
      shortDescription: rawValue.shortDescription.trim(),
      description: rawValue.description.trim() || undefined,
      thumbnailUrl: rawValue.thumbnailUrl.trim() || undefined,
      originalPrice: Number(rawValue.originalPrice) || 0,
      salePrice: Number(rawValue.salePrice) || 0,
      durationDays: Number(rawValue.durationDays) || 1,
      durationNights: Number(rawValue.durationNights) || 0,
      departureLocation: rawValue.departureLocation.trim(),
      maxParticipants: Number(rawValue.maxParticipants) || 1,
      availableSeats: Number(rawValue.availableSeats) || 0,
      featured: !!rawValue.featured,
      status: this.parseStatus(rawValue.status) || 'DRAFT',
      categoryId: Number(rawValue.categoryId),
      destinationId: Number(rawValue.destinationId),
    };
  }

  private setupCreateDraftAutosave(): void {
    if (this.isEditMode) {
      return;
    }

    this.form.valueChanges
      .pipe(debounceTime(500), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        try {
          localStorage.setItem(this.draftStorageKey, JSON.stringify(this.form.getRawValue()));
        } catch {
          this.feedback.warning('Không thể lưu bản nháp cục bộ trên trình duyệt này.');
        }
      });
  }

  private setupStableOptionRecalculation(): void {
    this.form.controls.categoryId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.rebuildCategorySelectOptions();
        this.rebuildDestinationSelectOptions();
        this.updateSelectedDestinationState();
      });

    this.form.controls.departureLocation.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.rebuildDepartureSelectOptions());
  }

  private checkCreateDraft(): void {
    if (this.isEditMode) {
      return;
    }

    this.showDraftBanner = !!this.readCreateDraft();

    if (!this.showDraftBanner && !this.form.controls.departureLocation.value) {
      this.form.controls.departureLocation.setValue(this.standardDepartureOptions[0].value);
    }
  }

  private rebuildTourSelectOptions(): void {
    this.rebuildCategorySelectOptions();
    this.rebuildDestinationSelectOptions();
    this.rebuildDepartureSelectOptions();
    this.updateSelectedDestinationState();
  }

  private rebuildCategorySelectOptions(): void {
    const selectedCategoryId = this.form.controls.categoryId.value;
    const selectableCategories = this.categories.filter((category) => isCategorySelectableForTour(category));
    const selectedCategory = this.categories.find((category) => category.id === selectedCategoryId);

    this.categoryOptions = this.isEditMode && selectedCategory && !selectableCategories.some((category) => category.id === selectedCategory.id)
      ? [selectedCategory, ...selectableCategories]
      : selectableCategories;
  }

  private rebuildDestinationSelectOptions(): void {
    const regionHint = this.selectedCategoryRegionHint();
    const selectedDestinationIds = new Set(this.form.controls.destinationSelectionKeys.value
      .map((key) => this.parseNumber(key.replace('destination:', '')))
      .filter((id): id is number => id !== undefined));
    const selectableDestinations = this.destinations.filter((destination) => isDestinationSelectableForTour(destination));
    const stableDestinations = this.isEditMode
      ? this.destinations.filter((destination) => !!destination.id && selectedDestinationIds.has(destination.id) && !isDestinationSelectableForTour(destination))
      : [];
    const sourceDestinations = [...stableDestinations, ...selectableDestinations.filter((destination) => !stableDestinations.some((item) => item.id === destination.id))];

    const sortedDestinations = regionHint
      ? [...sourceDestinations].sort((a, b) => {
          const aMatch = this.destinationMatchesRegion(a, regionHint) ? 0 : 1;
          const bMatch = this.destinationMatchesRegion(b, regionHint) ? 0 : 1;
          return aMatch - bMatch;
        })
      : sourceDestinations;

    this.destinationSelectOptions = sortedDestinations.map((destination) => ({
      label: this.destinationLabel(destination),
      displayLabel: this.destinationShortLabel(destination),
      value: this.destinationSelectionKey(destination),
      destinationId: this.parseNumber(destination.id) ?? 0,
    }));
    this.updateSelectedDestinationState();
  }

  private rebuildDepartureSelectOptions(): void {
    const current = this.form.controls.departureLocation.value.trim();
    const hasCurrent = this.standardDepartureOptions.some((option) => option.value === current);
    this.departureSelectOptions = !current || hasCurrent
      ? this.standardDepartureOptions
      : [{ label: `Khác: ${current}`, value: current }, ...this.standardDepartureOptions];
  }

  private updateSelectedDestinationState(): void {
    if (!this.destinationSelectOptions.length) {
      this.selectedDestinationOptions = [];
      this.selectedDestinationIds = [];
      this.selectedDestinationLabel = 'Chọn điểm đến';
      return;
    }

    const selectedKeys = this.form.controls.destinationSelectionKeys.value
      .filter((key) => this.destinationSelectOptions.some((option) => option.value === key));

    if (selectedKeys.length !== this.form.controls.destinationSelectionKeys.value.length) {
      this.form.controls.destinationSelectionKeys.setValue(selectedKeys, { emitEvent: false });
    }

    if (!selectedKeys.length) {
      this.selectedDestinationOptions = [];
      this.selectedDestinationIds = [];
      this.selectedDestinationLabel = 'Chọn điểm đến';
      this.form.controls.destinationSelectionKey.setValue('', { emitEvent: false });
      this.form.controls.destinationId.setValue(0, { emitEvent: false });
      return;
    }

    this.selectedDestinationOptions = selectedKeys
      .map((key) => this.destinationSelectOptions.find((option) => option.value === key))
      .filter((option): option is DestinationSelectOption => !!option);
    this.selectedDestinationIds = this.selectedDestinationOptions
      .map((option) => option.destinationId)
      .filter((id) => id > 0);
    this.selectedDestinationLabel = this.getSelectedDestinationLabel();

    const primaryOption = this.selectedDestinationOptions[0];
    this.form.controls.destinationSelectionKey.setValue(primaryOption?.value ?? '', { emitEvent: false });
    this.form.controls.destinationId.setValue(primaryOption?.destinationId ?? 0, { emitEvent: false });
  }

  private readCreateDraft(): Partial<ReturnType<typeof this.form.getRawValue>> | null {
    try {
      const rawDraft = localStorage.getItem(this.draftStorageKey);
      const parsed = rawDraft ? JSON.parse(rawDraft) : null;
      return this.isRecord(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  private removeCreateDraft(): void {
    try {
      localStorage.removeItem(this.draftStorageKey);
    } catch {
      // Storage can be unavailable in restricted browser contexts.
    }
  }

  private extractMediaPage(response: unknown): PageResponse<AdminMediaItem> {
    const content = this.extractMediaList(response);
    const source = this.isRecord(response) && this.isRecord(response['data']) ? response['data'] : response;
    const record = this.isRecord(source) ? source : {};

    return {
      content,
      page: this.parseNumber(record['page']) ?? this.mediaPage,
      size: this.parseNumber(record['size']) ?? this.mediaSize,
      totalElements: this.parseNumber(record['totalElements']) ?? content.length,
      totalPages: this.parseNumber(record['totalPages']) ?? (content.length ? 1 : 0),
      first: Boolean(record['first'] ?? this.mediaPage === 0),
      last: Boolean(record['last'] ?? true),
      empty: Boolean(record['empty'] ?? content.length === 0),
      sortBy: typeof record['sortBy'] === 'string' ? record['sortBy'] : undefined,
      sortDir: typeof record['sortDir'] === 'string' ? record['sortDir'] : undefined,
    };
  }

  private extractMediaList(response: unknown): AdminMediaItem[] {
    const list = this.extractList<AdminMediaItem>(response);
    return list.map((item) => this.normalizeMediaItem(item)).filter((item): item is AdminMediaItem => !!item);
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
    const url = this.getMediaUrl(mediaItem);

    return {
      ...mediaItem,
      url: mediaItem.url || url || undefined,
      sizeBytes: mediaItem.sizeBytes ?? mediaItem.bytes,
      type: mediaItem.type || mediaItem.mediaType || mediaItem.resourceType,
      module: mediaItem.module || mediaItem.folder,
    };
  }

  private normalizeCategories(categories: AdminCategory[]): AdminCategory[] {
    return categories
      .filter((item) => !!item.id)
      .sort((a, b) => (a.displayOrder ?? a.sortOrder ?? a.orderIndex ?? 0) - (b.displayOrder ?? b.sortOrder ?? b.orderIndex ?? 0));
  }

  private selectedCategory(): AdminCategory | undefined {
    const categoryId = this.form.controls.categoryId.value;
    return this.categoryOptions.find((item) => item.id === categoryId)
      || this.categories.find((item) => item.id === categoryId);
  }

  private isSelectedCategoryValidForCreate(): boolean {
    const category = this.selectedCategory();
    return !!category && isCategorySelectableForTour(category);
  }

  private categoryUnavailableLabel(category: AdminCategory): string {
    if (category.status !== 'APPROVED') {
      return 'chưa duyệt';
    }

    return 'không còn hiển thị';
  }

  private destinationUnavailableLabel(destination: AdminDestination): string {
    if (isDestinationSelectableForTour(destination)) {
      return '';
    }

    if (destination.status !== 'APPROVED') {
      return '(chưa duyệt)';
    }

    return '(không còn hiển thị)';
  }

  private destinationSelectionKey(destination: AdminDestination): string {
    return `destination:${destination.id}`;
  }

  private destinationSelectionKeyFromId(destinationId: number): string {
    const destination = this.destinations.find((item) => item.id === destinationId);

    if (!destination) {
      return '';
    }

    return this.destinationSelectionKey(destination);
  }

  private categoryNameFromSlug(slug?: string): string {
    const normalized = this.normalizeText(slug || '');

    if (['domestic', 'tour-trong-nuoc'].includes(normalized)) {
      return 'Tour trong nước';
    }

    if (['international', 'tour-nuoc-ngoai'].includes(normalized)) {
      return 'Tour nước ngoài';
    }

    if (['combo', 'tour-combo'].includes(normalized)) {
      return 'Tour combo';
    }

    if (normalized === 'visa') {
      return 'Visa';
    }

    if (['ve-may-bay', 'flight', 'flights'].includes(normalized)) {
      return 'Vé máy bay';
    }

    return '';
  }

  private selectedCategoryRegionHint(): 'DOMESTIC' | 'INTERNATIONAL' | null {
    const category = this.categories.find((item) => item.id === this.form.controls.categoryId.value);
    const value = this.normalizeText(`${category?.name || ''} ${category?.slug || ''}`);

    if (value.includes('trong-nuoc') || value.includes('domestic')) {
      return 'DOMESTIC';
    }

    if (value.includes('nuoc-ngoai') || value.includes('international')) {
      return 'INTERNATIONAL';
    }

    return null;
  }

  private destinationMatchesRegion(destination: AdminDestination, regionHint: 'DOMESTIC' | 'INTERNATIONAL'): boolean {
    const region = this.normalizeText(destination.region || '');
    const country = this.normalizeText(destination.country || '');

    if (regionHint === 'DOMESTIC') {
      return region.includes('domestic') || region.includes('trong-nuoc') || ['viet-nam', 'vietnam', 'vn'].includes(country);
    }

    return region.includes('international') || region.includes('nuoc-ngoai') || (!!country && !['viet-nam', 'vietnam', 'vn'].includes(country));
  }

  private normalizeText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private revokeUploadPreviewUrl(): void {
    if (this.uploadPreviewUrl) {
      URL.revokeObjectURL(this.uploadPreviewUrl);
      this.uploadPreviewUrl = '';
    }
  }

  private isAllowedImage(file: File): boolean {
    const lowerName = file.name.toLowerCase();
    const validType = this.allowedImageTypes.includes(file.type);
    const validExtension = this.allowedImageExtensions.some((extension) => lowerName.endsWith(extension));

    return validType || (!file.type && validExtension);
  }

  private tourRulesValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const originalPrice = this.parseNumber(control.get('originalPrice')?.value);
      const salePrice = this.parseNumber(control.get('salePrice')?.value);
      const maxParticipants = this.parseNumber(control.get('maxParticipants')?.value);
      const availableSeats = this.parseNumber(control.get('availableSeats')?.value);
      const durationDays = this.parseNumber(control.get('durationDays')?.value);
      const durationNights = this.parseNumber(control.get('durationNights')?.value);
      const errors: ValidationErrors = {};

      if (originalPrice !== undefined && salePrice !== undefined && salePrice > originalPrice) {
        errors['salePriceTooHigh'] = true;
      }

      if (maxParticipants !== undefined && availableSeats !== undefined && availableSeats > maxParticipants) {
        errors['availableSeatsTooHigh'] = true;
      }

      if (durationDays !== undefined && durationNights !== undefined && durationNights > durationDays) {
        errors['durationNightsTooHigh'] = true;
      }

      return Object.keys(errors).length ? errors : null;
    };
  }

  private extractList<T>(response: unknown): T[] {
    if (Array.isArray(response)) {
      return response as T[];
    }

    if (!this.isRecord(response)) {
      return [];
    }

    const data = response['data'];

    if (Array.isArray(data)) {
      return data as T[];
    }

    if (this.isRecord(data) && Array.isArray(data['content'])) {
      return data['content'] as T[];
    }

    if (Array.isArray(response['content'])) {
      return response['content'] as T[];
    }

    return [];
  }

  private extractItem<T>(response: unknown): T | null {
    if (!this.isRecord(response)) {
      return null;
    }

    const data = response['data'];

    if (this.isRecord(data)) {
      if (this.isRecord(data['tour'])) {
        return data['tour'] as T;
      }

      return data as T;
    }

    if (this.isRecord(response['tour'])) {
      return response['tour'] as T;
    }

    return response as T;
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

  private formatMoney(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  }

  private parseStatus(status?: string): TourStatus | null {
    return status === 'DRAFT' || status === 'PUBLISHED' || status === 'INACTIVE' || status === 'SOLD_OUT' ? status : null;
  }

  private errorText(error: unknown, fallback: string): string {
    if (this.isRecord(error)) {
      const status = this.parseNumber(error['status']);

      if (status === 401 || status === 403) {
        return 'Phiên đăng nhập admin không hợp lệ hoặc không đủ quyền quản lý tour/media.';
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
