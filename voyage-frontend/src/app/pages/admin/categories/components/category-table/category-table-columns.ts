import { ColDef, ICellRendererParams } from 'ag-grid-community';

import { CategoryActionCellRendererComponent } from '../category-action-cell/category-action-cell';
import { AdminCategory } from '../../../../../core/models/category.model';
import { CategoryOrderCellRenderer } from './category-order-cell/category-order-cell';
import {
  activeClass,
  activeLabel,
  currentCategoryImage,
  displayClass,
  displayLabel,
  escapeHtml,
  formatDateTime,
  getCategoryOrder,
  getCreatedDateValue,
  getUpdatedDateValue,
  hasPendingCategoryChange,
  parseDate,
  shouldShowUpdatedDate,
  workflowClass,
  workflowLabel,
  CATEGORY_FALLBACK_IMAGE,
} from '../../category-utils';

export interface CategoryGridRow {
  category: AdminCategory;
  id?: number;
  rowIndex: number;
  imageUrl: string;
  name: string;
  description: string;
  slug: string;
  workflowLabel: string;
  workflowClassName: string;
  activeLabel: string;
  activeClassName: string;
  displayLabel: string;
  displayClassName: string;
  hasPendingChange: boolean;
  pendingChangeLabel: string;
  order: number;
  createdDisplay: string;
  createdTimestamp: number;
  updatedDisplay: string;
  updatedTimestamp: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  reorderBusy: boolean;
}

export interface CategoryTableContext {
  openEdit(category: AdminCategory): void;
  openCopy(category: AdminCategory): void;
  openDetail?: (category: AdminCategory) => void;
  openPending(category: AdminCategory): void;
  openDelete?: (category: AdminCategory) => void;
  reload(): void;
  move(category: AdminCategory, index: number, direction: 'up' | 'down'): void;
}

export function buildCategoryGridRows(
  categories: AdminCategory[],
  reorderBusyIds: Set<number>,
  reorderBlocked: boolean,
  sortBlocked: boolean,
): CategoryGridRow[] {
  return categories.map((category, index) => {
    const createdDate = parseDate(getCreatedDateValue(category));
    const updatedDate = parseDate(getUpdatedDateValue(category));
    const updatedTimestamp = shouldShowUpdatedDate(createdDate, updatedDate)
      ? updatedDate?.getTime() || 0
      : 0;
    const hasPendingChange = hasPendingCategoryChange(category);
    const reorderSupportedByBackend = false;
    const reorderBlockedNow =
      !reorderSupportedByBackend || reorderBlocked || sortBlocked || reorderBusyIds.size > 0;

    return {
      category,
      id: category.id,
      rowIndex: index,
      imageUrl: currentCategoryImage(category),
      name: category.name || 'Chưa đặt tên',
      description: category.description || 'Chưa có mô tả',
      slug: category.slug || 'dang-cap-nhat',
      workflowLabel: workflowLabel(category.status),
      workflowClassName: workflowClass(category.status),
      activeLabel: activeLabel(category),
      activeClassName: activeClass(category),
      displayLabel: displayLabel(category),
      displayClassName: displayClass(category),
      hasPendingChange,
      pendingChangeLabel: hasPendingChange ? 'Có thay đổi chờ duyệt' : 'Không có',
      order: getCategoryOrder(category),
      createdDisplay: formatDateTime(createdDate),
      createdTimestamp: createdDate?.getTime() || 0,
      updatedDisplay: updatedTimestamp ? formatDateTime(updatedDate) : '-',
      updatedTimestamp,
      canMoveUp: !reorderBlockedNow && categories.length > 1 && index > 0,
      canMoveDown: !reorderBlockedNow && categories.length > 1 && index < categories.length - 1,
      reorderBusy: !!category.id && reorderBusyIds.has(category.id),
    };
  });
}

