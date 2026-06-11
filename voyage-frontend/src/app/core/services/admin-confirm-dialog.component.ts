import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
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
    <section class="admin-confirm">
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
    </section>
  `,
  styleUrl: './admin-confirm-dialog.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminConfirmDialogComponent {
  readonly context = injectContext<TuiDialogContext<boolean, AdminConfirmDialogData>>();
}
