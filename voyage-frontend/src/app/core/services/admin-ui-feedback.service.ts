import { Injectable, inject } from '@angular/core';
import { TuiDialogService, TuiNotificationService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';

import { AdminConfirmDialogComponent } from './admin-confirm-dialog.component';

type NotificationAppearance = 'positive' | 'negative' | 'warning' | 'info';

@Injectable({ providedIn: 'root' })
export class AdminUiFeedbackService {
  private readonly dialogs = inject(TuiDialogService);
  private readonly notifications = inject(TuiNotificationService);
  private readonly confirmDialog = new PolymorpheusComponent(AdminConfirmDialogComponent);
  private lastNotificationKey = '';
  private lastNotificationTime = 0;

  success(message: string, title = 'Thành công'): void {
    this.notify(message, title, 'positive');
  }

  error(message: string, title = 'Có lỗi xảy ra'): void {
    this.notify(message, title, 'negative');
  }

  warning(message: string, title = 'Cần chú ý'): void {
    this.notify(message, title, 'warning');
  }

  info(message: string, title = 'Thông tin'): void {
    this.notify(message, title, 'info');
  }

  confirmDanger(
    message = 'Thao tác này không thể hoàn tác. Bạn có chắc muốn xóa?',
    title = 'Xác nhận thao tác',
    confirmText = 'Xóa',
  ): Observable<boolean> {
    return this.confirm(message, title, confirmText, 'negative');
  }

  confirmWarning(
    message: string,
    title = 'Xác nhận thao tác',
    confirmText = 'Đồng ý',
  ): Observable<boolean> {
    return this.confirm(message, title, confirmText, 'warning');
  }

  confirmInfo(
    message: string,
    title = 'Xác nhận thao tác',
    confirmText = 'Đồng ý',
  ): Observable<boolean> {
    return this.confirm(message, title, confirmText, 'primary');
  }

  private confirm(message: string, title: string, confirmText: string, appearance: string): Observable<boolean> {
    return this.dialogs.open<boolean>(this.confirmDialog, {
      label: title,
      size: 's',
      data: {
        message,
        yes: confirmText,
        no: 'Hủy',
        appearance,
      },
    });
  }

  private notify(message: string, label: string, appearance: NotificationAppearance): void {
    const key = `${appearance}:${label}:${message}`;
    const now = Date.now();

    if (key === this.lastNotificationKey && now - this.lastNotificationTime < 800) {
      return;
    }

    this.lastNotificationKey = key;
    this.lastNotificationTime = now;

    this.notifications.open(message, {
      label,
      appearance,
      autoClose: appearance === 'negative' ? 5000 : 3500,
      closable: true,
    }).subscribe();
  }
}
