import { NgIf } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!newPassword || !confirmPassword) {
    return null;
  }

  return newPassword === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly token = this.activatedRoute.snapshot.queryParamMap.get('token') || '';
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(this.token ? null : 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã thiếu token.');
  readonly successMessage = signal<string | null>(null);

  readonly form = this.formBuilder.nonNullable.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  submit(): void {
    if (!this.token) {
      this.errorMessage.set('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã thiếu token.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const rawValue = this.form.getRawValue();

    this.authService.resetPassword({
      token: this.token,
      newPassword: rawValue.newPassword,
      confirmPassword: rawValue.confirmPassword,
    }).subscribe({
      next: () => {
        this.successMessage.set('Mật khẩu đã được cập nhật. Bạn có thể đăng nhập bằng mật khẩu mới.');
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(
          error?.error?.message || 'Không thể cập nhật mật khẩu. Vui lòng kiểm tra lại liên kết.',
        );
        this.loading.set(false);
      },
    });
  }
}
