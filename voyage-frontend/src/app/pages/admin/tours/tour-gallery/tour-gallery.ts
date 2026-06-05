import { NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs';

import { AdminMediaApiService } from '../../../../core/api/admin-media-api.service';
import { AdminTourApiService } from '../../../../core/api/admin-tour-api.service';
import { AdminTourImage } from '../../../../core/models/admin-tour.model';
import { AdminMediaItem } from '../../../../core/models/media.model';
import { AdminUiFeedbackService } from '../../../../core/services/admin-ui-feedback.service';

@Component({
  selector: 'app-admin-tour-gallery',
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './tour-gallery.html',
  styleUrl: './tour-gallery.scss',
})
export class TourGallery implements OnInit, OnChanges {
  @ViewChild('galleryUploadInput') private galleryUploadInput?: ElementRef<HTMLInputElement>;

  private readonly adminTourApiService = inject(AdminTourApiService);
  private readonly adminMediaApiService = inject(AdminMediaApiService);
  private readonly feedback = inject(AdminUiFeedbackService);

  @Input() tourId: number | null = null;
  @Input() isEditMode = false;
  @Output() thumbnailSelected = new EventEmitter<string>();

  readonly fallbackImage = '/hero/bg-home.png';
  readonly allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  readonly allowedImageExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
  readonly maxUploadSize = 5 * 1024 * 1024;
  readonly mediaSkeletonCards = [1, 2, 3, 4];

  galleryLoading = false;
  gallerySaving = false;
  galleryDeletingId: number | null = null;
  galleryErrorMessage = '';
  gallerySuccessMessage = '';
  tourImages: AdminTourImage[] = [];
  mediaLoading = false;
  mediaErrorMessage = '';
  mediaItems: AdminMediaItem[] = [];
  selectedMediaId: number | null = null;
  selectedUploadFile: File | null = null;
  uploadErrorMessage = '';
  uploading = false;
  altTextInput = '';
  sortOrderInput = 0;
  editingImageId: number | null = null;
  editingAltText = '';
  editingSortOrder = 0;
  settingThumbnailId: number | null = null;
  reorderSaving = false;

  ngOnInit(): void {
    this.loadGalleryIfReady();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tourId'] || changes['isEditMode']) {
      this.loadGalleryIfReady();
    }
  }

  loadGalleryIfReady(): void {
    if (!this.isEditMode || !this.tourId) {
      this.tourImages = [];
      return;
    }

    this.loadGallery();
    this.loadMedia();
  }

  loadGallery(): void {
    if (!this.tourId) {
      return;
    }

    this.galleryLoading = true;
    this.galleryErrorMessage = '';
    this.gallerySuccessMessage = '';

    this.adminTourApiService.getTourImages(this.tourId).subscribe({
      next: (response) => {
        this.tourImages = this.extractList(response).sort((a, b) => this.sortImage(a, b));
        this.galleryLoading = false;
      },
      error: (error) => {
        this.galleryErrorMessage = this.errorText(error, 'Không thể tải thư viện ảnh tour. Vui lòng thử lại sau.');
        this.galleryLoading = false;
      },
    });
  }

  addImage(): void {
    this.galleryErrorMessage = 'Backend hiện chỉ hỗ trợ upload multipart hoặc attach từ Media. Vui lòng chọn ảnh từ Media hoặc tải ảnh mới.';
  }

  loadMedia(): void {
    this.mediaLoading = true;
    this.mediaErrorMessage = '';

    this.adminMediaApiService.getMedia({
      module: 'tours',
      page: 0,
      size: 12,
      sortBy: 'createdAt',
      sortDir: 'desc',
    }).subscribe({
      next: (response) => {
        this.mediaItems = this.extractMediaList(response);
        this.mediaLoading = false;
      },
      error: (error) => {
        this.mediaErrorMessage = this.errorText(error, 'Không thể tải danh sách Media. Vui lòng thử lại sau.');
        this.mediaLoading = false;
      },
    });
  }

  selectMedia(item: AdminMediaItem): void {
    if (!item.id || !this.getMediaUrl(item)) {
      this.galleryErrorMessage = 'Ảnh Media này chưa có đủ ID hoặc URL để gắn vào gallery.';
      return;
    }

    this.selectedMediaId = item.id;
    if (!this.altTextInput.trim()) {
      this.altTextInput = item.originalFilename || item.publicId || '';
    }
  }

  attachSelectedMedia(): void {
    if (!this.tourId) {
      this.galleryErrorMessage = 'Vui lòng lưu tour trước khi quản lý thư viện ảnh.';
      return;
    }

    if (!this.selectedMediaId) {
      this.galleryErrorMessage = 'Vui lòng chọn ảnh từ Media trước khi thêm vào gallery.';
      return;
    }

    this.attachMedia(this.selectedMediaId);
  }

  onUploadFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    this.uploadErrorMessage = '';

    if (!file) {
      this.selectedUploadFile = null;
      return;
    }

    if (!this.isAllowedImage(file)) {
      this.uploadErrorMessage = 'Chỉ hỗ trợ ảnh PNG, JPG, JPEG hoặc WEBP.';
      input.value = '';
      this.selectedUploadFile = null;
      return;
    }

    if (file.size > this.maxUploadSize) {
      this.uploadErrorMessage = 'Ảnh tải lên tối đa 5MB.';
      input.value = '';
      this.selectedUploadFile = null;
      return;
    }

    this.selectedUploadFile = file;
  }

  uploadAndAttachImage(): void {
    if (!this.tourId) {
      this.galleryErrorMessage = 'Vui lòng lưu tour trước khi quản lý thư viện ảnh.';
      return;
    }

    if (!this.selectedUploadFile) {
      this.uploadErrorMessage = 'Vui lòng chọn ảnh trước khi tải lên.';
      return;
    }

    this.uploading = true;
    this.uploadErrorMessage = '';
    this.galleryErrorMessage = '';

    this.adminMediaApiService.uploadMedia(this.selectedUploadFile, 'tours').subscribe({
      next: (response) => {
        const media = this.extractUploadItem(response);

        if (!media?.id) {
          this.uploading = false;
          this.uploadErrorMessage = 'Tải ảnh thành công nhưng backend chưa trả mediaId để gắn vào gallery.';
          this.loadMedia();
          return;
        }

        this.mediaItems = [media, ...this.mediaItems.filter((item) => item.id !== media.id)];
        this.attachMedia(media.id, true);
      },
      error: (error) => {
        this.uploadErrorMessage = this.errorText(error, 'Không thể tải ảnh mới. Vui lòng thử lại sau.');
        this.uploading = false;
      },
    });
  }

  clearSelectedUploadFile(): void {
    this.selectedUploadFile = null;
    this.uploadErrorMessage = '';

    if (this.galleryUploadInput) {
      this.galleryUploadInput.nativeElement.value = '';
    }
  }

  isSelectedMedia(item: AdminMediaItem): boolean {
    return !!item.id && item.id === this.selectedMediaId;
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

  private attachMedia(mediaId: number, fromUpload = false): void {
    if (!this.tourId) {
      return;
    }

    this.gallerySaving = true;
    this.galleryErrorMessage = '';
    this.gallerySuccessMessage = '';

    this.adminTourApiService.attachTourImageFromMedia(this.tourId, {
      mediaId,
      altText: this.altTextInput.trim() || undefined,
      sortOrder: Number(this.sortOrderInput) || 0,
      isThumbnail: false,
    }).subscribe({
      next: (response) => {
        const savedImage = this.extractItem(response);
        this.gallerySuccessMessage = 'Đã thêm ảnh vào thư viện tour.';
        this.gallerySaving = false;
        this.uploading = false;
        this.selectedMediaId = null;
        this.altTextInput = '';
        this.sortOrderInput = 0;
        this.clearSelectedUploadFile();

        if (savedImage?.id || this.getImageUrl(savedImage || {})) {
          this.upsertImage(savedImage || {});
        } else {
          this.loadGallery();
        }
      },
      error: (error) => {
        this.galleryErrorMessage = this.errorText(
          error,
          'Không thể thêm ảnh vào gallery. Vui lòng kiểm tra định dạng request hoặc backend attach URL.'
        );
        this.gallerySaving = false;
        this.uploading = false;
        if (fromUpload) {
          this.loadMedia();
        }
      },
    });
  }

  startEdit(image: AdminTourImage): void {
    this.editingImageId = image.id ?? null;
    this.editingAltText = image.altText || '';
    this.editingSortOrder = image.sortOrder ?? 0;
  }

  cancelEdit(): void {
    this.editingImageId = null;
    this.editingAltText = '';
    this.editingSortOrder = 0;
  }

  saveEdit(image: AdminTourImage): void {
    if (!this.tourId || !image.id) {
      return;
    }

    this.gallerySaving = true;
    this.galleryErrorMessage = '';
    this.gallerySuccessMessage = '';

    this.adminTourApiService.updateTourImage(this.tourId, image.id, {
      altText: this.editingAltText.trim() || undefined,
      sortOrder: Number(this.editingSortOrder) || 0,
    }).subscribe({
      next: (response) => {
        const sortOrderChanged = (image.sortOrder ?? 0) !== (Number(this.editingSortOrder) || 0);
        const updatedImage = this.extractItem(response) || {
          ...image,
          altText: this.editingAltText.trim(),
          sortOrder: Number(this.editingSortOrder) || 0,
        };
        this.upsertImage(updatedImage);
        this.gallerySuccessMessage = 'Đã cập nhật thông tin ảnh.';
        this.gallerySaving = false;
        this.cancelEdit();

        if (sortOrderChanged) {
          this.saveReorder();
        }
      },
      error: (error) => {
        this.galleryErrorMessage = this.errorText(error, 'Không thể cập nhật mô tả ảnh. Vui lòng thử lại sau.');
        this.gallerySaving = false;
      },
    });
  }

  setThumbnail(image: AdminTourImage): void {
    const imageUrl = this.getImageUrl(image);

    if (!this.tourId || !image.id || !imageUrl) {
      this.galleryErrorMessage = 'Ảnh này chưa có URL hợp lệ để đặt làm ảnh đại diện.';
      return;
    }

    this.settingThumbnailId = image.id;
    this.galleryErrorMessage = '';
    this.gallerySuccessMessage = '';

    this.adminTourApiService.setTourImageThumbnail(this.tourId, image.id).subscribe({
      next: () => {
        this.tourImages = this.tourImages.map((item) => ({ ...item, isThumbnail: item.id === image.id }));
        this.thumbnailSelected.emit(imageUrl);
        this.gallerySuccessMessage = 'Đã đặt ảnh làm ảnh đại diện tour.';
        this.feedback.success(this.gallerySuccessMessage);
        this.settingThumbnailId = null;
      },
      error: (error) => {
        this.galleryErrorMessage = this.errorText(error, 'Không thể đặt ảnh đại diện. Vui lòng thử lại sau.');
        this.feedback.error(this.galleryErrorMessage);
        this.settingThumbnailId = null;
      },
    });
  }

  deleteImage(image: AdminTourImage): void {
    if (!this.tourId || !image.id || this.galleryDeletingId) {
      return;
    }

    this.feedback
      .confirmDanger(
        'Thao t\u00e1c n\u00e0y kh\u00f4ng th\u1ec3 ho\u00e0n t\u00e1c. B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n x\u00f3a \u1ea3nh n\u00e0y kh\u1ecfi th\u01b0 vi\u1ec7n tour?',
      )
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (!confirmed || !this.tourId || !image.id) {
          return;
        }

        this.galleryDeletingId = image.id;
        this.galleryErrorMessage = '';
        this.gallerySuccessMessage = '';

        this.adminTourApiService.deleteTourImage(this.tourId, image.id).subscribe({
          next: () => {
            this.tourImages = this.tourImages.filter((item) => item.id !== image.id);
            this.gallerySuccessMessage = '\u0110\u00e3 x\u00f3a \u1ea3nh kh\u1ecfi th\u01b0 vi\u1ec7n tour.';
            this.feedback.success(this.gallerySuccessMessage);
            this.galleryDeletingId = null;
          },
          error: (error) => {
            this.galleryErrorMessage = this.errorText(error, 'Kh\u00f4ng th\u1ec3 x\u00f3a \u1ea3nh. Vui l\u00f2ng th\u1eed l\u1ea1i sau.');
            this.feedback.error(this.galleryErrorMessage);
            this.galleryDeletingId = null;
          },
        });
      });
  }

  moveImage(image: AdminTourImage, direction: -1 | 1): void {
    const currentIndex = this.tourImages.findIndex((item) => item.id === image.id);
    const nextIndex = currentIndex + direction;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= this.tourImages.length) {
      return;
    }

    const nextImages = [...this.tourImages];
    [nextImages[currentIndex], nextImages[nextIndex]] = [nextImages[nextIndex], nextImages[currentIndex]];
    this.tourImages = nextImages.map((item, index) => ({ ...item, sortOrder: index }));
    this.saveReorder();
  }

  saveReorder(): void {
    if (!this.tourId) {
      return;
    }

    const items = this.tourImages
      .filter((image) => !!image.id)
      .map((image, index) => ({ id: image.id, sortOrder: image.sortOrder ?? index }));

    if (!items.length) {
      return;
    }

    this.reorderSaving = true;
    this.galleryErrorMessage = '';
    this.gallerySuccessMessage = '';

    this.adminTourApiService.reorderTourImages(this.tourId, { items }).subscribe({
      next: (response) => {
        const reorderedImages = this.extractList(response);

        if (reorderedImages.length) {
          this.tourImages = reorderedImages.sort((a, b) => this.sortImage(a, b));
        }

        this.gallerySuccessMessage = 'Đã cập nhật thứ tự thư viện ảnh.';
        this.reorderSaving = false;
      },
      error: (error) => {
        this.galleryErrorMessage = this.errorText(error, 'Không thể cập nhật thứ tự ảnh. Vui lòng thử lại sau.');
        this.reorderSaving = false;
        this.loadGallery();
      },
    });
  }

  copyUrl(image: AdminTourImage): void {
    const imageUrl = this.getImageUrl(image);

    if (!imageUrl) {
      this.galleryErrorMessage = 'Ảnh này chưa có URL để sao chép.';
      return;
    }

    if (!navigator.clipboard?.writeText) {
      this.gallerySuccessMessage = imageUrl;
      return;
    }

    navigator.clipboard.writeText(imageUrl).then(() => {
      this.gallerySuccessMessage = 'Đã sao chép URL ảnh.';
      this.feedback.success(this.gallerySuccessMessage);
    }).catch(() => {
      this.gallerySuccessMessage = imageUrl;
    });
  }

  openImage(image: AdminTourImage): void {
    const imageUrl = this.getImageUrl(image);

    if (!imageUrl) {
      return;
    }

    window.open(imageUrl, '_blank', 'noopener,noreferrer');
  }

  getImageUrl(image: AdminTourImage | null): string {
    if (!image) {
      return '';
    }

    return image.url
      || image.imageUrl
      || image.secureUrl
      || image.data?.url
      || image.data?.secureUrl
      || '';
  }

  shortUrl(image: AdminTourImage): string {
    const imageUrl = this.getImageUrl(image);

    if (!imageUrl) {
      return 'Chưa có URL';
    }

    return imageUrl.length > 48 ? `${imageUrl.slice(0, 28)}...${imageUrl.slice(-14)}` : imageUrl;
  }

  handleImageError(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (image.src.endsWith(this.fallbackImage)) {
      return;
    }

    image.src = this.fallbackImage;
  }

  trackImage(_: number, image: AdminTourImage): number | string | undefined {
    return image.id || this.getImageUrl(image);
  }

  private upsertImage(image: AdminTourImage): void {
    this.tourImages = [
      image,
      ...this.tourImages.filter((item) => item.id !== image.id),
    ].sort((a, b) => this.sortImage(a, b));
  }

  private extractList(response: unknown): AdminTourImage[] {
    if (Array.isArray(response)) {
      return response.map((item) => this.normalizeTourImage(item)).filter(this.isTourImage);
    }

    if (!this.isRecord(response)) {
      return [];
    }

    const data = response['data'];

    if (Array.isArray(data)) {
      return data.map((item) => this.normalizeTourImage(item)).filter(this.isTourImage);
    }

    if (this.isRecord(data) && Array.isArray(data['content'])) {
      return data['content'].map((item) => this.normalizeTourImage(item)).filter(this.isTourImage);
    }

    if (Array.isArray(response['content'])) {
      return response['content'].map((item) => this.normalizeTourImage(item)).filter(this.isTourImage);
    }

    return [];
  }

  private extractItem(response: unknown): AdminTourImage | null {
    if (this.isRecord(response) && this.isRecord(response['data'])) {
      return this.normalizeTourImage(response['data']);
    }

    return this.normalizeTourImage(response);
  }

  private normalizeTourImage(raw: unknown): AdminTourImage | null {
    if (!this.isRecord(raw)) {
      return null;
    }

    const image = raw as AdminTourImage;
    return {
      ...image,
      isThumbnail: image.isThumbnail ?? Boolean(image['thumbnail']),
    };
  }

  private extractMediaList(response: unknown): AdminMediaItem[] {
    const list = this.extractUnknownList(response);
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

  private normalizeMediaItem(raw: unknown): AdminMediaItem | null {
    if (!this.isRecord(raw)) {
      return null;
    }

    const media = raw as AdminMediaItem;
    const url = this.getMediaUrl(media);

    return {
      ...media,
      url: media.url || url || undefined,
      sizeBytes: media.sizeBytes ?? media.bytes,
      type: media.type || media.mediaType || media.resourceType,
      module: media.module || media.folder,
    };
  }

  private extractUnknownList(response: unknown): unknown[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (!this.isRecord(response)) {
      return [];
    }

    const data = response['data'];

    if (Array.isArray(data)) {
      return data;
    }

    if (this.isRecord(data) && Array.isArray(data['content'])) {
      return data['content'];
    }

    if (Array.isArray(response['content'])) {
      return response['content'];
    }

    return [];
  }

  private isAllowedImage(file: File): boolean {
    const lowerName = file.name.toLowerCase();
    const validType = this.allowedImageTypes.includes(file.type);
    const validExtension = this.allowedImageExtensions.some((extension) => lowerName.endsWith(extension));

    return validType || (!file.type && validExtension);
  }

  private sortImage(a: AdminTourImage, b: AdminTourImage): number {
    const orderA = Number(a.sortOrder ?? 0);
    const orderB = Number(b.sortOrder ?? 0);

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return (a.id ?? 0) - (b.id ?? 0);
  }

  private errorText(error: unknown, fallback: string): string {
    if (this.isRecord(error)) {
      const status = Number(error['status']);

      if (status === 401 || status === 403) {
        return 'Phiên đăng nhập admin không hợp lệ hoặc không đủ quyền quản lý thư viện ảnh tour.';
      }

      const errorBody = error['error'];

      if (this.isRecord(errorBody) && typeof errorBody['message'] === 'string') {
        return errorBody['message'];
      }
    }

    return fallback;
  }

  private isTourImage(image: AdminTourImage | null): image is AdminTourImage {
    return !!image;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
