import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AdminMediaApiService } from '../../../core/api/admin-media-api.service';
import { AdminMediaItem } from '../../../core/models/media.model';
import { PageResponse } from '../../../core/models/page-response.model';

interface MediaModuleOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-admin-media',
  imports: [NgClass, NgFor, NgIf],
  templateUrl: './media.html',
  styleUrl: './media.scss',
  standalone: true,
})
export class AdminMedia implements OnInit, OnDestroy {
  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;

  private readonly adminMediaApiService = inject(AdminMediaApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly fallbackImage = '/hero/bg-home.png';
  readonly maxFileSize = 5 * 1024 * 1024;
  readonly allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  readonly allowedImageExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
  readonly moduleOptions: MediaModuleOption[] = [
    { label: 'Tất cả', value: 'ALL' },
    { label: 'Tours', value: 'tours' },
    { label: 'Categories', value: 'categories' },
    { label: 'Destinations', value: 'destinations' },
    { label: 'Avatars', value: 'avatars' },
    { label: 'Banners', value: 'banners' },
    { label: 'General', value: 'general' },
  ];
  readonly uploadModuleOptions = this.moduleOptions.filter((module) => module.value !== 'ALL');
  readonly skeletonCards = Array.from({ length: 8 });

  loading = false;
  loadingMore = false;
  uploading = false;
  deletingId: number | null = null;
  errorMessage = '';
  successMessage = '';
  mediaItems: AdminMediaItem[] = [];
  selectedModule = 'ALL';
  uploadModule = 'general';
  page = 0;
  size = 12;
  totalElements = 0;
  totalPages = 0;
  selectedFile: File | null = null;
  previewUrl = '';

  ngOnInit(): void {
    this.loadMedia(0, false);
  }

  ngOnDestroy(): void {
    this.revokePreviewUrl();
  }

  get hasMore(): boolean {
    return this.page + 1 < this.totalPages;
  }

  loadMedia(page: number = 0, append: boolean = false): void {
    this.loading = !append;
    this.loadingMore = append;
    this.errorMessage = '';

    this.adminMediaApiService
      .getMedia({
        module: this.selectedModule === 'ALL' ? undefined : this.selectedModule,
        page,
        size: this.size,
        sortBy: 'createdAt',
        sortDir: 'desc',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const pageResponse = this.extractPage(response);

          this.mediaItems = append
            ? [...this.mediaItems, ...pageResponse.content]
            : pageResponse.content;
          this.page = pageResponse.page;
          this.size = pageResponse.size;
          this.totalElements = pageResponse.totalElements;
          this.totalPages = pageResponse.totalPages;
          this.loading = false;
          this.loadingMore = false;
        },
        error: (error) => {
          this.errorMessage = this.errorText(
            error,
            'Không thể tải danh sách media. Vui lòng thử lại sau.',
          );
          this.loading = false;
          this.loadingMore = false;
        },
      });
  }

  applyModuleFilter(module: string): void {
    if (this.selectedModule === module || this.loading) {
      return;
    }

    this.selectedModule = module;
    this.page = 0;
    this.loadMedia(0, false);
  }

  onUploadModuleChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.uploadModule = value || 'general';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.errorMessage = '';
    this.successMessage = '';

    if (!file) {
      return;
    }

    if (!this.isAllowedImage(file)) {
      this.errorMessage = 'Chỉ hỗ trợ ảnh PNG, JPG, JPEG hoặc WEBP.';
      input.value = '';
      this.clearSelectedFile(false);
      return;
    }

    if (file.size > this.maxFileSize) {
      this.errorMessage = 'Ảnh upload tối đa 5MB.';
      input.value = '';
      this.clearSelectedFile(false);
      return;
    }

