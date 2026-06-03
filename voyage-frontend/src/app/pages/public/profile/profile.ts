import { NgClass, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { UserApiService } from '../../../core/api/user-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AvatarUploadResponse, RoleCode, UserMeResponse, UserResponse, UserStatus } from '../../../core/models/user.model';

@Component({
  selector: 'app-profile',
  imports: [NgClass, NgIf, ReactiveFormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private readonly userApiService = inject(UserApiService);
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly fallbackAvatar = '/hero/bg-home.png';
  readonly maxAvatarSize = 5 * 1024 * 1024;
  readonly allowedAvatarTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

  loading = false;
  saving = false;
  uploadingAvatar = false;
  errorMessage = '';
  successMessage = '';
  user: UserMeResponse | null = null;
  avatarPreviewUrl = '';

  readonly form = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: [{ value: '', disabled: true }],
    phone: ['', [Validators.pattern(/^[0-9+\-\s()]{8,20}$/)]],
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.userApiService
      .getMe()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const user = response.data;
          this.setUser(user);
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Không thể tải hồ sơ cá nhân. Vui lòng thử lại sau.';
          this.loading = false;
        },
      });
  }

  saveProfile(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const rawValue = this.form.getRawValue();

    this.userApiService
      .updateMe({
        fullName: rawValue.fullName.trim(),
        phone: rawValue.phone.trim() || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.setUser(response.data);
          this.successMessage = 'Đã cập nhật hồ sơ cá nhân.';
          this.saving = false;
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Không thể cập nhật hồ sơ. Vui lòng thử lại sau.';
          this.saving = false;
        },
      });
  }

  uploadAvatar(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.allowedAvatarTypes.includes(file.type)) {
      this.errorMessage = 'Ảnh đại diện chỉ hỗ trợ PNG, JPG, JPEG hoặc WEBP.';
      input.value = '';
      return;
    }

    if (file.size > this.maxAvatarSize) {
      this.errorMessage = 'Ảnh đại diện tối đa 5MB.';
      input.value = '';
      return;
    }

    this.avatarPreviewUrl = URL.createObjectURL(file);
    this.uploadingAvatar = true;

    this.userApiService
      .uploadAvatar(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const updatedUser = this.extractAvatarUser(response.data);

          if (updatedUser) {
            this.setUser(updatedUser);
          } else if (this.user && this.isRecord(response.data) && typeof response.data['avatarUrl'] === 'string') {
            this.setUser({
              ...this.user,
              avatarUrl: response.data['avatarUrl'],
              avatarPublicId:
                typeof response.data['avatarPublicId'] === 'string' ? response.data['avatarPublicId'] : this.user.avatarPublicId,
            });
          }

          this.successMessage = 'Đã cập nhật ảnh đại diện.';
          this.uploadingAvatar = false;
          input.value = '';
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Không thể upload ảnh đại diện. Vui lòng thử lại sau.';
          this.uploadingAvatar = false;
          input.value = '';
        },
      });
  }

  roleLabel(role?: RoleCode): string {
    const labels: Record<RoleCode, string> = {
      USER: 'Khách hàng',
      ADMIN: 'Quản trị viên',
      SUPER_ADMIN: 'Super Admin',
    };

    return role ? labels[role] : 'Đang cập nhật';
  }

  statusLabel(status?: UserStatus): string {
    const labels: Record<UserStatus, string> = {
      ACTIVE: 'Đang hoạt động',
      INACTIVE: 'Tạm khóa',
      BANNED: 'Bị khóa',
    };

    return status ? labels[status] : 'Đang cập nhật';
  }

  statusClass(status?: UserStatus): string {
    return `profile-page__status--${(status || 'unknown').toLowerCase()}`;
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

  handleAvatarError(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (image.src.endsWith(this.fallbackAvatar)) {
      return;
    }

    image.src = this.fallbackAvatar;
  }

  private setUser(user: UserMeResponse): void {
    this.user = user;
    this.avatarPreviewUrl = user.avatarUrl || '';
    this.form.patchValue({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
    });
    this.authService.updateCurrentUser(user as UserResponse);
  }

  private extractAvatarUser(response: AvatarUploadResponse | UserMeResponse): UserMeResponse | null {
    if (!this.isRecord(response)) {
      return null;
    }

    if (this.isUser(response)) {
      return response;
    }

    const user = response['user'];
    return this.isUser(user) ? user : null;
  }

  private isUser(value: unknown): value is UserMeResponse {
    return this.isRecord(value) && typeof value['id'] === 'number' && typeof value['email'] === 'string';
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
