import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

import type { CategoryGridRow, CategoryTableContext } from '../category-table-columns';

interface CategoryOrderCellParams extends ICellRendererParams<CategoryGridRow> {
  context: CategoryTableContext;
}

export class CategoryOrderCellRenderer implements ICellRendererComp {
  private eGui!: HTMLElement;
  private params!: CategoryOrderCellParams;

  init(params: CategoryOrderCellParams): void {
    this.params = params;
    this.eGui = document.createElement('div');
    this.eGui.className = 'admin-categories__order-cell';
    this.render();
  }

  getGui(): HTMLElement {
    return this.eGui;
  }

  refresh(params: CategoryOrderCellParams): boolean {
    this.params = params;
    this.render();
    return true;
  }

  destroy(): void {
    this.eGui.replaceChildren();
  }

  private render(): void {
    const row = this.params.data;

    if (!row) {
      this.eGui.textContent = '';
      return;
    }

    if (row.reorderBusy) {
      this.eGui.innerHTML = `
        <span class="admin-categories__order-spinner" aria-label="Đang sắp xếp"></span>
        <span class="admin-categories__order-number">${row.order}</span>
      `;
      return;
    }

    this.eGui.innerHTML = `
      <button
        type="button"
        class="admin-categories__order-button"
        data-order-action="up"
        aria-label="Chuyển lên"
        title="${row.canMoveUp ? 'Chuyển lên' : 'Sắp xếp thứ tự đang chờ endpoint backend riêng'}"
        ${row.canMoveUp ? '' : 'disabled'}
      >
        ↑
      </button>

      <span class="admin-categories__order-number">${row.order}</span>

      <button
        type="button"
        class="admin-categories__order-button"
        data-order-action="down"
        aria-label="Chuyển xuống"
        title="${row.canMoveDown ? 'Chuyển xuống' : 'Sắp xếp thứ tự đang chờ endpoint backend riêng'}"
        ${row.canMoveDown ? '' : 'disabled'}
      >
        ↓
      </button>
    `;

    this.eGui.querySelectorAll<HTMLButtonElement>('[data-order-action]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const direction = button.dataset['orderAction'] as 'up' | 'down';

        if (!row.category || row.reorderBusy) {
          return;
        }

        if (direction === 'up' && !row.canMoveUp) {
          return;
        }

        if (direction === 'down' && !row.canMoveDown) {
          return;
        }

        this.params.context?.move(row.category, row.rowIndex, direction);
      });
    });
  }
}