    this.revokePreviewUrl();
    this.selectedFile = file;
    this.previewUrl = URL.createObjectURL(file);
  }

  uploadMedia(): void {
    if (this.uploading) {
      return;
    }

    if (!this.selectedFile) {
      this.errorMessage = 'Vui lòng chọn ảnh trước khi upload.';
      return;
    }

    const module = this.uploadModule && this.uploadModule !== 'ALL' ? this.uploadModule : 'general';

    this.uploading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminMediaApiService
      .uploadMedia(this.selectedFile, module)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const uploadedItem = this.extractUploadItem(response);

          this.uploading = false;
          this.clearSelectedFile(true);

          if (uploadedItem && this.getMediaUrl(uploadedItem)) {
            this.successMessage = 'Upload ảnh thành công.';

            if (this.shouldShowUploadedItem(uploadedItem, module)) {
              this.mediaItems = [
                uploadedItem,
                ...this.mediaItems.filter((item) => item.id !== uploadedItem.id),
              ];
              this.totalElements += 1;
              this.page = 0;
            } else {
              this.loadMedia(0, false);
            }

            return;
          }

          this.page = 0;
          this.loadMedia(0, false);
          this.errorMessage = uploadedItem?.publicId
            ? 'Backend chưa trả URL ảnh Cloudinary, cần kiểm tra response upload.'
            : '';
          this.successMessage = uploadedItem?.publicId ? '' : 'Upload ảnh thành công.';
        },
        error: (error) => {
          this.errorMessage = this.errorText(error, 'Không thể upload ảnh. Vui lòng thử lại sau.');
          this.uploading = false;
        },
      });
  }

  copyUrl(item: AdminMediaItem): void {
    const url = this.getMediaUrl(item);

    if (!url) {
      this.errorMessage = 'Media này chưa có URL để copy.';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          this.successMessage = 'Đã copy URL ảnh';
        })
        .catch(() => this.copyUrlFallback(url));
      return;
    }

    this.copyUrlFallback(url);
  }

  deleteMedia(item: AdminMediaItem): void {
    const id = item.id;

    if (!id || this.deletingId) {
      return;
    }

    const confirmed = window.confirm(
      'Bạn có chắc muốn xóa media này? URL đã dùng ở nội dung khác có thể bị lỗi ảnh.',
    );

    if (!confirmed) {
      return;
    }

    this.deletingId = id;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminMediaApiService.deleteMedia(id).subscribe({
      next: () => {
        this.mediaItems = this.mediaItems.filter((media) => media.id !== id);
        this.totalElements = Math.max(0, this.totalElements - 1);
        this.successMessage = 'Đã xóa media.';
        this.deletingId = null;
      },
      error: (error) => {
        this.errorMessage = this.errorText(error, 'Không thể xóa media. Vui lòng thử lại sau.');
        this.deletingId = null;
      },
    });
  }

  loadMore(): void {
    if (!this.hasMore || this.loadingMore) {
      return;
    }

    this.loadMedia(this.page + 1, true);
  }

  retry(): void {
    this.loadMedia(0, false);
  }

  getMediaUrl(item: AdminMediaItem): string {
    return this.extractMediaUrl(item);
  }

  shortUrl(url?: string): string {
    if (!url) {
      return 'Chưa có URL';
    }

    return url.length > 58 ? `${url.slice(0, 34)}...${url.slice(-18)}` : url;
  }

  moduleLabel(module?: string): string {
    if (!module) {
      return 'general';
    }

    return this.moduleOptions.find((item) => item.value === module)?.label || module;
  }

  formatBytes(value?: number): string {
    if (!value) {
      return 'Đang cập nhật';
    }

    if (value < 1024) {
      return `${value} B`;
    }

    if (value < 1024 * 1024) {
      return `${(value / 1024).toFixed(1)} KB`;
    }

    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  }

  getMediaSize(item: AdminMediaItem): number | undefined {
    return item.sizeBytes ?? item.bytes;
  }

  formatDate(value?: string): string {
    if (!value) {
      return 'Đang cập nhật';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  handleImageError(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (image.src.endsWith(this.fallbackImage)) {
      return;
    }

    image.src = this.fallbackImage;
  }

  private extractPage(response: unknown): PageResponse<AdminMediaItem> {
    const content = this.extractList(response);
    const source =
      this.isRecord(response) && this.isRecord(response['data']) ? response['data'] : response;
    const record = this.isRecord(source) ? source : {};

    return {
      content,
      page: this.parseNumber(record['page']) ?? this.page,
      size: this.parseNumber(record['size']) ?? this.size,
      totalElements: this.parseNumber(record['totalElements']) ?? content.length,
      totalPages: this.parseNumber(record['totalPages']) ?? (content.length ? 1 : 0),
      first: Boolean(record['first'] ?? this.page === 0),
      last: Boolean(record['last'] ?? true),
      empty: Boolean(record['empty'] ?? content.length === 0),
      sortBy: typeof record['sortBy'] === 'string' ? record['sortBy'] : undefined,
      sortDir: typeof record['sortDir'] === 'string' ? record['sortDir'] : undefined,
    };
  }

  private extractList(response: unknown): AdminMediaItem[] {
    if (Array.isArray(response)) {
      return response.map((item) => this.normalizeMediaItem(item)).filter(this.isDefinedMediaItem);
    }

    if (!this.isRecord(response)) {
      return [];
    }

    const data = response['data'];

    if (Array.isArray(data)) {
      return data.map((item) => this.normalizeMediaItem(item)).filter(this.isDefinedMediaItem);
    }

    if (this.isRecord(data) && Array.isArray(data['content'])) {
      return data['content']
        .map((item) => this.normalizeMediaItem(item))
        .filter(this.isDefinedMediaItem);
    }

    if (Array.isArray(response['content'])) {
      return response['content']
        .map((item) => this.normalizeMediaItem(item))
        .filter(this.isDefinedMediaItem);
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

  private shouldShowUploadedItem(item: AdminMediaItem, fallbackModule: string): boolean {
    if (this.selectedModule === 'ALL') {
      return true;
    }

    const itemModule = item.module || item.folder || fallbackModule;
    return itemModule === this.selectedModule;
  }

  private extractMediaUrl(item: AdminMediaItem): string {
    const directUrl =
      item.url || item.imageUrl || item.secureUrl || item.fileUrl || item.mediaUrl || '';

    if (directUrl) {
      return directUrl;
    }

    const data = item.data;

    return data?.url || data?.imageUrl || data?.secureUrl || '';
  }

  private clearSelectedFile(resetInput: boolean): void {
    this.selectedFile = null;
    this.revokePreviewUrl();

    if (resetInput && this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private revokePreviewUrl(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = '';
    }
  }

  private isAllowedImage(file: File): boolean {
    const lowerName = file.name.toLowerCase();
    const validType = this.allowedImageTypes.includes(file.type);
    const validExtension = this.allowedImageExtensions.some((extension) =>
      lowerName.endsWith(extension),
    );

    return validType || (!file.type && validExtension);
  }

  private copyUrlFallback(url: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = url;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      const copied = document.execCommand('copy');
      this.successMessage = copied ? 'Đã copy URL ảnh' : `Copy thủ công URL: ${url}`;
    } catch {
      this.successMessage = `Copy thủ công URL: ${url}`;
    } finally {
      document.body.removeChild(textarea);
    }
  }

  private errorText(error: unknown, fallback: string): string {
    if (this.isRecord(error)) {
      const status = this.parseNumber(error['status']);

      if (status === 401 || status === 403) {
        return 'Phiên đăng nhập admin không hợp lệ hoặc không đủ quyền truy cập media.';
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

  private isDefinedMediaItem(value: AdminMediaItem | null): value is AdminMediaItem {
    return !!value;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