export function buildCategoryColumnDefs(): ColDef<CategoryGridRow>[] {
  return [
    {
      headerName: 'Ảnh',
      field: 'imageUrl',
      width: 92,
      minWidth: 92,
      maxWidth: 92,
      pinned: 'left',
      lockPinned: true,
      sortable: false,
      resizable: false,
      suppressMovable: true,
      cellRenderer: (params: ICellRendererParams<CategoryGridRow, string>) =>
        renderImageCell(params.data),
    },
    {
      headerName: 'Tên danh mục',
      field: 'name',
      width: 280,
      minWidth: 260,
      maxWidth: 320,
      pinned: 'left',
      lockPinned: true,
      suppressMovable: true,
      cellRenderer: (params: ICellRendererParams<CategoryGridRow, string>) =>
        renderNameCell(params.data),
    },
    {
      headerName: 'Slug',
      field: 'slug',
      width: 230,
      minWidth: 210,
      cellRenderer: (params: ICellRendererParams<CategoryGridRow, string>) => {
        const slug = escapeHtml(params.data?.slug || 'dang-cap-nhat');
        return `<code class="admin-categories__grid-slug">${slug}</code>`;
      },
    },
    {
      headerName: 'Trạng Thái',
      field: 'workflowLabel',
      width: 148,
      minWidth: 138,
      cellRenderer: (params: ICellRendererParams<CategoryGridRow, string>) =>
        renderWorkflowCell(params.data),
    },
    {
      headerName: 'Hoạt động',
      field: 'activeLabel',
      width: 146,
      minWidth: 136,
      cellRenderer: (params: ICellRendererParams<CategoryGridRow, string>) =>
        renderActiveCell(params.data),
    },
    {
      headerName: 'Hiển thị',
      field: 'displayLabel',
      width: 154,
      minWidth: 144,
      cellRenderer: (params: ICellRendererParams<CategoryGridRow, string>) =>
        renderDisplayCell(params.data),
    },
    {
      headerName: 'Phê duyệt',
      field: 'pendingChangeLabel',
      width: 186,
      minWidth: 176,
      cellRenderer: (params: ICellRendererParams<CategoryGridRow, string>) =>
        renderApprovalCell(params.data),
    },
    {
      headerName: 'Thứ tự',
      field: 'order',
      width: 132,
      minWidth: 132,
      maxWidth: 132,
      sort: 'asc',
      headerClass: 'admin-categories__grid-header--center',
      cellClass: 'admin-categories__grid-cell--center',
      cellRenderer: CategoryOrderCellRenderer,
      comparator: (valueA, valueB) => Number(valueA || 0) - Number(valueB || 0),
    },
    {
      headerName: 'Ngày tạo',
      field: 'createdDisplay',
      width: 172,
      minWidth: 164,
      comparator: (_valueA, _valueB, nodeA, nodeB) => {
        return (nodeA.data?.createdTimestamp || 0) - (nodeB.data?.createdTimestamp || 0);
      },
    },
    {
      headerName: 'Cập nhật',
      field: 'updatedDisplay',
      width: 172,
      minWidth: 164,
      comparator: (_valueA, _valueB, nodeA, nodeB) => {
        return (nodeA.data?.updatedTimestamp || 0) - (nodeB.data?.updatedTimestamp || 0);
      },
    },
    {
      headerName: 'Hành động',
      colId: 'actions',
      width: 112,
      minWidth: 112,
      maxWidth: 112,
      pinned: 'right',
      lockPinned: true,
      sortable: false,
      resizable: false,
      suppressMovable: true,
      cellRenderer: CategoryActionCellRendererComponent,
    },
  ];
}

function renderImageCell(row?: CategoryGridRow): string {
  if (!row) {
    return '';
  }

  const src = escapeHtml(row.imageUrl);
  const alt = escapeHtml(row.name);
  const fallback = escapeHtml(CATEGORY_FALLBACK_IMAGE);

  return `<img class="admin-categories__grid-thumb" src="${src}" alt="${alt}" onerror="this.onerror=null;this.src='${fallback}'" />`;
}

function renderNameCell(row?: CategoryGridRow): string {
  if (!row) {
    return '';
  }

  return `
    <div class="admin-categories__grid-name">
      <strong>${escapeHtml(row.name)}</strong>
      <small>${escapeHtml(row.description)}</small>
    </div>
  `;
}

function renderWorkflowCell(row?: CategoryGridRow): string {
  if (!row) {
    return '';
  }

  return `<span class="admin-categories__workflow ${escapeHtml(row.workflowClassName)}">${escapeHtml(row.workflowLabel)}</span>`;
}

function renderActiveCell(row?: CategoryGridRow): string {
  if (!row) {
    return '';
  }

  return `<span class="admin-categories__active ${escapeHtml(row.activeClassName)}">${escapeHtml(row.activeLabel)}</span>`;
}

function renderDisplayCell(row?: CategoryGridRow): string {
  if (!row) {
    return '';
  }

  return `<span class="admin-categories__display ${escapeHtml(row.displayClassName)}">${escapeHtml(row.displayLabel)}</span>`;
}

function renderApprovalCell(row?: CategoryGridRow): string {
  if (!row) {
    return '';
  }

  const stateClass = row.hasPendingChange
    ? 'admin-categories__approval--pending'
    : 'admin-categories__approval--empty';

  return `<span class="admin-categories__approval ${stateClass}">${escapeHtml(row.pendingChangeLabel)}</span>`;
}
