import { NgIf } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  imports: [NgIf, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    phone: ['', [Validators.pattern(/^[0-9]{9,11}$/)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const rawValue = this.form.getRawValue();

    this.authService.register({
      fullName: rawValue.fullName,
      email: rawValue.email,
      password: rawValue.password,
      phone: rawValue.phone || undefined,
    }).subscribe({
      next: () => {
        this.successMessage.set('Đăng ký thành công. Vui lòng đăng nhập.');
        this.loading.set(false);

        setTimeout(() => {
          this.router.navigateByUrl('/login');
        }, 800);
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message || 'Đăng ký thất bại.');
        this.loading.set(false);
      },
    });
  }
}
