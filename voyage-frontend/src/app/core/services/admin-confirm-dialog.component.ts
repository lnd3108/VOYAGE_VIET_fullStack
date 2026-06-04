import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';

export interface AdminConfirmDialogData {
  message: string;
  yes: string;
  no: string;
  appearance: string;
}

@Component({
  selector: 'app-admin-confirm-dialog',
  template: `
    <p class="admin-confirm__message">{{ context.data.message }}</p>
    <footer class="admin-confirm__actions">
      <button type="button" class="admin-confirm__button admin-confirm__button--cancel" (click)="context.completeWith(false)">
        {{ context.data.no }}
      </button>
      <button
        type="button"
        class="admin-confirm__button admin-confirm__button--confirm"
        [class.admin-confirm__button--danger]="context.data.appearance === 'negative'"
        [class.admin-confirm__button--warning]="context.data.appearance === 'warning'"
        (click)="context.completeWith(true)"
      >
        {{ context.data.yes }}
      </button>
    </footer>
  `,
  styles: [`
    .admin-confirm__message {
      margin: 0;
      color: #334155;
      line-height: 1.55;
    }

    .admin-confirm__actions {
      margin-top: 22px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .admin-confirm__button {
      min-height: 40px;
      padding: 0 16px;
      border: 0;
      border-radius: 12px;
      font-weight: 800;
      cursor: pointer;
    }

    .admin-confirm__button--cancel {
      background: #f1f5f4;
      color: #14534f;
    }

    .admin-confirm__button--confirm {
      background: #1f6f68;
      color: #fff;
    }

    .admin-confirm__button--danger {
      background: #da0808;
    }

    .admin-confirm__button--warning {
      background: #f59e0b;
      color: #143734;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminConfirmDialogComponent {
  readonly context = injectContext<TuiDialogContext<boolean, AdminConfirmDialogData>>();
}
