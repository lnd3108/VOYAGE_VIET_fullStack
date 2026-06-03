import { NgClass, NgIf } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';

type VerifyEmailStatus = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [NgClass, NgIf, RouterLink],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.scss',
})
export class VerifyEmail implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  readonly token = this.activatedRoute.snapshot.queryParamMap.get('token') || '';
  readonly status = signal<VerifyEmailStatus>(this.token ? 'loading' : 'error');
  readonly message = signal(
    this.token ? '' : 'Liên kết xác thực email không hợp lệ hoặc đã thiếu token.',
  );

  ngOnInit(): void {
    if (!this.token) {
      return;
    }

    this.authService.verifyEmail(this.token).subscribe({
      next: () => {
        this.status.set('success');
        this.message.set('Tài khoản của bạn đã được xác thực email.');
      },
      error: (error) => {
        this.status.set('error');
        this.message.set(
          error?.error?.message || 'Liên kết xác thực không hợp lệ hoặc đã hết hạn.',
        );
      },
    });
  }

  get title(): string {
    if (this.status() === 'loading') {
      return 'Đang xác thực email';
    }

    if (this.status() === 'success') {
      return 'Xác thực email thành công';
    }

    return 'Không thể xác thực email';
  }

  get subtitle(): string {
    if (this.status() === 'loading') {
      return 'VoyageViet đang kiểm tra liên kết xác thực của bạn.';
    }

    return this.message();
  }
}
