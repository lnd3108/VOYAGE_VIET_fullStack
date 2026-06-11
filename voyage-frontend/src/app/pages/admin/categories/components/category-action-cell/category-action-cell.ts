import { NgIf } from '@angular/common';
import {
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  HostListener,
  isDevMode,
  OnDestroy,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

import { CategoryGridRow, CategoryTableContext } from '../category-table/category-table-columns';
import { parseCategoryStatus } from '../../category-utils';

interface CategoryActionCellParams extends ICellRendererParams<CategoryGridRow> {
  context: CategoryTableContext;
}

type CategoryMenuActionKey =
  | 'edit'
  | 'copy'
  | 'submit'
  | 'resubmit'
  | 'review'
  | 'cancelApprove'
  | 'delete';

interface CategoryMenuAction {
  key: CategoryMenuActionKey;
  label: string;
  icon: string;
  tone?: 'neutral' | 'primary' | 'danger';
  separatorBefore?: boolean;
}

@Component({
  selector: 'app-category-action-cell-renderer',
  standalone: true,
  imports: [NgIf, TuiIcon],
  templateUrl: './category-action-cell.html',
  styleUrl: './category-action-cell.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CategoryActionCellRendererComponent implements ICellRendererAngularComp, OnDestroy {
  private static activeMenu: CategoryActionCellRendererComponent | null = null;

  private readonly appRef = inject(ApplicationRef);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly environmentInjector = inject(EnvironmentInjector);

  row: CategoryGridRow | null = null;
  private context: CategoryTableContext | null = null;

  isMenuOpen = false;
  openDirection: 'down' | 'up' = 'down';
  private menuElement: HTMLElement | null = null;
  private iconRefs: ComponentRef<TuiIcon>[] = [];

  ngOnDestroy(): void {
    if (CategoryActionCellRendererComponent.activeMenu === this) {
      CategoryActionCellRendererComponent.activeMenu = null;
    }

    this.destroyBodyMenu();
  }

  agInit(params: CategoryActionCellParams): void {
    this.row = params.data || null;
    this.context = params.context;
  }

  refresh(params: CategoryActionCellParams): boolean {
    this.agInit(params);
    return true;
  }

  get menuActions(): CategoryMenuAction[] {
    switch (this.status) {
      case 'PENDING':
        return [
          { key: 'copy', label: 'Sao chép', icon: '@tui.copy' },
          {
            key: 'review',
            label: 'Xem & duyệt',
            icon: '@tui.circle-check',
            tone: 'primary',
            separatorBefore: true,
          },
        ];

      case 'APPROVED':
        return [
          { key: 'copy', label: 'Sao chép', icon: '@tui.copy' },
          {
            key: 'cancelApprove',
            label: 'Hủy duyệt',
            icon: '@tui.rotate-ccw',
            separatorBefore: true,
          },
        ];

      case 'REJECTED':
        return [
          { key: 'edit', label: 'Sửa', icon: '@tui.pencil' },
          { key: 'copy', label: 'Sao chép', icon: '@tui.copy' },
          {
            key: 'resubmit',
            label: 'Gửi duyệt lại',
            icon: '@tui.send',
            tone: 'primary',
            separatorBefore: true,
          },
          { key: 'delete', label: 'Xóa', icon: '@tui.trash-2', tone: 'danger' },
        ];

      case 'CANCEL_APPROVE':
        return [
          { key: 'edit', label: 'Sửa', icon: '@tui.pencil' },
          { key: 'copy', label: 'Sao chép', icon: '@tui.copy' },
          {
            key: 'submit',
            label: 'Gửi duyệt',
            icon: '@tui.send',
            tone: 'primary',
            separatorBefore: true,
          },
          { key: 'delete', label: 'Xóa', icon: '@tui.trash-2', tone: 'danger' },
        ];

      case 'DRAFT':
      default:
        return [
          { key: 'edit', label: 'Sửa', icon: '@tui.pencil' },
          { key: 'copy', label: 'Sao chép', icon: '@tui.copy' },
          {
            key: 'submit',
            label: 'Gửi duyệt',
            icon: '@tui.send',
            tone: 'primary',
            separatorBefore: true,
          },
          { key: 'delete', label: 'Xóa', icon: '@tui.trash-2', tone: 'danger' },
        ];
    }
  }

  @HostListener('document:mousedown', ['$event'])
  closeOnOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;

    if (
      !target?.closest('.admin-categories__action-wrap') &&
      !this.menuElement?.contains(target)
    ) {
      this.closeMenu();
    }
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    this.closeMenu();
  }

  stopGridEvent(event: Event): void {
    event.stopPropagation();
  }

  toggleMenu(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const trigger = event.currentTarget as HTMLElement;

    if (this.isMenuOpen) {
      this.closeMenu();
      return;
    }

    CategoryActionCellRendererComponent.activeMenu?.closeMenu();
    CategoryActionCellRendererComponent.activeMenu = this;

    this.setMenuDirection(trigger);
    this.isMenuOpen = true;
    this.renderBodyMenu(trigger);
    this.changeDetectorRef.detectChanges();
  }

  closeMenu(): void {
    if (!this.isMenuOpen) {
      return;
    }

    this.isMenuOpen = false;
    this.openDirection = 'down';
    this.destroyBodyMenu();

    if (CategoryActionCellRendererComponent.activeMenu === this) {
      CategoryActionCellRendererComponent.activeMenu = null;
    }

    this.changeDetectorRef.detectChanges();
  }

  runMenuAction(event: MouseEvent, action: CategoryMenuAction): void {
    event.preventDefault();
    event.stopPropagation();

    const category = this.row?.category;
    const context = this.context;

    if (isDevMode()) {
      console.debug('[CategoryActionCell] clicked', {
        action: action.key,
        categoryId: category?.id,
        status: category?.status,
        hasContext: !!context,
        contextKeys: context ? Object.keys(context) : [],
      });
    }

    if (!category || !context) {
      console.warn('[CategoryActionCell] Missing category or context', { category, context });
      return;
    }

    this.closeMenu();

    switch (action.key) {
      case 'edit':
        context.openEdit(category);
        break;

      case 'copy':
        context.openCopy(category);
        break;

      case 'submit':
      case 'resubmit':
      case 'review':
      case 'cancelApprove':
        context.openPending(category);
        break;

      case 'delete':
        context.openDelete?.(category);
        break;
    }
  }

  private get status(): string {
    return parseCategoryStatus(this.row?.category.status) || 'DRAFT';
  }

  private setMenuDirection(trigger: HTMLElement): void {
    const rect = trigger.getBoundingClientRect();
    const menuHeight = 260;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    this.openDirection = spaceBelow < menuHeight && spaceAbove > spaceBelow ? 'up' : 'down';
  }

  private renderBodyMenu(trigger: HTMLElement): void {
    this.destroyBodyMenu();

    const rect = trigger.getBoundingClientRect();
    const menuWidth = 220;
    const menuHeight = 260;
    const gap = 10;
    const viewportPadding = 12;
    const left = Math.min(
      Math.max(viewportPadding, rect.right - menuWidth),
      window.innerWidth - menuWidth - viewportPadding,
    );
    const menu = document.createElement('div');

    menu.className = 'admin-categories__action-menu admin-categories__action-menu--body';
    menu.style.top = '0px';
    menu.style.left = `${left}px`;
    menu.style.width = `${menuWidth}px`;
    menu.style.maxHeight = `${menuHeight}px`;
    menu.style.visibility = 'hidden';
    menu.addEventListener('mousedown', (event) => {
      event.stopPropagation();
    });
    menu.addEventListener('click', (event) => event.stopPropagation());

    this.menuActions.forEach((action) => {
      if (action.separatorBefore) {
        const separator = document.createElement('div');

        separator.className = 'admin-categories__action-separator';
        menu.appendChild(separator);
      }

      const button = document.createElement('button');
      const icon = this.createTuiIcon(action.icon);
      const label = document.createElement('span');

      button.type = 'button';
      button.className = [
        'admin-categories__action-item',
        action.tone === 'primary' ? 'admin-categories__action-item--primary' : '',
        action.tone === 'danger' ? 'admin-categories__action-item--danger' : '',
      ]
        .filter(Boolean)
        .join(' ');
      label.textContent = action.label;
      button.append(icon, label);
      button.addEventListener('mousedown', (event) => {
        event.stopPropagation();
      });
      button.addEventListener('click', (event) => this.runMenuAction(event, action));
      menu.appendChild(button);
    });

    document.body.appendChild(menu);
    this.menuElement = menu;

    const actualMenuHeight = Math.min(menu.offsetHeight || menuHeight, menuHeight);
    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding - gap;
    const spaceAbove = rect.top - viewportPadding - gap;
    const shouldOpenUp = spaceBelow < actualMenuHeight && spaceAbove > spaceBelow;
    const availableHeight = Math.max(
      120,
      shouldOpenUp ? spaceAbove : window.innerHeight - rect.bottom - viewportPadding - gap,
    );
    const finalHeight = Math.min(actualMenuHeight, availableHeight, menuHeight);
    const top = shouldOpenUp
      ? Math.max(viewportPadding, rect.top - finalHeight - gap)
      : Math.min(rect.bottom + gap, window.innerHeight - viewportPadding - finalHeight);

    this.openDirection = shouldOpenUp ? 'up' : 'down';
    menu.classList.toggle('admin-categories__action-menu--up', shouldOpenUp);
    menu.style.top = `${top}px`;
    menu.style.maxHeight = `${finalHeight}px`;
    menu.style.visibility = 'visible';
  }

  private destroyBodyMenu(): void {
    this.menuElement?.remove();
    this.menuElement = null;
    this.iconRefs.forEach((iconRef) => {
      this.appRef.detachView(iconRef.hostView);
      iconRef.destroy();
    });
    this.iconRefs = [];
  }

  private createTuiIcon(iconName: string): HTMLElement {
    const hostElement = document.createElement('tui-icon');

    hostElement.setAttribute('icon', iconName);

    const iconRef = createComponent(TuiIcon, {
      environmentInjector: this.environmentInjector,
      hostElement,
    });

    hostElement.classList.add('admin-categories__action-item-icon');
    this.appRef.attachView(iconRef.hostView);
    iconRef.setInput('icon', iconName);
    iconRef.changeDetectorRef.detectChanges();
    this.iconRefs.push(iconRef);

    return hostElement;
  }
}
