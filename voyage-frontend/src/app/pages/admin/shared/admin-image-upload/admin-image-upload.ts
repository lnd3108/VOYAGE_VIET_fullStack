import { NgIf } from '@angular/common';
import { Component, DestroyRef, ElementRef, Input, OnDestroy, ViewChild, forwardRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TuiIcon } from '@taiga-ui/core';

import { AdminMediaApiService } from '../../../../core/api/admin-media-api.service';
import { AdminMediaItem } from '../../../../core/models/media.model';

@Component({
  selector: 'app-admin-image-upload',
  imports: [NgIf, TuiIcon],
  templateUrl: './admin-image-upload.html',
  styleUrl: './admin-image-upload.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AdminImageUpload),
      multi: true,
    },
  ],
})
export class AdminImageUpload implements ControlValueAccessor, OnDestroy {
  @Input() label = 'Ảnh';
  @Input() helpText = 'Chọn ảnh để upload trực tiếp hoặc dán URL Cloudinary.';
  @Input() uploadModule = 'general';
  @Input() placeholder = 'Dán URL ảnh Cloudinary hoặc upload ảnh mới';

  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;

  private readonly adminMediaApiService = inject(AdminMediaApiService);
  private readonly destroyRef = inject(DestroyRef);
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  readonly maxFileSize = 5 * 1024 * 1024;
  readonly allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

  value = '';
  selectedFile: File | null = null;
  previewUrl = '';
  uploading = false;
  disabled = false;
  errorMessage = '';
  successMessage = '';

  ngOnDestroy(): void {
    this.revokePreviewUrl();
  }

  writeValue(value: string | null): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  updateUrl(value: string): void {
    this.value = value;
    this.successMessage = '';
    this.errorMessage = '';
    this.onChange(value);
    this.onTouched();
  }

  markTouched(): void {
    this.onTouched();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    this.errorMessage = '';
    this.successMessage = '';

    if (!file) {
      return;
    }

    if (!this.allowedImageTypes.includes(file.type)) {
      this.errorMessage = 'Chỉ hỗ trợ ảnh PNG, JPG, JPEG hoặc WEBP.';
      this.clearSelectedFile(true);
      return;
    }

    if (file.size > this.maxFileSize) {
      this.errorMessage = 'Ảnh upload tối đa 5MB.';
      this.clearSelectedFile(true);
      return;
    }

    this.revokePreviewUrl();
    this.selectedFile = file;
    this.previewUrl = URL.createObjectURL(file);
    this.onTouched();
  }

  uploadSelectedFile(): void {
    if (this.disabled || this.uploading) {
      return;
    }

    if (!this.selectedFile) {
      this.errorMessage = 'Vui lòng chọn ảnh trước khi upload.';
      return;
    }

    this.uploading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminMediaApiService
      .uploadMedia(this.selectedFile, this.uploadModule || 'general')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const imageUrl = this.extractUploadUrl(response);
          this.uploading = false;

          if (!imageUrl) {
            this.errorMessage = 'Upload thành công nhưng backend chưa trả URL ảnh.';
            return;
          }

          this.value = imageUrl;
          this.onChange(imageUrl);
          this.onTouched();
          this.clearSelectedFile(true);
          this.successMessage = 'Đã upload ảnh và gắn URL vào form.';
        },
        error: () => {
          this.errorMessage = 'Không thể upload ảnh. Vui lòng thử lại sau.';
          this.uploading = false;
        },
      });
  }

  clearSelectedFile(resetInput: boolean): void {
    this.selectedFile = null;
    this.revokePreviewUrl();

    if (resetInput && this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  previewSource(): string {
    return this.previewUrl || this.value;
  }

  private extractUploadUrl(response: unknown): string {
    const item = this.extractUploadItem(response);
    return item ? this.extractMediaUrl(item) : '';
  }

  private extractUploadItem(response: unknown): AdminMediaItem | null {
    if (this.isRecord(response)) {
      const data = response['data'];

      if (this.isRecord(data)) {
        if (this.isRecord(data['media'])) {
          return data['media'] as AdminMediaItem;
        }

        return data as AdminMediaItem;
      }

      if (this.isRecord(response['media'])) {
        return response['media'] as AdminMediaItem;
      }
    }

    return this.isRecord(response) ? response as AdminMediaItem : null;
  }

  private extractMediaUrl(item: AdminMediaItem): string {
    return item.url
      || item.imageUrl
      || item.secureUrl
      || item.fileUrl
      || item.mediaUrl
      || item.data?.url
      || item.data?.imageUrl
      || item.data?.secureUrl
      || '';
  }

  private revokePreviewUrl(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = '';
    }
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
