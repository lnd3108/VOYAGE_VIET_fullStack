import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  AllCommunityModule,
  ColDef,
  DomLayoutType,
  GetRowIdParams,
  GridApi,
  GridReadyEvent,
  ModuleRegistry,
  RowSelectionOptions,
  SelectionChangedEvent,
  SortChangedEvent,
  Theme,
  themeQuartz,
} from 'ag-grid-community';

import { AdminCategory } from '../../../../../core/models/category.model';
import {
  CategoryGridRow,
  CategoryTableContext,
  buildCategoryColumnDefs,
  buildCategoryGridRows,
} from './category-table-columns';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-admin-category-table',
  standalone: true,
  imports: [NgIf, AgGridAngular],
  templateUrl: './category-table.html',
  styleUrl: './category-table.scss',
})
export class AdminCategoryTableComponent implements OnChanges {
  @Input() categories: AdminCategory[] = [];
  @Input() loading = false;
  @Input() context!: CategoryTableContext;
  @Input() reorderBlockedByFilter = false;
  @Input() reorderingCategoryIds = new Set<number>();

  @Input() rowHeight = 76;
  @Input() domLayout: DomLayoutType = 'normal';
  @Input() suppressCellFocus = true;
  @Input() loadThemeGoogleFonts = false;

  @Input() showReorderNote = false;
  @Input() reorderNoteText =
    'Tắt tìm kiếm, lọc trạng thái và đưa bảng về thứ tự mặc định để sắp xếp thứ tự danh mục trên toàn bộ danh sách.';

  @Output() selectionChanged = new EventEmitter<AdminCategory[]>();
  @Output() sortBlockedChange = new EventEmitter<boolean>();

  readonly theme: Theme = themeQuartz;
  readonly defaultColDef: ColDef<CategoryGridRow> = {
    sortable: true,
    resizable: true,
    suppressMovable: true,
  };
  readonly rowSelection: RowSelectionOptions = {
    mode: 'multiRow',
    checkboxes: true,
    headerCheckbox: true,
    enableClickSelection: false,
  };

  readonly selectionColumnDef: ColDef<CategoryGridRow> = {
    width: 52,
    minWidth: 52,
    maxWidth: 52,
    pinned: 'left',
    lockPinned: true,
    sortable: false,
    resizable: false,
    suppressMovable: true,
  };

  readonly getRowId = (params: GetRowIdParams<CategoryGridRow>) =>
    `${params.data.id ?? params.data.rowIndex}`;
  readonly columnDefs = buildCategoryColumnDefs();
  readonly overlayLoadingTemplate =
    '<span class="admin-categories__grid-overlay">Đang tải danh sách danh mục...</span>';
  readonly overlayNoRowsTemplate =
    '<span class="admin-categories__grid-overlay">Chưa có danh mục nào.</span>';

  rowData: CategoryGridRow[] = [];
  private gridApi?: GridApi<CategoryGridRow>;
  private gridSortBlocksReorder = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['categories'] ||
      changes['reorderingCategoryIds'] ||
      changes['reorderBlockedByFilter']
    ) {
      this.rebuildRows();
      this.updateGridOverlay();
    }

    if (changes['loading']) {
      this.updateGridOverlay();
    }
  }

  clearSelection(): void {
    this.gridApi?.deselectAll();
    this.selectionChanged.emit([]);
  }

  handleGridReady(event: GridReadyEvent<CategoryGridRow>): void {
    this.gridApi = event.api;
    this.updateGridSortState();
    this.rebuildRows();
    this.updateGridOverlay();
  }

  handleSortChanged(_event: SortChangedEvent<CategoryGridRow>): void {
    this.updateGridSortState();
    this.rebuildRows();
    this.gridApi?.refreshCells({ columns: ['actions'], force: true });
  }

  handleSelectionChanged(event: SelectionChangedEvent<CategoryGridRow>): void {
    this.selectionChanged.emit(event.api.getSelectedRows().map((row) => row.category));
  }

  private rebuildRows(): void {
    this.rowData = buildCategoryGridRows(
      this.categories,
      this.reorderingCategoryIds,
      this.reorderBlockedByFilter,
      this.gridSortBlocksReorder,
    );
  }

  private updateGridOverlay(): void {
    if (!this.gridApi) {
      return;
    }

    if (this.loading) {
      this.gridApi.showLoadingOverlay();
      return;
    }

    if (!this.rowData.length) {
      this.gridApi.showNoRowsOverlay();
      return;
    }

    this.gridApi.hideOverlay();
  }

  private updateGridSortState(): void {
    const sortedColumns = this.gridApi?.getColumnState().filter((column) => column.sort) || [];
    const nextValue =
      sortedColumns.length > 0 &&
      !(
        sortedColumns.length === 1 &&
        sortedColumns[0].colId === 'order' &&
        sortedColumns[0].sort === 'asc'
      );

    if (nextValue !== this.gridSortBlocksReorder) {
      this.gridSortBlocksReorder = nextValue;
      this.sortBlockedChange.emit(nextValue);
    }
  }
}
